use wasm_bindgen::prelude::wasm_bindgen;
use std::cmp;

#[wasm_bindgen]
pub struct Game {
    grid: Vec<u32>,
    width: u32,
    height: u32
}

#[wasm_bindgen]
impl Game {
    pub fn new(width: u32, height: u32) -> Self {
        Self {
            grid: vec![0; (width * height) as usize],
            width,
            height,
        }
    }

    pub fn tick(&mut self) {
        let mut new_grid: Vec<u32> = Vec::new();

        for row in 0..self.height {
            for col in 0..self.width {
                let index = self.get_cell_index(row, col);
                let is_alive = self.is_cell_alive(index);

                let lifetime = if is_alive { cmp::min(self.grid[index] + 1, 256) } else { 0 };

                new_grid.push(lifetime); 
            }
        }

        self.grid = new_grid;
    }

    pub fn toggle_cell(&mut self, row: u32, col: u32) {
        if !self.is_valid_cell(row as i32, col as i32) {
            return;
        }

        let index = self.get_cell_index(row, col);

        self.grid[index] = if self.grid[index] == 0 { 1 } else { 0 }
    }

    pub fn cells(&self) -> *const u32 {
        self.grid.as_ptr()
    }

    pub fn clear_grid(&mut self) {
        for row in 0..self.height {
            for col in 0..self.width {
                let index = self.get_cell_index(row, col);

                self.grid[index] = 0;
            }
        }
    }
    
    /// Returns the state of the cell in the next tick.
    fn is_cell_alive(&self, index: usize) -> bool {
        let neigbours_count = self.get_live_neighbours(index);

        match self.grid[index] {
            0 => return neigbours_count == 3,
            _ => return neigbours_count == 2 || neigbours_count == 3
        }
    }

    /// Returns the number of live neighbours of the cell.
    fn get_live_neighbours(&self, index: usize) -> u32 {
        let row = (index / (self.width as usize)) as i32;
        let col = (index % (self.width as usize)) as i32;

        let mut neighbours = 0;

        for row_diff in -1..2 {
            for col_diff in -1..2 {
                let curr_row = (row + row_diff).rem_euclid(self.height as i32);
                let curr_col = (col + col_diff).rem_euclid(self.width as i32);

                let curr_index = self.get_cell_index(curr_row as u32, curr_col as u32);

                if self.grid[curr_index] > 0 && curr_index != index {
                    neighbours += 1;
                }
            }
        }

        neighbours
    }

    fn get_cell_index(&self, row: u32, col: u32) -> usize {
        (row * self.width + col) as usize
    }

    fn is_valid_cell(&self, row: i32, col: i32) -> bool {
        row >= 0 && col >= 0 && row < (self.height as i32) && col < (self.width as i32)
    }

}

impl Game {
    /// Get the dead and alive values of the entire universe.
    pub fn get_cells(&self) -> &[u32] {
        &self.grid
    }

    /// Set cells to be alive in a universe by passing the row and column
    /// of each cell as an array.
    pub fn set_cells(&mut self, cells: &[(u32, u32)]) {
        for (row, col) in cells.iter().cloned() {
            let idx = self.get_cell_index(row, col);

            self.grid[idx] = 1;
        }
    }

}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_cell_index() {
        let game = Game::new(10, 10);
        let cell_index = game.get_cell_index(9, 9);

        assert_eq!(cell_index, 99); 
    }

    #[test]
    fn test_count_live_neighbours_without_loop() {
        let mut game = Game::new(3, 3);
        
        game.set_cells(&[(0, 0), (1, 1), (2, 2)]);

        let actual_live_neighbours = game.get_live_neighbours(game.get_cell_index(1, 1));

        assert_eq!(actual_live_neighbours, 2); 
    }

    
    #[test]
    fn test_get_next_state_dead_to_alive() {
        let mut game = Game::new(3, 3);
        game.set_cells(&[(0, 1), (0, 2), (2, 1)]);

        let cell_index = game.get_cell_index(1, 1);

        assert!(game.is_cell_alive(cell_index)); 
    }

    #[test]
    fn test_get_next_state_dead_to_dead_under() {
        let mut game = Game::new(3, 3);
        game.set_cells(&[(0, 1), (2, 1)]);

        let cell_index = game.get_cell_index(1, 1);

        assert!(!game.is_cell_alive(cell_index)); 
    }

    #[test]
    fn test_get_next_state_dead_to_dead_over() {
        let mut game = Game::new(3, 3);
        game.set_cells(&[(0, 1), (0, 2), (2, 1), (2, 2)]);

        let cell_index = game.get_cell_index(1, 1);

        assert!(!game.is_cell_alive(cell_index)); 
    }

    #[test]
    fn test_get_next_state_alive_to_alive() {
        let mut game = Game::new(3, 3);
        game.set_cells(&[(0, 1), (0, 2), (1, 1), (2, 2)]);

        let cell_index = game.get_cell_index(1, 1);

        assert!(game.is_cell_alive(cell_index)); 
    }

    #[test]
    fn test_get_next_state_alive_to_dead_under() {
        let mut game = Game::new(3, 3);
        game.set_cells(&[(1, 1), (2, 2)]);

        let cell_index = game.get_cell_index(1, 1);

        assert!(!game.is_cell_alive(cell_index)); 
    }

    
    #[test]
    fn test_get_next_state_alive_to_dead_over() {
        let mut game = Game::new(3, 3);
        game.set_cells(&[(0, 1), (0, 2), (1, 1), (2, 2), (2, 1)]);

        let cell_index = game.get_cell_index(1, 1);

        assert!(!game.is_cell_alive(cell_index)); 
    }

    #[test]
    fn test_toggle_cell() {
        let mut game = Game::new(3, 3);
        let cell_index = game.get_cell_index(1, 1);

        game.toggle_cell(1, 1);

        assert_eq!(game.grid[cell_index], 1);

        game.toggle_cell(1, 1);

        assert_eq!(game.grid[cell_index], 0);
    }

    #[test]
    fn clear_grid_test() {
        let mut game = Game::new(3, 3);

        game.toggle_cell(1, 1);
        game.toggle_cell(0, 0);
        game.toggle_cell(2, 0);

        game.clear_grid();

        for row in 0..game.height {
            for col in 0..game.width {
                assert_eq!(game.grid[game.get_cell_index(row, col)], 0);
            }
        }
    }

}
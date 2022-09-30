use wasm_bindgen::prelude::wasm_bindgen;
use std::cmp;

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, PartialEq, Copy, Debug)]
pub enum CellState {
    Dead,
    Alive,
}

#[wasm_bindgen]
#[derive(Clone, PartialEq, Copy, Debug)]
pub struct Cell {
    pub state: CellState,
    lifetime: u32
}

#[wasm_bindgen]
impl Cell {
    pub fn new(state: CellState) -> Self {
        Self {
            state,
            lifetime: 0
        }
    }

    fn toggle(&mut self) {
        self.state = match self.state {
            CellState::Dead => CellState::Alive,
            CellState::Alive => CellState::Dead,
        }
    }
}

#[wasm_bindgen]
pub struct Game {
    grid: Vec<Cell>,
    width: u32,
    height: u32
}

#[wasm_bindgen]
impl Game {
    pub fn new(width: u32, height: u32) -> Self {
        Self {
            grid: vec![Cell::new(CellState::Dead); (width * height) as usize],
            width,
            height,
        }
    }

    pub fn tick(&mut self) {
        let mut new_grid: Vec<Cell> = Vec::new();

        for row in 0..self.height {
            for col in 0..self.width {
                let index = self.get_cell_index(row, col);

                let mut new_cell = Cell::new(self.get_next_state(index));
                new_cell.lifetime = cmp::min(self.grid[index].lifetime + 1, 256);

                new_grid.push(new_cell); 
            }
        }

        self.grid = new_grid;
    }

    pub fn toggle_cell(&mut self, row: u32, col: u32) {
        if !self.is_valid_cell(row as i32, col as i32) {
            return;
        }

        let index = self.get_cell_index(row, col);

        self.grid[index].toggle();
    }

    pub fn cells(&self) -> *const Cell {
        self.grid.as_ptr()
    }
    
    /// Returns the state of the cell in the next tick.
    fn get_next_state(&self, index: usize) -> CellState {
        let neigbours_count = self.get_live_neighbours(index);

        match self.grid[index].state {
            CellState::Alive => {
                return if neigbours_count == 2 || neigbours_count == 3 { CellState::Alive } else { CellState::Dead };
            },

            CellState::Dead => {
                return if neigbours_count == 3 { CellState::Alive } else { CellState::Dead };
            },
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

                if self.grid[curr_index].state == CellState::Alive && curr_index != index {
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
    pub fn get_cells(&self) -> &[Cell] {
        &self.grid
    }

    /// Set cells to be alive in a universe by passing the row and column
    /// of each cell as an array.
    pub fn set_cells(&mut self, cells: &[(u32, u32)]) {
        for (row, col) in cells.iter().cloned() {
            let idx = self.get_cell_index(row, col);
            self.grid[idx].state = CellState::Alive;
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

        assert_eq!(game.get_next_state(cell_index), CellState::Alive); 
    }

    #[test]
    fn test_get_next_state_dead_to_dead_under() {
        let mut game = Game::new(3, 3);
        game.set_cells(&[(0, 1), (2, 1)]);

        let cell_index = game.get_cell_index(1, 1);

        assert_eq!(game.get_next_state(cell_index), CellState::Dead); 
    }

    #[test]
    fn test_get_next_state_dead_to_dead_over() {
        let mut game = Game::new(3, 3);
        game.set_cells(&[(0, 1), (0, 2), (2, 1), (2, 2)]);

        let cell_index = game.get_cell_index(1, 1);

        assert_eq!(game.get_next_state(cell_index), CellState::Dead); 
    }

    #[test]
    fn test_get_next_state_alive_to_alive() {
        let mut game = Game::new(3, 3);
        game.set_cells(&[(0, 1), (0, 2), (1, 1), (2, 2)]);

        let cell_index = game.get_cell_index(1, 1);

        assert_eq!(game.get_next_state(cell_index), CellState::Alive); 
    }

    #[test]
    fn test_get_next_state_alive_to_dead_under() {
        let mut game = Game::new(3, 3);
        game.set_cells(&[(1, 1), (2, 2)]);

        let cell_index = game.get_cell_index(1, 1);

        assert_eq!(game.get_next_state(cell_index), CellState::Dead); 
    }

    
    #[test]
    fn test_get_next_state_alive_to_dead_over() {
        let mut game = Game::new(3, 3);
        game.set_cells(&[(0, 1), (0, 2), (1, 1), (2, 2), (2, 1)]);

        let cell_index = game.get_cell_index(1, 1);

        assert_eq!(game.get_next_state(cell_index), CellState::Dead); 
    }

}
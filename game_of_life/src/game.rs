use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, PartialEq, Copy)]
pub enum Cell {
    Dead,
    Alive,
}

#[wasm_bindgen]
impl Cell {
    fn toggle(&mut self) {
        *self = match *self {
            Cell::Dead => Cell::Alive,
            Cell::Alive => Cell::Dead,
        }
    }
}

#[wasm_bindgen]
pub struct Game {
    grid: Vec<Cell>,
    width: u32,
    height: u32
}

// TODO: Infinite universe with looped-over boundries
// TODO: Color cells by their lifetime

#[wasm_bindgen]
impl Game {
    pub fn new(width: u32, height: u32) -> Self {
        Self {
            grid: vec![Cell::Dead; (width * height) as usize],
            width,
            height,
        }
    }

    pub fn tick(&mut self) {
        let mut new_grid: Vec<Cell> = Vec::new();

        for row in 0..self.height {
            for col in 0..self.width {
                new_grid.push(self.get_next_state(self.get_cell_index(row, col))); 
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
    fn get_next_state(&self, index: usize) -> Cell {
        let neigbours_count = self.get_live_neighbours(index);

        match self.grid[index] {
            Cell::Alive => {
                return if neigbours_count == 2 || neigbours_count == 3 { Cell::Alive } else { Cell::Dead };
            },

            Cell::Dead => {
                return if neigbours_count == 3 { Cell::Alive } else { Cell::Dead };
            },
        }
    }

    /// Returns the number of live neighbours of the cell.
    fn get_live_neighbours(&self, index: usize) -> u32 {
        let row = (index / (self.width as usize)) as i32;
        let col = (index % (self.width as usize)) as i32;

        let mut neighbours = 0;

        for row_diff in -1..1 {
            for col_diff in -1..1 {
                let curr_row = row + row_diff;
                let curr_col = col + col_diff;

                if !self.is_valid_cell(curr_row, curr_col) {
                    continue;
                }

                let curr_index = self.get_cell_index(curr_row as u32, curr_col as u32);

                if self.grid[curr_index] == Cell::Alive && curr_index != index {
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

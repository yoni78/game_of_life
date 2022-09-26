#[repr(u8)]
#[derive(Clone, PartialEq, Copy)]
pub enum Cell {
    Dead,
    Alive,
}

pub struct Game {
    grid: Vec<Cell>,
    dimension: i32
}

// TODO: Infinite universe with looped-over boundries
// TODO: Color cells by their lifetime

impl Game {
    pub fn new(dimension: i32) -> Self {
        Self {
            grid: vec![Cell::Dead; dimension.pow(2) as usize],
            dimension
        }
    }

    pub fn tick(&mut self) {
        let mut new_grid: Vec<Cell> = Vec::new();

        for i in 0..self.dimension {
            new_grid.push(self.get_next_state(i as usize)); 
        }

        for i in 0..self.dimension {
            self.grid[i as usize] = new_grid[i as usize];
        }
    }

    pub fn set_cell(&mut self, row: i32, col: i32, state: Cell) {
        if !self.is_valid_cell(row, col) {
            return;
        }

        let index = self.get_cell_index(row, col);

        self.grid[index] = state;
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
    fn get_live_neighbours(&self, index: usize) -> i32 {
        let row = (index / (self.dimension as usize)) as i32;
        let col = (index % (self.dimension as usize)) as i32;

        let mut neighbours = 0;

        for row_diff in -1..1 {
            for col_diff in -1..1 {
                let curr_row = row + row_diff;
                let curr_col = col + col_diff;

                if !self.is_valid_cell(curr_row, curr_col) {
                    continue;
                }

                let curr_index = self.get_cell_index(curr_row, curr_col);

                if self.grid[curr_index] == Cell::Alive && curr_index != index {
                    neighbours += 1;
                }
            }
        }

        neighbours
    }

    fn get_cell_index(&self, row: i32, col: i32) -> usize {
        (row * self.dimension + col) as usize
    }

    fn is_valid_cell(&self, row: i32, col: i32) -> bool {
        row >= 0 && col >= 0 && row < self.dimension && col < self.dimension
    }

}

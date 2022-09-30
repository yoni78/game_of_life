use game_of_life::game::Game;
use wasm_bindgen_test::wasm_bindgen_test;


pub fn input_spaceship() -> Game {
    let mut game = Game::new(6, 6);
    
    game.set_cells(&[(1,2), (2,3), (3,1), (3,2), (3,3)]);

    game
}


pub fn expected_spaceship() -> Game {
    let mut game = Game::new(6, 6);
    
    game.set_cells(&[(2,1), (2,3), (3,2), (3,3), (4,2)]);
    
    game
}

#[test]
#[wasm_bindgen_test]
pub fn test_tick() {
    let mut input_game = input_spaceship();
    let expected_game=  expected_spaceship();

    input_game.tick();

    let input_cells = input_game.get_cells();
    let expected_cells = expected_game.get_cells();

    for i in 0..input_cells.len() {
        assert_eq!(input_cells[i] > 0, expected_cells[i] > 0);
    }
}


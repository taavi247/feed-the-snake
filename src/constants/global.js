export const ENVIRONMENT_ROWS = 20;
export const ENVIRONMENT_COLUMNS = 20;

export const API_URL = 'http://127.0.0.1:8000/api/movesnake';

export const CellState = {
    EMPTY: 'empty',
    STATICWALL : 's_wall',
    USERWALL : 'u_wall',
    APPLE : 'apple',
    SCISSORS : 'scissors',
    SNAKEHEAD : 'snakehead',
    SNAKEBODY : 'snakebody'
};

export const SnakeDirection = {
    UP: 'up',
    DOWN : 'down',
    LEFT : 'left',
    RIGHT : 'right',
}
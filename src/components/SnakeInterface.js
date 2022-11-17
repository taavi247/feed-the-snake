import React, { Component } from 'react';
import GameOver from './GameOver';
import Grid from './Grid';
import Toolbar from './Toolbar';
import {
    ENVIRONMENT_ROWS,
    ENVIRONMENT_COLUMNS,
    SnakeDirection,
    CellState
} from '../constants/global';
import {
    fetchControlJSON,
    getRandomDirectionAsIndex,
    getGridCenter
} from '../utils/utils';
import './SnakeInterface.css';

export default class SnakeInterface extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cells: Array(
                ENVIRONMENT_ROWS * ENVIRONMENT_COLUMNS).fill(CellState.EMPTY),
            selectedItem: CellState.APPLE,
            snakeDirection: SnakeDirection.UP,
            snake: [],
            isSnakeDead: false,
            isSnakeFed: false,
            gameId: 0,
            orderId: 0,
            isSnakeBrainControl: false,
            currentScore: 0,
            isStarted: false,
            isAutoplay: false,
            isRandomizeWall: false,
            isRandomizeItems: false,
        };
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleSelectedItemChange = this.handleSelectedItemChange.bind(this);
        this.handleRandomizeItems = this.handleRandomizeItems.bind(this);
        this.handleRandomizeWall = this.handleRandomizeWall.bind(this);
        this.handleSnakeBrain = this.handleSnakeBrain.bind(this);
        this.handleToggleAutoplay = this.handleToggleAutoplay.bind(this);
        this.handleResetEnvironment = this.handleResetEnvironment.bind(this);
        this.handleStartEnvironment = this.handleStartEnvironment.bind(this);
        this.timerId = null;
        this.mouseDown = false;
    }

    handleRandomizeItems(setting) {
        this.setState({ isRandomizeItems: setting });
    }

    handleRandomizeWall(setting) {
        this.setState({ isRandomizeWall: setting });
    }

    handleSelectedItemChange(item) {
        this.setState({ selectedItem: item });
    }

    handleSnakeBrain(setting) {
        this.setState({ isSnakeBrainControl: setting });
    }

    handleToggleAutoplay(setting) {
        this.setState({ isAutoplay: setting });
    }

    handleResetEnvironment() {
        this.resetEnvironment();
    }

    handleStartEnvironment() {
        this.startEnvironment();
    }

    componentDidMount() {
        this.resetEnvironment();
    
        document.body.onmousedown = () => (this.mouseDown = true);
        document.body.onmouseup = () => (this.mouseDown = false);
        document.getElementById('input_snakespeed').value = -200;
    
        document.body.addEventListener('keydown', this.handleKeyPress);
    }
    
    componentWillUnmount() {
        document.body.removeEventListener('keydown', this.handleKeyPress);
    
        document.getElementById('button_selectapples').classList.add('buttonon');
    
        clearInterval(this.timerId);
        this.timerId = null;
    }

    environmentTick() {
        // Updates current state to the server
        // And receives snake control
        this.getSnakeControlFromServer();

        // Stop here if previous tick killed the snake
        if (this.state.isSnakeDead || this.state.isSnakeFed) {
            if (this.state.isAutoplay) {
                this.resetEnvironment();
                this.setState({ isStarted: true });
            }
            else {
                clearInterval(this.timerId);
            }
            return;
        }

        // Advances the snake by one cell and updates the score
        this.moveSnake();

        this.checkIfSnakeDead();
        this.checkIfSnakeFed();

        const newOrderId = this.state.orderId + 1;
        this.setState({ orderId: newOrderId });
    }

    getSnakeControlFromServer() {
        // Creates a JSON including unique gcame Id, turn and
        // location of snake and items
        const json = this.createSnakeItemJSON(
            this.state.snake,
            this.state.cells
        );

        const options = {
            referrer: 'no-referrer-when-downgrade',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: json
        };

        fetchControlJSON(options).then(control_json => {
            if (this.state.isSnakeBrainControl) {
                this.setSnakeDirection(control_json.snakeDirection);
            }
        });
    }

    createSnakeItemJSON(snake, items) {
        var i = items.indexOf(CellState.APPLE);
        var apples = [];
        while (i !== -1) {
            apples.push(i);
            i = items.indexOf(CellState.APPLE, i + 1);
        }

        var scissors = [];
        i = items.indexOf(CellState.SCISSORS);
        while (i !== -1) {
            scissors.push(i);
            i = items.indexOf(CellState.SCISSORS, i + 1);
        }

        var walls = [];
        i = items.indexOf(CellState.STATICWALL);
        while (i !== -1) {
            walls.push(i);
            i = items.indexOf(CellState.STATICWALL, i + 1);
        }
        i = items.indexOf(CellState.USERWALL);
        while (i !== -1) {
            walls.push(i);
            i = items.indexOf(CellState.USERWALL, i + 1);
        }

        var snakeHead = snake[0];
        var snakeBody = snake.slice(1);

        const gameId = this.state.gameId;
        const orderId = this.state.orderId;
        const score = this.state.currentScore;
        const isSnakeDead = this.state.isSnakeDead;
        const isSnakeFed = this.state.isSnakeFed;

        // Add data you wish to send to the backend here
        return JSON.stringify({
            gameId, orderId, snakeHead,
            snakeBody, walls, apples,
            scissors, score, isSnakeDead,
            isSnakeFed
        });
    }

    moveSnake() {
        const snakeDirection = this.state.snakeDirection;
        const snake = this.state.snake;
        let snakeheadLocation = snake[0];

        // Adds a new head cell in beginning of the array
        // depending on control direction
        switch (snakeDirection) {
            case SnakeDirection.UP:
                snake.unshift(snakeheadLocation - ENVIRONMENT_COLUMNS);
                break;
            case SnakeDirection.DOWN:
                snake.unshift(snakeheadLocation + ENVIRONMENT_COLUMNS);
                break;
            case SnakeDirection.LEFT:
                snake.unshift(snakeheadLocation - 1);
                break;
            case SnakeDirection.RIGHT:
                snake.unshift(snakeheadLocation + 1);
                break;
            default:
                break;
        }

        snakeheadLocation = snake[0];

        const cells = this.state.cells;

        // If the snake eats an apple just clear the apple from the cell
        if (this.state.cells[snakeheadLocation] === CellState.APPLE) {
            cells[snakeheadLocation] = CellState.EMPTY;

            let currentScore = this.state.currentScore + 1;
            this.setState({ currentScore: currentScore });
        }
        // If the snake runs into a scissor remove one extra element from
        // the body array to shorten the snake
        else if (this.state.cells[snakeheadLocation] === CellState.SCISSORS) {
            snake.pop();
            snake.pop();
            cells[snakeheadLocation] = CellState.EMPTY;

            if (this.state.currentScore > 0) {
                let currentScore = this.state.currentScore - 1;
                this.setState({ currentScore: currentScore });
            }
        }
        // Otherwise just remove one element from the body array to make 
        // the snake seem to advance normally on the grid
        else {
            snake.pop();
        }

        this.setState({ cells: cells });
        this.setState({ snake: snake });
    }

    checkIfSnakeDead() {
        const snakebody = this.state.snake.slice(1);
        const snakeHeadLocation = this.state.snake[0];

        // The snake dies if it runs into its own body or a wall 
        // or on too many scissors
        if (snakebody.find(element => element === snakeHeadLocation)
            || this.state.cells[snakeHeadLocation] === CellState.STATICWALL
            || this.state.cells[snakeHeadLocation] === CellState.USERWALL
            || snakebody.length < 1
        ) {
            this.setState({ isSnakeDead: true });
            this.setState({ isStarted: false });
        }
    }

    checkIfSnakeFed() {
        if (!this.state.cells.find(item => item === CellState.APPLE)) {
            this.setState({ isSnakeFed: true });
            this.setState({ isStarted: false });
        }
    }

    handleKeyPress(e) {
        this.setSnakeDirection(e.code);
    }

    setSnakeDirection(snakeDirection) {
        switch (snakeDirection) {
            case 'ArrowUp':
                if (this.state.snakeDirection !== SnakeDirection.DOWN) {
                    this.setState({ snakeDirection: SnakeDirection.UP });
                }
                break;
            case 'ArrowDown':
                if (this.state.snakeDirection !== SnakeDirection.UP) {
                    this.setState({ snakeDirection: SnakeDirection.DOWN });
                }
                break;
            case 'ArrowLeft':
                if (this.state.snakeDirection !== SnakeDirection.RIGHT) {
                    this.setState({ snakeDirection: SnakeDirection.LEFT });
                }
                break;
            case 'ArrowRight':
                if (this.state.snakeDirection !== SnakeDirection.LEFT) {
                    this.setState({ snakeDirection: SnakeDirection.RIGHT });
                }
                break;
            default:
                break;
        }
    }

    startEnvironment() {
        if (this.state.isStarted || this.state.isSnakeDead) {
            return;
        }

        const snakeSpeed = -1 * document.getElementById('input_snakespeed').value;

        if (!this.timerId) {
            this.timerId = setInterval(() => { this.environmentTick(); }, snakeSpeed);
        }
        this.setState({ isStarted: true });
    }

    resetEnvironment() {
        if (!this.state.isAutoplay) {
            clearInterval(this.timerId);
            this.timerId = null;
            this.setState({ isStarted: false });
        }

        this.setState({ currentScore: 0 });

        let cells = this.state.cells;
        cells = this.createEnvironment();

        this.randomizeEnvironment();

        let snake = this.state.snake;
        snake = this.createSnakeOfLength(6);
        this.setState({ snake: snake },
            () => {
                this.generateWalls();
                this.generateItems();
            }
        );

        // Django database uses only positive (16-bit) integers
        const maxRandomNumber = (Math.pow(2, 32) / 2) - 1;
        this.setState({ gameId: Math.floor(Math.random() * maxRandomNumber) });

        this.setState({ orderId: 0 });
        this.setState({ snakeDirection: SnakeDirection.UP });
        this.setState({ cells: cells });
        this.setState({ isSnakeDead: false });
        this.setState({ isSnakeFed: false });
    }

    // Creates an empty environment grid surrounded by walls
    createEnvironment() {
        let cells = this.state.cells;
        const GridSize = ENVIRONMENT_ROWS * ENVIRONMENT_COLUMNS;
        for (let i = 0; i < GridSize; ++i) {
            if (i < ENVIRONMENT_COLUMNS || i > (GridSize - ENVIRONMENT_COLUMNS - 1)
                || !(i % ENVIRONMENT_COLUMNS) || !((i + 1) % ENVIRONMENT_COLUMNS)
            ) {
                cells[i] = CellState.STATICWALL;
            }
            else {
                cells[i] = CellState.EMPTY;
            }
        }
        return cells;
    }

    createSnakeOfLength(length) {
        let snake = [];
        for (let i = 0; i < length; ++i) {
            snake.push(getGridCenter() + i * ENVIRONMENT_COLUMNS);
        }
        return snake;
    }

    randomizeEnvironment() {
        if (this.state.isRandomizeWall) {
            let max = document.getElementById('input_wall_size').max;
            let randomValue = Math.floor(Math.random() * max);
            document.getElementById('input_wall_size').value = randomValue;

            max = document.getElementById('input_wall_amount').max;
            randomValue = Math.floor(Math.random() * max);
            document.getElementById('input_wall_amount').value = randomValue;
        }

        if (this.state.isRandomizeItems) {
            let max = document.getElementById('input_apples').max;
            let randomValue = Math.floor(Math.random() * max);
            document.getElementById('input_apples').value = randomValue;

            max = document.getElementById('input_scissors').max;
            randomValue = Math.floor(Math.random() * max);
            document.getElementById('input_scissors').value = randomValue;
        }
    }

    generateWalls() {
        let cells = this.state.cells;

        let wSize = document.getElementById('input_wall_size').value;
        let wAmount = document.getElementById('input_wall_amount').value;
        let i = 0;
        while (i < wAmount) {
            let j = 0;
            let randomCell = Math.floor(
                Math.random() * ENVIRONMENT_COLUMNS * ENVIRONMENT_ROWS);

            while (j <= wSize) {
                if (this.checkIfCellModifiable(randomCell)) {
                    cells[randomCell] = CellState.USERWALL;
                    randomCell = getRandomDirectionAsIndex(randomCell);
                    ++i;
                    ++j;
                }
                else {
                    break;
                }
            }
        }
        this.setState({ cells: cells });
    }

    generateItems() {
        let cells = this.state.cells;

        let nApples = document.getElementById('input_apples').value;
        let nScissors = document.getElementById('input_scissors').value;

        let i = 0;
        while (i < nApples) {
            let randomCell = Math.floor(
                Math.random() * ENVIRONMENT_COLUMNS * ENVIRONMENT_ROWS);
            if (this.state.cells[randomCell] === CellState.EMPTY
                && this.checkIfCellModifiable(randomCell)) {
                cells[randomCell] = CellState.APPLE;
                ++i;
            }
        }
        i = 0;
        while (i < nScissors) {
            let randomCell = Math.floor(
                Math.random() * ENVIRONMENT_COLUMNS * ENVIRONMENT_ROWS);
            if ((this.state.cells[randomCell] === CellState.EMPTY)
                && this.checkIfCellModifiable(randomCell)) {
                cells[randomCell] = CellState.SCISSORS;
                ++i;
            }
        }
        this.setState({ cells: cells });
    }

    checkIfCellModifiable(i) {
        if (this.state.cells[i] === CellState.STATICWALL
            || (this.state.snake.find(element => element === i))) {
            return false;
        }
        else {
            return true;
        }
    }

    // Lets user to place previously selected items on the grid
    // Or use eraser to remove items
    handleMouseOver(i) {
        if (this.state.isStarted) {
            return;
        }

        if (this.mouseDown) {
            if (this.checkIfCellModifiable(i)) {
                const cells = this.state.cells;
                cells[i] = this.state.selectedItem;
                this.setState({ cells: cells });
            }
        }
    }

    render() {
        return (
            <div className='interface'>
                <div className='game_status'>
                    <GameOver
                        isSnakeDead={this.state.isSnakeDead}
                        isSnakeFed={this.state.isSnakeFed}
                    />
                    Score: {this.state.currentScore}
                </div>
                <Grid
                    cells={this.state.cells}
                    snake={this.state.snake}
                    onMouseOver={(i) => this.handleMouseOver(i)}
                />
                <Toolbar
                    onSelectedItemChange={this.handleSelectedItemChange}
                    onRandomizeItems={this.handleRandomizeItems}
                    onRandomizeWall={this.handleRandomizeWall}
                    onSnakeBrain={this.handleSnakeBrain}
                    onToggleAutoplay={this.handleToggleAutoplay}
                    onResetEnvironment={this.handleResetEnvironment}
                    onStartEnvironment={this.handleStartEnvironment}
                />
            </div>
        );
    }
}
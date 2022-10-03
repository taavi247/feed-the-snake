import React, { Component } from 'react';

const ENVIRONMENT_ROWS = 30;
const ENVIRONMENT_COLUMNS = 30;

const API_URL = 'http://127.0.0.1:8000/api/movesnake';

const CellState = {
    EMPTY: 'empty',
    STATICWALL: 'wall',
    USERWALL: 'wall',
    APPLE: 'apple',
    SCISSORS: 'scissors',
    SNAKEHEAD: 'snakehead',
    SNAKEBODY: 'snakebody'
};

const SnakeDirection = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right',
}


function Cell(props) {
    return (
        <div
            key={'c' + props.index}
            className={'cell ' + props.cellstate}
            onMouseOver={props.onMouseOver}
        />
    );
}

class EnvironmentGrid extends Component {
    renderCell(cell, index) {
        return (
            <Cell
                index={index}
                cellstate={cell}
                onMouseOver={() => this.props.onMouseOver(index)}
            />
        );
    }

    render() {
        // Combines snake and cell states to render a grid with divs
        const Grid = this.props.state.cells.map((cell, index) => {
            let cellrow = [];

            // Adding a line break here to change rows in flexbox
            if (!(index % ENVIRONMENT_COLUMNS)) {
                cellrow.push(
                    <div
                        key={'l' + index}
                        className='linebreak'>
                    </div>);
            }

            const snakeheadLocation = this.props.state.snake[0];

            if (this.props.state.snake.find(element => element === index)) {
                cellrow.push(
                    this.renderCell(
                        snakeheadLocation === index
                        ? CellState.SNAKEHEAD : CellState.SNAKEBODY, index
                    )
                );
            }
            else {
                cellrow.push(this.renderCell(cell, index));
            }

            return cellrow;
        });

        return (
            <div key='grid' className='container'>
                { Grid }
            </div>
        );
    }
}

class SnakeEnvironment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cells: createEnvironment(),
            selectedItem: CellState.APPLE,
            snakeDirection: SnakeDirection.UP,
            snake: [],
            isSnakeDead: false,
            gameId: 0,
            orderId: 0,
            isSnakeBrainControl: false,
            currentScore: 0,
            isStarted: false,
            isAutoplay: false,
        };
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.timerId = null;
        this.mouseDown = false;
    }

    componentDidMount() {
        this.resetEnvironment();

        document.body.onmousedown = () => (this.mouseDown = true);
        document.body.onmouseup = () => (this.mouseDown = false);
        document.getElementById('input_snakespeed').value = -200.0;

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
        if (this.state.isSnakeDead) {
            if (this.state.isAutoplay) {
                this.resetEnvironment();
                this.generateItems();
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

        fetch(API_URL, options)
            .then(response => {
                if (response.headers.get('content-type') === 'application/json') {
                    return response.json();
                }
                else {
                    console.log('Response was not in JSON format');
                }
            })
            .then(result => {
                if (this.state.isSnakeBrainControl) {
                    this.setSnakeDirection(result.snakeDirection)
                }
            })
            .catch(error => {
                console.error('Fetch API error: ', error);
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

        var snakeHead = snake[0];
        var snakeBody = snake.slice(1);

        const gameId = this.state.gameId;
        const orderId = this.state.orderId;
        const score = this.state.currentScore;

        // Add data you wish to send to the backend here
        return JSON.stringify({
            gameId, orderId, snakeHead,
            snakeBody, apples, scissors,
            score
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
            || snakebody.length < 1
        ) {
            this.setState({ isSnakeDead: true });
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
            this.timerId = setInterval(() =>
                { this.environmentTick(); }, snakeSpeed);
        }
        this.setState({ isStarted: true });
    }

    resetEnvironment() {
        if (!this.state.isAutoplay) {
            clearInterval(this.timerId);
            this.timerId = null;
        }

        this.setState({ currentScore: 0 });

        const snake = createSnakeOfLength(6);

        const cells = createEnvironment();

        // Django database uses only positive (16-bit) integers
        const maxRandomNumber = (Math.pow(2, 32) / 2) - 1;
        this.setState({ gameId: Math.floor(Math.random() * maxRandomNumber) });

        this.setState({ orderId: 0 });
        this.setState({ snake: snake });
        this.setState({ snakeDirection: SnakeDirection.UP });
        this.setState({ cells: cells });
        this.setState({ isSnakeDead: false });    
    }

    toggleSnakeBrain() {
        if (this.state.isSnakeDead) {
            return;
        }

        if (this.state.isSnakeBrainControl) {
            this.setState({ isSnakeBrainControl: false });
            let button = document.getElementById('button_snakebrain');
            button.classList.remove('buttonon');

            document.body.addEventListener('keydown', this.handleKeyPress);
        }
        else {
            this.setState({ isSnakeBrainControl: true });
            let button = document.getElementById('button_snakebrain');
            button.classList.add('buttonon');

            document.body.removeEventListener('keydown', this.handleKeyPress);
        }
    }

    toggleAutoplay() {
        if (this.state.isSnakeDead) {
            return;
        }

        if (this.state.isAutoplay) {
            this.setState({ isAutoplay: false });
            let button = document.getElementById('button_autoplay');
            button.classList.remove('buttonon');
        }
        else {
            this.setState({ isAutoplay: true });
            let button = document.getElementById('button_autoplay');
            button.classList.add('buttonon');
        }
    }

    generateItems() {
        var cells = createEnvironment();

        let nApples = document.getElementById('input_apples').value;
        let nScissors = document.getElementById('input_scissors').value;

        let i = 0;
        while (i < nApples) {
            let randomCell = Math.floor(
                Math.random() * ENVIRONMENT_COLUMNS * ENVIRONMENT_ROWS);
            if (this.checkIfCellEmpty(randomCell)) {
                cells[randomCell] = CellState.APPLE;
                this.setState({ cells: cells });
                ++i;
            }
        }
        i = 0;
        while (i < nScissors) {
            let randomCell = Math.floor(
                Math.random() * ENVIRONMENT_COLUMNS * ENVIRONMENT_ROWS);
            if (this.checkIfCellEmpty(randomCell)) {
                cells[randomCell] = CellState.SCISSORS;
                this.setState({ cells: cells });
                ++i;
            }
        }
    }

    checkIfCellEmpty(i) {
        if (this.state.cells[i] === CellState.EMPTY &&
            !this.state.snake.find(element => element === i)) {
                return true;
        }
        else {
            return false;
        }
    }

    checkIfCellHasItem(i) {
        if (this.state.cells[i] === CellState.APPLE ||
            this.state.cells[i] === CellState.SCISSORS) {
            return true;
        }
        else {
            return false;
        }
    }

    selectItem(selectedItem) {
        const buttonApples = document.getElementById('button_selectapples');
        const buttonScissors = document.getElementById('button_selectscissors');
        const buttonEraser = document.getElementById('button_selecteraser');

        if (selectedItem === CellState.APPLE) {
            this.setState({ selectedItem: CellState.APPLE });
            buttonApples.classList.add('buttonon');
            buttonScissors.classList.remove('buttonon');
            buttonEraser.classList.remove('buttonon');
        }
        else if (selectedItem === CellState.SCISSORS) {
            this.setState({ selectedItem: CellState.SCISSORS })
            buttonApples.classList.remove('buttonon');
            buttonScissors.classList.add('buttonon');
            buttonEraser.classList.remove('buttonon');
        }
        else if (selectedItem === CellState.EMPTY) {
            this.setState({ selectedItem: CellState.EMPTY })
            buttonApples.classList.remove('buttonon');
            buttonScissors.classList.remove('buttonon');
            buttonEraser.classList.add('buttonon');
        }
    }

    // Lets user to place previously selected items on the grid
    // Or use eraser to remove items
    handleMouseOver(i) {
        if (this.state.isStarted) {
            return;
        }

        if (this.mouseDown) {
            if (this.checkIfCellEmpty(i) || this.checkIfCellHasItem(i)) {
                    const cells = this.state.cells;
                    cells[i] = this.state.selectedItem;
                    this.setState({ cells: cells });
            }
        }
    }

    render() {
        let snakeDeadMessage;
        if (this.state.isSnakeDead) {
            snakeDeadMessage = <b style={{color: 'red'}}> Snake is dead!</b>;
        }

        return (
            <html>
            <head>
                <link rel='stylesheet' href='SnakeEnvironment.css'/>
            </head>
            <body>
                    <h1>Feed the Snake</h1>
                    <p>Score: {this.state.currentScore}{snakeDeadMessage}</p>
                    <div className='EnvironmentGrid'>
                        <EnvironmentGrid
                            key='environment_grid'
                            state={this.state}
                            onMouseOver={(i) => this.handleMouseOver(i)}
                        />
                    </div>
                    <button
                        id='button_selectapples'
                        className='button'
                        onClick={() => this.selectItem(CellState.APPLE)}>
                        Apple
                    </button>
                    <button
                        id='button_selectscissors'
                        className='button'
                        onClick={() => this.selectItem(CellState.SCISSORS)}>
                        Scissors
                    </button>
                    <button
                        id='button_selecteraser'
                        className='button'
                        onClick={() => this.selectItem(CellState.EMPTY)}>
                        Eraser
                    </button>
                    <button
                        id='button_snakebrain'
                        className='button'
                        onClick={() => this.toggleSnakeBrain()}>
                        Snake Brain
                    </button>
                    <br/>
                    <button
                        id='button_reset'
                        className='button'
                        onClick={() => {
                            if (!this.state.isStarted) {
                                this.resetEnvironment()
                            }
                        }}>
                        Reset
                    </button>
                    <button
                        id='button_start'
                        className='button'
                        onClick={() => this.startEnvironment()}>
                        Start
                    </button>
                    <button
                        id='button_autoplay'
                        className='button'
                        onClick={() => this.toggleAutoplay()}>
                        Autoplay
                    </button>
                    <p><b>Item generator</b></p>
                    <label for='input_apples'>Apples</label>
                    <input
                        id='input_apples'
                        type='range'
                        name='appleinput'
                        min='0'
                        max={Math.floor((ENVIRONMENT_COLUMNS * ENVIRONMENT_ROWS) / 3)}>
                    </input>
                    <label for='input_scissors'>Scissors</label>
                    <input
                        id='input_scissors'
                        type='range'
                        name='scissorinput'
                        min='0'
                        max={Math.floor((ENVIRONMENT_COLUMNS * ENVIRONMENT_ROWS) / 3)}>
                    </input>
                    <button
                        id='button_generate'
                        className='button_generate'
                        onClick={() => {
                            if (!this.state.isStarted) {
                                this.generateItems()
                            }
                        }}>
                        Generate
                    </button>
                    <p><b>Snake speed</b></p>
                    <label for='input_snakespeed'>Speed</label>
                    <input
                        id='input_snakespeed'
                        type='range'
                        name='speedinput'
                        min='-200.0'
                        max='-0.1'
                        step='0.1'>
                    </input>
            </body>
            </html>
        );
    }
}

const getGridCenter = () => {
    const middleRow = Math.floor((ENVIRONMENT_ROWS - 1) / 2);
    return (
        Math.floor(middleRow * ENVIRONMENT_COLUMNS + (ENVIRONMENT_COLUMNS - 1) / 2)
    );
}

const createSnakeOfLength = (length) => {
    let snake = [];
    for (let i = 0; i < length; ++i) {
        snake.push(getGridCenter() + i * ENVIRONMENT_COLUMNS);
    }
    return snake;
}

// Creates an empty environment grid surrounded by walls
const createEnvironment = () => {
    const GridSize = ENVIRONMENT_ROWS * ENVIRONMENT_COLUMNS;
    const cells =
        Array(GridSize).fill(CellState.EMPTY);
    for (let i = 0; i < GridSize; ++i) {
        if (i < ENVIRONMENT_COLUMNS || i > (GridSize - ENVIRONMENT_COLUMNS - 1)
            || !(i % ENVIRONMENT_COLUMNS) || !((i + 1) % ENVIRONMENT_COLUMNS)
        ){
                cells[i] = CellState.STATICWALL;
        }
    }
    return cells;
}

export default SnakeEnvironment;


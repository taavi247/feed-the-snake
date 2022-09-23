import React, { Component } from 'react';

const environmentRows = 30;
const environmentColumns = 30;

const maxRandomNumber = (Math.pow(2, 32) / 2) - 1;

var timerID = null;

var mouseDown = false;

const CELLSTATE = {
    EMPTY: "empty",
    WALL: "wall",
    APPLE: "apple",
    SCISSORS: "scissors",
    SNAKEHEAD: "snakehead",
    SNAKEBODY: "snakebody"
};

const SNAKEDIRECTION = {
    UP: "up",
    DOWN: "down",
    LEFT: "left",
    RIGHT: "right",
}

function Cell(props) {
    return (
        <div
            key={"c" + props.index}
            className={"cell " + props.cellstate}
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
            if (!(index % environmentColumns)) {
                cellrow.push(<div className="linebreak"></div>);
            }

            const snakeheadLocation = this.props.state.snake[0];

            if (this.props.state.snake.find(element => element === index)) {
                cellrow.push(
                    this.renderCell(
                        snakeheadLocation === index
                        ? CELLSTATE.SNAKEHEAD : CELLSTATE.SNAKEBODY, index
                    )
                );
            }
            else {
                cellrow.push(this.renderCell(cell, index));
            }

            return cellrow;
        });

        return (
            <div className="container">
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
            selectedItem: CELLSTATE.APPLE,
            snakeDirection: SNAKEDIRECTION.UP,
            snake: [],
            gameover: false,
            tickInterval: 200,
            gameID: 0,
            orderID: 0,
            snakeBrainControl: true,
        };
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    componentDidMount() {
        this.resetEnvironment();

        document.body.onmousedown = () => (mouseDown = true);
        document.body.onmouseup = () => (mouseDown = false);
    }

    componentWillUnmount() {
        document.body.removeEventListener("keydown", this.handleKeyPress);

        clearInterval(timerID);
        timerID = null;
    }

    handleKeyPress(e) {
        switch (e.code) {
            case "ArrowUp":
                if (this.state.snakeDirection !== SNAKEDIRECTION.DOWN) {
                    this.setState({ snakeDirection: SNAKEDIRECTION.UP });
                }
                break;
            case "ArrowDown":
                if (this.state.snakeDirection !== SNAKEDIRECTION.UP) {
                    this.setState({ snakeDirection: SNAKEDIRECTION.DOWN });
                }
                break;
            case "ArrowLeft":
                if (this.state.snakeDirection !== SNAKEDIRECTION.RIGHT) {
                    this.setState({ snakeDirection: SNAKEDIRECTION.LEFT });
                }
                break;
            case "ArrowRight":
                if (this.state.snakeDirection !== SNAKEDIRECTION.LEFT) {
                    this.setState({ snakeDirection: SNAKEDIRECTION.RIGHT });
                }
                break;
            default:
                break;
        }
    }

    // Creates a JSON including unique game ID, turn and
    // location of snake and items
    createSnakeItemJSON(snake, items) {
        var i = items.indexOf(CELLSTATE.APPLE);
        var apples = [];
        while (i !== -1) {
            apples.push(i);
            i = items.indexOf(CELLSTATE.APPLE, i + 1);
        }

        var scissors = [];
        i = items.indexOf(CELLSTATE.SCISSORS);
        while (i !== -1) {
            scissors.push(i);
            i = items.indexOf(CELLSTATE.SCISSORS, i + 1);
        }

        var snakeHead = snake[0];
        var snakeBody = snake.slice(1);

        const gameID = this.state.gameID;
        const orderID = this.state.orderID;

        return JSON.stringify({
            gameID, orderID, snakeHead,
            snakeBody, apples, scissors
        });
    }

    environmentTick() {
        const json = this.createSnakeItemJSON(
            this.state.snake,
            this.state.cells
        );

        // Sends the JSON using the Fetch API to Django server
        // And receives snake controlling JSON
        postJSON(json)
            .then((response) => response.json())
            .then((result) => {
                let snakeBrainDirection = result.snakeDirection;

                if (this.state.snakeBrainControl) {
                    if (snakeBrainDirection == "ArrowUp") {
                        this.setState({ snakeDirection: SNAKEDIRECTION.UP });
                    }
                    else if (snakeBrainDirection == "ArrowDown") {
                        this.setState({ snakeDirection: SNAKEDIRECTION.DOWN });
                    }
                    else if (snakeBrainDirection == "ArrowLeft") {
                        this.setState({ snakeDirection: SNAKEDIRECTION.LEFT });
                    }
                    else if (snakeBrainDirection == "ArrowRight") {
                        this.setState({ snakeDirection: SNAKEDIRECTION.RIGHT });
                    }
                }
            });
        
        if (this.state.gameover) {
            clearInterval(timerID);
            return;
        }

        const snakeDirection = this.state.snakeDirection;
        const snake = this.state.snake;
        let snakeheadLocation = snake[0];

        // Adds a new head cell in beginning of the array
        // depending on control direction
        switch (snakeDirection) {
            case SNAKEDIRECTION.UP:
                snake.unshift(snakeheadLocation - environmentColumns);
                break;
            case SNAKEDIRECTION.DOWN:
                snake.unshift(snakeheadLocation + environmentColumns);
                break;
            case SNAKEDIRECTION.LEFT:
                snake.unshift(snakeheadLocation - 1);
                break;
            case SNAKEDIRECTION.RIGHT:
                snake.unshift(snakeheadLocation + 1);
                break;
            default:
                break;
        }

        snakeheadLocation = snake[0];

        const cells = this.state.cells;

        // If the snake eats an apple just clear the apple from the cell
        if (this.state.cells[snakeheadLocation] === CELLSTATE.APPLE) {
            cells[snakeheadLocation] = CELLSTATE.EMPTY;
        }

        // If the snake runs into a scissor remove one extra element from
        // the body array to shorten the snake
        else if (this.state.cells[snakeheadLocation] === CELLSTATE.SCISSORS) {
            snake.pop();
            snake.pop();
            cells[snakeheadLocation] = CELLSTATE.EMPTY;
        }

        // Otherwise just remove one element from the body array to make 
        // the snake seem to advance normally on the grid
        else {
            snake.pop();
        }

        const snakebody = snake.slice(1);

        // The snake dies if runs into a wall or on too many scissors
        if (snakebody.find(element => element === snakeheadLocation)
            || this.state.cells[snakeheadLocation] === CELLSTATE.WALL
            || snake.length < 2
        ) {
            this.setState({ gameover: true });
        }

        this.setState({ cells: cells });
        this.setState({ snake: snake });

        const newOrderID = this.state.orderID + 1;
        this.setState({ orderID: newOrderID});
    }

    startEnvironment() {
        document.body.addEventListener("keydown", this.handleKeyPress);

        if (!timerID) {
            timerID = setInterval(() =>
                { this.environmentTick(); }, this.state.tickInterval);
        }
    }

    resetEnvironment() {
        document.body.removeEventListener("keydown", this.handleKeyPress);

        clearInterval(timerID);
        timerID = null;

        const snake = createSnakeOfLength(6);

        const cells = createEnvironment();

        this.setState({ gameID: Math.floor(Math.random() * maxRandomNumber) });
        this.setState({ orderID: 0 });
        this.setState({ snake: snake });
        this.setState({ snakeDirection: SNAKEDIRECTION.UP });
        this.setState({ cells: cells });
        this.setState({ gameover: false });
    }

    toggleSnakeBrain() {
        if (this.state.snakeBrainControl) {
            this.setState({ snakeBrainControl: false });
            let button = document.getElementById("button_snakebrain");
            button.classList.add("brainoff");
        }
        else {
            this.setState({ snakeBrainControl: true });
            let button = document.getElementById("button_snakebrain");
            button.classList.remove("brainoff");
        }
    }

    // Lets user to place previously selected items on the grid
    handleClick(i) {
        if (mouseDown) {
            if (this.state.cells[i] !== CELLSTATE.WALL &&
                !this.state.snake.find(element => element === i)) {
                    const cells = this.state.cells;
                    cells[i] = this.state.selectedItem;
                    this.setState({ cells: cells });
            }
        }
    }

    render() {
        let gameoverMessage;
        if (this.state.gameover) {
            gameoverMessage = <h1>Snake is dead!</h1>
        }

        return (
            <html>
            <head>
                <link rel="stylesheet" href="SnakeEnvironment.css"/>
            </head>
            <body>
                    <h1>Feed the Snake</h1>
                    <div className="EnvironmentGrid">
                        <EnvironmentGrid
                            state={this.state}
                            onMouseOver={(i) => this.handleClick(i)}
                        />
                    </div>
                    <button
                        className="button"
                        onClick={() => this.setState({ selectedItem: CELLSTATE.APPLE })}>
                        Apple
                    </button>
                    <button
                        className="button"
                        onClick={() => this.setState({ selectedItem: CELLSTATE.SCISSORS })}>
                        Scissors
                    </button>
                    <button
                        className="button"
                        onClick={() => this.resetEnvironment()}>
                        Reset
                    </button>
                    <button
                        className="button"
                        onClick={() => this.startEnvironment()}>
                        Start
                    </button>
                    <button
                        id="button_snakebrain"
                        className="button_snakebrain"
                        onClick={() => this.toggleSnakeBrain()}>
                        Snake Brain
                    </button>
                    { gameoverMessage }
            </body>
            </html>
        );
    }
}

const getGridCenter = () => {
    const middleRow = Math.floor((environmentRows - 1) / 2);
    return (
        Math.floor(middleRow * environmentColumns + (environmentColumns - 1) / 2)
    );
}

const createSnakeOfLength = (length) => {
    let snake = [];
    for (let i = 0; i < length; ++i) {
        snake.push(getGridCenter() + i * environmentColumns);
    }
    return snake;
}

// Creates an empty environment grid surrounded by walls
const createEnvironment = () => {
    const GridSize = environmentRows * environmentColumns;
    const cells =
        Array(GridSize).fill(CELLSTATE.EMPTY);
    for (let i = 0; i < GridSize; ++i) {
        if (i < environmentColumns || i > (GridSize - environmentColumns - 1)
            || !(i % environmentColumns) || !((i + 1) % environmentColumns)
        ){
                cells[i] = CELLSTATE.WALL;
        }
    }
    return cells;
}

const postJSON = (json) => {
    const headers = { "Content-Type": "application/json" };

    return fetch("http://127.0.0.1:8000/api/movesnake", {
        referrer: "no-referrer-when-downgrade",
        method: "POST",
        headers: headers,
        body: json
    });
}

export default SnakeEnvironment;


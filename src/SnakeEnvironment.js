import React, { Component } from 'react';

const environmentRows = 30;
const environmentColumns = 30;

var timerID = null;

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
            className={"cell " + props.cellstate}
            onClick={props.onClick}
        />
    );
}

class EnvironmentGrid extends Component {
    renderCell(cell, index) {
        return (
            <Cell
                cellstate={cell}
                onClick={() => this.props.onClick(index)}
            />
        );
    }

    render() {
        const Grid = this.props.state.cells.map((cell, index) => {
            let cellrow = [];

            // Adding a line break here to change rows in flexbox
            if (!(index % environmentColumns)) {
                cellrow.push(<div className="linebreak"></div>);
            }

            if (this.props.state.snake.find(element => element === index)) {
                cellrow.push(
                    this.renderCell(
                        this.props.state.snake[0] === index
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
        };
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    componentDidMount() {
        this.resetEnvironment();
    }

    componentWillUnmount() {
        document.body.removeEventListener("keydown", this.handleKeyPress);

        clearInterval(timerID);
        timerID = null;
    }

    handleKeyPress(e) {
        switch (e.code) {
            case "ArrowUp":
                this.setState({ snakeDirection: SNAKEDIRECTION.UP });
                break;
            case "ArrowDown":
                this.setState({ snakeDirection: SNAKEDIRECTION.DOWN });
                break;
            case "ArrowLeft":
                this.setState({ snakeDirection: SNAKEDIRECTION.LEFT });
                break;
            case "ArrowRight":
                this.setState({ snakeDirection: SNAKEDIRECTION.RIGHT });
                break;
            default:
                break;
        }
    }

    environmentTick() {
        if (this.state.gameover) {
            clearInterval(timerID);
            return;
        }

        const snakeDirection = this.state.snakeDirection;
        const snake = this.state.snake;

        switch (snakeDirection) {
            case SNAKEDIRECTION.UP:
                snake.unshift(snake[0] - environmentColumns);
                break;
            case SNAKEDIRECTION.DOWN:
                snake.unshift(snake[0] + environmentColumns);
                break;
            case SNAKEDIRECTION.LEFT:
                snake.unshift(snake[0] - 1);
                break;
            case SNAKEDIRECTION.RIGHT:
                snake.unshift(snake[0] + 1);
                break;
            default:
                break;
        }

        const snakeheadLocation = snake[0];
        const cells = this.state.cells;

        const snakebody = snake.slice(1);
        if (snakebody.find(element => element === snakeheadLocation)
            || this.state.cells[snakeheadLocation] === CELLSTATE.WALL
            || snake.length < 1
        ){
                this.setState({ gameover: true });
        }

        if (this.state.cells[snakeheadLocation] === CELLSTATE.APPLE) {
            cells[snakeheadLocation] = CELLSTATE.EMPTY;
        }
        else if (this.state.cells[snakeheadLocation] === CELLSTATE.SCISSORS) {
            snake.pop();
            snake.pop();
            cells[snakeheadLocation] = CELLSTATE.EMPTY;
        }
        else {
            snake.pop();
        }

        this.setState({ cells: cells });
        this.setState({ snake: snake });
        
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

        this.setState({ snake: snake });
        this.setState({ snakeDirection: SNAKEDIRECTION.UP });
        this.setState({ cells: cells });
        this.setState({ gameover: false });
    }

    handleClick(i) {
        const cells = this.state.cells;
        cells[i] = this.state.selectedItem;
        this.setState({ cells: cells });
    }

    render() {
        let gameoverMessage;
        if (this.state.gameover) {
            gameoverMessage = <h1>Snake is dead!</h1>
        }

        return (
            <html>
            <head>
                <link rel="stylesheet" href="App.css"/>
            </head>
            <body>
                    <h1>Feed the Snake</h1>
                    <div className="EnvironmentGrid">
                        <EnvironmentGrid
                            state={this.state}
                            onClick={(i) => this.handleClick(i)}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => this.setState({ selectedItem: CELLSTATE.APPLE })}>
                        Apple
                    </button>
                    <button
                        type="button"
                        onClick={() => this.setState({ selectedItem: CELLSTATE.SCISSORS })}>
                        Scissors
                    </button>
                    <button
                        type="button"
                        onClick={() => this.resetEnvironment()}>
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={() => this.startEnvironment()}>
                        Start
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
    console.log(snake);
    return snake;
}

const createEnvironment = () => {
    const GridSize = environmentRows * environmentColumns;
    const cells =
        Array(GridSize).fill(CELLSTATE.EMPTY);
    for (let i = 0; i < GridSize; ++i) {
        if (i < environmentColumns
            || i > (GridSize - environmentColumns - 1)
            || !(i % environmentColumns)
            || !((i + 1) % environmentColumns)
        ){
                cells[i] = CELLSTATE.WALL;
        }
    }
    return cells;
}

export default SnakeEnvironment;


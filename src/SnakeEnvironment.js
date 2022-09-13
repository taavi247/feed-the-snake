import React, { Component } from 'react';

const environmentRows = 30;
const environmentColumns = 30;

const tickInterval = 200;
var timerID = null;

const CELLSTATE = {
    EMPTY: "empty",
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
            cells: Array(environmentRows * environmentColumns).fill(CELLSTATE.EMPTY),
            selectedItem: CELLSTATE.APPLE,
            snakeDirection: SNAKEDIRECTION.UP,
            snake: [],
        };
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    handleKeyPress(e) {
        let snakeDirection;
        switch (e.code) {
            case "ArrowUp":
                snakeDirection = SNAKEDIRECTION.UP;
                break;
            case "ArrowDown":
                snakeDirection = SNAKEDIRECTION.DOWN;
                break;
            case "ArrowLeft":
                snakeDirection = SNAKEDIRECTION.LEFT;
                break;
            case "ArrowRight":
                snakeDirection = SNAKEDIRECTION.RIGHT;
                break;
            default:
                break;
        }
        this.setState({ snakeDirection: snakeDirection });
    }

    componentDidMount() {
        document.body.addEventListener("keydown", this.handleKeyPress);

        this.resetEnvironment();
    }

    environmentTick() {
        const snakeDirection = this.state.snakeDirection;
        const snake = this.state.snake;
        switch (snakeDirection) {
            case SNAKEDIRECTION.UP:
                snake.unshift(snake[0] - environmentColumns);
                snake.pop();
                break;
            case SNAKEDIRECTION.DOWN:
                snake.unshift(snake[0] + environmentColumns);
                snake.pop();
                break;
            case SNAKEDIRECTION.LEFT:
                snake.unshift(snake[0] - 1);
                snake.pop();
                break;
            case SNAKEDIRECTION.RIGHT:
                snake.unshift(snake[0] + 1);
                snake.pop();
                break;
            default:
                break;
        }
        this.setState({ snake: snake });
    }

    startEnvironment() {
        if (!timerID) {
            timerID = setInterval(() => { this.environmentTick(); }, tickInterval);
        }
    }

    resetEnvironment() {
        clearInterval(timerID);
        timerID = null;

        const snake =
        [
            getGridCenter(),
            getGridCenter() + environmentColumns,
            getGridCenter() + 2 * environmentColumns
        ];

        this.setState({ snake: snake });

        const cells =
            Array(environmentRows * environmentColumns).fill(CELLSTATE.EMPTY);

        this.setState({ cells: cells }); 
    }

    handleClick(i) {
        const cells = this.state.cells;
        cells[i] = this.state.selectedItem;
        this.setState({ cells: cells });
    }

    switchApple() {
        this.setState({ selectedItem: CELLSTATE.APPLE });
    }

    switchScissors() {
        this.setState({ selectedItem: CELLSTATE.SCISSORS });
    }

    render() {   
        return (
            <html>
            <head>
                <link rel="stylesheet" href="App.css"/>
            </head>
            <body>
                    <h1>...</h1>
                    <div className="EnvironmentGrid">
                        <EnvironmentGrid
                            state={this.state}
                            onClick={(i) => this.handleClick(i)}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => this.switchApple()}>
                        Apple
                    </button>
                    <button
                        type="button"
                        onClick={() => this.switchScissors()}>
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

export default SnakeEnvironment;


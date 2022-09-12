import React, { Component } from 'react';

const environmentRows = 30;
const environmentColumns = 30;

function Square(props) {
    return (
        <div className={"square " + props.status} onClick={props.onClick} />
    );
}

class EnvironmentGrid extends Component {
    renderSquare(square, index) {
        return (
            <Square
                status={square}
                onClick={() => this.props.onClick(index)}
            />
        );
    }

    render() {
        const Grid = this.props.state.squares.map((square, index) => {
            let squarelb = [];

            // Adding a line break here to change rows in flexbox
            if (!(index % environmentColumns)) {
                squarelb.push(<div className="linebreak"></div>);
            }

            squarelb.push(this.renderSquare(square, index));
            return squarelb;
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
            squares: Array(environmentRows * environmentColumns).fill("empty"),
        };
    }

    handleClick(i) {
        const squares = this.state.squares;
        squares[i] = "clicked";
        this.setState({
            squares: squares
        });
    }

    render() {
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
            </body>
            </html>
        );
    }
}

export default SnakeEnvironment;


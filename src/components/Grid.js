import {
    CellState,
    ENVIRONMENT_COLUMNS
} from '../constants/global';
import Cell from './Cell';
import './Grid.css';

export default function Grid(props) {
    const renderCell = (cell, index) => {
        return (
            <Cell
                key={'cell' + index}
                index={index}
                cellstate={cell}
                onMouseOver={() => props.onMouseOver(index)}
            />
        );
    }
    
    // Combines snake and cell states to render a grid with divs
    const Grid = props.cells.map((cell, index) => {
        let cellrow = [];

        // Adding a line break here to change rows with CSS styling
        if (!(index % ENVIRONMENT_COLUMNS)) {
            cellrow.push(
                <div
                    key={'linebreak' + index}
                    className='linebreak'>
                </div>);
        }

        const snakeheadLocation = props.snake[0];

        if (props.snake.find(element => element === index)) {
            cellrow.push(
                renderCell(
                    snakeheadLocation === index
                        ? CellState.SNAKEHEAD : CellState.SNAKEBODY, index
                    )
            );
        }
        else {
                cellrow.push(renderCell(cell, index));
        }

        return cellrow;
    });

    return (
        <div className='grid'>
            {Grid}
        </div>
    );
}
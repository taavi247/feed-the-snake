import {
    ENVIRONMENT_ROWS,
    ENVIRONMENT_COLUMNS,
    CellState
} from '../constants/global';
import './Toolbar.css';

export default function Toolbar(props) {
    function selectItem(selectedItem) {
        const buttonApples = document.getElementById('button_selectapples');
        const buttonScissors = document.getElementById('button_selectscissors');
        const buttonWalls = document.getElementById('button_selectwalls');
        const buttonEraser = document.getElementById('button_selecteraser');

        if (selectedItem === CellState.APPLE) {
            props.onSelectedItemChange(CellState.APPLE);
            buttonApples.classList.add('buttonon');
            buttonScissors.classList.remove('buttonon');
            buttonWalls.classList.remove('buttonon');
            buttonEraser.classList.remove('buttonon');
        }
        else if (selectedItem === CellState.SCISSORS) {
            props.onSelectedItemChange(CellState.SCISSORS);
            buttonApples.classList.remove('buttonon');
            buttonScissors.classList.add('buttonon');
            buttonWalls.classList.remove('buttonon');
            buttonEraser.classList.remove('buttonon');
        }
        else if (selectedItem === CellState.USERWALL) {
            props.onSelectedItemChange(CellState.USERWALL);
            buttonApples.classList.remove('buttonon');
            buttonScissors.classList.remove('buttonon');
            buttonWalls.classList.add('buttonon');
            buttonEraser.classList.remove('buttonon');
        }
        else if (selectedItem === CellState.EMPTY) {
            props.onSelectedItemChange(CellState.EMPTY);
            buttonApples.classList.remove('buttonon');
            buttonScissors.classList.remove('buttonon');
            buttonWalls.classList.remove('buttonon');
            buttonEraser.classList.add('buttonon');
        }
    }

    function toggleAutoplay() {
        let button = document.getElementById('button_autoplay');
        if (button.classList.contains('buttonon')) {
            props.onToggleAutoplay(false);
            button.classList.remove('buttonon');
        }
        else {
            props.onToggleAutoplay(true);
            button.classList.add('buttonon');
        }
    }

    function toggleRandomizeItems() {
        let button = document.getElementById('button_randomize_items');
        if (button.classList.contains('buttonon')) {
            props.onRandomizeItems(false);
            button.classList.remove('buttonon');
        }
        else {
            props.onRandomizeItems(true);
            button.classList.add('buttonon');
        }
    }

    function toggleRandomizeWall() {
        let button = document.getElementById('button_randomize_wall');
        if (button.classList.contains('buttonon')) {
            props.onRandomizeWall(false);
            button.classList.remove('buttonon');
        }
        else {
            props.onRandomizeWall(true);
            button.classList.add('buttonon');
        }
    }

    function toggleSnakeBrain() {
        let button = document.getElementById('button_snakebrain');
        if (button.classList.contains('buttonon')) {
            props.onSnakeBrain(false);
            button.classList.remove('buttonon');
        }
        else {
            props.onSnakeBrain(true);
            button.classList.add('buttonon');
        }
    }

    return (
        <div className='toolbar'>
            <button
                id='button_selectapples'
                className='button'
                onClick={() => selectItem(CellState.APPLE)}>
                Apple
            </button>
            <button
                id='button_selectscissors'
                className='button'
                onClick={() => selectItem(CellState.SCISSORS)}>
                Scissors
            </button>
            <button
                id='button_selectwalls'
                className='button'
                onClick={() => selectItem(CellState.USERWALL)}>
                Wall
            </button>
            <button
                id='button_selecteraser'
                className='button'
                onClick={() => selectItem(CellState.EMPTY)}>
                Eraser
            </button>
            <br/>
            <button
                id='button_reset'
                className='button'
                onClick={() => props.onResetEnvironment()}>
                Reset / Generate
            </button>
            <button
                id='button_start'
                className='button'
                onClick={() => props.onStartEnvironment()}>
                Start
            </button>
            <button
                id='button_autoplay'
                className='button'
                onClick={() => toggleAutoplay()}>
                Autoplay
            </button>
            <br/>
            <button
                id='button_snakebrain'
                className='button'
                onClick={() => toggleSnakeBrain()}>
                Snake Brain
            </button>
            <p><b>Wall generator</b></p>
            <label htmlFor='input_wall_size'>Size</label>
            <input
                id='input_wall_size'
                type='range'
                name='wall_size_input'
                min='0'
                max='20'>
            </input>
            <label htmlFor='input_wall_amount'>Amount</label>
            <input
                id='input_wall_amount'
                type='range'
                name='wall_amount_input'
                min='0'
                max='200'>
            </input>
            <button
                id='button_zero_wall'
                className='button'
                onClick={() => {
                    document.getElementById('input_wall_size').value = 0;
                    document.getElementById('input_wall_amount').value = 0;
                }}>
                Zero
            </button>
            <button
                id='button_randomize_wall'
                className='button'
                onClick={() => toggleRandomizeWall()}>
                Randomize
            </button>
            <p><b>Item generator</b></p>
            <label htmlFor='input_apples'>Apples</label>
            <input
                id='input_apples'
                type='range'
                name='appleinput'
                min='1'
                max={Math.floor((ENVIRONMENT_COLUMNS * ENVIRONMENT_ROWS) / 3)}>
            </input>
            <label htmlFor='input_scissors'>Scissors</label>
            <input
                id='input_scissors'
                type='range'
                name='scissorinput'
                min='0'
                max={Math.floor((ENVIRONMENT_COLUMNS * ENVIRONMENT_ROWS) / 3)}>
            </input>
            <button
                id='button_zero_items'
                className='button'
                onClick={() => {
                    document.getElementById('input_apples').value = 0;
                    document.getElementById('input_scissors').value = 0;
                }}>
                Zero
            </button>
            <button
                id='button_randomize_items'
                className='button'
                onClick={() => toggleRandomizeItems()}>
                Randomize
            </button>
            <p><b>Snake speed</b></p>
            <label htmlFor='input_snakespeed'>Speed</label>
            <input
                id='input_snakespeed'
                type='range'
                name='speedinput'
                min='-300'
                max='-50'
                step='1'>
            </input>
        </div>
    );
}
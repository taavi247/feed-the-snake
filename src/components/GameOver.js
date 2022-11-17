export default function GameOver(props) {
    let gameOverMsg = <b style={{ color: 'gray' }}> Snake is hungry!</b>;

    if (props.isSnakeDead) {
        gameOverMsg = <b style={{ color: 'red' }}> Snake is dead!</b>;
    }
    else if (props.isSnakeFed) {
        gameOverMsg = <b style={{ color: 'green' }}> Snake ate all the apples!</b>;
    }

    return (
        <div className='gameover_msg'>
            <p>{gameOverMsg}</p>
        </div>
    );
}
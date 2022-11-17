export default function Cell(props) {
    return (
        <div
            className={'cell ' + props.cellstate}
            onMouseOver={props.onMouseOver}
        />
    );
}
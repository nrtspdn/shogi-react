import { Piece } from "./piece";
import './Tile.css';

interface Props {
    piece: Piece;
    validMove?: boolean;
    canPromote?: boolean;
    selected?: boolean;
    onSelect: ((rightClick: boolean) => void);
}

export default function(props: Props) {
    let className = 'tile';
    if (props.selected) {
        className += ' selected';
    } else if (props.validMove) {
        className += ' validMove';
    }

    const rightClick = (ev: React.MouseEvent) => {
        ev.preventDefault();
        props.onSelect(true);
    }

    return <div className={className} onClick={() => props.onSelect(false)} onContextMenu={rightClick}
         style={{color: props.piece.colour.value}}>
        {props.piece.name}
    </div>;
}
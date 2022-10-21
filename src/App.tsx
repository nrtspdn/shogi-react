import { useState } from 'react';
import Board from './board';
import Tile from './Tile';
import './App.css';
import { BLUE, Colour, RED } from './colour';

function App() {
  const [board, setBoard] = useState(new Board());
  const [currentPlayer, setCurrentPlayer] = useState(board.currentPlayer);
  const [pieces, setPieces] = useState(board.pieces);
  const [selection, setSelection] = useState(null as [number, number] | null);
  const [validMoves, setValidMoves] = useState([] as [number, number][]);

  const onSelect = (row: number, col: number, promote: boolean) => {
    if (selection && selection[0] === row && selection[1] === col) { // Deselect
      setSelection(null);
      setValidMoves([]);
    } else if (board.at(row, col).colour === board.currentPlayer.colour) { // Select
      setSelection([row, col]);
      setValidMoves(board.getValidMoves(row, col));
    } else if (selection && validMoves.find(coord => coord[0] === row && coord[1] === col)) { // Move
      board.movePiece(selection[0], selection[1], row, col);

      if (promote) {
        try {
          board.promote(row, col);
        } catch (e) {}
      }

      board.nextPlayer();
      setSelection(null);
      setValidMoves([]);
      setPieces([...board.pieces]);
      setCurrentPlayer(board.currentPlayer);

      if (board.gameOver) {
        alert('Game over!');
      }
    }
  }

  const onSelectCaptured = (colour: Colour, row: number) => {
    if (currentPlayer.colour !== colour) {
      return;
    }

    if (selection && selection[0] === row && selection[1] === 9) { // Deselect
      setSelection(null);
      setValidMoves([]);
    } else { // Select
      setSelection([row, 9]);
      setValidMoves(board.getValidMoves(row, 9));
    }
  }

  const tiles = [];
  for (let row = 8; row >= 0; row--) {
    tiles.push(<span className='label'>{row+1}</span>);
    for (let col = 8; col >= 0; col--) {
      const selected = !!(selection && selection[0] === row && selection[1] === col);
      const validMove = !!validMoves.find(coord => coord[0] === row && coord[1] === col);

      tiles.push(<Tile piece={board.at(row, col)} key={`R${row}C${col}`} onSelect={(right) => onSelect(row, col, right)}
       selected={selected} validMove={validMove} />);
    }
  }

  let redCapture = [];
  for (let i = 0; i < board.red.capturedPieces.length; ++i) {
    const selected = !!(currentPlayer === board.red && selection && selection[1] === 9 && selection[0] === i);
    redCapture.push(<Tile piece={board.red.capturedPieces[i]} onSelect={() => onSelectCaptured(RED, i)}
    selected={selected} />);
  }

  let blueCapture = [];
  for (let i = 0; i < board.blue.capturedPieces.length; ++i) {
    const selected = !!(currentPlayer === board.blue && selection && selection[1] === 9 && selection[0] === i);
    blueCapture.push(<Tile piece={board.blue.capturedPieces[i]} onSelect={() => onSelectCaptured(BLUE, i)}
    selected={selected} />);
  }

  return <div className='main'>
    <div className='sidebar'>
      {board.currentPlayer.name}'s turn
    </div>

    <div className='board'>
      <span className='label'></span>
      <span className='label'>A</span>
      <span className='label'>B</span>
      <span className='label'>C</span>
      <span className='label'>D</span>
      <span className='label'>E</span>
      <span className='label'>F</span>
      <span className='label'>G</span>
      <span className='label'>H</span>
      <span className='label'>I</span>
      {tiles}
    </div>

    <div className='right'>
      <div>
        <div className='left'>{board.red.name}'s captured pieces</div>
        <div className='capturedPieces'>
          {redCapture}
        </div>
      </div>

      <div>
        <div className='capturedPieces' style={{flexFlow: 'wrap-reverse'}}>
          {blueCapture}
        </div>
        <div className='left'>{board.blue.name}'s captured pieces</div>
      </div>
    </div>
  </div>
}

export default App;

import { BLUE, RED } from './colour';
import { Bishop, Empty, Gold, King, Knight, Lance, Pawn, Piece, Rook, Silver } from './piece';
import Player from './player';

export default class Board {
    pieces: Piece[][];
    red: Player;
    blue: Player;
    currentPlayer: Player;
    gameOver = false;

    constructor() {
        this.red = new Player('Red', RED);
        this.blue = new Player('Blue', BLUE);
        this.currentPlayer = this.blue;

        this.pieces = [];
        for (let y = 0; y < 9; y++) {
            this.pieces[y] = [];
            for (let x = 0; x < 9; x++) {
                if (y === 2) {
                    this.pieces[y][x] = new Pawn(BLUE);
                } else if (y === 6) {
                    this.pieces[y][x] = new Pawn(RED);
                } else {
                    this.pieces[y][x] = new Empty();
                }
            }
        }

        this.pieces[0] = [new Lance(BLUE), new Knight(BLUE), new Silver(BLUE), new Gold(BLUE), new King(BLUE), new Gold(BLUE), new Silver(BLUE), new Knight(BLUE), new Lance(BLUE)];
        this.pieces[1][1] = new Bishop(BLUE);
        this.pieces[1][7] = new Rook(BLUE);
        this.pieces[7][1] = new Rook(RED);
        this.pieces[7][7] = new Bishop(RED);
        this.pieces[8] = [new Lance(RED), new Knight(RED), new Silver(RED), new Gold(RED), new King(RED), new Gold(RED), new Silver(RED), new Knight(RED), new Lance(RED)];
    }

    at(coord: [number, number]): Piece;
    at(row: number, col: number): Piece;
    at(arg1: number | [number, number], arg2?: number) {
        let row, col;
        if (arg2 !== undefined) {
            row = arg1 as number;
            col = arg2;
        } else {
            [row, col] = arg1 as [number, number]
        }

        if (col === 9) { // Captured piece
            return this.currentPlayer.capturedPieces[row];
        }

        return this.pieces[row][col];
    }

    getValidMoves(row: number, col: number): [number, number][] {
        const target = this.at(row, col);

        if (col === 9) { // Captured piece
            const moves: [number, number][] = [];
            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    if (this.pieces[r][c].isEmpty() && target.canDropAt(this, r, c)) {
                        moves.push([r, c]);
                    }
                }
            }

            return moves;
        }
        return target.getValidMoves(this, row, col);
    }

    movePiece(srcRow: number, srcCol: number, dstRow: number, dstCol: number): void {
        const source = this.at(srcRow, srcCol);
        const target = this.pieces[dstRow][dstCol];
        if (!target.isEmpty()) {
            target.colour = this.currentPlayer.colour;
            this.currentPlayer.capturedPieces.push(target.unpromotedPiece());

            if (target instanceof King) {
                this.gameOver = true;
            }
        }

        this.pieces[dstRow][dstCol] = source;
        if (srcCol === 9) { // Captured piece
            this.currentPlayer.capturedPieces.splice(srcRow, 1); // Remove captured piece from list
        } else {
            this.pieces[srcRow][srcCol] = new Empty();
        }

        if (this.mustPromote(dstRow, dstCol)) {
            this.promote(dstRow, dstCol);
        }
    }

    mustPromote(row: number, col: number): boolean {
        return this.pieces[row][col].mustPromote(row, col);
    }

    print(): void {
        console.log('    A    B    C    D    E    F    G    H    I');
        let top = '  ┌────┬────┬────┬────┬────┬────┬────┬────┬────┐';
        if (this.red.capturedPieces.length) {
            top += '   Captured pieces: ' + this.red.capturedPieces.join(' ');
        }
        console.log(top);

        const rows = [];
        for (let row = 8; row >= 0; row--) {
            let line = (row+1) + ' │ ' + this.pieces[row].join(' │ ') + ' │';

            if (row === 0 && this.currentPlayer === this.blue && this.blue.capturedPieces.length) {
                line += '                   ';
                for (let i = 0; i < this.blue.capturedPieces.length; i++) {
                    line += ` X${i+1}`;
                }
            }

            if (row === 8 && this.currentPlayer === this.red && this.red.capturedPieces.length) {
                line += '                   ';
                for (let i = 0; i < this.red.capturedPieces.length; i++) {
                    line += ` X${i+1}`;
                }
            }

            rows.push(line);
        }

        console.log(rows.join('\n  ├────┼────┼────┼────┼────┼────┼────┼────┼────┤\n'));

        let bottom = '  └────┴────┴────┴────┴────┴────┴────┴────┴────┘';
        if (this.blue.capturedPieces.length) {
            bottom += '   Captured pieces: ' + this.blue.capturedPieces.join(' ');
        }
        console.log(bottom);
    }

    promote(row: number, col: number): void {
        if (!this.pieces[row][col].canPromote(row, col)) {
            throw new Error('This piece cannot be promoted');
        }

        this.pieces[row][col] = this.pieces[row][col].promotedPiece();
    }

    nextPlayer(): void {
        if (this.currentPlayer === this.blue) {
            this.currentPlayer = this.red;
        } else {
            this.currentPlayer = this.blue;
        }
    }
}
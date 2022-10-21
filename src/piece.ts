import Board from './board';
import { Colour, BLUE, EMPTY, RED } from './colour';
import { colourText } from './common';

export abstract class Piece {
    name: string;
    colour: Colour;
    selected: boolean = false;
    reachable: boolean = false;

    constructor(name: string, colour: Colour) {
        this.name = name;
        this.colour = colour;
    }

    toString(): string {
        const str = colourText(this.name, this.colour);
        if (this.selected) {
            return `\x1b[47m${str}`
        } else if (this.reachable) {
            return `\x1b[42m${str}\x1b[0m`;
        }
        return str;
    }

    abstract getValidMoves(board: Board, row: number, col: number): [number, number][];

    canDropAt(board: Board, row: number, col: number): boolean {
        return !this.mustPromote(row, col);
    }

    getMovesInDirection(board: Board, row: number, col: number, forward: number, right: number): [number, number][] {
        const moves = [];
        for (let i = 1; i <= 8; i++) {
            const coord = this.relativeCoordinate(row, col, i * forward, i * right);
            if (!isValid(coord) || board.at(coord).colour === this.colour) {
                break;
            }

            moves.push(coord);
            if (!board.at(coord).isEmpty() && board.at(coord).colour !== this.colour) {
                // Found an enemy piece, we can't go further
                break;
            }
        }

        return moves;
    }

    isEmpty(): boolean {
        return false;
    }

    canPromote(row: number, col: number): boolean {
        return false;
    }

    mustPromote(row: number, col: number): boolean {
        return false;
    }

    promotedPiece(): Piece {
        throw new Error('This piece cannot be promoted');
    }

    unpromotedPiece(): Piece {
        return this;
    }

    relativeCoordinate(row: number, col: number, forward: number, right: number): [number, number] {
        if (this.colour === BLUE) {
            return [row + forward, col + right];
        } else {
            return [row - forward, col - right];
        }
    }
}

abstract class Promotable extends Piece {
    canPromote(row: number, col: number): boolean {
        return (this.colour === RED && row >= 0 && row <= 2) || (this.colour === BLUE && row <= 8 && row >= 6);
    }
}

export class Bishop extends Piece {
    constructor(colour: Colour) {
        super('角', colour);
    }

    getValidMoves(board: Board, row: number, col: number): [number, number][] {
        return this.getMovesInDirection(board, row, col, 1, -1)
            .concat(this.getMovesInDirection(board, row, col, 1, 1))
            .concat(this.getMovesInDirection(board, row, col, -1, -1))
            .concat(this.getMovesInDirection(board, row, col, -1, 1));
    }
}

export class Gold extends Piece {
    constructor(colour: Colour) {
        super('金', colour);
    }

    getValidMoves(board: Board, row: number, col: number): [number, number][] {
        return filterValidCoordinates([
            this.relativeCoordinate(row, col, 1, 0),
            this.relativeCoordinate(row, col, 1, -1),
            this.relativeCoordinate(row, col, 1, 1),
            this.relativeCoordinate(row, col, 0, -1),
            this.relativeCoordinate(row, col, 0, 1),
            this.relativeCoordinate(row, col, -1, 0),
        ], board, this.colour);
    }
}

export class King extends Piece {
    constructor(colour: Colour) {
        super('玉', colour);
    }

    getValidMoves(board: Board, row: number, col: number): [number, number][] {
        return filterValidCoordinates([
            this.relativeCoordinate(row, col, 1, -1),
            this.relativeCoordinate(row, col, 1, 0),
            this.relativeCoordinate(row, col, 1, 1),
            this.relativeCoordinate(row, col, 0, -1),
            this.relativeCoordinate(row, col, 0, 1),
            this.relativeCoordinate(row, col, -1, -1),
            this.relativeCoordinate(row, col, -1, 0),
            this.relativeCoordinate(row, col, -1, 1),
        ], board, this.colour);
    }
}

export class Knight extends Promotable {
    constructor(colour: Colour) {
        super('桂', colour);
    }

    getValidMoves(board: Board, row: number, col: number): [number, number][] {
        return filterValidCoordinates([
            this.relativeCoordinate(row, col, 2, -1),
            this.relativeCoordinate(row, col, 2, 1),
        ], board, this.colour);
    }

    mustPromote(row: number, col: number): boolean {
        return (this.colour === RED && (row === 0 || row === 1)) || (this.colour === BLUE && (row === 8 || row === 7));
    }

    promotedPiece(): Piece {
        return new PromotedKnight(this.colour);
    }
}

class PromotedKnight extends Gold {
    constructor(colour: Colour) {
        super(colour);
        this.name = '圭';
    }

    unpromotedPiece(): Piece {
        return new Knight(this.colour);
    }
}

export class Lance extends Promotable {
    constructor(colour: Colour) {
        super('香', colour);
    }

    getValidMoves(board: Board, row: number, col: number): [number, number][] {
        return this.getMovesInDirection(board, row, col, 1, 0);
    }

    mustPromote(row: number, col: number): boolean {
        return (this.colour === RED && row === 0) || (this.colour === BLUE && row === 8);
    }

    promotedPiece(): Piece {
        return new PromotedLance(this.colour);
    }
}

class PromotedLance extends Gold {
    constructor(colour: Colour) {
        super(colour);
        this.name = '杏';
    }

    unpromotedPiece(): Piece {
        return new Lance(this.colour);
    }
}

export class Pawn extends Promotable {
    constructor(colour: Colour) {
        super('歩', colour);
    }

    canDropAt(board: Board, row: number, col: number): boolean {
        for (let r = 0; r < 9; r++) {
            if (board.at(r, col) instanceof Pawn && board.at(r, col).colour === this.colour) {
                return false;
            }
        }

        return !this.mustPromote(row, col);
    }

    getValidMoves(board: Board, row: number, col: number): [number, number][] {
        return filterValidCoordinates([this.relativeCoordinate(row, col, 1, 0)], board, this.colour);
    }

    mustPromote(row: number, col: number): boolean {
        return (this.colour === RED && row === 0) || (this.colour === BLUE && row === 8);
    }

    promotedPiece(): Piece {
        return new PromotedPawn(this.colour);
    }
}

class PromotedPawn extends Gold {
    constructor(colour: Colour) {
        super(colour);
        this.name = 'と';
    }

    unpromotedPiece(): Piece {
        return new Pawn(this.colour);
    }
}

export class Rook extends Piece {
    constructor(colour: Colour) {
        super('飛', colour);
    }

    getValidMoves(board: Board, row: number, col: number): [number, number][] {
        return this.getMovesInDirection(board, row, col, 1, 0)
            .concat(this.getMovesInDirection(board, row, col, -1, 0))
            .concat(this.getMovesInDirection(board, row, col, 0, 1))
            .concat(this.getMovesInDirection(board, row, col, 0, -1));
    }
}

export class Silver extends Promotable {
    constructor(colour: Colour) {
        super('銀', colour);
    }

    getValidMoves(board: Board, row: number, col: number): [number, number][] {
        return filterValidCoordinates([
            this.relativeCoordinate(row, col, 1, 0),
            this.relativeCoordinate(row, col, 1, -1),
            this.relativeCoordinate(row, col, 1, 1),
            this.relativeCoordinate(row, col, -1, -1),
            this.relativeCoordinate(row, col, -1, 1),
        ], board, this.colour);
    }

    promotedPiece(): Piece {
        return new PromotedSilver(this.colour);
    }
}

export class PromotedSilver extends Gold {
    constructor(colour: Colour) {
        super(colour);
        this.name = '全';
    }

    unpromotedPiece(): Piece {
        return new Silver(this.colour);
    }
}

export class Empty extends Piece {
    constructor() {
        super('  ', EMPTY);
    }

    canPromote(row: number, col: number): boolean {
        return false;
    }

    getValidMoves(board: Board, row: number, col: number): [number, number][] {
        throw new Error('Empty cannot move');
    }

    isEmpty(): boolean {
        return true;
    }
}

function isValid(coord: [number, number]): boolean {
    return coord[0] >= 0 && coord[0] <= 8 && coord[1] >= 0 && coord[1] <= 8;
}

function filterValidCoordinates(coordinates: [number, number][], board?: Board, excludeColour?: Colour) {
    let result = coordinates.filter(coord => coord[0] >= 0 && coord[0] <= 8 && coord[1] >= 0 && coord[1] <= 8);

    if (excludeColour && board) {
        result = result.filter(coord => board.at(coord).colour !== excludeColour);
    }

    return result;
}

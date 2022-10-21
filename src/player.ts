import { Colour } from "./colour";
import { colourText } from "./common";
import { Piece } from "./piece";

export default class Player {
    name: string;
    colour: Colour;
    capturedPieces: Piece[] = [];

    constructor(name: string, colour: Colour) {
        this.name = name;
        this.colour = colour;
    }

    toString(): string {
        return colourText(this.name, this.colour);
    }
}
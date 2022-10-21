import { Colour } from './colour';

export function colourText(text: string, colour: Colour): string {
    return `\x1b[${colour.value}m${text}\x1b[0m`;
}
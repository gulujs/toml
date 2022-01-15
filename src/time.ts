import { RE_TIME } from './constants.js';
import { InvalidValueError, INVALID_TIME_MESSAGE } from './errors/index.js';


export class Time {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;

  constructor(str: string) {
    const matches = str.match(RE_TIME);
    if (!matches) {
      throw new InvalidValueError(INVALID_TIME_MESSAGE(str));
    }

    this.hours = Number(matches[1]);
    this.minutes = Number(matches[2]);
    this.seconds = Number(matches[3]);
    this.milliseconds = Number(matches[4] || 0);
  }

  toString(): string {
    let str = `${numeral(this.hours)}:${numeral(this.minutes)}:${numeral(this.seconds)}`;
    if (this.milliseconds > 0) {
      str += `.${this.milliseconds}`;
    }
    return str;
  }
}

function numeral(num: number): string {
  const str = `0${num}`;
  return str.substring(str.length - 2);
}

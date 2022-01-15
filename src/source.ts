export class Source {
  private nextPos = 0;
  private end = false;

  lineNum = 0;
  line = '';

  constructor(private readonly source: string) {}

  next(): boolean {
    if (this.end) {
      return false;
    }

    const start = this.nextPos;
    const i = this.source.indexOf('\n', start);

    this.lineNum++;

    if (i >= 0) {
      this.nextPos = i + 1;
    } else {
      this.nextPos = this.source.length;
      this.end = true;
    }

    this.line = this.source.substring(start, this.nextPos);
    return true;
  }
}

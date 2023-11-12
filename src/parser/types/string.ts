import {
  RE_ONE_QUOTE,
  RE_THREE_DOUBLE_QUOTES,
  RE_THREE_DOUBLE_QUOTES_END,
  RE_THREE_SINGLE_QUOTES,
  RE_THREE_SINGLE_QUOTES_END
} from '../constants.js';
import { SYNTAX_ERROR_MESSAGE } from '../../errors/index.js';
import { ValueResult } from './get-value.js';
import { Source } from '../source.js';


export function getString(source: Source, offset: number): ValueResult | null {
  let str = getStringInThreeSingleQuotes(source, offset);
  if (str === null) {
    str = getStringInThreeDoubleQuotes(source, offset);
    if (str === null) {
      str = getStringInOneQuote(source, offset);
    }
  }

  return str;
}

function getStringInThreeSingleQuotes(source: Source, offset: number): ValueResult | null {
  RE_THREE_SINGLE_QUOTES.lastIndex = offset;
  const matches = RE_THREE_SINGLE_QUOTES.exec(source.line);
  if (!matches || matches.index !== offset) {
    return null;
  }

  if (matches[3]) {
    source.assertValidString(matches[2]!, offset + matches[1]!.length);
    return createThreeQuotesValueResult(
      matches[2]!,
      RE_THREE_SINGLE_QUOTES.lastIndex,
      '\'',
      source
    );
  }

  if (!matches[4]) {
    throw new SyntaxError(SYNTAX_ERROR_MESSAGE(source, offset + matches[1]!.length));
  }

  let value = '';
  if (matches[2]) {
    source.assertValidString(matches[2], offset + matches[1]!.length);
    value = matches[2] + matches[4];
  }

  let nextIndex = RE_THREE_SINGLE_QUOTES.lastIndex;
  while (source.next()) {
    nextIndex = 0;
    RE_THREE_SINGLE_QUOTES_END.lastIndex = nextIndex;
    const matches = RE_THREE_SINGLE_QUOTES_END.exec(source.line);
    if (!matches) {
      source.assertValidString(source.line, 0);
      value += source.line;
      continue;
    }

    source.assertValidString(matches[1]!, 0);
    value += matches[1]!;

    return createThreeQuotesValueResult(
      value,
      RE_THREE_SINGLE_QUOTES_END.lastIndex,
      '\'',
      source
    );
  }

  throw new SyntaxError(SYNTAX_ERROR_MESSAGE(source, nextIndex));
}

function getStringInThreeDoubleQuotes(source: Source, offset: number): ValueResult | null {
  RE_THREE_DOUBLE_QUOTES.lastIndex = offset;
  const matches = RE_THREE_DOUBLE_QUOTES.exec(source.line);
  if (!matches || matches.index !== offset) {
    return null;
  }

  if (matches[3]) {
    const strOffset = offset + matches[1]!.length;
    source.assertValidString(matches[2]!, strOffset);
    return createThreeQuotesValueResult(
      source.unescapeString(matches[2]!, strOffset),
      RE_THREE_DOUBLE_QUOTES.lastIndex,
      '"',
      source
    );
  }

  if (!matches[5]) {
    throw new SyntaxError(SYNTAX_ERROR_MESSAGE(source, offset + matches[1]!.length));
  }

  let nextLineTrimStart = !!matches[4];
  let value = '';
  if (matches[2]) {
    const strOffset = offset + matches[1]!.length;
    source.assertValidString(matches[2], strOffset);
    value = source.unescapeString(matches[2], strOffset);
    if (!nextLineTrimStart) {
      value += matches[5];
    }
  }

  let nextIndex = RE_THREE_DOUBLE_QUOTES.lastIndex;
  while (source.next()) {
    nextIndex = 0;
    RE_THREE_DOUBLE_QUOTES_END.lastIndex = nextIndex;
    const matches = RE_THREE_DOUBLE_QUOTES_END.exec(source.line);
    if (!matches) {
      throw new SyntaxError(SYNTAX_ERROR_MESSAGE(source, nextIndex));
    }

    if (nextLineTrimStart && !matches[2] && !matches[3]) {
      continue;
    }

    if (!nextLineTrimStart) {
      value += matches[1]!;
    }

    if (matches[2]) {
      const strOffset = matches[1]!.length;
      source.assertValidString(matches[2], strOffset);
      value += source.unescapeString(matches[2], strOffset);
    }

    if (matches[3]) {
      return createThreeQuotesValueResult(
        value,
        RE_THREE_DOUBLE_QUOTES_END.lastIndex,
        '"',
        source
      );
    }

    nextLineTrimStart = !!matches[4];
    if (!nextLineTrimStart) {
      value += matches[5]!;
    }
  }

  throw new SyntaxError(SYNTAX_ERROR_MESSAGE(source, nextIndex));
}

function createThreeQuotesValueResult(
  value: string,
  nextIndex: number,
  quote: '\'' | '"',
  source: Source
): ValueResult {
  if (source.line[nextIndex] === quote) {
    value += quote;
    nextIndex += 1;
    if (source.line[nextIndex] === quote) {
      value += quote;
      nextIndex += 1;
    }
  }
  return { value, nextIndex };
}

function getStringInOneQuote(source: Source, offset: number): ValueResult | null {
  RE_ONE_QUOTE.lastIndex = offset;
  const matches = RE_ONE_QUOTE.exec(source.line);
  if (!matches || matches.index !== offset) {
    return null;
  }

  const strOffset = offset + matches[1]!.length + 1;
  if (matches[2]) {
    source.assertValidString(matches[2], strOffset);
    return {
      value: matches[2],
      nextIndex: RE_ONE_QUOTE.lastIndex
    };

  } else {
    source.assertValidString(matches[3]!, strOffset);
    return {
      value: source.unescapeString(matches[3]!, strOffset),
      nextIndex: RE_ONE_QUOTE.lastIndex
    };
  }
}

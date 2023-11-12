import { Converters, tryGetValue, ValueResult } from './get-value.js';
import {
  RE_INLINE_TABLE_END,
  RE_INLINE_TABLE_START,
  RE_KEY
} from '../constants.js';
import { Source } from '../source.js';
import { TableObject } from '../../table-object/index.js';
import { SYNTAX_ERROR_MESSAGE } from '../../errors/index.js';


export function getInlineTable(source: Source, offset: number, converters: Converters): ValueResult | null {
  RE_INLINE_TABLE_START.lastIndex = offset;
  const matches = RE_INLINE_TABLE_START.exec(source.line);
  if (!matches || matches.index !== offset) {
    return null;
  }

  const obj = new TableObject();
  let nextIndex = RE_INLINE_TABLE_START.lastIndex;

  let hasPostfixComma = false;
  // eslint-disable-next-line no-constant-condition,@typescript-eslint/no-unnecessary-condition
  while (true) {
    const key = source.getKey(nextIndex, RE_KEY);
    if (key) {
      const valueResult = tryGetValue(source, key.nextIndex, converters);
      if (valueResult === null) {
        throw new SyntaxError(SYNTAX_ERROR_MESSAGE(source, key.nextIndex));
      }

      nextIndex = valueResult.nextIndex;
      obj.set(key.path, valueResult.value);

    } else if (hasPostfixComma) {
      throw new SyntaxError(SYNTAX_ERROR_MESSAGE(source, nextIndex));
    }

    const state = checkEndState(source, nextIndex);
    nextIndex = state.nextIndex;
    if (state.end) {
      break;
    }
    hasPostfixComma = true;
  }

  return {
    value: obj.root,
    nextIndex
  };
}

interface EndState {
  end: boolean;
  nextIndex: number;
}

function checkEndState(source: Source, offset: number): EndState {
  RE_INLINE_TABLE_END.lastIndex = offset;
  const matches = RE_INLINE_TABLE_END.exec(source.line);
  if (!matches || matches.index !== offset) {
    throw new SyntaxError(SYNTAX_ERROR_MESSAGE(source, offset));
  }
  return {
    end: matches[1] === '}',
    nextIndex: RE_INLINE_TABLE_END.lastIndex
  };
}

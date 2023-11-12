import {
  RE_ARRAY_END_OR_CONTINUE,
  RE_ARRAY_END_ONLY,
  RE_ARRAY_START
} from '../constants.js';
import { SYNTAX_ERROR_MESSAGE } from '../../errors/index.js';
import { Source } from '../source.js';
import { Converters, tryGetValue, ValueResult } from './get-value.js';


export function getArray(source: Source, offset: number, converters: Converters): ValueResult | null {
  RE_ARRAY_START.lastIndex = offset;
  const matches = RE_ARRAY_START.exec(source.line);
  if (!matches || matches.index !== offset) {
    return null;
  }

  const value = [];
  let nextIndex = RE_ARRAY_START.lastIndex;

  // eslint-disable-next-line no-constant-condition,@typescript-eslint/no-unnecessary-condition
  while (true) {
    const valueResult = tryGetValue(source, nextIndex, converters);
    if (valueResult === null) {
      RE_ARRAY_END_ONLY.lastIndex = nextIndex;
      const m = RE_ARRAY_END_ONLY.exec(source.line);
      if (!m || m.index !== nextIndex) {
        throw new SyntaxError(SYNTAX_ERROR_MESSAGE(source, nextIndex));
      }
      if (m[2]) {
        nextIndex = RE_ARRAY_END_ONLY.lastIndex;
        break;
      }
      if (m[4]) {
        source.assertValidString(m[3]!, m[1]!.length + 1);
        source.next();
        nextIndex = 0;
        continue;
      }

      throw new SyntaxError(SYNTAX_ERROR_MESSAGE(source, nextIndex));
    }

    value.push(valueResult.value);
    nextIndex = valueResult.nextIndex;

    let state: EndOrContinueState | null = null;
    let loopAtLeastOnce = false;
    do {
      if (loopAtLeastOnce) {
        nextIndex = 0;
      }
      state = checkEndOrContinue(source, nextIndex);
      loopAtLeastOnce = true;
    } while (!state && source.next());

    if (state) {
      nextIndex = state.nextIndex;
      if (state.end) break;
      if (state.cont) continue;
    }

    throw new SyntaxError(SYNTAX_ERROR_MESSAGE(source, nextIndex));
  }

  return { value, nextIndex };
}

interface EndOrContinueState {
  end: boolean;
  cont: boolean;
  nextIndex: number;
}

function checkEndOrContinue(source: Source, offset: number): EndOrContinueState | null {
  RE_ARRAY_END_OR_CONTINUE.lastIndex = offset;
  const matches = RE_ARRAY_END_OR_CONTINUE.exec(source.line);
  if (!matches || matches.index !== offset) {
    throw new SyntaxError(SYNTAX_ERROR_MESSAGE(source, offset));
  }

  if (matches[1]) {
    return {
      end: true,
      cont: false,
      nextIndex: RE_ARRAY_END_OR_CONTINUE.lastIndex
    };
  }

  if (matches[2]) {
    let nextIndex = 0;
    if (matches[4]) {
      if (matches[3]) {
        source.assertValidString(matches[3], source.line.indexOf('#', offset) + 1);
      }
      source.next();
    } else {
      nextIndex = RE_ARRAY_END_OR_CONTINUE.lastIndex;
    }

    return {
      end: false,
      cont: true,
      nextIndex
    };
  }

  if (!matches[4]) {
    throw new SyntaxError(SYNTAX_ERROR_MESSAGE(source, offset));
  }

  return null;
}

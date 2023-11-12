# @gulujs/toml

> TOML parser and serializer

Compatible with TOML version [v1.0.0](https://toml.io/en/v1.0.0).

The module passes [the TOML test suite](https://github.com/toml-lang/toml-test), except for the following three test case:

- decoder
    - [valid/comment/tricky.toml](https://github.com/toml-lang/toml-test/blob/master/tests/valid/comment/tricky.toml)
    - [valid/float/exponent.toml](https://github.com/toml-lang/toml-test/blob/master/tests/valid/float/exponent.toml)
    - [valid/float/underscore.toml](https://github.com/toml-lang/toml-test/blob/master/tests/valid/float/underscore.toml)
    - [valid/float/zero.toml](https://github.com/toml-lang/toml-test/blob/master/tests/valid/float/zero.toml)
    - [valid/spec/float-0.toml](https://github.com/toml-lang/toml-test/blob/master/tests/valid/spec/float-0.toml)
- encoder
    - [valid/comment/tricky.toml](https://github.com/toml-lang/toml-test/blob/master/tests/valid/comment/tricky.toml)
    - [valid/float/exponent.toml](https://github.com/toml-lang/toml-test/blob/master/tests/valid/float/exponent.toml)
    - [valid/float/underscore.toml](https://github.com/toml-lang/toml-test/blob/master/tests/valid/float/underscore.toml)
    - [valid/float/zero.toml](https://github.com/toml-lang/toml-test/blob/master/tests/valid/float/zero.toml)
    - [valid/spec/float-0.toml](https://github.com/toml-lang/toml-test/blob/master/tests/valid/spec/float-0.toml)
    - [valid/spec/local-date-time-0.toml](https://github.com/toml-lang/toml-test/blob/master/tests/valid/spec/local-date-time-0.toml)
    - [valid/spec/local-time-0.toml](https://github.com/toml-lang/toml-test/blob/master/tests/valid/spec/local-time-0.toml)
    - [valid/spec/offset-date-time-0.toml](https://github.com/toml-lang/toml-test/blob/master/tests/valid/spec/offset-date-time-0.toml)

The reason:

1. JavaScript does not define different types of numbers, like integers, short, long, floating-point etc.
So @gulujs/toml doesn't preserve type information between integers and floats.
2. [TomlDate](src/date.ts) is inherited from JavaScript Date object, the precision of the Date object in JavaScript is typically in milliseconds.


## Installation

```sh
npm install @gulujs/toml
```

## Usage

```js
import * as fs from 'fs';
import * as TOML from '@gulujs/toml';

const source = fs.readFileSync('/path/to/file.toml', { encoding: 'utf-8' });
const config = TOML.parse(source);
console.log(config);

console.log(TOML.stringify(config));
```

## License

[MIT](LICENSE)

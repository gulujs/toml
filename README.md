# @lunjs/toml

The module passes [the TOML test suite](https://github.com/BurntSushi/toml-test), except for the following three test case:

- [invalid/encoding/bad-utf8-in-comment.toml](https://github.com/BurntSushi/toml-test/blob/master/tests/invalid/encoding/bad-utf8-in-comment.toml)
- [invalid/encoding/bad-utf8-in-string.toml](https://github.com/BurntSushi/toml-test/blob/master/tests/invalid/encoding/bad-utf8-in-string.toml)
- [invalid/datetime/hour-over.toml](https://github.com/BurntSushi/toml-test/blob/master/tests/invalid/datetime/hour-over.toml)

Compatible with TOML version [v1.0.0](https://toml.io/en/v1.0.0).

## Installation

```sh
npm install @lunjs/toml
```

## Usage

```js
import * as fs from 'fs';
import * as TOML from '@lunjs/toml';

const source = fs.readFileSync('/path/to/file.toml', { encoding: 'utf-8' });
const config = TOML.parse(source);
console.log(config);
```

## License

[MIT](LICENSE)

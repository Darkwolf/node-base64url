# Base64URL
## Install
`npm i --save @darkwolf/base64url`
## Usage
```javascript
// ECMAScript
import Base64URL from '@darkwolf/base64url'
// CommonJS
const Base64URL = require('@darkwolf/base64url')

// Number Encoding
const integer = Number.MAX_SAFE_INTEGER // => 9007199254740991
const encodedInt = Base64URL.encodeInt(integer) // => 'f________'
const decodedInt = Base64URL.decodeInt(encodedInt) // => 9007199254740991

const negativeInteger = -integer // => -9007199254740991
const encodedNegativeInt = Base64URL.encodeInt(negativeInteger) // => '~f________'
const decodedNegativeInt = Base64URL.decodeInt(encodedNegativeInt) // => -9007199254740991

// BigInt Encoding
const bigInt = BigInt(Number.MAX_VALUE) // => 179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368n
const encodedBigInt = Base64URL.encodeBigInt(bigInt) // => 'P________gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
const decodedBigInt = Base64URL.decodeBigInt(encodedBigInt) // => -179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368n

const negativeBigInt = -bigInt // => -179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368n
const encodedNegativeBigInt = Base64URL.encodeBigInt(negativeBigInt) // => '~P________gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
const decodedNegativeBigInt = Base64URL.decodeBigInt(encodedNegativeBigInt) // => -179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368n

// Text Encoding
const text = 'Ave, Darkwolf!'
const encodedText = Base64URL.encodeText(text) // => 'QXZlLCBEYXJrd29sZiE'
const decodedText = Base64URL.decodeText(encodedText) // => 'Ave, Darkwolf!'

const emojis = '🐺🐺🐺'
const encodedEmojis = Base64URL.encodeText(emojis) // => '8J-QuvCfkLrwn5C6'
const decodedEmojis = Base64URL.decodeText(encodedEmojis) // => '🐺🐺🐺'

// Buffer Encoding
const buffer = Uint8Array.of(0x00, 0x02, 0x04, 0x08, 0x0f, 0x1f, 0x3f, 0x7f, 0xff) // => <Uint8Array 00 02 04 08 0f 1f 3f 7f ff>
const encodedBuffer = Base64URL.encode(buffer) // => <Uint8Array 41 41 49 45 43 41 38 66 50 33 5f 5f>
const decodedBuffer = Base64URL.decode(encodedBuffer) // => <Uint8Array 00 02 04 08 0f 1f 3f 7f ff>

const encodedBufferToString = Base64URL.encodeToString(buffer) // => 'AAIECA8fP3__'
const decodedBufferFromString = Base64URL.decodeFromString(encodedBufferToString) // => <Uint8Array 00 02 04 08 0f 1f 3f 7f ff>

// Custom Alphabet
const base64Url = new Base64URL('-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz')

const encInt = base64Url.encodeInt(integer) // => 'Uzzzzzzzz'
const decInt = base64Url.decodeInt(encInt) // => 9007199254740991

const encNegativeInt = base64Url.encodeInt(negativeInteger) // => '~Uzzzzzzzz'
const decNegativeInt = base64Url.decodeInt(encNegativeInt) // => -9007199254740991

const encBigInt = base64Url.encodeBigInt(bigInt) // 'EzzzzzzzzV-----------------------------------------------------------------------------------------------------------------------------------------------------------------'
const decBigInt = base64Url.decodeBigInt(encBigInt) // => 179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368n

const encNegativeBigInt = base64Url.encodeBigInt(negativeBigInt) // => '~EzzzzzzzzV-----------------------------------------------------------------------------------------------------------------------------------------------------------------'
const decNegativeBigInt = base64Url.decodeBigInt(encNegativeBigInt) // => -179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368n

const encText = base64Url.encodeText(text) // => 'FMO_A103NM8fSqxgOX3'
const decText = base64Url.decodeText(encText) // => 'Ave, Darkwolf!'

const encEmojis = base64Url.encodeText(emojis) // => 'w8yFij1UZAfkbt1u'
const decEmojis = base64Url.decodeText(encEmojis) // => '🐺🐺🐺'

const encBuffer = base64Url.encode(buffer) // => <Uint8Array 2d 2d 37 33 31 2d 77 55 45 72 7a 7a>
const decBuffer = base64Url.decode(encBuffer) // => <Uint8Array 00 02 04 08 0f 1f 3f 7f ff>

const encBufferToString = base64Url.encodeToString(buffer) // => '--731-wUErzz'
const decBufferFromString = base64Url.decodeFromString(encBufferToString) // => <Uint8Array 00 02 04 08 0f 1f 3f 7f ff>
```
## [API Documentation](https://github.com/Darkwolf/node-base64url/blob/master/docs/API.md)
## Contact Me
#### GitHub: [@PavelWolfDark](https://github.com/PavelWolfDark)
#### Telegram: [@PavelWolfDark](https://t.me/PavelWolfDark)
#### Email: [PavelWolfDark@gmail.com](mailto:PavelWolfDark@gmail.com)

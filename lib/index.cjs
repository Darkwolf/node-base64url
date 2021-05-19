'use strict'
const { TextEncoder, TextDecoder } = require('util')
const {
  ObjectCreate,
  ObjectDefineProperties,
  FunctionPrototypeBind,
  FunctionPrototypeSymbolHasInstance,
  Symbol,
  SymbolToStringTag,
  RangeError,
  SyntaxError,
  TypeError,
  NumberMAX_SAFE_INTEGER,
  NumberMIN_SAFE_INTEGER,
  NumberPrototypeToString,
  BigInt,
  MathFloor,
  MathLog,
  String,
  StringPrototypeCharCodeAt,
  StringPrototypeRepeat,
  StringPrototypeSafeSymbolIterator,
  TypedArrayPrototypeFill,
  Uint8Array,
  PrimitivesIsString,
  InstancesIsUint8Array,
  TypesToIntegerOrInfinity,
  TypesToBigInt
} = require('@darkwolf/primordials')

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

const alphabetSymbol = Symbol('alphabet')
const alphabetLookupSymbol = Symbol('alphabetLookup')
const baseMapSymbol = Symbol('baseMap')
const baseMapLookupSymbol = Symbol('baseMapLookup')
const encodeToStringSymbol = Symbol('encodeToString')
const decodeFromStringSymbol = Symbol('decodeFromString')
class Base64URL {
  constructor(alphabet) {
    if (alphabet === undefined) {
      alphabet = ALPHABET
    } else {
      validateAlphabet(alphabet)
    }
    const lookups = createAlphabetLookups(alphabet)
    this[alphabetSymbol] = alphabet
    this[alphabetLookupSymbol] = lookups.lookup
    this[baseMapSymbol] = lookups.baseMap
    this[baseMapLookupSymbol] = lookups.baseMapLookup
  }

  get alphabet() {
    return this[alphabetSymbol]
  }

  encodeInt(value) {
    let number = TypesToIntegerOrInfinity(value)
    if (number < NumberMIN_SAFE_INTEGER) {
      throw new RangeError('The value must be greater than or equal to the minimum safe integer')
    } else if (number > NumberMAX_SAFE_INTEGER) {
      throw new RangeError('The value must be less than or equal to the maximum safe integer')
    }
    const alphabet = this[alphabetSymbol]
    if (!number) {
      return alphabet[0]
    }
    const isNegative = number < 0
    if (isNegative) {
      number = -number
    }
    let result = ''
    while (number) {
      result = `${alphabet[number % 64]}${result}`
      number = MathFloor(number / 64)
    }
    return isNegative ? `~${result}` : result
  }

  decodeInt(string) {
    string = String(string)
    const {length} = string
    const alphabetLookup = this[alphabetLookupSymbol]
    const isNegative = string[0] === '~'
    let result = 0
    for (let i = isNegative && length > 1 ? 1 : 0; i < length; i++) {
      const char = string[i]
      const index = alphabetLookup[char]
      if (index === undefined) {
        throw new SyntaxError(`Invalid character "${char}" at index ${i} for base64url encoding`)
      }
      result = result * 64 + index
    }
    return isNegative && result > 0 ? -result : result
  }

  encodeBigInt(value) {
    let bigInt = TypesToBigInt(value)
    const alphabet = this[alphabetSymbol]
    if (!bigInt) {
      return alphabet[0]
    }
    const isNegative = bigInt < 0n
    if (isNegative) {
      bigInt = -bigInt
    }
    let result = ''
    while (bigInt) {
      result = `${alphabet[bigInt % 64n]}${result}`
      bigInt /= 64n
    }
    return isNegative ? `~${result}` : result
  }

  decodeBigInt(string) {
    string = String(string)
    const {length} = string
    const alphabetLookup = this[alphabetLookupSymbol]
    const isNegative = string[0] === '~'
    let result = 0n
    for (let i = isNegative && length > 1 ? 1 : 0; i < length; i++) {
      const char = string[i]
      const index = alphabetLookup[char]
      if (index === undefined) {
        throw new SyntaxError(`Invalid character "${char}" at index ${i} for Base64URL encoding`)
      }
      result = result * 64n + BigInt(index)
    }
    return isNegative ? -result : result
  }

  [encodeToStringSymbol](input) {
    const length = input.length >>> 0
    const alphabet = this[alphabetSymbol]
    const extraBytes = length % 3
    const extraLength = length - extraBytes
    let result = ''
    let index = 0
    while (index < extraLength) {
      const number = (input[index++] << 16) + (input[index++] << 8) + input[index++]
      result += alphabet[number >> 18 & 0x3f]
      result += alphabet[number >> 12 & 0x3f]
      result += alphabet[number >> 6 & 0x3f]
      result += alphabet[number & 0x3f]
    }
    if (extraBytes === 1) {
      const number = input[index]
      result += alphabet[number >> 2]
      result += alphabet[number << 4 & 0x3f]
    } else if (extraBytes === 2) {
      const number = (input[index++] << 8) + input[index]
      result += alphabet[number >> 10]
      result += alphabet[number >> 4 & 0x3f]
      result += alphabet[number << 2 & 0x3f]
    }
    return result
  }

  [decodeFromStringSymbol](string) {
    const {length} = string
    const alphabetLookup = this[alphabetLookupSymbol]
    const extraBytes = length % 4
    const extraLength = length - extraBytes
    const result = new Uint8Array(length * 3 >> 2)
    let index = 0
    let resultIndex = 0
    while (index < extraLength) {
      const char = string[index++]
      const byte = alphabetLookup[char]
      if (byte === undefined) {
        throw new SyntaxError(`Invalid character "${char}" at index ${index - 1} for Base64URL encoding`)
      }
      const char2 = string[index++]
      const byte2 = alphabetLookup[char2]
      if (byte2 === undefined) {
        throw new SyntaxError(`Invalid character "${char2}" at index ${index - 1} for Base64URL encoding`)
      }
      const char3 = string[index++]
      const byte3 = alphabetLookup[char3]
      if (byte3 === undefined) {
        throw new SyntaxError(`Invalid character "${char3}" at index ${index - 1} for Base64URL encoding`)
      }
      const char4 = string[index++]
      const byte4 = alphabetLookup[char4]
      if (byte4 === undefined) {
        throw new SyntaxError(`Invalid character "${char4}" at index ${index - 1} for Base64URL encoding`)
      }
      const number = (byte << 18) + (byte2 << 12) + (byte3 << 6) + byte4
      result[resultIndex++] = number >> 16 & 0xff
      result[resultIndex++] = number >> 8 & 0xff
      result[resultIndex++] = number & 0xff
    }
    if (extraBytes === 1) {
      const char = string[index]
      const byte = alphabetLookup[char]
      if (byte === undefined) {
        throw new SyntaxError(`Invalid character "${char}" at index ${index} for Base64URL encoding`)
      }
    } else if (extraBytes === 2) {
      const char = string[index++]
      const byte = alphabetLookup[char]
      if (byte === undefined) {
        throw new SyntaxError(`Invalid character "${char}" at index ${index - 1} for Base64URL encoding`)
      }
      const char2 = string[index]
      const byte2 = alphabetLookup[char2]
      if (byte2 === undefined) {
        throw new SyntaxError(`Invalid character "${char2}" at index ${index} for Base64URL encoding`)
      }
      const number = (byte << 2) + (byte2 >> 4)
      result[resultIndex] = number & 0xff
    } else if (extraBytes === 3) {
      const char = string[index++]
      const byte = alphabetLookup[char]
      if (byte === undefined) {
        throw new SyntaxError(`Invalid character "${char}" at index ${index - 1} for Base64URL encoding`)
      }
      const char2 = string[index++]
      const byte2 = alphabetLookup[char2]
      if (byte2 === undefined) {
        throw new SyntaxError(`Invalid character "${char2}" at index ${index - 1} for Base64URL encoding`)
      }
      const char3 = string[index]
      const byte3 = alphabetLookup[char3]
      if (byte3 === undefined) {
        throw new SyntaxError(`Invalid character "${char3}" at index ${index} for Base64URL encoding`)
      }
      const number = (byte << 10) + (byte2 << 4) + (byte3 >> 2)
      result[resultIndex++] = number >> 8 & 0xff
      result[resultIndex] = number & 0xff
    }
    return result
  }

  encodeText(string) {
    return this[encodeToStringSymbol](textEncoder.encode(String(string)))
  }

  decodeText(string) {
    return textDecoder.decode(this[decodeFromStringSymbol](String(string)))
  }

  encode(input) {
    if (!InstancesIsUint8Array(input)) {
      throw new TypeError('The input must be an instance of Uint8Array')
    }
    const length = input.length >>> 0
    const baseMap = this[baseMapSymbol]
    const extraBytes = length % 3
    const extraLength = length - extraBytes
    const result = new Uint8Array((length << 2 | 2) / 3)
    let index = 0
    let resultIndex = 0
    while (index < extraLength) {
      const number = (input[index++] << 16) + (input[index++] << 8) + input[index++]
      result[resultIndex++] = baseMap[number >> 18 & 0x3f]
      result[resultIndex++] = baseMap[number >> 12 & 0x3f]
      result[resultIndex++] = baseMap[number >> 6 & 0x3f]
      result[resultIndex++] = baseMap[number & 0x3f]
    }
    if (extraBytes === 1) {
      const number = input[index]
      result[resultIndex++] = baseMap[number >> 2]
      result[resultIndex] = baseMap[number << 4 & 0x3f]
    } else if (extraBytes === 2) {
      const number = (input[index++] << 8) + input[index]
      result[resultIndex++] = baseMap[number >> 10]
      result[resultIndex++] = baseMap[number >> 4 & 0x3f]
      result[resultIndex] = baseMap[number << 2 & 0x3f]
    }
    return result
  }

  decode(input) {
    if (!InstancesIsUint8Array(input)) {
      throw new TypeError('The input must be an instance of Uint8Array')
    }
    const length = input.length >>> 0
    const baseMapLookup = this[baseMapLookupSymbol]
    const extraBytes = length % 4
    const extraLength = length - extraBytes
    const result = new Uint8Array(length * 3 >> 2)
    let index = 0
    let resultIndex = 0
    while (index < extraLength) {
      const charCode = input[index++]
      const byte = baseMapLookup[charCode]
      if (byte === undefined) {
        throw new SyntaxError(`Invalid byte "${NumberPrototypeToString(charCode, 16)}" at index ${index - 1} for Base64URL encoding`)
      }
      const charCode2 = input[index++]
      const byte2 = baseMapLookup[charCode2]
      if (byte2 === undefined) {
        throw new SyntaxError(`Invalid byte "${NumberPrototypeToString(charCode2, 16)}" at index ${index - 1} for Base64URL encoding`)
      }
      const charCode3 = input[index++]
      const byte3 = baseMapLookup[charCode3]
      if (byte3 === undefined) {
        throw new SyntaxError(`Invalid byte "${NumberPrototypeToString(charCode3, 16)}" at index ${index - 1} for Base64URL encoding`)
      }
      const charCode4 = input[index++]
      const byte4 = baseMapLookup[charCode4]
      if (byte4 === undefined) {
        throw new SyntaxError(`Invalid byte "${NumberPrototypeToString(charCode4, 16)}" at index ${index - 1} for Base64URL encoding`)
      }
      const number = (byte << 18) + (byte2 << 12) + (byte3 << 6) + byte4
      result[resultIndex++] = number >> 16 & 0xff
      result[resultIndex++] = number >> 8 & 0xff
      result[resultIndex++] = number & 0xff
    }
    if (extraBytes === 1) {
      const charCode = input[index]
      const byte = baseMapLookup[charCode]
      if (byte === undefined) {
        throw new SyntaxError(`Invalid byte "${NumberPrototypeToString(charCode, 16)}" at index ${index} for Base64URL encoding`)
      }
    } else if (extraBytes === 2) {
      const charCode = input[index++]
      const byte = baseMapLookup[charCode]
      if (byte === undefined) {
        throw new SyntaxError(`Invalid byte "${NumberPrototypeToString(charCode, 16)}" at index ${index - 1} for Base64URL encoding`)
      }
      const charCode2 = input[index]
      const byte2 = baseMapLookup[charCode2]
      if (byte2 === undefined) {
        throw new SyntaxError(`Invalid byte "${NumberPrototypeToString(charCode2, 16)}" at index ${index} for Base64URL encoding`)
      }
      const number = (byte << 2) + (byte2 >> 4)
      result[resultIndex] = number & 0xff
    } else if (extraBytes === 3) {
      const charCode = input[index++]
      const byte = baseMapLookup[charCode]
      if (byte === undefined) {
        throw new SyntaxError(`Invalid byte "${NumberPrototypeToString(charCode, 16)}" at index ${index - 1} for Base64URL encoding`)
      }
      const charCode2 = input[index++]
      const byte2 = baseMapLookup[charCode2]
      if (byte2 === undefined) {
        throw new SyntaxError(`Invalid byte "${NumberPrototypeToString(charCode2, 16)}" at index ${index - 1} for Base64URL encoding`)
      }
      const charCode3 = input[index]
      const byte3 = baseMapLookup[charCode3]
      if (byte3 === undefined) {
        throw new SyntaxError(`Invalid byte "${NumberPrototypeToString(charCode3, 16)}" at index ${index} for Base64URL encoding`)
      }
      const number = (byte << 10) + (byte2 << 4) + (byte3 >> 2)
      result[resultIndex++] = number >> 8 & 0xff
      result[resultIndex] = number & 0xff
    }
    return result
  }

  encodeToString(input) {
    if (!InstancesIsUint8Array(input)) {
      throw new TypeError('The input must be an instance of Uint8Array')
    }
    return this[encodeToStringSymbol](input)
  }

  decodeFromString(input) {
    if (!PrimitivesIsString(input)) {
      throw new TypeError('The input must be a string')
    }
    return this[decodeFromStringSymbol](input)
  }
}

const isBase64URL = FunctionPrototypeBind(FunctionPrototypeSymbolHasInstance, null, Base64URL)

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

const createAlphabetLookups = alphabet => {
  const lookup = ObjectCreate(null)
  const baseMap = new Uint8Array(64)
  const baseMapLookup = ObjectCreate(null)
  for (let i = 0; i < 64; i++) {
    const char = alphabet[i]
    const charCode = StringPrototypeCharCodeAt(char)
    lookup[char] = i
    baseMap[i] = charCode
    baseMapLookup[charCode] = i
  }
  return {
    lookup,
    baseMap,
    baseMapLookup
  }
}

const base64url = new Base64URL()
const encodeInt = FunctionPrototypeBind(Base64URL.prototype.encodeInt, base64url)
const decodeInt = FunctionPrototypeBind(Base64URL.prototype.decodeInt, base64url)
const encodeBigInt = FunctionPrototypeBind(Base64URL.prototype.encodeBigInt, base64url)
const decodeBigInt = FunctionPrototypeBind(Base64URL.prototype.decodeBigInt, base64url)
const encodeText = FunctionPrototypeBind(Base64URL.prototype.encodeText, base64url)
const decodeText = FunctionPrototypeBind(Base64URL.prototype.decodeText, base64url)
const encode = FunctionPrototypeBind(Base64URL.prototype.encode, base64url)
const decode = FunctionPrototypeBind(Base64URL.prototype.decode, base64url)
const encodeToString = FunctionPrototypeBind(Base64URL.prototype.encodeToString, base64url)
const decodeFromString = FunctionPrototypeBind(Base64URL.prototype.decodeFromString, base64url)

const validateAlphabet = value => {
  if (!PrimitivesIsString(value)) {
    throw new TypeError('The alphabet must be a string')
  }
  if (value.length !== 64) {
    throw new RangeError('The length of the alphabet must be equal to 64')
  }
  const alphabetLookup = base64url[alphabetLookupSymbol]
  const uniqueCharsLookup = ObjectCreate(null)
  for (let i = 0; i < 64; i++) {
    const char = value[i]
    if (alphabetLookup[char] === undefined) {
      throw new SyntaxError(`Invalid character "${char}" at index ${i} for the Base64URL alphabet`)
    }
    if (uniqueCharsLookup[char]) {
      throw new SyntaxError(`The character "${char}" at index ${i} is already in the alphabet`)
    }
    uniqueCharsLookup[char] = i
  }
}

const isBase64URLString = value => {
  if (!PrimitivesIsString(value)) {
    return false
  }
  const alphabetLookup = base64url[alphabetLookupSymbol]
  for (const char of StringPrototypeSafeSymbolIterator(value)) {
    if (alphabetLookup[char] === undefined) {
      return false
    }
  }
  return true
}

ObjectDefineProperties(Base64URL, {
  ALPHABET: {
    value: ALPHABET
  },
  isBase64URL: {
    value: isBase64URL
  },
  isBase64URLString: {
    value: isBase64URLString
  },
  encodeInt: {
    value: encodeInt
  },
  decodeInt: {
    value: decodeInt
  },
  encodeBigInt: {
    value: encodeBigInt
  },
  decodeBigInt: {
    value: decodeBigInt
  },
  encodeText: {
    value: encodeText
  },
  decodeText: {
    value: decodeText
  },
  encode: {
    value: encode
  },
  decode: {
    value: decode
  },
  encodeToString: {
    value: encodeToString
  },
  decodeFromString: {
    value: decodeFromString
  }
})
ObjectDefineProperties(Base64URL.prototype, {
  [SymbolToStringTag]: {
    value: 'Base64URL'
  }
})

module.exports = Base64URL

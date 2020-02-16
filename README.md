![npm Version](https://img.shields.io/npm/v/@mrvanosh/mcp23s17?style=flat-square)
![npm](https://img.shields.io/npm/dw/@mrvanosh/mcp23s17?style=flat-square)

# MCP23S17
This is library to control the MCP23S17 IO-Expander.

I created this because MCP23S17 library that already exists in NPM is outdated and is not working on newer Node.JS versions.

This library support Node.JS versions 6, 8, 10, 12 and probably newers versions.

I will really appreciate making issues and pull requests on GitHub.

## Contents
  * [Installation](#installation)
  * [What's working](#whats-working)
  * [Coming soon](#coming-soon)
  * [Usage](#usage)
  * [API Documentation](#api-documentation)

## Installation
```
npm i @mrvanosh/mcp23s17
```

## What's working?
- Setting pin mode
- Writing pin state to HIGH or LOW

## Coming soon
- Reading state from pin
- Setting mode & writing state for many pins by array

## Usage
Write to first 4 pins on an MCP23S17 extender.

```js
const MCP23S17 = require('@mrvanosh/mcp23s17')

// MCP23S17 is on BUS 0 and it's device 0
// this stands for /dev/spidev0.0
const mcp = new MCP23S17(0, 0)

mcp.begin()

mcp.mode(0, 'out')
mcp.mode(1, 'out')
mcp.mode(2, 'out')
mcp.mode(3, 'out')

mcp.write(0, true)
mcp.write(1, true)
mcp.write(2, true)
mcp.write(3, true)
```

## API Documentation
All methods are asynchronous.

### Class MCP23S17
- [MCP23S17 Constructor](#mcp23s17busnumber-devicenumber)
- [device.begin(busNumber, deviceNumber)](#begin)
- [device.mode(pin, mode)](#modepin-mode)
  
### MCP23S17(busNumber, deviceNumber)
- busNumber - the number of the SPI bus to open, 0 for `/dev/spidev0.n`, 1 for `/dev/spidev1.n`, ...
- deviceNumber - the number of the SPI device to open, 0 for `/dev/spidevn.0`, 1 for `/dev/spidevn.1`, ...

### begin()
  Initializes MCP23S17

### mode(pin, mode)
Setup pin mode
- pin - pin on MCP23S17 numerated from 0 to 15
- mode - `'in'` for set pin to input, `'out'` for set pin to output

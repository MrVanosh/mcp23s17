![npm Version](https://img.shields.io/npm/v/@mrvanosh/mcp23s17?style=flat-square)
![npm](https://img.shields.io/npm/dw/@mrvanosh/mcp23s17?style=flat-square)

# MCP23x17
This is library to control the MCP23x17 (MCP23S17, MCP23017) IO-Expander.

I created this because MCP23S17 library that already exists in NPM is outdated and is not working on newer Node.JS versions.

This library support Node.JS versions 6, 8, 10, 12 and probably newers versions.

I will really appreciate making issues and pull requests on GitHub.

## Contents
  * [Installation](#installation)
  * [What's working](#whats-working)
  * [Usage](#usage)
  * [API Documentation](#api-documentation)

## Installation
```
npm i @mrvanosh/mcp23s17
```

## What's working?
- Setting pin mode
- Writing pin state to HIGH or LOW
- Reading pin state
- Pull-up input pins
- Software onChange callbacks

## Usage
Turn on LED on input change on an MCP23S17 extender.

```js
const {
  i2c,
  spi,
  MCP23x17,
  A7,
  B5,
  MODE_OUTPUT,
  MODE_INPUT,
  PULL_UP,
  OUTPUT_HIGH
} = require('@mrvanosh/mcp23s17');

(async () => {
  // MCP23S17 is on BUS 0 and it's device 0
  // this stands for /dev/spidev0.0
  // const bus = new spi(0,0);
  const bus = new i2c(1);
  const mcp = new MCP23x17(bus, 0x20)

  // Button is connected to pin #7 and ground
  // LED anode connected to pin #13 (B5), LED cathode is connected to ground through resistor 300 ohm

  await mcp.begin()

  // Set pin #7 (A7) as input with pull-up resistor
  const input = await mcp.mode(A7, MODE_INPUT, PULL_UP)
  // Set pin #13 (B5) as output with initial state LOW
  const output = await mcp.mode(B5, MODE_OUTPUT, OUTPUT_HIGH)

  input.onChange((value) => {
    // Revert value because input is pull-up
    output.write(!value);
  })

  while(1) {
    // continuously reading input to detect changes
    await mcp.read();
    // If you don't need track a immediate change, use small pause
    // await (new Promise((resolve) => setTimeout(resolve, 50)));
  }
})();
```
See more examples in `examples` directory

## API Documentation
All methods are asynchronous.

### Class MCP23S17
- [MCP23x17 Constructor](#mcp23s17busnumber-devicenumber)
- [device.begin(busNumber, deviceNumber)](#begin)
- [device.mode(pin, mode[, stateOrPullUp])](#modepin-mode)
- [device.read([pin])](#readpin)
- [device.write(pin, state)](#writepin-state)
- [device.directions(arrayOfPins)](#directionsarrayofpins)
- [device.toggle(pin)](#togglepin)
- [device.onChange(pin, callback)](#onchangepin-callback)
  
### MCP23x17(bus, slaveAddress)
- bus - object of interface SPI or I2C (`new spi(0,0)`, `new i2c(1)`)
- slaveAddress - address of mcp27x17 chip

### begin()
  Initializes MCP23S17

### mode(pin, mode)
Setup pin mode
- pin - pin on MCP23S17 numerated from 0 to 15
- mode - `MCP23S17.MODE_INPUT` or `MCP23S17.MODE_OUTPUT`
- stateOrPullUp - pull-up for inputs and LOW/HIGH state for outputs

### read([pin])
Read certain pin or read all pins to cache. Return true/false for pin reading or 16bit number with pins state
- pin - pin number for reading (0-15)

### write(pin, state)
Write LOW or HIGH value to output pin
- pin - pin number
- state - true/false

### directions(arrayOfPins)
Setting pins directions through 16 length array (see examples), Must be executed before `begin` function
- arrayOfPins - array of pin directions 

### toggle(pin)
Revert state of output pin
- pin - pin number

### onChange(pin, callback)
Track changes value at input pin and execute callback with new value
- pin - input pin number
- callback - function to be executed on pin state change

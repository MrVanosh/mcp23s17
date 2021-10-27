![npm Version](https://img.shields.io/npm/v/@mrvanosh/mcp23x17?style=flat-square)
![npm](https://img.shields.io/npm/dw/@mrvanosh/mcp23x17?style=flat-square)

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
npm i @mrvanosh/mcp23x17
```

## What's working?
- Setting pin mode
- Writing pin state to HIGH or LOW
- Reading pin state
- Pull-up input pins
- Software onChange callbacks

## Usage
Toggles LED on input (button) change on an MCP23x17 extender.

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
} = require('@mrvanosh/mcp23x17');

(async () => {
  // MCP23S17 is on BUS 0 and it's device 0
  // this stands for /dev/spidev0.0
  // const bus = new spi(0,0);

  // MCP23017 is on BUS 1 and it's device 1
  // const bus = new i2c(1);
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
    await input.read();
    // If you don't need track a immediate change, use small pause
    // await (new Promise((resolve) => setTimeout(resolve, 50)));
  }
})();
```
See more examples in `examples` directory

## API Documentation
All methods are asynchronous.

- [MCP23x17](#mcp23x17)
  - [Contents](#contents)
  - [Installation](#installation)
  - [What's working?](#whats-working)
  - [Usage](#usage)
  - [API Documentation](#api-documentation)
  - [Class MCP23x17](#class-mcp23x17)
    - [MCP23x17(bus, slaveAddress)](#mcp23x17bus-slaveaddress)
    - [directions(arrayOfPins)](#directionsarrayofpins)
    - [begin()](#begin)
    - [mode(pin, mode, stateOrPullUp)](#modepin-mode-stateorpullup)
    - [read([pin])](#readpin)
    - [write(pin, state) on MCP23x17 object](#writepin-state-on-mcp23x17-object)
    - [toggle(pin)](#togglepin)
    - [isPulledUp(pin)](#ispulleduppin)
    - [onChange(pin, callback)](#onchangepin-callback)
  - [InputPin](#inputpin)
    - [read()](#read)
    - [pullUp()](#pullup)
    - [pullOff()](#pulloff)
    - [onChange(callback)](#onchangecallback)
  - [OutputPin](#outputpin)
    - [write(state)](#writestate)
    - [high()](#high)
    - [low()](#low)
    - [toggle()](#toggle)

## Class MCP23x17

### MCP23x17(bus, slaveAddress)
- bus - object of interface SPI or I2C (`new spi(0,0)`, `new i2c(1)`)
- slaveAddress - address of MCP23x17 chip
e.g.
`const bus = new i2c(1);`
`const mcp = new MCP23x17(bus, 0x20);`

### directions(arrayOfPins)
Setting pins directions through 16 length array (see examples), Must be executed before `begin` function
- arrayOfPins - array of pin directions

### begin()
  Initializes MCP23x17
  e.g. `await mcp.begin();`

### mode(pin, mode, stateOrPullUp)
Setup pin mode
- pin - pin on MCP23X17 imported from library (A1, ..., A7) (B1, ... B7)
- mode - `MODE_INPUT` or `MODE_OUTPUT`
- stateOrPullUp - pull-up for inputs and LOW/HIGH state for outputs - `OUTPUT_HIGH`, `OUTPUT_LOW`, `PULL_UP`, `PULL_DOWN`
e.g.
`const input = await mcp.mode(A1, MODE_INPUT, PULL_UP)` - creates InputPin object
`const output = await mcp.mode(A2, MODE_OUTPUT, OUTPUT_HIGH)` - creates OutputPin object

### read([pin])
Read certain pin or read all pins to cache. Return true/false for pin reading or 16bit number with pins state
- pin - pin for reading (A1, ..., A7) (B1, ... B7)

### write(pin, state) on MCP23x17 object
Write LOW or HIGH value to output pin
- pin - pin number (A1, ..., A7) (B1, ... B7)
- state - true/false

### toggle(pin)
Revert state of output pin
- pin - pin number (A1, ..., A7) (B1, ... B7)

### isPulledUp(pin)
- pin - pin number (A1, ..., A7) (B1, ... B7)

### onChange(pin, callback)
Track changes value at input pin and execute callback with new value
- pin - input pin number
- callback - function to be executed on pin state change

## InputPin

### read()
Return true/false for pin reading

### pullUp()
Pull Up a pin

### pullOff()
Disable pull up on a pin

### onChange(callback)
Track changes value at input pin and execute callback with new value
- callback - function to be executed on pin state change

## OutputPin

### write(state)
Set pin state
- true/false -> true - ON, false - OFF

### high()
Set pin state to high

### low()
Set pin state to low

### toggle()
Revert state of output pin

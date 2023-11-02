![npm Version](https://img.shields.io/npm/v/@mrvanosh/mcp23x17?style=flat-square)
![npm](https://img.shields.io/npm/dw/@mrvanosh/mcp23x17?style=flat-square)

# MCP23x17

This library facilitates control of the MCP23x17 series of IO-Expanders, specifically the MCP23S17 (SPI interface) and MCP23017 (I2C interface).

I developed this library because the existing NPM package for the MCP23S17 was outdated and incompatible with newer versions of Node.JS.

This library supports Node.JS versions 12, 14, 16, and likely newer versions as well.

Your contributions through issues and pull requests on GitHub are highly appreciated.

## Contents

- [Installation](#installation)
- [What's Working](#whats-working)
- [Usage](#usage)
- [API Documentation](#api-documentation)

## Installation

```bash
npm i @mrvanosh/mcp23x17
```

## What's Working?

- Setting pin modes
- Writing HIGH or LOW states to pins
- Reading pin states
- Enabling pull-up resistors on input pins
- Implementing software-based onChange callbacks

## Usage

Example: Toggling an LED based on input (button) changes using the MCP23x17 IO-Expander.

```javascript
const {
  i2c,
  spi,
  MCP23x17,
  A7,
  B5,
  MODE_OUTPUT,
  MODE_INPUT,
  PULL_UP,
  OUTPUT_HIGH,
} = require("@mrvanosh/mcp23x17");

(async () => {
  // For MCP23S17 (SPI): Initialize with SPI bus and device numbers
  // Example for /dev/spidev0.0: const bus = new spi(0,0);

  // For MCP23017 (I2C): Initialize with I2C bus number
  const bus = new i2c(1);
  const mcp = new MCP23x17(bus, 0x20);

  // Connect a button to pin #7 and ground, and an LED (through a 300-ohm resistor) to pin #13 (B5)

  await mcp.begin();

  // Configure pin #7 (A7) as an input with a pull-up resistor
  const input = await mcp.mode(A7, MODE_INPUT, PULL_UP);
  // Configure pin #13 (B5) as an output, initially set to HIGH
  const output = await mcp.mode(B5, MODE_OUTPUT, OUTPUT_HIGH);

  input.onChange((value) => {
    // Invert the value because the input is pull-up
    output.write(!value);
  });

  while (true) {
    // Continuously read input to detect changes
    await input.read();
    // For less immediate change tracking, include a small delay
    // await (new Promise((resolve) => setTimeout(resolve, 50)));
  }
})();
```

More examples can be found in the `examples` directory.

## API Documentation

All methods are asynchronous.

### Class MCP23x17

#### MCP23x17(bus, slaveAddress)
- **bus**: An SPI or I2C interface object (`new spi(0,0)` for SPI, `new i2c(1)` for I2C).
- **slaveAddress**: The address of the MCP23x17 chip.

#### directions(arrayOfPins)
Sets the directions of pins using a 16-element array. Must be called before `begin`.
- **arrayOfPins**: An array specifying the directions of each pin.

#### begin()
Initializes the MCP23x17.

#### mode(pin, mode, stateOrPullUp)
Configures the mode of a pin.
- **pin**: The pin number (e.g., A1, B7).
- **mode**: Either `MODE_INPUT` or `MODE_OUTPUT`.
- **stateOrPullUp**: For inputs, use `PULL_UP` or `PULL_DOWN`. For outputs, use `OUTPUT_HIGH` or `OUTPUT_LOW`.

#### read([pin])
Reads the state of a specified pin or all pins.
- **pin**: (Optional) The specific pin to read.

#### write(pin, state)
Sets the state of an output pin.
- **pin**: The pin number.
- **state**: The desired state (true for HIGH, false for LOW).

#### toggle(pin)
Toggles the state of an output pin.
- **pin**: The pin number.

#### isPulledUp(pin)
Checks if a pin has a pull-up resistor enabled.
- **pin**: The pin number.

#### onChange(pin, callback)
Executes a callback function when the value of an input pin changes.
- **pin**: The pin number.
- **callback**: The function to execute on a state change.

### InputPin

#### read()
Returns the current state of the pin (true for HIGH, false for LOW).

#### pullUp()
Enables a pull-up resistor on the pin.

#### pullOff()
Disables the pull-up resistor on the pin.

#### onChange(callback)
Registers a callback function to be called when the pin's state changes.
- **callback**: The function to execute on a state change.

### OutputPin

#### write(state)
Sets the state of the pin.
- **state**: true for HIGH, false

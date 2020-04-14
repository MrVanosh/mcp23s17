const spi = require('spi-device')
const debug = require('debug')('mcp23s17')

const
  IODIRA = 0x00,
  IODIRB = 0x01,
  IPOLA = 0x02,
  IPOLB = 0x03,
  GPINTENA = 0x04,
  GPINTENB = 0x05,
  DEFVALA = 0x06,
  DEFVALB = 0x07,
  INTCONA = 0x08,
  INTCONB = 0x09,
  IOCONA = 0x0A,
  IOCONB = 0x0B,
  GPPUA = 0x0C,
  GPPUB = 0x0D,
  INTFA = 0x0E,
  INTFB = 0x0F,
  INTCAPA = 0x10,
  INTCAPB = 0x11,
  GPIOA = 0x12,
  GPIOB = 0x13,
  OLATA = 0x14,
  OLATB = 0x15

const IOCON = {
  INTPOL: 1 << 1, // This bit sets the polarity of the INT output pin
  ODR:    1 << 2, // Configures the INT pin as an open-drain output
  HAEN:   1 << 3, // Hardware Address Enable bit
  SEQOP:  1 << 5, // Sequential Operation mode bit
  MIRROR: 1 << 6, // INT Pins Mirror bit
  BANK:   1 << 7, // Controls how the registers are addressed
}

const
  MODE_INPUT = 'INPUT',
  MODE_OUTPUT = 'OUTPUT',
  OUTPUT_HIGH = true,
  OUTPUT_LOW = false

const READ = 0x01
const WRITE = 0x00

class MCP23S17 {
  _GPIO = 0x0000
  _GPPU = 0x0000
  _IODIR = 0xFFFF
  _mcp23s17 = null
  _isInitilized = false
  _deviceOpcode = 0x40
  _changeCallBacks = []

  constructor(busNumber, deviceNumber, slaveAddress = 0x00) {
    this._deviceOpcode |= (slaveAddress << 1)
    debug('Device opcode byte', this._deviceOpcode.toString(2))
    this._mcp23s17 = new Promise((resolve, reject) => {
      const mcp23s17 = spi.open(busNumber, deviceNumber, { maxSpeedHz: 10000000 }, err => {
        if (err) reject(err)
        resolve(mcp23s17)
      })
    })
  }

  async _getConnection() {
    if (!this._isInitilized) {
      throw new Error('Please call `begin` before')
    }
    return this._mcp23s17
  }

  _isInputMode(value) {
    return value === MODE_INPUT ||
           value === 1 ||
           value === true
  }

  _validatePin(pin, mode) {
    if (typeof (pin) !== 'number' || pin > 15 || pin < 0) {
      throw new Error('Invalid pin number')
    }
    if (mode) {
      if (mode === MODE_INPUT && !(this._IODIR & (1 << pin))) {
        throw new Error(`Pin #${pin} is configured as output`)
      } else if (mode === MODE_OUTPUT && (this._IODIR & (1 << pin))) {
        throw new Error(`Pin #${pin} is configured as input`)
      }
    }
  }

  async _transfer(R_W, register, value) {
    const mcp23s17 = await this._getConnection()
    const sendBuffer = Buffer.from([this._deviceOpcode | R_W, register, value])
    let message = [{
      sendBuffer,
      byteLength:    3,
      receiveBuffer: Buffer.alloc(3),
    }]
    debug('Request to device', sendBuffer)
    return new Promise((resolve, reject) => {
      mcp23s17.transfer(message, (err, message) => {
        err && reject(err)
        debug('Response from device', message[0].receiveBuffer)
        const hexValue = message[0].receiveBuffer.toString('hex')
        resolve(parseInt(hexValue, 16))
      })
    })
  }

  async _write(register, value) {
    debug(`Write register 0x${register.toString(16).toUpperCase()} = 0b${value.toString(2)}`)
    return this._transfer(WRITE, register, value)
  }

  async _read(register) {
    debug(`Read from register 0x${register.toString(16).toUpperCase()}`)
    return this._transfer(READ, register, 0x00)
  }

  _getRegisterValue(pin, value16Bit) {
    return pin < 8 ? value16Bit & 0xFF : value16Bit >> 8
  }

  _checkInputChanged(oldValue) {
    if (!this._changeCallBacks.length) {
      return;
    }
    debug("Check input pins changed")
    for (const i in this._changeCallBacks) {
      const checkBit = 1 << i;
      // If pin is in output mode now skipped it
      if (!(this._IODIR & checkBit)) {
        continue;
      }
      if ((oldValue & checkBit) !== (this._GPIO & checkBit)) {
        this._changeCallBacks[i](!!(this._GPIO & checkBit));
      }
    }
  }

  async begin() {
    this._isInitilized = true

    await this._write(IOCONA, 0x00 | IOCON.HAEN)
    await this._write(IOCONB, 0x00 | IOCON.HAEN)
    await this._write(IODIRA, this._getRegisterValue(0, this._IODIR))
    await this._write(IODIRB, this._getRegisterValue(8, this._IODIR))
    await this._write(GPPUA, this._getRegisterValue(0, this._GPPU))
    await this._write(GPPUB, this._getRegisterValue(8, this._GPPU))
    await this._write(GPIOA, this._getRegisterValue(0, this._GPIO))
    await this._write(GPIOB, this._getRegisterValue(8, this._GPIO))
  }

  directions(iodir) {
    if (this._isInitilized) {
      throw new Error('Function directions must be executed before calling `begin`')
    }
    if (typeof (iodir) !== 'number' && !Array.isArray(iodir)) {
      throw new Error('Invalid argument for directions function')
    }

    if (typeof (iodir) === 'number') {
      this._IODIR = iodir & 0xFFFF
      return
    }

    const setMode = (pin, mode) => {
      if (this._isInputMode(mode)) {
        this._IODIR |= (1 << pin);
      } else {
        this._IODIR &= (~(1 << pin));
      }
    }

    for (let n in iodir) {
      const value = iodir[n]
      if (typeof (value) === 'object') {
        setMode(n, value.mode)
        if (this._isInputMode(value.mode) && typeof (value.pullUp) !== 'undefined') {
          if (value.pullUp) {
            this._GPPU |= 1 << n
          } else {
            this._GPPU &= ~(1 << n)
          }
        } else if (!this._isInputMode(value.mode) && typeof (value.state) !== 'undefined') {
          if (value.state) {
            this._GPIO |= 1 << n
          } else {
            this._GPIO &= ~(1 << n)
          }
        }
      } else {
        setMode(n, value)
      }
    }

  }

  async mode(pin, mode, stateOrPullUp) {
    this._validatePin(pin)
    debug(`Set mode '${mode}' for pin #${pin}`)

    if (this._isInputMode(mode)) {
      this._IODIR |= (1 << pin)
    } else {
      this._IODIR &= (~(1 << pin))
    }

    await this._write(pin < 8 ? IODIRA : IODIRB, this._getRegisterValue(pin, this._IODIR))

    if (typeof (stateOrPullUp) !== 'undefined') {
      if (this._isInputMode(mode)) {
        if (stateOrPullUp) {
          this._GPPU |= (1 << pin)
        } else {
          this._GPPU &= (~(1 << pin))
        }
        await this._write(pin < 8 ? GPPUA : GPPUB, this._getRegisterValue(pin, this._GPPU))
      } else {
        await this.write(pin, !!stateOrPullUp)
      }
    }

    return this._isInputMode(mode) ? new InputPin(pin, this) : new OutputPin(pin, this);
  }

  async write(pin, state) {
    this._validatePin(pin, MODE_OUTPUT)
    debug(`Write ${state ? 'High' : 'Low'} value for pin #${pin}`)

    if (state) {
      this._GPIO |= (1 << pin)
    } else {
      this._GPIO &= (~(1 << pin))
    }

    return this._write(pin < 8 ? GPIOA : GPIOB, this._getRegisterValue(pin, this._GPIO))
  }

  async read(pin) {
    typeof(pin) !== 'undefined' && this._validatePin(pin, MODE_INPUT);
    debug(`Read ${typeof (pin) === 'undefined' ? 'pins' : `pin #${pin}`}`)

    const oldGPIO = this._GPIO;
    const register = (pin < 8 || typeof(pin) === 'undefined') ? GPIOA : GPIOB
    const value = await this._read(register);
    if (typeof (pin) !== 'undefined') {
      this._GPIO = (this._GPIO & (pin < 8 ? 0xFF00 : 0xFF)) | (value << (pin < 8 ? 0 : 8))
      this._checkInputChanged(oldGPIO);
      return this.get(pin)
    }
    const valueB = await this._read(GPIOB)
    this._GPIO = value | (valueB << 8)
    this._checkInputChanged(oldGPIO);

    return this._GPIO
  }

  get(pin) {
    this._validatePin(pin, MODE_INPUT)
    return !!(this._GPIO & (1 << pin))
  }

  getPin(pin) {
    return (this._IODIR & (1 << pin)) ? new InputPin(pin, this) : new OutputPin(pin, this);
  }

  async toggle(pin) {
    this._validatePin(pin, MODE_OUTPUT)

    return this.write(pin, !(this._GPIO & (1 << pin)))
  }

  onChange(pin, callback) {
    this._validatePin(pin, MODE_INPUT);
    this._changeCallBacks[pin] = callback.bind(this);
  }
}

class Pin {
  mcp;
  pin;

  constructor(pin, mcp) {
    this.pin = pin;
    this.mcp = mcp;
  }
}

class OutputPin extends Pin {
  write = async (level) => this.mcp.write(this.pin, level);
  low = async () => this.write(false);
  high = async () => this.write(true);
  toggle = async () => this.mcp.toggle(this.pin);
}

class InputPin extends Pin {
  read = async () => this.mcp.read(this.pin);
  pullUp = async () => this.mcp.mode(this.pin, MODE_INPUT, true);
  pullOff = async () => this.mcp.mode(this.pin, MODE_INPUT, false);
  onChange = (callback) => this.mcp.onChange(this.pin, callback);
}

module.exports = {
  MCP23S17,
  MODE_INPUT,
  MODE_OUTPUT,
  OUTPUT_HIGH,
  OUTPUT_LOW
}

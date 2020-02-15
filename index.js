const spi = require('spi-device');

const IODIRA   = 0x00,
  IODIRB   = 0x01,
  IPOLA    = 0x02,
  IPOLB    = 0x03,
  GPINTENA = 0x04,
  GPINTENB = 0x05,
  DEFVALA  = 0x06,
  DEFVALB  = 0x07,
  INTCONA  = 0x08,
  INTCONB  = 0x09,
  I0CONA   = 0x0A,
  I0CONB   = 0x0B,
  GPPUA    = 0x0C,
  GPPUB    = 0x0D,
  INTFA    = 0x0E,
  INTFB    = 0x0F,
  INTCAPA  = 0x10,
  INTCAPB  = 0x11,
  GPIOA    = 0x12,
  GPIOB    = 0x13,
  OLATA    = 0x14,
  OLATB    = 0x15,
  READ   = 0x01,
  WRITE   = 0x00,
  ADDR   = 0x04;

class MCP23S17 {
  constructor(busNumber, deviceNumber) {
    this._GPIOA = 0x00;
    this._GPIOB = 0x00;
    this._IODIRA = 0xFF;
    this._IODIRB = 0xFF;

    this.mcp23s17 = new Promise((resolve, reject) => {
      const mcp23s17 = spi.open(busNumber, deviceNumber, {maxSpeedHz: 10000000}, err => {
        if(err) reject(err);
        resolve(mcp23s17);
      });
    });
  }
  async begin() {
    const mcp23s17 = await this.mcp23s17;

    let message = [{
      sendBuffer: Buffer.from([0x40, I0CONA, 0x00]),
      byteLength: 3
    }];

    mcp23s17.transfer(message, (err, message) => {
      if(err) throw err;
    });

    return mcp23s17;
  }
  async mode(pin, mode) {
    const mcp23s17 = await this.mcp23s17;
    let registry, noshifts, value;
    if(pin < 8) {
      registry = IODIRA;
      noshifts = pin;
      value = this._IODIRA;
    } else {
      registry = IODIRB;
      noshifts = pin & 0x07;
      value = this._IODIRB;
    }

    if(mode === 'in') {
      value |= (1 << noshifts);
    } else {
      value &= (~(1 << noshifts));
    }

    const message = [{
      sendBuffer: Buffer.from([0x40, registry, value]),
      byteLength: 3
    }];
    mcp23s17.transfer(message, (err, message) => {
      if(err) throw err;
    });

    if(pin < 8) this._IODIRA = value;
    else this._IODIRB = value;
  }
  async write(pin, state) {
    this.mode(pin, 'out');
    const mcp23s17 = await this.mcp23s17;
    let registry, noshifts, value;
    if(pin < 8) {
      registry = GPIOA;
      noshifts = pin;
      value = this._GPIOA;
    } else {
      registry = GPIOB;
      noshifts = pin & 0x07;
      value = this._GPIOB;
    }

    if(state) {
      value |= (1 << noshifts);
    } else {
      value &= (~(1 << noshifts));
    }

    const message = [{
      sendBuffer: Buffer.from([0x40, registry, value]),
      byteLength: 3
    }];
    mcp23s17.transfer(message, (err, message) => {
      if(err) throw err;
    });

    if(pin < 8) this._GPIOA = value;
    else this._GPIOB = value;
  }
}

module.exports = MCP23S17;

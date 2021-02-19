const i2cBus = require('i2c-bus');

module.exports = class I2C {
  connection;

  constructor(busNumber) {
    this.connection = i2cBus.openPromisified(busNumber);
  }

  async write(addr, register, value) {
    const conn = await this.connection;
    return conn.writeByte(addr, register, value);
  }

  async read(addr, register) {
    const conn = await this.connection;
    return conn.readByte(addr, register);
  }
}

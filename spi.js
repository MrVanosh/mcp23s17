const spiDevice = require('spi-device')

const READ = 0x01
const WRITE = 0x00

module.exports = class SPI {
  connection;

  constructor(busNumber, deviceNumber) {
    this.connection = new Promise((resolve, reject) => {
      const conn = spiDevice.open(busNumber, deviceNumber, { maxSpeedHz: 10000000 }, err => {
        if (err) reject(err)
        resolve(conn)
      })
    })
  }

  async _transfer(R_W, addr, register, value) {
    const conn = await this.connection;
    const sendBuffer = Buffer.from([0x40 | addr | R_W, register, value])
    let message = [{
      sendBuffer,
      byteLength: 3,
      receiveBuffer: Buffer.alloc(3),
    }]
    return new Promise((resolve, reject) => {
      conn.transfer(message, (err, message) => {
        err && reject(err)
        const hexValue = message[0].receiveBuffer.toString('hex')
        resolve(parseInt(hexValue, 16))
      })
    })
  }

  async write(addr, register, value) {
    return this._transfer(WRITE, addr, register, value)
  }

  async read(addr, register) {
    return this._transfer(READ, addr, register, 0x00)
  }
}

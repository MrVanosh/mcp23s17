const {
  i2c,
  spi,
  MCP23x17,
  B5,
  MODE_OUTPUT,
  OUTPUT_HIGH
} = require('../');

(async () => {
  // MCP23S17 is on BUS 0 and it's device 0
  // this stands for /dev/spidev0.0
  // const bus = new spi(0,0);
  const bus = new i2c(1);
  const mcp = new MCP23x17(bus, 0x20)

  await mcp.begin()

  // Set pin B5 as output with HIGH state
  const output = await mcp.mode(B5, MODE_OUTPUT, OUTPUT_HIGH);

  setInterval(output.toggle, 500);
  // Or use mcp object with pin number
  // setInterval(() => mcp.toggle(B5), 500);
})();

const MCP23S17 = require('../');

(async () => {
  // MCP23S17 is on BUS 0 and it's device 0
  // this stands for /dev/spidev0.0
  const mcp = new MCP23S17.MCP23S17(0, 0)

  await mcp.begin()

  // Set pin #13 as output with HIGH state
  const output = await mcp.mode(13, MCP23S17.MODE_OUTPUT, true)

  setInterval(output.toggle, 500);
  // Or use mcp object with pin number
  // setInterval(() => mcp.toggle(13), 500);
})();

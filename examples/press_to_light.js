const MCP23S17 = require('../');

(async () => {
  // MCP23S17 is on BUS 0 and it's device 0
  // this stands for /dev/spidev0.0
  const mcp = new MCP23S17.MCP23S17(0, 0);

  // Button is connected to pin #7 and ground
  // LED anode connected to pin #13 (B5), LED cathode is connected to ground through resistor 300 ohm

  mcp.directions([
    1, 1, 1, 1, 1, 1, 1, {mode: MCP23S17.MODE_INPUT, pullUp: true},
    1, 1, 1, 1, 1, {mode: MCP23S17.MODE_OUTPUT, state: false}, 1, 1,
    ]);

  await mcp.begin()

  // Also you are able to set pins after begin
  // await mcp.mode(7, MCP23S17.MODE_INPUT, true)
  // await mcp.mode(13, MCP23S17.MODE_OUTPUT, true)

  // Set pin alias
  const output = mcp.getPin(13);
  const input = mcp.getPin(7);

  while(1) {
    // Revert value because input is pull-up
    await output.write(!await input.read());

    // Read only one pin
    // const value = await mcp.read(7);
    // await mcp.write(13, !value);

    // Read all pins and then get value
    // await mcp.read();
    // const value = mcp.get(7);
    // await mcp.write(13, !value);
  }
})();

const MCP23S17 = require('../');

(async () => {
  // MCP23S17 is on BUS 0 and it's device 0
  // this stands for /dev/spidev0.0
  const mcp = new MCP23S17.MCP23S17(0, 0);

  // Button is connected to pin #7 and ground
  // LED anode connected to pin #13 (B5), LED cathode is connected to ground through resistor 300 ohm

  await mcp.begin()

  // Set pin #7 (A7) as input with pull-up resistor
  const input = await mcp.mode(7, MCP23S17.MODE_INPUT, true)
  // Set pin #13 (B5) as output with initial state LOW
  const output = await mcp.mode(13, MCP23S17.MODE_OUTPUT, false)

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

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
} = require('../');

(async () => {
  // MCP23S17 is on BUS 0 and it's device 0
  // this stands for /dev/spidev0.0
  // const bus = new spi(0,0);
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
    await mcp.read();
    // If you don't need track a immediate change, use small pause
    // await (new Promise((resolve) => setTimeout(resolve, 50)));
  }
})();

/**
 * Run with: node --experimental-transform-types --no-warnings simple.ts
 */
import { RaptorQDecoder, RaptorQEncoder } from "../index.js";

const REPAIR_PACKETS = 10;
const SYMBOL_SIZE = 8;
const SOURCE_BLOCKS = 1;
const ALIGNMENT = 8;

const input = Buffer.from("Some data you want FEC for");

const encoder = new RaptorQEncoder(input, SYMBOL_SIZE, SOURCE_BLOCKS, ALIGNMENT);
const decoder = new RaptorQDecoder(encoder.getOti());

const packets = encoder.getPackets(REPAIR_PACKETS);

for (const packet of packets) {
  const result = decoder.addPacket(packet);

  if (result) {
    console.log("Restored", result.toString());
    process.exit();
  }
}

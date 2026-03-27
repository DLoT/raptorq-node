import { RaptorQDecoder, RaptorQEncoder } from '../index.js';
import { createWriteStream, readFileSync } from 'fs';
import { Readable, Transform, Writable } from 'stream';
import { pipeline } from 'stream/promises';

const SYMBOL_SIZE = 64;
const SOURCE_BLOCKS = 128;
const ALIGNMENT = 8;
const REPAIR_PACKETS = 50;

const abortController = new AbortController();
const { signal } = abortController;

const inputFile = readFileSync('./some-file');
const resultFile = createWriteStream('./some-file.restored');

const encoder = new RaptorQEncoder(inputFile, SYMBOL_SIZE, SOURCE_BLOCKS, ALIGNMENT);
const decoder = new RaptorQDecoder(encoder.getOti());

let lostPackets = 0;
let totalPackets = 0;
let bytesSent = 0;
let bytesTotal = 0;

(async () => {
  console.log('Start test');

  await start();

  console.log('Test finished');
})();

async function start() {

  try {
    await pipeline(
      getRaptorQPackets(),
      packetLoss(0.15),
      status(console.log),
      writeResult(),
      { signal }
    );
  } catch (error) {
    if ((<Error>error).name === 'AbortError') {
      shutdown();

      return;
    }

    console.error('Error -> %o', error);
  }
}

function shutdown() {
  console.log('Finished');
  console.log('Orignal size was %o', toMb(inputFile.length));
  console.log('Mb sent/received %o/%o ', toMb(bytesTotal), toMb(bytesSent));

  const ratio = lostPackets * 100 / totalPackets;
  console.log('Lost %o of %o packets: Ratio %o%', lostPackets, totalPackets, Number((ratio).toFixed(2)));
}

function toMb(bytes: number) {
  return Number((bytes / 1024 / 1024).toFixed(3));
}

function getRaptorQPackets(): Readable {
  const packets = encoder.getPackets(REPAIR_PACKETS);
  let index = 0;

  return new Readable({
    read() {
      if (index >= packets.length) {
        this.push(null);

        return;
      }

      this.push(packets[index]);
      index++;
    }
  });
}

function status(statusCallback: (status: { packetsSent: number, bytesSent: number }) => void) {
  let packetsSent = 0;

  return new Transform({
    transform(chunk, _encoding, callback) {
      packetsSent++;
      bytesSent += chunk.length;

      statusCallback({ packetsSent, bytesSent });

      callback(null, chunk);
    },
  });
}


function packetLoss(lossRate: number) {
  return new Transform({
    transform(chunk, _encoding, callback) {
      const rng = Math.random();
      totalPackets++;
      bytesTotal += chunk.length;
      if (rng < lossRate) {
        lostPackets++;
        callback();

        return;
      }

      bytesSent += chunk.length;

      callback(null, chunk);
    },
  });
}

function writeResult() {
  return new Writable({
    objectMode: false,
    write(chunk, _encoding, callback) {
     const result = decoder.addPacket(chunk);

      if (result) {
        resultFile.write(result);
        abortController.abort();
      }

      callback();
    },
  });
}

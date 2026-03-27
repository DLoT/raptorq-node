/* eslint-disable */
export declare class RaptorQDecoder {
  constructor(otiHeader: Buffer)
  addPacket(packetBuffer: Buffer): Buffer | null
}

export declare class RaptorQEncoder {
  constructor(data: Buffer, symbolSize: number, sourceBlocks: number, alignment: number)
  getOti(): Buffer
  getPackets(repairPackets: number): Buffer[]
}

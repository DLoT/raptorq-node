#![deny(clippy::all)]

use napi::bindgen_prelude::Buffer;

use raptorq::{Encoder, ObjectTransmissionInformation};

#[macro_use]
extern crate napi_derive;

#[napi]
pub fn encode(
  data: Buffer,
  symbol_size: u16,
  source_blocks: u8,
  alignment: u8,
  repair_packets: u32,
) -> Vec<Buffer> {
  let oti =
    ObjectTransmissionInformation::new(data.len() as u64, symbol_size, source_blocks, 1, alignment);

  let encoder = Encoder::new(&data.as_ref(), oti);

  encoder
    .get_encoded_packets(repair_packets)
    .into_iter()
    .map(|packet| Buffer::from(packet.serialize()))
    .collect()
}

#[napi]
pub fn get_oti(data_length: u32, symbol_size: u16, source_blocks: u8, alignment: u8) -> Buffer {
  let oti = ObjectTransmissionInformation::new(
    data_length as u64,
    symbol_size,
    source_blocks,
    1,
    alignment,
  );

  Buffer::from(oti.serialize().to_vec())
}

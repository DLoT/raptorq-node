#![deny(clippy::all)]

use napi::{bindgen_prelude::Buffer, Error, Status};
use napi_derive::napi;
use raptorq::{Decoder, Encoder, EncodingPacket, ObjectTransmissionInformation};

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

#[napi]
pub struct RaptorQDecoder {
  #[napi(skip)]
  pub inner: Decoder,
}

#[napi]
impl RaptorQDecoder {
  #[napi(constructor)]
  pub fn new(oti_header: Buffer) -> napi::Result<RaptorQDecoder> {
    let oti: &[u8; 12] = oti_header
      .as_ref()
      .try_into()
      .map_err(|_| Error::new(Status::InvalidArg, "OTI must be 12 bytes".to_string()))?;

    let oti = ObjectTransmissionInformation::deserialize(oti);
    Ok(RaptorQDecoder {
      inner: Decoder::new(oti),
    })
  }

  #[napi]
  pub fn add_packet(&mut self, packet_buffer: Buffer) -> Option<Buffer> {
    let packet = EncodingPacket::deserialize(packet_buffer.as_ref());
    self.inner.decode(packet).map(Buffer::from)
  }
}

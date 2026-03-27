#!/usr/bin/env bash

set -e

cargo clean

cargo build --release --target x86_64-unknown-linux-gnu \
  && cp target/x86_64-unknown-linux-gnu/release/libraptorq_node.so ./raptorq-node.linux-x64-gnu.node

cargo build --release --target aarch64-unknown-linux-gnu  \
&& cp target/aarch64-unknown-linux-gnu/release/libraptorq_node.so ./raptorq-node.linux-arm64-gnu.node

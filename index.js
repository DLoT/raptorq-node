import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

function getNativeBinding() {
  const { platform, arch } = process;

  if (platform !== 'linux') {
    throw new Error(`Unsupported platform: ${platform} only linux is supported`);
  }

  if (['x64', 'arm64'].includes(arch) === false){
    throw new Error(`Unsupported arch: ${arch} only x64 and arm64 are supported`);
  }

  try {
    return require(`./raptorq-node.linux-${arch}-gnu.node`);
  } catch (error) {
    console.log(error);
  }

  throw new Error("Failed to load bindings");
}

const nativeBinding = getNativeBinding();

export const { RaptorQDecoder, RaptorQEncoder } = nativeBinding;
export default nativeBinding;

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

function getBindingPath() {
  const { platform, arch } = process;
  if (platform !== 'linux') {
    return null;
  }

  if (arch === 'x64') {
    return 'linux-x64-gnu';
  }

  if (arch === 'arm64') {
    return 'linux-arm64-gnu';
  }

  return null;
};

function load() {
  const suffix = getBindingPath();
  if (!suffix) {
    throw new Error(`Unsupported platform/arch: ${process.platform} ${process.arch}`);
  }

  const paths = [
    `./raptorq-node.${suffix}.node`,
    `@dlot/raptorq-node/raptorq-node-${suffix}`
  ];

  for (const path of paths) {
    try {
      return require(path);
    } catch (e) {
      loadErrors.push(e);
    }
  }

  console.log(loadErrors);
  throw new Error("Failed to load native raptorq bindings");
}

const nativeBinding = load();

export const { RaptorQDecoder, RaptorQEncoder } = nativeBinding;
export default nativeBinding;

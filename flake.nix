{
  description = "Rust development flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    rust-overlay.url = "github:oxalica/rust-overlay";
  };

  outputs =
    {
      self,
      nixpkgs,
      rust-overlay,
      ...
    }:
    let
      system = "x86_64-linux";
      overlays = [ (import rust-overlay) ];
      pkgs = import nixpkgs {
        inherit system overlays;
      };

      aarch64-pkgs = pkgs.pkgsCross.aarch64-multiplatform;

      rustToolchain = pkgs.rust-bin.stable.latest.default.override {
        targets = [
          "x86_64-unknown-linux-gnu"
          "aarch64-unknown-linux-gnu"
        ];
        extensions = [
          "rust-src"
          "rust-analyzer"
        ];
      };
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        RUST_SRC_PATH = "${rustToolchain}/lib/rustlib/src/rust/library";
        CARGO_TARGET_AARCH64_UNKNOWN_LINUX_GNU_LINKER = "aarch64-unknown-linux-gnu-gcc";

        nativeBuildInputs = with pkgs; [
          yarn
          pkg-config
        ];

        buildInputs = with pkgs; [
          rustToolchain
          stdenv.cc.cc.lib
          aarch64-pkgs.buildPackages.gcc
        ];

        shellHook = ''
          echo "Rust shell active (${system})"
        '';
      };
    };
}

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
      pkgs = import nixpkgs { inherit system overlays; };

      rustToolchain = pkgs.rust-bin.stable.latest.default.override {
        extensions = [
          "rust-src"
          "rust-analyzer"
        ];
      };
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        RUST_SRC_PATH = "${rustToolchain}/lib/rustlib/src/rust/library";

        buildInputs = with pkgs; [
          rustToolchain
          pkg-config
          yarn
          napi-rs-cli
        ];

        shellHook = ''
          echo "Rust shell active (${system})"
        '';
      };
    };
}

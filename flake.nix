{
  description = "nix-team development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.nix-team = pkgs.mkShell {
          name = "nix-team";
          buildInputs = with pkgs; [
            go
            nodejs_20
            docker
            docker-compose
            pnpm
            rustc
            cargo
          ];

          shellHook = ''
            export PS1="\n\[\033[1;32m\][nix-team]\[\033[0m\] \[\033[1;34m\]\w\[\033[0m\] $ "
            
            echo "Starting My Dev Environment..."
            echo "Running pnpm install..."
            pnpm install || {
              echo "pnpm install failed"
              exit 1
            }
            echo "Running pnpm typesense..."
            pnpm typesense || {
              echo "pnpm typesense failed"
              exit 1
            }
          
            echo "Environment setup complete. You are now in the nix-team shell."
            
            echo "Nix-team shell active. Type 'exit' to leave."
          '';
        };
      }
    );
}
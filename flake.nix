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
            caddy
            which
            polkit
          ];

          shellHook = ''
            export PS1="\n\[\033[1;32m\][nix-team]\[\033[0m\] \[\033[1;34m\]\w\[\033[0m\] $ "

            # Create the sudo-caddy-wrapper script
            echo "Creating sudo-caddy-wrapper script..."
            cat << 'EOF' > /tmp/sudo-caddy-wrapper.sh
            #!/bin/sh
            CADDY_PATH=$(which caddy)
            sudo env "PATH=$PATH" $CADDY_PATH "$@"
            EOF
            chmod +x /tmp/sudo-caddy-wrapper.sh
            export PATH=/tmp:$PATH

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


            echo "The services are hosted at the following URLs:"
            echo "Typesense: http://localhost:8108"
            echo "Typesense Dashboard: http://localhost:8800"
            echo "Caddy: http://localhost (HTTP), https://localhost (HTTPS)"
          
            echo "Environment setup complete. You are now in the nix-team shell."
            echo "Nix-team shell active. Type 'exit' to leave."
          '';
        };
      }
    );
}
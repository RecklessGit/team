#!/bin/bash

# Update Nix channels and packages
echo "Updating Nix channels..."
nix-channel --update

# Upgrade all installed packages
echo "Upgrading installed packages..."
nix-env -u '*'

# Clean up the Nix store
echo "Cleaning up the Nix store..."
nix-collect-garbage -d

# Optimize the Nix store by removing dead symlinks
echo "Optimizing the Nix store..."
nix-store --optimise

# Delete all generations except the current one
echo "Deleting old generations..."
nix-env --delete-generations old

# Clear the Nix Flake registry cache
echo "Clearing the Nix Flake registry cache..."
rm -rf ~/.cache/nix/flake-registry

# Clear the Nix Flake lock files
echo "Clearing Nix Flake lock files..."
find ~/.config/nixpkgs -name '*.lock' -delete

# Perform Nix store garbage collection
echo "Performing Nix store garbage collection..."
nix-store --gc

# Delete unused profiles
echo "Deleting unused profiles..."
for profile in $(ls ~/.nix-profile); do
    nix-env -p ~/.nix-profile/$profile --delete-generations old
done

echo "Nix Flakes cleanup completed!"

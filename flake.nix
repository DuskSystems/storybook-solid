{
  description = "storybook-solid";

  inputs = {
    nixpkgs = {
      url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    };
  };

  # nix flake show
  outputs =
    {
      nixpkgs,
      ...
    }:

    let
      perSystem = nixpkgs.lib.genAttrs nixpkgs.lib.systems.flakeExposed;

      systemPkgs = perSystem (
        system:

        import nixpkgs {
          inherit system;

          overlays = [
            (final: prev: {
              biome = prev.callPackage ./nix/biome.nix { };
            })
          ];
        }
      );

      perSystemPkgs = f: perSystem (system: f (systemPkgs.${system}));
    in
    {
      packages = perSystemPkgs (pkgs: {
        biome = pkgs.biome;
      });

      devShells = perSystemPkgs (pkgs: {
        # nix develop
        default = pkgs.mkShell {
          name = "storybook-solid-shell";

          env = {
            # Nix
            NIX_PATH = "nixpkgs=${nixpkgs.outPath}";

            # Storybook
            STORYBOOK_DISABLE_TELEMETRY = "1";

            # Node
            NODE_OPTIONS = "--disable-warning=ExperimentalWarning";

            # Playwright
            # NOTE: Ensure the package version here matches the version in `package.json` exactly.
            PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
            PLAYWRIGHT_HOST_PLATFORM_OVERRIDE = "nixos";
          };

          buildInputs = with pkgs; [
            # Node
            nodejs_23
            pnpm_10
            vtsls
            biome
            vscode-langservers-extracted
            package-version-server

            # Nix
            nix-update
            nixfmt-rfc-style
            nixd
            nil
          ];
        };
      });
    };
}

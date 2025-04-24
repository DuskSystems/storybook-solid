{
  lib,
  rustPlatform,
  fetchFromGitHub,
}:

rustPlatform.buildRustPackage (finalAttrs: {
  pname = "biome";
  version = "2.0.0-beta.2";

  src = fetchFromGitHub {
    owner = "biomejs";
    repo = "biome";
    rev = "@biomejs/biome@${finalAttrs.version}";
    hash = "sha256-ecI+9+PETvB1GDs2S8AjtiVw8vT83ntAlI/5H4taSKM=";
  };

  useFetchCargoVendor = true;
  cargoHash = "sha256-7i9KqrYYalDGvPWpp7UA7MNIEQklVwc3RkW77a9M/Z4=";

  cargoBuildFlags = [
    "--bin=biome"
  ];

  env = {
    BIOME_VERSION = finalAttrs.version;
  };

  doCheck = false;

  meta = {
    description = "One toolchain for your web project.";
    homepage = "https://biomejs.dev";
    changelog = "https://github.com/biomejs/biome/releases";
    license = lib.licenses.mit;
    platforms = lib.platforms.unix;
    maintainers = [ lib.maintainers.cathalmullan ];
    sourceProvenance = [ lib.sourceTypes.fromSource ];
    mainProgram = "biome";
  };
})

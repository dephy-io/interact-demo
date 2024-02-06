set -e

HOMEBREW_NO_AUTO_UPDATE=1

TARGET_LIST=(
    "aarch64-unknown-linux-gnu"
    "x86_64-unknown-linux-gnu"
    "aarch64-unknown-linux-musl"
    "x86_64-unknown-linux-musl"
    "x86_64-apple-darwin"
    "aarch64-apple-darwin"
    "x86_64-pc-windows-gnu"
)

brew tap messense/macos-cross-toolchains

rm -rf target/out
mkdir -p target/out

for T in "${TARGET_LIST[@]}"
do
    echo "building for target $T..."
    brew install messense/macos-cross-toolchains/$T || true
    rustup target add $T
    cargo build --target=$T --release
    mkdir -p target/out/$T
    cp target/$T/release/debug-utils* target/out/$T/
    rm target/out/$T/debug-utils.d
done

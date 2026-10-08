"""Build this throwaway probe using the isolated toolchain installed for this task."""
from pathlib import Path
import os, subprocess
root = Path(__file__).resolve().parent
cache = Path.home()/'.cache/velvetroom-prototype'
env = os.environ.copy()
env.update(CARGO_HOME=str(cache/'media-rust/cargo'), RUSTUP_HOME=str(cache/'media-rust/rustup'), CARGO_TARGET_DIR=str(cache/'media-target'))
env['PATH'] = str(cache/'media-rust/cargo/bin') + os.pathsep + env['PATH']
if not (root/'src-tauri/media-probe').exists() or (root/'native/MediaProbe.swift').stat().st_mtime > (root/'src-tauri/media-probe').stat().st_mtime:
 subprocess.run(['/Library/Developer/CommandLineTools/usr/bin/swiftc', '-sdk', '/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk', '-target', 'arm64-apple-macosx15.0', '-parse-as-library', '-O', '-o', str(root/'src-tauri/media-probe'), str(root/'native/MediaProbe.swift')], check=True)
subprocess.run([str(cache/'media-node/node_modules/.bin/tauri'), 'build', '--bundles', 'app'], cwd=root, env=env, check=True)

# Local ad-hoc integrity signing only; no developer identity or notarization.
bundle=cache/'media-target/release/bundle/macos/Velvetroom Media Lab.app'
subprocess.run(['codesign','--force','--sign','-',str(bundle/'Contents/Resources/media-probe')],check=True)
subprocess.run(['codesign','--force','--sign','-',str(bundle)],check=True)
subprocess.run(['codesign','--verify','--deep','--strict',str(bundle)],check=True)

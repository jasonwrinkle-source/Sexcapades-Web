# Sexcapades Packaging & Deploy Pipeline

This directory holds the production release scripts for Sexcapades.

## Active Scripts (v4.0)

- **`package-deploy-all-4.0.sh`**: Master single-command release packager.
  - Builds all optimized deliverables (`app.html`, `gate.html`, `quickstart.html`, `guide.html`).
  - Stalls duplicate assets and extracts CSS/JS/images.
  - Verifies hashes, gates, and permissions.
  - Produces `deploy-all-v4.0-<date>_<time>-optimized.tar.gz`.
- **`package-deploy-app-4.0.sh`**: Lightweight packager for app-only deploys (`deploy-app-v4.0-*.tar.gz`).
- **`sexcapades-3.5-optimize.py`**: The extraction, asset deduping, and minification engine invoked by the release shell scripts.
- **`sexcapades-drive-upload.sh`**: Google Drive pre-release/snapshot backup uploader.

## Archived Scripts

- **`archive-v3.5/`**: Historical deployment scripts from the legacy v3.5 releases.

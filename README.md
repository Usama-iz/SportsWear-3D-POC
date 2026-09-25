# SportsWear 3D POC

Three-page technical POC for Noura Tech / InvoZone validation.

## Current Slice

- Page 1: React + Three.js customizer using the supplied GLB and SVG master artwork.
- Page 2: sample order, roster, generated proof revision, change request, approval lock, revision history.
- Page 3: order-linked customer/merchandiser thread, file references, revision references, status timeline.
- Browser persistence with localStorage.
- Structured design/order JSON exports.
- Clickable proof revision inspection.
- Customer-entered change requests.
- Revised proof/version flow labels.
- Proof PNG download.
- Approximate logo placement controls for X/Y/scale.

## Run

```bash
npm install --no-audit --no-fund
npm run dev
```

The app expects the supplied jersey assets under `public/assets`.

See `TECHNICAL_WALKTHROUGH.md` for implementation details and the full testing checklist.

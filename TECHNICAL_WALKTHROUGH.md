# SportsWear 3D POC Technical Walkthrough

This POC validates the Phase 1 direction requested by Noura Tech: structured design data drives the 3D customizer, proof generation, roster approval, and order communication flow.

## Tech Stack

- Vite for the local development/build toolchain.
- React + TypeScript for the application UI and typed POC data model.
- Three.js through `@react-three/fiber` and `@react-three/drei` for the 3D garment preview.
- Zustand for lightweight in-browser state management.
- Zustand persistence middleware for localStorage demo continuity.
- Canvas 2D + SVG parsing for dynamic jersey texture generation.
- CSS in `src/styles.css` for the full POC interface.

## Implemented Structure

```text
SportsWear-3d-POC/
  public/assets/
    Soccer_Crew_neck_SS.glb
    Soccer_Crew_neck_SS_masterfile_v.02.svg
    UV.png
    detail-layers/
  src/
    App.tsx
    main.tsx
    styles.css
    components/
      CommunicationPage.tsx
      CustomizerPage.tsx
      DesignProofImage.tsx
      JerseyScene.tsx
      ProofPage.tsx
    lib/
      assets.ts
      exportOrder.ts
      textureRenderer.ts
    store/
      pocStore.ts
    types/
      poc.ts
```

## Key Files

### `src/types/poc.ts`

Defines the typed data contracts used by the POC:

- `DesignConfig`: structured customization state.
- `RosterPlayer`: roster row data.
- `ProofRevision`: versioned proof snapshot.
- `OrderMessage`: customer/merchandiser message.
- `TimelineEvent`: audit/status timeline entry.
- `SampleOrder`: complete sample order state.

### `src/store/pocStore.ts`

Central Zustand store for the POC. It owns:

- current active page
- current structured design state
- sample order data
- roster edits
- proof revision creation
- change request flow
- approval and locking
- message/audit timeline events
- localStorage persistence
- demo reset action

This is intentionally in-browser for the POC. In Phase 1, these actions would map to backend API endpoints.

### `src/lib/textureRenderer.ts`

This is the most important technical file for the POC.

It loads the supplied Illustrator SVG master file, recolors named garment zones, draws crest/logo, sponsor text, player name, and player number, then outputs a canvas texture.

The same renderer is used by:

- 3D jersey preview in `JerseyScene.tsx`
- proof image preview in `DesignProofImage.tsx`

This demonstrates the single-source-of-truth requirement.

### `src/lib/exportOrder.ts`

Builds downloadable JSON exports for the current design and complete sample order. The order export includes roster, revisions, messages, timeline, active revision, and normalized design snapshots.

### `src/components/JerseyScene.tsx`

Loads the supplied GLB model:

```text
public/assets/Soccer_Crew_neck_SS.glb
```

Then applies the generated canvas texture to a Three.js material. The GLB has UVs but no embedded materials/textures, so the material is created in code.

### `src/components/CustomizerPage.tsx`

Implements POC Page 1:

- live 3D garment viewer
- zone color controls
- logo upload/removal
- logo X/Y/scale placement controls
- sponsor text
- player name
- player number
- font color
- structured JSON preview
- design JSON export
- save proof version action

### `src/components/ProofPage.tsx`

Implements POC Page 2:

- generated proof preview from the same design state
- simplified front/back proof cards
- roster table with names, numbers, sizes, quantities
- proof revision generation
- request change flow
- approve and lock flow
- revision history list
- clickable revision inspection
- full order JSON export
- customer-entered change requests
- revised proof/version flow labels
- generated proof PNG download

### `src/components/CommunicationPage.tsx`

Implements POC Page 3:

- order-linked conversation thread
- assigned merchandiser
- customer message composer
- file reference upload
- revision-linked messages
- order status timeline
- audit metadata with author and timestamp
- ready-for-production handoff action after approval

## Data Flow

```text
User changes colors/logo/text
  -> Zustand updates DesignConfig
  -> textureRenderer converts DesignConfig into canvas texture
  -> JerseyScene applies texture to GLB material
  -> DesignProofImage uses same renderer for proof preview
  -> createProofRevision snapshots DesignConfig + roster
  -> approveProof locks order and records audit event
```

## Asset Notes

The supplied GLB is usable for the POC because it contains geometry, normals, and UVs.

Important limitation:

- the GLB does not contain embedded materials or textures
- zone-level recoloring is done through generated texture mapping, not mesh material slots

This is acceptable for the POC and aligns with the Phase 1 requirement that design output should come from structured data.

## Local Setup

Run from the POC folder:

```bash
cd /Users/usamamehmood/Documents/Sportswear-3d/SportsWear-3d-POC
npm install --no-audit --no-fund
npm run dev
```

Open the local Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

## Testing Checklist

### 1. Install And Build

```bash
cd /Users/usamamehmood/Documents/Sportswear-3d/SportsWear-3d-POC
npm install --no-audit --no-fund
npm run build
```

Expected result:

- dependencies install successfully
- TypeScript check passes
- Vite production build completes

### 2. Start Dev Server

```bash
npm run dev
```

Expected result:

- Vite starts without runtime errors
- browser opens the app at `http://localhost:5173`

### 3. Page 1 Customizer Test

Open the Customizer page and verify:

- GLB jersey loads in the viewer
- orbit/zoom controls work
- changing zone colors updates the 3D jersey
- sponsor text updates on the design
- player name updates on the design
- player number updates on the design
- text color updates on the design
- uploading a PNG/JPG/SVG logo updates the design texture
- removing logo restores placeholder crest
- structured JSON updates as controls change
- Save Proof Version navigates to Proof page

### 4. Page 2 Proof/Roster/Approval Test

On the Proof page verify:

- generated proof image uses the current design state
- roster shows at least three players
- player name, number, size, and quantity can be edited before approval
- Generate Proof creates a new revision
- Request Change submits the typed customer note and changes order status to `Changes Requested`
- a later Generate Proof creates a revised proof and visible `v1->v2` flow
- revision history keeps previous proof versions
- Download Proof PNG exports the generated proof image
- Approve & Lock changes status to `Approved`
- after approval, roster fields are disabled
- top status pill shows locked state

### 5. Page 3 Communication Test

On the Thread page verify:

- order ID is visible
- merchandiser assignment is visible
- current order status is visible
- customer can send a message
- message appears in the order thread
- attaching a file records the file name
- message can reference the active proof revision
- timeline shows events such as Proof Sent, Changes Requested, and Approved
- each thread/timeline item shows user/role/timestamp metadata

### 6. Single Source Of Truth Test

Run this manual flow:

1. Go to Customizer.
2. Change base color, sponsor text, name, and number.
3. Move and scale the logo placement.
4. Click Save Proof Version.
5. Confirm the Proof page reflects the same design.
6. Return to Customizer and change the design again.
7. Click Generate Proof.
8. Confirm revision history keeps both versions and each revision can be inspected.

Expected result:

- customizer, proof image, revision snapshot, and structured JSON are all driven from the same design object.

### 7. Mobile Responsiveness Test

In browser dev tools test widths:

- 390 px
- 768 px
- 1280 px

Expected result:

- top navigation remains usable
- 3D viewer remains visible
- controls stack cleanly on mobile
- proof roster table scrolls horizontally when needed
- communication thread remains readable

### 8. Persistence And Export Test

Run this flow:

1. Change colors/text/logo placement.
2. Generate a proof.
3. Refresh the browser.
4. Confirm the design/order state remains.
5. Click Export Design JSON.
6. Click Export Order JSON.

Expected result:

- localStorage restores the demo state after refresh
- downloaded JSON includes structured design data and order traceability data

## Known POC Limitations

- No real backend yet; data is stored in browser state.
- localStorage is only for demo continuity and not a production persistence layer.
- No real authentication yet.
- No real payment or checkout yet.
- No production print-file export yet.
- Logo/name/number slots are approximate POC placements.
- SVG-to-texture rendering should be validated in the browser after dependencies are installed.

## Next Implementation Steps

1. Run dependency install and verify GLB/SVG rendering in browser.
2. Tune UV-space placements for logo, sponsor, name, and number.
3. Tune UV-space placements for logo, sponsor, name, and number after browser visual review.
4. Add a simple image export for generated proof previews.
5. Add automated browser checks with Playwright once the local server can be started.

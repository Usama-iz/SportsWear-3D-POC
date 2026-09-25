import { Download, RotateCcw, Save, Upload, X } from 'lucide-react';
import { downloadJson } from '../lib/exportOrder';
import { designSnapshot } from '../lib/textureRenderer';
import { usePocStore } from '../store/pocStore';
import type { TextPlacementKey, ZoneKey } from '../types/poc';
import { JerseyScene } from './JerseyScene';

const zoneLabels: Array<{ key: ZoneKey; label: string }> = [
  { key: 'base', label: 'Base' },
  { key: 'sleeves', label: 'Sleeves' },
  { key: 'collar', label: 'Collar' },
  { key: 'pattern', label: 'Pattern' },
  { key: 'accent', label: 'Accent' },
  { key: 'trim', label: 'Trim' },
];

const textPlacementLabels: Array<{ key: TextPlacementKey; label: string }> = [
  { key: 'sponsor', label: 'Front Sponsor' },
  { key: 'name', label: 'Back Name' },
  { key: 'number', label: 'Back Number' },
];

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;
const formatScale = (value: number) => `${value.toFixed(2)}x`;

interface CustomizerPageProps {
  embedded?: boolean;
}

export function CustomizerPage({ embedded = false }: CustomizerPageProps) {
  const design = usePocStore((state) => state.design);
  const updateZone = usePocStore((state) => state.updateZone);
  const updateDesignField = usePocStore((state) => state.updateDesignField);
  const setLogoFromFile = usePocStore((state) => state.setLogoFromFile);
  const clearLogo = usePocStore((state) => state.clearLogo);
  const resetDesign = usePocStore((state) => state.resetDesign);
  const createProofRevision = usePocStore((state) => state.createProofRevision);
  const setActivePage = usePocStore((state) => state.setActivePage);

  const saveProof = () => {
    createProofRevision();
    setActivePage('proof');
  };

  const updateTextPlacement = (
    key: TextPlacementKey,
    field: 'x' | 'y' | 'scale',
    value: number,
  ) => {
    updateDesignField('textPlacements', {
      ...design.textPlacements,
      [key]: {
        ...design.textPlacements[key],
        [field]: value,
      },
    });
  };

  const Root = embedded ? 'div' : 'main';

  return (
    <Root className={`customizer-grid${embedded ? ' customizer-grid-embedded' : ''}`}>
      <section className="viewer-surface" aria-label="3D jersey preview">
        <div className="viewer-toolbar">
          <div>
            <p className="eyebrow">Live 3D</p>
            <h2>Noura soccer jersey</h2>
          </div>
          <div className="viewer-chips" aria-label="Preview metadata">
            <span>GLB</span>
            <span>UV texture</span>
            <span>{design.playerNumber}</span>
          </div>
        </div>
        <div className="viewer-canvas">
          <JerseyScene design={design} />
        </div>
        <div className="viewer-footer">
          <span>Template</span>
          <strong>Soccer Crew Neck SS</strong>
          <span>Player</span>
          <strong>{design.playerName || 'Unassigned'}</strong>
        </div>
      </section>

      <aside className="tool-panel customizer-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Page 1</p>
            <h1>Jersey Customizer</h1>
          </div>
          <button
            className="icon-button"
            type="button"
            title="Reset sample design"
            onClick={resetDesign}
          >
            <RotateCcw size={18} />
          </button>
        </div>
        <div className="panel-summary">
          <article>
            <span>Sponsor</span>
            <strong>{design.sponsorText || 'Not set'}</strong>
          </article>
          <article>
            <span>Name / No.</span>
            <strong>
              {design.playerName || 'Player'} / {design.playerNumber || '--'}
            </strong>
          </article>
        </div>

        <section className="control-section first-section">
          <h2>Zones</h2>
          <div className="swatch-grid">
            {zoneLabels.map((zone) => (
              <label className="swatch-control" key={zone.key}>
                <span>
                  <i style={{ background: design.zones[zone.key] }} />
                  {zone.label}
                </span>
                <input
                  type="color"
                  value={design.zones[zone.key]}
                  onChange={(event) => updateZone(zone.key, event.target.value)}
                  aria-label={`${zone.label} color`}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="control-section">
          <h2>Artwork</h2>
          <div className="file-row">
            <label className="button secondary">
              <Upload size={16} />
              Upload
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    void setLogoFromFile(file);
                  }
                }}
              />
            </label>
            <button className="icon-button" type="button" onClick={clearLogo} title="Remove logo">
              <X size={17} />
            </button>
          </div>
          <p className="file-name">{design.logo.filename ?? 'Generated placeholder crest'}</p>
          <div className="range-grid">
            <label className="range-field">
              <span className="range-label">
                <span>X</span>
                <strong>{formatPercent(design.logo.x)}</strong>
              </span>
              <input
                type="range"
                min="0.16"
                max="0.42"
                step="0.01"
                value={design.logo.x}
                onChange={(event) =>
                  updateDesignField('logo', {
                    ...design.logo,
                    x: Number(event.target.value),
                  })
                }
              />
            </label>
            <label className="range-field">
              <span className="range-label">
                <span>Y</span>
                <strong>{formatPercent(design.logo.y)}</strong>
              </span>
              <input
                type="range"
                min="0.22"
                max="0.48"
                step="0.01"
                value={design.logo.y}
                onChange={(event) =>
                  updateDesignField('logo', {
                    ...design.logo,
                    y: Number(event.target.value),
                  })
                }
              />
            </label>
            <label className="range-field">
              <span className="range-label">
                <span>Scale</span>
                <strong>{formatScale(design.logo.scale)}</strong>
              </span>
              <input
                type="range"
                min="0.6"
                max="1.5"
                step="0.05"
                value={design.logo.scale}
                onChange={(event) =>
                  updateDesignField('logo', {
                    ...design.logo,
                    scale: Number(event.target.value),
                  })
                }
              />
            </label>
          </div>
        </section>

        <section className="control-section">
          <h2>Text</h2>
          <label className="field">
            <span>Sponsor</span>
            <input
              type="text"
              value={design.sponsorText}
              maxLength={18}
              onChange={(event) => updateDesignField('sponsorText', event.target.value)}
            />
          </label>
          <div className="two-col">
            <label className="field">
              <span>Name</span>
              <input
                type="text"
                value={design.playerName}
                maxLength={14}
                onChange={(event) => updateDesignField('playerName', event.target.value)}
              />
            </label>
            <label className="field">
              <span>Number</span>
              <input
                type="text"
                value={design.playerNumber}
                maxLength={3}
                onChange={(event) => updateDesignField('playerNumber', event.target.value)}
              />
            </label>
          </div>
          <label className="swatch-control single">
            <span>
              <i style={{ background: design.fontColor }} />
              Text color
            </span>
            <input
              type="color"
              value={design.fontColor}
              onChange={(event) => updateDesignField('fontColor', event.target.value)}
              aria-label="Text color"
            />
          </label>
          <div className="placement-stack">
            {textPlacementLabels.map((item) => (
              <div className="placement-card" key={item.key}>
                <h3>{item.label} Placement</h3>
                <div className="range-grid compact">
                  <label className="range-field">
                    <span className="range-label">
                      <span>X</span>
                      <strong>{formatPercent(design.textPlacements[item.key].x)}</strong>
                    </span>
                    <input
                      type="range"
                      min="0.12"
                      max="0.88"
                      step="0.01"
                      value={design.textPlacements[item.key].x}
                      onChange={(event) =>
                        updateTextPlacement(item.key, 'x', Number(event.target.value))
                      }
                    />
                  </label>
                  <label className="range-field">
                    <span className="range-label">
                      <span>Y</span>
                      <strong>{formatPercent(design.textPlacements[item.key].y)}</strong>
                    </span>
                    <input
                      type="range"
                      min="0.16"
                      max="0.82"
                      step="0.01"
                      value={design.textPlacements[item.key].y}
                      onChange={(event) =>
                        updateTextPlacement(item.key, 'y', Number(event.target.value))
                      }
                    />
                  </label>
                  <label className="range-field">
                    <span className="range-label">
                      <span>Scale</span>
                      <strong>{formatScale(design.textPlacements[item.key].scale)}</strong>
                    </span>
                    <input
                      type="range"
                      min="0.55"
                      max="1.6"
                      step="0.05"
                      value={design.textPlacements[item.key].scale}
                      onChange={(event) =>
                        updateTextPlacement(item.key, 'scale', Number(event.target.value))
                      }
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="control-section state-section">
          <h2>Structured State</h2>
          <pre>{JSON.stringify(designSnapshot(design), null, 2)}</pre>
        </section>

        <div className="action-stack">
          <button className="button secondary wide" type="button" onClick={() => downloadJson('design-config.json', designSnapshot(design))}>
            <Download size={17} />
            Export Design JSON
          </button>
          <button className="button primary wide" type="button" onClick={saveProof}>
            <Save size={17} />
            Save Proof Version
          </button>
        </div>
      </aside>
    </Root>
  );
}

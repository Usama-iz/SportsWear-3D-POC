import { Check, Download, FileClock, Plus, Send } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useCallback, useState } from 'react';
import { buildOrderExport, downloadDataUrl, downloadJson } from '../lib/exportOrder';
import { designSnapshot } from '../lib/textureRenderer';
import { usePocStore } from '../store/pocStore';
import type { ProofRevision, RosterPlayer } from '../types/poc';
import { DesignProofImage } from './DesignProofImage';

const sizes = ['YXS', 'YS', 'YM', 'YL', 'S', 'M', 'L', 'XL', '2XL'];

const getRevisionLabel = (revision: ProofRevision) =>
  revision.previousRevisionId ? `Version ${revision.version - 1} -> Version ${revision.version}` : `Version ${revision.version}`;

function RosterRow({ player }: { player: RosterPlayer }) {
  const updateRosterPlayer = usePocStore((state) => state.updateRosterPlayer);
  const locked = usePocStore((state) => state.order.locked);

  return (
    <tr>
      <td>
        <input
          value={player.name}
          disabled={locked}
          onChange={(event) => updateRosterPlayer(player.id, { name: event.target.value })}
        />
      </td>
      <td>
        <input
          value={player.number}
          disabled={locked}
          maxLength={3}
          onChange={(event) => updateRosterPlayer(player.id, { number: event.target.value })}
        />
      </td>
      <td>
        <select
          value={player.size}
          disabled={locked}
          onChange={(event) => updateRosterPlayer(player.id, { size: event.target.value })}
        >
          {sizes.map((size) => (
            <option value={size} key={size}>
              {size}
            </option>
          ))}
        </select>
      </td>
      <td>
        <input
          type="number"
          min={1}
          value={player.quantity}
          disabled={locked}
          onChange={(event) =>
            updateRosterPlayer(player.id, { quantity: Number(event.target.value) })
          }
        />
      </td>
    </tr>
  );
}

export function ProofPage() {
  const design = usePocStore((state) => state.design);
  const order = usePocStore((state) => state.order);
  const addRosterPlayer = usePocStore((state) => state.addRosterPlayer);
  const createProofRevision = usePocStore((state) => state.createProofRevision);
  const selectProofRevision = usePocStore((state) => state.selectProofRevision);
  const requestChange = usePocStore((state) => state.requestChange);
  const approveProof = usePocStore((state) => state.approveProof);
  const [changeRequest, setChangeRequest] = useState(
    'Please change the jersey body from blue to black.',
  );
  const [proofImageUrl, setProofImageUrl] = useState('');
  const handleProofImageReady = useCallback((dataUrl: string) => {
    setProofImageUrl(dataUrl);
  }, []);
  const viewingRevision = order.revisions.find(
    (revision) => revision.id === (order.viewingRevisionId ?? order.activeRevisionId),
  );
  const activeRevision = order.revisions.find((revision) => revision.id === order.activeRevisionId);
  const proofDesign = viewingRevision?.design ?? activeRevision?.design ?? design;
  const proofStyle = {
    '--shirt-color': proofDesign.zones.base,
    color: proofDesign.fontColor,
  } as CSSProperties;
  const revisionFlow = order.revisions
    .slice()
    .reverse()
    .map((revision) => (revision.previousRevisionId ? `v${revision.version - 1}->v${revision.version}` : `v${revision.version}`))
    .join(' / ');
  const canRequestChange = Boolean(order.activeRevisionId && !order.locked && changeRequest.trim());

  return (
    <main className="proof-layout">
      <section className="work-surface">
        <div className="page-title">
          <p className="eyebrow">Page 2</p>
          <h1>Proof, Roster & Approval</h1>
        </div>

        <div className="proof-grid">
          <section className="proof-preview">
            <article className="proof-tile">
              <span>Generated Texture</span>
              <DesignProofImage design={proofDesign} onImageReady={handleProofImageReady} />
            </article>
            <article className="proof-tile">
              <span>Front Proof</span>
              <div className="proof-shirt front-proof" style={proofStyle}>
                <div className="proof-logo">{proofDesign.logo.filename ? 'LOGO' : 'NT'}</div>
                <strong>{proofDesign.sponsorText}</strong>
              </div>
            </article>
            <article className="proof-tile">
              <span>Back Proof</span>
              <div className="proof-shirt back-proof" style={proofStyle}>
                <span>{proofDesign.playerName}</span>
                <b>{proofDesign.playerNumber}</b>
              </div>
            </article>
          </section>

          <section className="snapshot-panel">
            <div className="status-strip">
              <span>{viewingRevision ? `Proof v${viewingRevision.version}` : order.id}</span>
              <strong>{order.status}</strong>
            </div>
            <pre>{JSON.stringify(designSnapshot(proofDesign), null, 2)}</pre>
          </section>
        </div>

        <section className="table-section">
          <div className="section-bar">
            <h2>Roster</h2>
            <button
              className="button secondary"
              type="button"
              disabled={order.locked}
              onClick={addRosterPlayer}
            >
              <Plus size={16} />
              Player
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>No.</th>
                  <th>Size</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {order.roster.map((player) => (
                  <RosterRow player={player} key={player.id} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      <aside className="tool-panel proof-actions">
        <section className="control-section">
          <h2>Approval</h2>
          <button
            className="button secondary wide"
            type="button"
            onClick={() => downloadJson(`${order.id}-structured-export.json`, buildOrderExport(design, order))}
          >
            <Download size={17} />
            Export Order JSON
          </button>
          <button
            className="button secondary wide"
            type="button"
            disabled={!proofImageUrl}
            onClick={() =>
              downloadDataUrl(
                `${order.id}-${viewingRevision ? `proof-v${viewingRevision.version}` : 'current-proof'}.png`,
                proofImageUrl,
              )
            }
          >
            <Download size={17} />
            Download Proof PNG
          </button>
          <button className="button primary wide" type="button" onClick={() => createProofRevision()}>
            <FileClock size={17} />
            Generate Proof
          </button>
          <label className="field change-request-field">
            <span>Change Request</span>
            <textarea
              value={changeRequest}
              disabled={!order.activeRevisionId || order.locked}
              rows={4}
              onChange={(event) => setChangeRequest(event.target.value)}
            />
          </label>
          <button
            className="button warning wide"
            type="button"
            disabled={!canRequestChange}
            onClick={() => requestChange(changeRequest.trim())}
          >
            <Send size={17} />
            Request Change
          </button>
          <button
            className="button success wide"
            type="button"
            disabled={order.locked}
            onClick={approveProof}
          >
            <Check size={17} />
            Approve & Lock
          </button>
        </section>

        <section className="control-section">
          <h2>Revisions</h2>
          {revisionFlow && <div className="version-flow">{revisionFlow}</div>}
          <div className="stack-list">
            {order.revisions.length === 0 ? (
              <p className="muted">No proof generated yet.</p>
            ) : (
              order.revisions.map((revision) => (
                <button
                  className={`list-card revision-card ${
                    revision.id === (order.viewingRevisionId ?? order.activeRevisionId) ? 'selected' : ''
                  }`}
                  key={revision.id}
                  type="button"
                  onClick={() => selectProofRevision(revision.id)}
                >
                  <div>
                    <strong>
                      Proof v{revision.version}
                      {revision.previousRevisionId ? ' Revised' : ''}
                    </strong>
                    <span>{revision.createdAt}</span>
                  </div>
                  <em>{getRevisionLabel(revision)}</em>
                  <p>
                    {revision.status}
                    {revision.id === order.activeRevisionId ? ' - Active' : ''}
                  </p>
                  {revision.note && <small>{revision.note}</small>}
                </button>
              ))
            )}
          </div>
        </section>
      </aside>
    </main>
  );
}

import { Bell, CheckCircle2, Clock3, FileText, MessageSquare, Paperclip, Send, UserRound } from 'lucide-react';
import { useState } from 'react';
import { usePocStore } from '../store/pocStore';
import type { MessageAuthorRole } from '../types/poc';

export function CommunicationPage() {
  const order = usePocStore((state) => state.order);
  const addMessage = usePocStore((state) => state.addMessage);
  const markReadyForProduction = usePocStore((state) => state.markReadyForProduction);
  const [message, setMessage] = useState('Can we confirm the final delivery date after approval?');
  const [fileName, setFileName] = useState('');
  const [sendAs, setSendAs] = useState<MessageAuthorRole>('Customer');
  const activeRevision = order.revisions.find((revision) => revision.id === order.activeRevisionId);
  const latestChangeRequest =
    order.revisions.find((revision) => revision.status === 'Change Requested') ??
    order.revisions.find((revision) => revision.changeRequest);
  const threadItems = order.messages.slice().reverse();

  const senderName =
    sendAs === 'Customer'
      ? 'Team Organizer'
      : sendAs === 'Merchandiser'
        ? order.assignedMerchandiser
        : 'Design Team';

  const sendMessage = () => {
    if (!message.trim()) {
      return;
    }

    addMessage({
      role: sendAs,
      author: senderName,
      body: message.trim(),
      fileName: fileName || undefined,
      revisionId: order.activeRevisionId,
    });
    setMessage('');
    setFileName('');
  };

  return (
    <main className="communication-layout">
      <section className="conversation-surface">
        <div className="page-title">
          <p className="eyebrow">Page 3</p>
          <h1>Order Communication</h1>
        </div>

        <div className="order-brief">
          <article>
            <FileText size={18} />
            <span>Order</span>
            <strong>{order.id}</strong>
          </article>
          <article>
            <UserRound size={18} />
            <span>Owner</span>
            <strong>{order.assignedMerchandiser}</strong>
          </article>
          <article>
            <Clock3 size={18} />
            <span>Status</span>
            <strong>{order.status}</strong>
          </article>
          <article>
            <CheckCircle2 size={18} />
            <span>Active Proof</span>
            <strong>{activeRevision ? `v${activeRevision.version}` : 'Not sent'}</strong>
          </article>
        </div>

        <section className="request-summary">
          <div>
            <p className="eyebrow">Latest Customer Request</p>
            <strong>
              {latestChangeRequest ? `Proof v${latestChangeRequest.version}` : 'No change requested yet'}
            </strong>
          </div>
          <p>
            {latestChangeRequest?.note ??
              'When the customer requests a correction, it appears here and stays tied to this order.'}
          </p>
        </section>

        <section className="message-composer">
          <div className="composer-title">
            <MessageSquare size={18} />
            <div>
              <strong>Send Message</strong>
              <span>
                Sending as {senderName} - linked to{' '}
                {activeRevision ? `proof v${activeRevision.version}` : 'the current order'}
              </span>
            </div>
          </div>
          <div className="send-as-tabs" aria-label="Send message as">
            {(['Customer', 'Merchandiser', 'Designer'] as MessageAuthorRole[]).map((role) => (
              <button
                className={sendAs === role ? 'active' : ''}
                key={role}
                type="button"
                onClick={() => setSendAs(role)}
              >
                {role}
              </button>
            ))}
          </div>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            aria-label="Order message"
          />
          <div className="composer-actions">
            <label className="button secondary">
              <Paperclip size={16} />
              Attach
              <input
                type="file"
                onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')}
              />
            </label>
            <span className="file-name">{fileName || 'No file attached'}</span>
            <button className="button primary" type="button" onClick={sendMessage}>
              <Send size={16} />
              Send
            </button>
            <button
              className="button secondary"
              type="button"
              onClick={() =>
                addMessage({
                  role: 'Merchandiser',
                  author: order.assignedMerchandiser,
                  body: 'Action required: please review the latest order update.',
                  revisionId: order.activeRevisionId,
                })
              }
            >
              <Bell size={16} />
              Alert
            </button>
          </div>
        </section>

        <section className="thread">
          <div className="section-bar">
            <h2>Order Conversation</h2>
            <span className="thread-count">{order.messages.length} entries</span>
          </div>
          {threadItems.map((item) => (
            <article
              className={`message-card role-${item.role.toLowerCase()}`}
              key={item.id}
            >
              <div className="message-avatar">{item.role.slice(0, 1)}</div>
              <div className="message-bubble">
                <header>
                  <div>
                    <strong>{item.author}</strong>
                    <span>{item.role}</span>
                  </div>
                  <time>{item.createdAt}</time>
                </header>
                <p>{item.body}</p>
                {(item.fileName || item.revisionId) && (
                  <footer>
                    {item.fileName && <span>File: {item.fileName}</span>}
                    {item.revisionId && <span>Proof revision linked</span>}
                  </footer>
                )}
              </div>
            </article>
          ))}
        </section>
      </section>

      <aside className="tool-panel">
        <section className="control-section first-section">
          <h2>Factory Handoff</h2>
          <button
            className="button success wide"
            type="button"
            disabled={order.status !== 'Approved'}
            onClick={markReadyForProduction}
          >
            Ready for Production
          </button>
        </section>
        <section className="control-section">
          <h2>Status Timeline</h2>
          <div className="timeline">
            {order.timeline.slice().reverse().map((event) => (
              <article key={event.id}>
                <i />
                <div>
                  <strong>{event.status}</strong>
                  <span>{event.label}</span>
                  <small>
                    {event.actor} - {event.createdAt}
                  </small>
                </div>
              </article>
            ))}
          </div>
        </section>
      </aside>
    </main>
  );
}

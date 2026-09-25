import { Home, MessageSquare, Palette, RotateCcw, ScrollText } from 'lucide-react';
import { CommunicationPage } from './components/CommunicationPage';
import { CustomizerPage } from './components/CustomizerPage';
import { LandingPage } from './components/LandingPage';
import { ProofPage } from './components/ProofPage';
import { usePocStore } from './store/pocStore';
import type { PageKey } from './types/poc';

const pages: Array<{ key: PageKey; label: string; icon: typeof Palette }> = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'customizer', label: 'Customizer', icon: Palette },
  { key: 'proof', label: 'Proof', icon: ScrollText },
  { key: 'communication', label: 'Thread', icon: MessageSquare },
];

function App() {
  const activePage = usePocStore((state) => state.activePage);
  const setActivePage = usePocStore((state) => state.setActivePage);
  const order = usePocStore((state) => state.order);
  const resetDemo = usePocStore((state) => state.resetDemo);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark">
          <span>NT</span>
          <div>
            <strong>Noura Sportswear POC</strong>
            <small>{order.id}</small>
          </div>
        </div>

        <nav className="segmented-nav" aria-label="POC pages">
          {pages.map((page) => {
            const Icon = page.icon;
            return (
              <button
                type="button"
                key={page.key}
                className={activePage === page.key ? 'active' : ''}
                onClick={() => setActivePage(page.key)}
              >
                <Icon size={16} />
                {page.label}
              </button>
            );
          })}
        </nav>

        <div className="status-cluster">
          <div className="status-pill">
            <span>{order.status}</span>
            {order.locked && <strong>Locked</strong>}
          </div>
          <button className="icon-button" type="button" title="Reset demo state" onClick={resetDemo}>
            <RotateCcw size={16} />
          </button>
        </div>
      </header>

      {activePage === 'home' && <LandingPage />}
      {activePage === 'customizer' && <CustomizerPage />}
      {activePage === 'proof' && <ProofPage />}
      {activePage === 'communication' && <CommunicationPage />}
    </div>
  );
}

export default App;

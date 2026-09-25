import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  MessageSquare,
  PackageCheck,
  Palette,
  ShieldCheck,
  Shirt,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePocStore } from '../store/pocStore';
import { CustomizerPage } from './CustomizerPage';
import { JerseyScene } from './JerseyScene';

const categories = ['Soccer Jersey', 'Training Kit', 'Shorts', 'Tracksuit'];

const heroSlides = [
  {
    theme: 'matchday',
    eyebrow: 'Noura Tech Sportswear Platform',
    title: 'Custom teamwear, proofed in 3D.',
    body: 'Design real jerseys in the browser, review live 3D changes, and move from concept to approved order with one connected workflow.',
    stat: '3D Customizer',
  },
  {
    theme: 'studio',
    eyebrow: 'Design To Proof',
    title: 'Live colors, logos, names, and numbers.',
    body: 'Every visual change is captured as structured design data, ready for proofing, revisions, approvals, and future production handoff.',
    stat: 'UV Texture Data',
  },
  {
    theme: 'approval',
    eyebrow: 'Order Collaboration',
    title: 'Roster, revisions, approval, and thread.',
    body: 'Keep players, proof versions, change requests, customer approval, files, and messages attached to the same order ID.',
    stat: 'Locked Approval',
  },
];

const steps = [
  {
    icon: Palette,
    title: 'Customize',
    text: 'Change jersey zones, artwork, player name, and number on the live 3D model.',
  },
  {
    icon: ClipboardList,
    title: 'Roster',
    text: 'Attach one approved design to player names, numbers, sizes, and quantities.',
  },
  {
    icon: CheckCircle2,
    title: 'Proof',
    text: 'Generate proof versions, keep revisions, and lock the latest approval.',
  },
  {
    icon: MessageSquare,
    title: 'Thread',
    text: 'Keep customer, merchandiser, files, changes, and timeline inside the order.',
  },
];

export function LandingPage() {
  const design = usePocStore((state) => state.design);
  const setActivePage = usePocStore((state) => state.setActivePage);
  const order = usePocStore((state) => state.order);
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = heroSlides[activeSlide];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="landing-page">
      <section className={`landing-hero hero-theme-${slide.theme}`}>
        <div className="hero-jersey-stage" aria-label="Live Noura jersey preview">
          <JerseyScene design={design} />
        </div>
        <div className="hero-copy">
          <p className="hero-kicker">
            <Sparkles size={16} />
            {slide.eyebrow}
          </p>
          <h1>{slide.title}</h1>
          <p>{slide.body}</p>
          <div className="hero-actions">
            <a className="button primary" href="#live-customizer">
              <ArrowDown size={17} />
              Start Customizing
            </a>
            <button className="button secondary" type="button" onClick={() => setActivePage('proof')}>
              <PackageCheck size={17} />
              View Proof Flow
            </button>
          </div>
          <div className="hero-slider" aria-label="Landing hero slides">
            {heroSlides.map((item, index) => (
              <button
                aria-label={`Show slide ${index + 1}`}
                className={index === activeSlide ? 'active' : ''}
                key={item.title}
                type="button"
                onClick={() => setActiveSlide(index)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                {item.stat}
              </button>
            ))}
          </div>
          <div className="hero-metrics" aria-label="POC capability summary">
            <article>
              <strong>Real GLB</strong>
              <span>Client jersey asset</span>
            </article>
            <article>
              <strong>UV Data</strong>
              <span>Dynamic texture output</span>
            </article>
            <article>
              <strong>{order.id}</strong>
              <span>Sample order flow</span>
            </article>
          </div>
        </div>
        <div className="hero-showcase-card">
          <span>{slide.stat}</span>
          <strong>{order.status}</strong>
          <p>One design record powers 3D preview, proof revisions, roster, and approval.</p>
          <ArrowRight size={18} />
        </div>
        <div className="hero-status-strip" aria-label="Live preview details">
          <span>Live Preview</span>
          <strong>
            {design.playerName || 'Player'} #{design.playerNumber || '--'}
          </strong>
        </div>
      </section>

      <section className="category-band" aria-label="Sportswear categories">
        <div>
          <p className="eyebrow">Teamwear Range</p>
          <h2>Built for configurable Noura products</h2>
        </div>
        <div className="category-list">
          {categories.map((category) => (
            <span key={category}>
              <Shirt size={16} />
              {category}
            </span>
          ))}
        </div>
      </section>

      <section className="landing-process" aria-label="POC workflow">
        <div className="section-intro">
          <p className="eyebrow">POC Flow</p>
          <h2>From jersey customization to approved production handoff</h2>
        </div>
        <div className="process-grid">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <article key={step.title}>
                <Icon size={22} />
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            );
          })}
        </div>
        <div className="landing-proof-strip" aria-label="Proof workflow highlight">
          <article>
            <ShieldCheck size={22} />
            <div>
              <strong>Approval-ready foundation</strong>
              <span>Versioned proofs, customer changes, locked approval, and production-ready status.</span>
            </div>
          </article>
          <button className="button secondary" type="button" onClick={() => setActivePage('communication')}>
            <MessageSquare size={17} />
            Open Order Thread
          </button>
        </div>
      </section>

      <section className="embedded-customizer" id="live-customizer">
        <div className="section-intro">
          <p className="eyebrow">Live Customizer</p>
          <h2>Design on the actual 3D jersey</h2>
        </div>
        <CustomizerPage embedded />
      </section>
    </main>
  );
}

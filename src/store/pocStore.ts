import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  DesignConfig,
  OrderMessage,
  OrderStatus,
  PageKey,
  ProofRevision,
  RosterPlayer,
  SampleOrder,
  TimelineEvent,
  ZoneKey,
} from '../types/poc';

const stamp = () =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

const cloneDesign = (design: DesignConfig): DesignConfig => ({
  ...design,
  zones: { ...design.zones },
  logo: { ...design.logo },
  textPlacements: {
    sponsor: { ...design.textPlacements.sponsor },
    name: { ...design.textPlacements.name },
    number: { ...design.textPlacements.number },
  },
});

const cloneRoster = (roster: RosterPlayer[]): RosterPlayer[] =>
  roster.map((player) => ({ ...player }));

const normalizeDesign = (design: DesignConfig): DesignConfig => ({
  ...cloneDesign(initialDesign),
  ...design,
  zones: {
    ...initialDesign.zones,
    ...design.zones,
  },
  logo: {
    ...initialDesign.logo,
    ...design.logo,
  },
  textPlacements: {
    sponsor: {
      ...initialDesign.textPlacements.sponsor,
      ...design.textPlacements?.sponsor,
    },
    name: {
      ...initialDesign.textPlacements.name,
      ...design.textPlacements?.name,
    },
    number: {
      ...initialDesign.textPlacements.number,
      ...design.textPlacements?.number,
    },
  },
});

const makeTimelineEvent = (
  status: OrderStatus,
  label: string,
  actor = 'System',
): TimelineEvent => ({
  id: crypto.randomUUID(),
  status,
  label,
  actor,
  createdAt: stamp(),
});

const initialDesign: DesignConfig = {
  templateId: 'soccer-crew-neck-ss',
  templateVersion: 'v0.2',
  zones: {
    base: '#111111',
    sleeves: '#d92d20',
    collar: '#f4f7fb',
    pattern: '#6b7280',
    accent: '#0ea5e9',
    trim: '#f8fafc',
  },
  logo: {
    x: 0.26,
    y: 0.34,
    scale: 1,
  },
  textPlacements: {
    sponsor: {
      x: 0.285,
      y: 0.47,
      scale: 1,
    },
    name: {
      x: 0.74,
      y: 0.31,
      scale: 1,
    },
    number: {
      x: 0.74,
      y: 0.43,
      scale: 1,
    },
  },
  sponsorText: 'NOURA FC',
  playerName: 'AHMED',
  playerNumber: '10',
  fontColor: '#ffffff',
};

const initialRoster: RosterPlayer[] = [
  { id: crypto.randomUUID(), name: 'Ahmed Khan', number: '10', size: 'M', quantity: 1 },
  { id: crypto.randomUUID(), name: 'Bilal Shah', number: '8', size: 'L', quantity: 1 },
  { id: crypto.randomUUID(), name: 'Sara Malik', number: '21', size: 'S', quantity: 1 },
];

const initialOrder: SampleOrder = {
  id: 'NT-POC-1007',
  status: 'Draft',
  assignedMerchandiser: 'Maya Collins',
  locked: false,
  roster: initialRoster,
  revisions: [],
  messages: [
    {
      id: crypto.randomUUID(),
      role: 'Merchandiser',
      author: 'Maya Collins',
      body: 'Order thread created. I will review the artwork, roster, and proof revisions here.',
      createdAt: stamp(),
    },
  ],
  timeline: [makeTimelineEvent('Draft', 'Sample order created', 'Customer')],
};

interface PocState {
  activePage: PageKey;
  design: DesignConfig;
  order: SampleOrder;
  setActivePage: (page: PageKey) => void;
  updateZone: (zone: ZoneKey, color: string) => void;
  updateDesignField: <K extends keyof DesignConfig>(field: K, value: DesignConfig[K]) => void;
  setLogoFromFile: (file: File) => Promise<void>;
  clearLogo: () => void;
  resetDesign: () => void;
  updateRosterPlayer: (id: string, updates: Partial<RosterPlayer>) => void;
  addRosterPlayer: () => void;
  createProofRevision: (note?: string) => void;
  selectProofRevision: (revisionId: string) => void;
  requestChange: (comment: string) => void;
  approveProof: () => void;
  markReadyForProduction: () => void;
  addMessage: (message: Omit<OrderMessage, 'id' | 'createdAt'>) => void;
  resetDemo: () => void;
}

export const usePocStore = create<PocState>()(
  persist(
    (set, get) => ({
      activePage: 'home',
      design: initialDesign,
      order: initialOrder,

      setActivePage: (page) => set({ activePage: page }),

      updateZone: (zone, color) =>
        set((state) => ({
          design: {
            ...state.design,
            zones: {
              ...state.design.zones,
              [zone]: color,
            },
          },
        })),

      updateDesignField: (field, value) =>
        set((state) => ({
          design: {
            ...state.design,
            [field]: value,
          },
        })),

      setLogoFromFile: async (file) => {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        set((state) => ({
          design: {
            ...state.design,
            logo: {
              ...state.design.logo,
              dataUrl,
              filename: file.name,
            },
          },
        }));
      },

      clearLogo: () =>
        set((state) => ({
          design: {
            ...state.design,
            logo: {
              x: state.design.logo.x,
              y: state.design.logo.y,
              scale: state.design.logo.scale,
            },
          },
        })),

      resetDesign: () =>
        set({
          design: cloneDesign(initialDesign),
        }),

      updateRosterPlayer: (id, updates) =>
        set((state) => ({
          order: {
            ...state.order,
            roster: state.order.roster.map((player) =>
              player.id === id ? { ...player, ...updates } : player,
            ),
          },
        })),

      addRosterPlayer: () =>
        set((state) => ({
          order: {
            ...state.order,
            roster: [
              ...state.order.roster,
              {
                id: crypto.randomUUID(),
                name: 'New Player',
                number: String(state.order.roster.length + 7),
                size: 'M',
                quantity: 1,
              },
            ],
          },
        })),

      createProofRevision: (note = 'Customer proof generated from current structured design state.') => {
        const state = get();
        const version = state.order.revisions.length + 1;
        const activeRevision = state.order.revisions.find(
          (revision) => revision.id === state.order.activeRevisionId,
        );
        const isRevisionAfterChange =
          state.order.status === 'Changes Requested' || activeRevision?.status === 'Change Requested';
        const revisionNote =
          note === 'Customer proof generated from current structured design state.' && isRevisionAfterChange
            ? `Revised proof generated after change request: ${activeRevision?.note ?? 'Customer requested changes.'}`
            : note;
        const revision: ProofRevision = {
          id: crypto.randomUUID(),
          version,
          status: 'Generated',
          createdAt: stamp(),
          note: revisionNote,
          changeRequest: isRevisionAfterChange ? activeRevision?.note : undefined,
          previousRevisionId: isRevisionAfterChange ? activeRevision?.id : undefined,
          design: cloneDesign(state.design),
          roster: cloneRoster(state.order.roster),
        };

        set((current) => ({
          order: {
            ...current.order,
            status: 'Proof Sent',
            activeRevisionId: revision.id,
            viewingRevisionId: revision.id,
            revisions: [revision, ...current.order.revisions],
            timeline: [
              makeTimelineEvent(
                'Proof Sent',
                `${isRevisionAfterChange ? 'Revised proof' : 'Proof'} v${version} sent`,
                'Merchandiser',
              ),
              ...current.order.timeline,
            ],
            messages: [
              {
                id: crypto.randomUUID(),
                role: 'Merchandiser',
                author: current.order.assignedMerchandiser,
                body: `${isRevisionAfterChange ? 'Revised proof' : 'Proof'} v${version} is ready for review.`,
                createdAt: stamp(),
                revisionId: revision.id,
              },
              ...current.order.messages,
            ],
          },
        }));
      },

      selectProofRevision: (revisionId) =>
        set((state) => ({
          order: {
            ...state.order,
            viewingRevisionId: revisionId,
          },
        })),

      requestChange: (comment) => {
        const state = get();
        const activeRevision = state.order.activeRevisionId;

        set((current) => ({
          order: {
            ...current.order,
            status: 'Changes Requested',
            viewingRevisionId: activeRevision,
            timeline: [
              makeTimelineEvent('Changes Requested', 'Customer requested proof changes', 'Customer'),
              ...current.order.timeline,
            ],
            revisions: current.order.revisions.map((revision) =>
              revision.id === activeRevision
                ? { ...revision, status: 'Change Requested', note: comment }
                : revision,
            ),
            messages: [
              {
                id: crypto.randomUUID(),
                role: 'Customer',
                author: 'Team Organizer',
                body: comment,
                createdAt: stamp(),
                revisionId: activeRevision,
              },
              ...current.order.messages,
            ],
          },
        }));
      },

      approveProof: () => {
        const state = get();
        const activeRevision = state.order.activeRevisionId;

        if (!activeRevision) {
          get().createProofRevision('Generated automatically before final approval.');
        }

        set((current) => {
          const revisionId = current.order.activeRevisionId ?? current.order.revisions[0]?.id;

          return {
            order: {
              ...current.order,
              status: 'Approved',
              locked: true,
              activeRevisionId: revisionId,
              viewingRevisionId: revisionId,
              timeline: [
                makeTimelineEvent(
                  'Approved',
                  'Customer approved and locked design/roster',
                  'Customer',
                ),
                ...current.order.timeline,
              ],
              revisions: current.order.revisions.map((revision) =>
                revision.id === revisionId ? { ...revision, status: 'Approved' } : revision,
              ),
              messages: [
                {
                  id: crypto.randomUUID(),
                  role: 'Customer',
                  author: 'Team Organizer',
                  body: 'Approved. I confirm all player names, numbers, and sizes are correct.',
                  createdAt: stamp(),
                  revisionId,
                },
                ...current.order.messages,
              ],
            },
          };
        });
      },

      markReadyForProduction: () =>
        set((state) => ({
          order: {
            ...state.order,
            status: 'Ready for Production',
            timeline: [
              makeTimelineEvent(
                'Ready for Production',
                'Approved order moved to production handoff queue',
                'Merchandiser',
              ),
              ...state.order.timeline,
            ],
            messages: [
              {
                id: crypto.randomUUID(),
                role: 'Merchandiser',
                author: state.order.assignedMerchandiser,
                body: 'The approved order has been marked ready for production handoff.',
                createdAt: stamp(),
                revisionId: state.order.activeRevisionId,
              },
              ...state.order.messages,
            ],
          },
        })),

      addMessage: (message) =>
        set((state) => ({
          order: {
            ...state.order,
            messages: [
              {
                ...message,
                id: crypto.randomUUID(),
                createdAt: stamp(),
              },
              ...state.order.messages,
            ],
          },
        })),

      resetDemo: () =>
        set({
          activePage: 'home',
          design: cloneDesign(initialDesign),
          order: {
            ...initialOrder,
            roster: cloneRoster(initialRoster),
            revisions: [],
            messages: initialOrder.messages.map((message) => ({ ...message })),
            timeline: initialOrder.timeline.map((event) => ({ ...event })),
          },
        }),
    }),
    {
      name: 'sportswear-3d-poc-state',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<PocState>;
        const activePage =
          persisted.activePage && ['home', 'customizer', 'proof', 'communication'].includes(persisted.activePage)
            ? persisted.activePage
            : currentState.activePage;

        return {
          ...currentState,
          ...persisted,
          activePage,
          design: persisted.design ? normalizeDesign(persisted.design) : currentState.design,
          order: persisted.order ?? currentState.order,
        };
      },
      partialize: (state) => ({
        activePage: state.activePage,
        design: state.design,
        order: state.order,
      }),
    },
  ),
);

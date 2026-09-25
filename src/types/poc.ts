export type PageKey = 'home' | 'customizer' | 'proof' | 'communication';

export type ZoneKey = 'base' | 'sleeves' | 'collar' | 'pattern' | 'accent' | 'trim';

export type OrderStatus =
  | 'Draft'
  | 'Proof Sent'
  | 'Changes Requested'
  | 'Approved'
  | 'Ready for Production';

export type MessageAuthorRole = 'Customer' | 'Merchandiser' | 'Designer';

export interface Placement {
  x: number;
  y: number;
  scale: number;
}

export interface LogoPlacement extends Placement {
  dataUrl?: string;
  filename?: string;
}

export type TextPlacementKey = 'sponsor' | 'name' | 'number';

export interface DesignConfig {
  templateId: string;
  templateVersion: string;
  zones: Record<ZoneKey, string>;
  logo: LogoPlacement;
  textPlacements: Record<TextPlacementKey, Placement>;
  sponsorText: string;
  playerName: string;
  playerNumber: string;
  fontColor: string;
}

export interface RosterPlayer {
  id: string;
  name: string;
  number: string;
  size: string;
  quantity: number;
}

export interface ProofRevision {
  id: string;
  version: number;
  status: 'Generated' | 'Change Requested' | 'Approved';
  createdAt: string;
  note: string;
  changeRequest?: string;
  previousRevisionId?: string;
  design: DesignConfig;
  roster: RosterPlayer[];
}

export interface OrderMessage {
  id: string;
  role: MessageAuthorRole;
  author: string;
  body: string;
  createdAt: string;
  fileName?: string;
  revisionId?: string;
}

export interface TimelineEvent {
  id: string;
  label: string;
  status: OrderStatus;
  actor: string;
  createdAt: string;
}

export interface SampleOrder {
  id: string;
  status: OrderStatus;
  assignedMerchandiser: string;
  locked: boolean;
  activeRevisionId?: string;
  viewingRevisionId?: string;
  roster: RosterPlayer[];
  revisions: ProofRevision[];
  messages: OrderMessage[];
  timeline: TimelineEvent[];
}

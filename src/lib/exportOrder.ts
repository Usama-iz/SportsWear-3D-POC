import { designSnapshot } from './textureRenderer';
import type { DesignConfig, SampleOrder } from '../types/poc';

export const buildOrderExport = (design: DesignConfig, order: SampleOrder) => ({
  exportedAt: new Date().toISOString(),
  orderId: order.id,
  status: order.status,
  locked: order.locked,
  assignedMerchandiser: order.assignedMerchandiser,
  activeRevisionId: order.activeRevisionId,
  currentDesign: {
    raw: design,
    normalized: designSnapshot(design),
  },
  roster: order.roster,
  revisions: order.revisions.map((revision) => ({
    ...revision,
    designSnapshot: designSnapshot(revision.design),
  })),
  messages: order.messages,
  timeline: order.timeline,
});

export const downloadJson = (filename: string, data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const downloadDataUrl = (filename: string, dataUrl: string) => {
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
};

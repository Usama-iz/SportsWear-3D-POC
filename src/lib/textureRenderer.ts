import type { DesignConfig, ZoneKey } from '../types/poc';
import { ASSETS, TEMPLATE_CANVAS_SIZE } from './assets';

const SVG_VIEWBOX_SIZE = 3600;

const zoneMatchers: Record<ZoneKey, (id: string) => boolean> = {
  base: (id) => id === 'Base' || id.startsWith('Base_'),
  sleeves: (id) => id === 'Sleeve' || id === 'Sleeves' || id.startsWith('Sleeve_') || id.startsWith('Sleeves_'),
  collar: (id) => id === 'Collar' || id.startsWith('Collar_'),
  pattern: (id) => id === 'Pattern' || id.startsWith('Pattern_'),
  accent: (id) => id === 'Element1' || id === 'Element2' || id.startsWith('Element1_'),
  trim: (id) => id === 'Stripe' || id.startsWith('Stripe_'),
};

let cachedSvg: string | null = null;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
    image.src = src;
  });

const getSvg = async () => {
  if (cachedSvg) {
    return cachedSvg;
  }

  const response = await fetch(ASSETS.masterSvg);
  cachedSvg = await response.text();
  return cachedSvg;
};

const recolorSvg = (svgText: string, design: DesignConfig) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(svgText, 'image/svg+xml');

  document.querySelectorAll<SVGElement>('[id]').forEach((element) => {
    const id = element.id;
    const zone = (Object.keys(zoneMatchers) as ZoneKey[]).find((key) => zoneMatchers[key](id));

    if (zone) {
      element.setAttribute('fill', design.zones[zone]);
    }
  });

  return new XMLSerializer().serializeToString(document.documentElement);
};

const drawText = (
  context: CanvasRenderingContext2D,
  label: string,
  x: number,
  y: number,
  size: number,
  color: string,
  weight = 800,
) => {
  context.save();
  context.fillStyle = color;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = `${weight} ${size}px Arial, Helvetica, sans-serif`;
  context.lineWidth = Math.max(8, size * 0.06);
  context.strokeStyle = 'rgba(0, 0, 0, 0.28)';
  context.strokeText(label.toUpperCase(), x, y);
  context.fillText(label.toUpperCase(), x, y);
  context.restore();
};

const drawFallbackCrest = (
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  size: number,
  accent: string,
) => {
  const half = size / 2;

  context.save();
  context.translate(centerX, centerY);
  context.beginPath();
  context.moveTo(0, -half);
  context.lineTo(half * 0.78, -half * 0.2);
  context.lineTo(half * 0.58, half * 0.72);
  context.lineTo(0, half);
  context.lineTo(-half * 0.58, half * 0.72);
  context.lineTo(-half * 0.78, -half * 0.2);
  context.closePath();
  context.fillStyle = '#ffffff';
  context.fill();
  context.lineWidth = Math.max(8, size * 0.08);
  context.strokeStyle = accent;
  context.stroke();

  context.beginPath();
  context.arc(0, 0, half * 0.34, 0, Math.PI * 2);
  context.fillStyle = accent;
  context.fill();

  context.fillStyle = '#111111';
  context.font = `800 ${size * 0.2}px Arial, Helvetica, sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('NT', 0, 1);
  context.restore();
};

const drawLogo = async (context: CanvasRenderingContext2D, design: DesignConfig, scale: number) => {
  const x = design.logo.x * TEMPLATE_CANVAS_SIZE;
  const y = design.logo.y * TEMPLATE_CANVAS_SIZE;
  const size = 190 * scale * design.logo.scale;

  if (!design.logo.dataUrl) {
    drawFallbackCrest(context, x, y, size, design.zones.accent);
    return;
  }

  const logo = await loadImage(design.logo.dataUrl);
  const ratio = Math.min(size / logo.width, size / logo.height);
  const width = logo.width * ratio;
  const height = logo.height * ratio;
  context.drawImage(logo, x - width / 2, y - height / 2, width, height);
};

const svgToImage = async (svgText: string) => {
  const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    return await loadImage(url);
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const renderDesignTexture = async (design: DesignConfig) => {
  const canvas = document.createElement('canvas');
  canvas.width = TEMPLATE_CANVAS_SIZE;
  canvas.height = TEMPLATE_CANVAS_SIZE;

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas 2D context is unavailable.');
  }

  const svg = await getSvg();
  const recoloredSvg = recolorSvg(svg, design);
  const image = await svgToImage(recoloredSvg);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const scale = TEMPLATE_CANVAS_SIZE / SVG_VIEWBOX_SIZE;

  await drawLogo(context, design, scale);

  drawText(
    context,
    design.sponsorText,
    TEMPLATE_CANVAS_SIZE * design.textPlacements.sponsor.x,
    TEMPLATE_CANVAS_SIZE * design.textPlacements.sponsor.y,
    116 * scale * design.textPlacements.sponsor.scale,
    design.fontColor,
    900,
  );

  drawText(
    context,
    design.playerName,
    TEMPLATE_CANVAS_SIZE * design.textPlacements.name.x,
    TEMPLATE_CANVAS_SIZE * design.textPlacements.name.y,
    96 * scale * design.textPlacements.name.scale,
    design.fontColor,
    800,
  );

  drawText(
    context,
    design.playerNumber,
    TEMPLATE_CANVAS_SIZE * design.textPlacements.number.x,
    TEMPLATE_CANVAS_SIZE * design.textPlacements.number.y,
    280 * scale * design.textPlacements.number.scale,
    design.fontColor,
    900,
  );

  return canvas;
};

export const designSnapshot = (design: DesignConfig) => ({
  templateRef: `${design.templateId}@${design.templateVersion}`,
  zones: design.zones,
  assets: {
    crest: design.logo.filename ?? 'generated-placeholder-crest',
    crestPlacement: {
      x: Number(design.logo.x.toFixed(2)),
      y: Number(design.logo.y.toFixed(2)),
      scale: Number(design.logo.scale.toFixed(2)),
    },
  },
  text: {
    sponsor: design.sponsorText,
    name: design.playerName,
    number: design.playerNumber,
    color: design.fontColor,
    placements: {
      sponsor: {
        x: Number(design.textPlacements.sponsor.x.toFixed(2)),
        y: Number(design.textPlacements.sponsor.y.toFixed(2)),
        scale: Number(design.textPlacements.sponsor.scale.toFixed(2)),
      },
      name: {
        x: Number(design.textPlacements.name.x.toFixed(2)),
        y: Number(design.textPlacements.name.y.toFixed(2)),
        scale: Number(design.textPlacements.name.scale.toFixed(2)),
      },
      number: {
        x: Number(design.textPlacements.number.x.toFixed(2)),
        y: Number(design.textPlacements.number.y.toFixed(2)),
        scale: Number(design.textPlacements.number.scale.toFixed(2)),
      },
    },
  },
});

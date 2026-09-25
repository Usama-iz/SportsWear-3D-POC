import { useEffect, useState } from 'react';
import { renderDesignTexture } from '../lib/textureRenderer';
import type { DesignConfig } from '../types/poc';

interface DesignProofImageProps {
  design: DesignConfig;
  onImageReady?: (dataUrl: string) => void;
}

export function DesignProofImage({ design, onImageReady }: DesignProofImageProps) {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    renderDesignTexture(design)
      .then((canvas) => {
        if (!cancelled) {
          const dataUrl = canvas.toDataURL('image/png');
          setImageUrl(dataUrl);
          onImageReady?.(dataUrl);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
    };
  }, [design, onImageReady]);

  return (
    <div className="generated-proof">
      {imageUrl ? <img src={imageUrl} alt="Generated proof from structured design data" /> : null}
    </div>
  );
}

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

/** URL pública del sitio (sin el hash de la sala). */
export function siteUrl() {
  const { origin, pathname } = window.location;
  return origin + pathname;
}

/** Genera un código QR como data URL. */
export function useQr(text: string, dark = '#0b0907', light = '#ede5d3') {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    QRCode.toDataURL(text, { margin: 1, width: 360, color: { dark, light }, errorCorrectionLevel: 'M' })
      .then(setSrc)
      .catch(() => setSrc(null));
  }, [text, dark, light]);
  return src;
}

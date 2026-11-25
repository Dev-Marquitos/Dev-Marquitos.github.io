import { useMuseumStore } from '../stores/useMuseumStore';
import { narrate } from '../stores/useNarration';
import { MUSEUM_PIECES } from '../data/museum';
import { pieceText } from './narrationTexts';

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

/** Recorre las piezas del museo con la cámara y el narrador. */
export async function runMuseumTour({ shortTexts = false, isAlive = () => true }: { shortTexts?: boolean; isAlive?: () => boolean } = {}) {
  const store = useMuseumStore.getState();
  store.setTouring(true);
  const touring = () => useMuseumStore.getState().touring && isAlive();
  for (const p of MUSEUM_PIECES) {
    if (!touring()) break;
    useMuseumStore.getState().select(p.id);
    await wait(1900);
    if (!touring()) break;
    const text = pieceText(p, !shortTexts);
    await narrate(text, 'piece-' + p.id, { force: true });
    await wait(700);
  }
  useMuseumStore.getState().setTouring(false);
  useMuseumStore.getState().select(null);
}

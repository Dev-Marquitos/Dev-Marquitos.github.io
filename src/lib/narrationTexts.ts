/**
 * Textos narrables construidos siempre igual en todo el sitio, para que
 * coincidan con las grabaciones pregeneradas de public/voz.
 */
import type { Person, Quote } from '../data/people';
import type { TimelineEvent } from '../data/timeline';
import type { MuseumPiece } from '../data/museum';

export const VOICE_TEST = 'Hola. Soy la voz del museo virtual de Radio Pío XII.';

export const quoteText = (q: Quote) => `${q.text} ${q.author}.`;
export const eventText = (ev: TimelineEvent) => `${ev.date ?? ev.year}. ${ev.title}. ${ev.text}`;
export const personText = (p: Person) => `${p.name}. ${p.role}. ${p.bio}`;
export const pieceText = (p: MuseumPiece, long = false) => (long ? `${p.title}. ${p.short} ${p.context}` : `${p.title}. ${p.short}`);

/**
 * Catálogo de todo lo que el museo puede narrar. Lo usa
 * `scripts/exportar-narraciones.mjs` para producir la lista de frases que
 * `scripts/generar_voz.py` convierte en audio (public/voz).
 */
import { NARRATION } from '../data/narration';
import { QUOTES, PEOPLE } from '../data/people';
import { ALL_EVENTS } from '../data/timeline';
import { MUSEUM_PIECES } from '../data/museum';
import { MEMORY } from '../data/memory';
import { KB_ANSWERS } from './assistant';
import { eventText, personText, pieceText, quoteText, VOICE_TEST } from './narrationTexts';
import { normalizeForSpeech, splitSentences, voiceKey } from './speechText';

export function allNarrationTexts(): string[] {
  return [
    ...Object.values(NARRATION),
    VOICE_TEST,
    ...QUOTES.map(quoteText),
    ...ALL_EVENTS.map(eventText),
    ...PEOPLE.map(personText),
    ...MUSEUM_PIECES.flatMap((p) => [pieceText(p), pieceText(p, true)]),
    ...MEMORY.map((m) => m.text),
    ...KB_ANSWERS,
  ];
}

/** Frases únicas (clave → texto hablado) que deben existir como audio. */
export function allVoiceLines(): { key: string; speech: string; display: string }[] {
  const seen = new Map<string, { key: string; speech: string; display: string }>();
  for (const text of allNarrationTexts()) {
    for (const line of splitSentences(text)) {
      const speech = normalizeForSpeech(line);
      const key = voiceKey(speech);
      if (!seen.has(key)) seen.set(key, { key, speech, display: line });
    }
  }
  return [...seen.values()];
}

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Mic, MessageCircle, Send, Volume2, X } from 'lucide-react';
import { ask, SUGGESTIONS, type KBEntry } from '../../lib/assistant';
import { useExperience, sfx } from '../../stores/useExperience';
import { narrate, toggleNarration } from '../../stores/useNarration';

interface Msg {
  id: number;
  from: 'user' | 'bot';
  text: string;
  entry?: KBEntry;
  alts?: KBEntry[];
}

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

function getRecognition(): SpeechRec | null {
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
  const C = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!C) return null;
  const r = new C();
  r.lang = 'es-BO';
  r.interimResults = false;
  r.maxAlternatives = 1;
  return r;
}

export function Assistant() {
  const open = useExperience((s) => s.assistantOpen);
  const setOpen = useExperience((s) => s.setAssistantOpen);
  const narratorOn = useExperience((s) => s.narratorOn);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: 0,
      from: 'bot',
      text: 'Hola. Soy el asistente del museo: respondo con la información verificada de estas salas, sin conexión a internet. ¿Qué quieres saber sobre Radio Pío XII?',
    },
  ]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const canListen = typeof window !== 'undefined' && !!((window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition || (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, open]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    sfx.click();
    const res = ask(q);
    const id = Date.now();
    const bot: Msg = res
      ? { id: id + 1, from: 'bot', text: res.entry.answer, entry: res.entry, alts: res.alternatives }
      : { id: id + 1, from: 'bot', text: 'No encontré eso en el archivo del museo. Prueba preguntando por la fundación, las masacres, la huelga de 1977, la Cadena de la Democracia, los objetos del museo o la señal en vivo.' };
    setMsgs((m) => [...m, { id, from: 'user', text: q }, bot]);
    setInput('');
    if (narratorOn && res) void narrate(res.entry.answer, 'assistant-' + id);
  };

  const listen = () => {
    const r = getRecognition();
    if (!r) return;
    setListening(true);
    r.onresult = (e) => {
      const t = e.results[0]?.[0]?.transcript ?? '';
      setInput(t);
      send(t);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.start();
  };

  return (
    <>
      <motion.button
        onClick={() => {
          sfx.whoosh();
          setOpen(!open);
        }}
        className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-[75] flex items-center gap-3 rounded-full bg-amber text-ink pl-4 pr-5 h-12 shadow-[0_10px_40px_rgba(242,165,65,0.35)] hover:bg-amber-hi transition-colors"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        aria-expanded={open}
        aria-label="Pregúntale al archivo"
        data-cursor="PREGUNTAR"
      >
        {open ? <X size={18} /> : <MessageCircle size={18} />}
        <span className="hidden md:inline font-mono text-[11px] tracking-[0.18em] uppercase">Pregúntale al archivo</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-20 left-3 right-3 md:right-auto md:left-6 md:bottom-24 z-[78] md:w-[420px] h-[min(620px,72vh)] panel rounded-[1.6rem] flex flex-col overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
            data-lenis-prevent
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-amber/15 text-amber">
                <MessageCircle size={17} />
                <span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-signal border-2 border-shaft" />
              </span>
              <div className="leading-tight">
                <p className="font-display text-lg">Asistente del museo</p>
                <p className="text-[11px] text-dust">Búsqueda BM25 local · fuentes verificadas · sin internet</p>
              </div>
            </div>
            <div ref={list} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {msgs.map((m) => (
                <div key={m.id} className={m.from === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${m.from === 'user' ? 'bg-amber text-ink rounded-br-md' : 'bg-ore border border-white/10 rounded-bl-md'}`}>
                    {m.entry && <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-amber mb-1.5">{m.entry.title}</p>}
                    <p>{m.text}</p>
                    {m.from === 'bot' && m.entry && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {m.entry.link && (
                          <button
                            onClick={() => {
                              navigate(m.entry!.link!.path);
                              setOpen(false);
                            }}
                            className="inline-flex items-center gap-1 rounded-full border border-amber/40 text-amber px-3 py-1 text-[11px] hover:bg-amber hover:text-ink transition-colors"
                          >
                            {m.entry.link.label} <ArrowUpRight size={12} />
                          </button>
                        )}
                        <button onClick={() => toggleNarration(m.text, 'assistant-' + m.id)} className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-[11px] text-tin hover:text-bone" aria-label="Escuchar respuesta">
                          <Volume2 size={12} /> Oír
                        </button>
                      </div>
                    )}
                    {m.alts && m.alts.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-dust mb-1.5">También puede interesarte</p>
                        {m.alts.map((a) => (
                          <button key={a.id} onClick={() => send(a.title)} className="block text-left text-[12px] text-tin hover:text-amber py-0.5">
                            › {a.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 pt-2 pb-3 border-t border-white/10">
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-[11.5px] text-tin hover:text-bone hover:border-white/25">
                    {s}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={listening ? 'Escuchando…' : 'Escribe tu pregunta…'}
                  className="flex-1 bg-ink border border-white/10 rounded-full px-4 h-11 text-sm text-bone placeholder:text-dust focus:outline-none focus:border-amber/60"
                  aria-label="Pregunta"
                />
                {canListen && (
                  <button type="button" onClick={listen} className={`w-11 h-11 rounded-full flex items-center justify-center border ${listening ? 'border-ember text-ember blink-soft' : 'border-white/15 text-tin hover:text-amber'}`} aria-label="Preguntar por voz">
                    <Mic size={17} />
                  </button>
                )}
                <button type="submit" className="w-11 h-11 rounded-full bg-amber text-ink flex items-center justify-center hover:bg-amber-hi" aria-label="Enviar">
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

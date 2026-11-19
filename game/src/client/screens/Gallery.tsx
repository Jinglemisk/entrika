// Every card the game can draw, from the content files: open /?kartlar to check an edit. Not linked from the game.
// ?kartlar&mod=got&dil=en shows another mod or language; the pickers at the top switch them.
import { useState } from 'react';
import { AMBITIONS, CHARACTERS, COMPANIONS, CRISES, INTRIGUE, type Field } from '../../engine/index.ts';
import { Card, CardBack, CardDefs } from '../cards/Card.tsx';
import { spec, type CardRef } from '../cardSpecs.ts';
import { LANGS, MODS, setWords, type Lang } from '../words.ts';

const REFS: CardRef[] = [
  ...CHARACTERS.map(c => ({ t: 'char', id: c.id }) as const),
  ...COMPANIONS.map(c => ({ t: 'kul', id: c.id }) as const),
  ...INTRIGUE.flatMap(c => (Object.keys(c.copies) as Field[]).map(field => ({ t: 'intr', kind: c.id, field }) as const)),
  ...AMBITIONS.map(c => ({ t: 'hirs', id: c.id }) as const),
  ...CRISES.map(c => ({ t: 'crisis', id: c.id }) as const),
  { t: 'kader', k: 'h' }, { t: 'kader', k: 'x' }, { t: 'taraf', side: 'loyalist' }, { t: 'taraf', side: 'traitor' },
];
const BACKS = ['char', 'kul', 'intr', 'hirs', 'crisis', 'kader', 'taraf'] as const;

const q = new URLSearchParams(location.search);

export function Gallery() {
  const [mod, setMod] = useState(() => MODS.find(m => m.id === q.get('mod'))?.id ?? MODS[0].id);
  const [lang, setLang] = useState<Lang>(() => (LANGS as string[]).includes(q.get('dil') ?? '') ? q.get('dil') as Lang : MODS.find(m => m.id === mod)!.native);
  setWords(mod, lang);
  const go = (m: string, l: Lang) => { setMod(m); setLang(l); history.replaceState(null, '', `?kartlar&mod=${m}&dil=${l}`); };
  return (
    <div className="gallery">
      <div className="gallery-pick">
        <select value={mod} onChange={e => go(e.target.value, lang)}>{MODS.map(m => <option key={m.id} value={m.id}>{m.id}</option>)}</select>
        <select value={lang} onChange={e => go(mod, e.target.value as Lang)}>{LANGS.map(l => <option key={l} value={l}>{l}</option>)}</select>
      </div>
      <CardDefs />
      {REFS.map(r => <Card key={JSON.stringify(r)} spec={spec(r)} width={220} />)}
      {BACKS.map(k => <CardBack key={k} kind={k} width={220} />)}
    </div>
  );
}

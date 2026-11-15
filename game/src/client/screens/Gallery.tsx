// Every card the game can draw, from the content files: open /?kartlar to check an edit. Not linked from the game.
import { AMBITIONS, CHARACTERS, COMPANIONS, CRISES, INTRIGUE, type Field } from '../../engine/index.ts';
import { Card, CardBack, CardDefs } from '../cards/Card.tsx';
import { spec, type CardRef } from '../cardSpecs.ts';

const REFS: CardRef[] = [
  ...CHARACTERS.map(c => ({ t: 'char', id: c.id }) as const),
  ...COMPANIONS.map(c => ({ t: 'kul', id: c.id }) as const),
  ...INTRIGUE.flatMap(c => (Object.keys(c.copies) as Field[]).map(field => ({ t: 'intr', kind: c.id, field }) as const)),
  ...AMBITIONS.map(c => ({ t: 'hirs', id: c.id }) as const),
  ...CRISES.map(c => ({ t: 'crisis', id: c.id }) as const),
  { t: 'kader', k: 'h' }, { t: 'kader', k: 'x' }, { t: 'taraf', side: 'loyalist' }, { t: 'taraf', side: 'traitor' },
];
const BACKS = ['char', 'kul', 'intr', 'hirs', 'crisis', 'kader', 'taraf'] as const;

export function Gallery() {
  return (
    <div className="gallery">
      <CardDefs />
      {REFS.map(r => <Card key={JSON.stringify(r)} spec={spec(r)} width={220} />)}
      {BACKS.map(k => <CardBack key={k} kind={k} width={220} />)}
    </div>
  );
}

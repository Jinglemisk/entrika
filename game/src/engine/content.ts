// Typed access to the content files: the mechanics, keyed by id. Behaviour lives in code keyed by the same ids.
import rulesJson from '../../content/rules.json' with { type: 'json' };
import intrigueJson from '../../content/intrigue.json' with { type: 'json' };
import charactersJson from '../../content/characters.json' with { type: 'json' };
import companionsJson from '../../content/companions.json' with { type: 'json' };
import ambitionsJson from '../../content/ambitions.json' with { type: 'json' };
import crisesJson from '../../content/crises.json' with { type: 'json' };
import miscJson from '../../content/misc.json' with { type: 'json' };
import termsJson from '../../content/terms.json' with { type: 'json' };

export type Field = 'harem' | 'divan';
export type CrisisField = Field | 'saray';
export type Freq = 'once' | 'crisis' | 'always' | null;

/** Every entry carries an `about` line: what it does, in neutral English, for mod authors. The words players see (names,
 *  card text, flavor) live in each mod's words files (mods/<id>/<lang>.json) and its pictures in the mod's skin
 *  (mods/<id>/skin.json), both keyed by these ids. */
export interface PowerDef { id: string; freq: Freq; icon?: string; about: string }
/** Süleyman has no Lütuf power. */
export interface CharacterDef { id: string; sultan?: boolean; wildcard?: boolean; about: string; base: PowerDef; favor?: PowerDef }
/** Who a card may be played on: any player but Süleyman, only the two Vekils, only the Birinci Vekil, anyone but
 *  yourself, or always yourself. */
export type TargetRule = 'player' | 'minister' | 'first' | 'other' | 'self' | 'none';   // none: played with no target (counts as its owner's, never shown)
export interface IntrigueDef { id: string; copies: Partial<Record<Field, number>>; target: TargetRule; about: string }
export interface CompanionDef { id: string; recast: string; freq: Freq; about: string }
export type GoalType =
  | 'appointedCrises' | 'ministerOnHiyanet' | 'ministerOnHizmet' | 'lostInfluence' | 'distinctTargets' | 'objected'
  | 'targetedInCrisis' | 'playedInCrisis' | 'backedMinister' | 'unseatedByIntrigue' | 'seatByIntrigue' | 'usedInfoCard';
export interface AmbitionDef { id: string; goal: { type: GoalType; n?: number }; about: string }
export type DrawRule = 'none' | 'zeroInfluence' | 'leastInfluence' | 'besideSultan' | 'lastMinisters' | 'everyone';
export interface CrisisDef { id: string; field: CrisisField; draw: DrawRule; about: string }
/** A game term (Vekil, Nüfuz, Tertip...): the icon drawn in front of it in card text. Its words are in each mod. */
export interface TermDef { icon: string | null; about: string }
export interface MiscDef {
  kader: Record<'h' | 'x', { about: string }>;
  taraf: Record<'loyalist' | 'traitor', { about: string }>;
  treason: Record<string, { about: string; icon?: string }>;
}

export interface Rules {
  players: { min: number; max: number };
  allegiance: Record<string, { loyalist: number; traitor: number }>;
  startInfluence: number; startIntrigue: number; companionChoices: number;
  handLimit: number; objectionCost: number;
  kader: { hizmet: number; hiyanet: number; draw: number };
  tracks: { loyalty: number; treason: number };
  treasonPowers: Record<string, string>;
  kulisSeconds: number;
  powerWindows: Record<string, { show: 'public' | 'hidden'; secs: number }>;
  timers: { wave: number; object: number; redirect: number; ferman: number };
}

export const RULES = rulesJson as Rules;
export const INTRIGUE = intrigueJson as IntrigueDef[];
export const CHARACTERS = charactersJson as CharacterDef[];
export const COMPANIONS = companionsJson as CompanionDef[];
export const AMBITIONS = ambitionsJson as AmbitionDef[];
export const CRISES = crisesJson as CrisisDef[];
export const MISC = miscJson as MiscDef;
export const TERMS = termsJson as Record<string, TermDef>;

const index = <T extends { id: string }>(list: T[]) => Object.fromEntries(list.map(x => [x.id, x])) as Record<string, T>;
export const intrigueById = index(INTRIGUE);
export const characterById = index(CHARACTERS);
export const companionById = index(COMPANIONS);
export const ambitionById = index(AMBITIONS);
export const crisisById = index(CRISES);

/** The field of a printed card kind: a kind printed in one field only has that field. */
export function soleField(kind: string): Field | null {
  const f = Object.keys(intrigueById[kind].copies) as Field[];
  return f.length === 1 ? f[0] : null;
}

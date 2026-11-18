// Typed access to the content files. The engine reads names and numbers from here; behaviour lives in code keyed by id.
import rulesJson from '../../content/rules.json' with { type: 'json' };
import intrigueJson from '../../content/intrigue.json' with { type: 'json' };
import charactersJson from '../../content/characters.json' with { type: 'json' };
import companionsJson from '../../content/companions.json' with { type: 'json' };
import ambitionsJson from '../../content/ambitions.json' with { type: 'json' };
import crisesJson from '../../content/crises.json' with { type: 'json' };
import miscJson from '../../content/misc.json' with { type: 'json' };

export type Field = 'harem' | 'divan';
export type CrisisField = Field | 'saray';
export type Freq = 'once' | 'crisis' | 'always' | null;
export type Art = { src: string; pos?: string } | null;

export interface PowerDef { id: string; name: string; freq: Freq; text: string }
/** Süleyman has no Lütuf power. The flavor line is neutral: it never hints at a side. */
export interface CharacterDef {
  id: string; name: string; sultan?: boolean; wildcard?: boolean;
  base: PowerDef; favor?: PowerDef; flavor: string;
}
/** Who a card may be played on: any player but Süleyman, only the two Vekils, only the Birinci Vekil, anyone but
 *  yourself, or always yourself. */
export type TargetRule = 'player' | 'minister' | 'first' | 'other' | 'self';
export interface IntrigueDef {
  id: string; name: string; copies: Partial<Record<Field, number>>; target: TargetRule;
  text: string; flavor: string; art: Art;
}
export interface CompanionDef {
  id: string; name: string; recast: string; freq: Freq; text: string; flavor: string; art: Art;
}
export type GoalType =
  | 'appointedCrises' | 'ministerOnHiyanet' | 'ministerOnHizmet' | 'lostInfluence' | 'distinctTargets' | 'objected'
  | 'targetedInCrisis' | 'playedInCrisis' | 'backedMinister' | 'unseatedByIntrigue' | 'seatByIntrigue' | 'usedInfoCard';
export interface AmbitionDef { id: string; name: string; goal: { type: GoalType; n?: number }; text: string; flavor: string }
export type DrawRule = 'none' | 'zeroInfluence' | 'leastInfluence' | 'besideSultan' | 'lastMinisters' | 'everyone';
export interface CrisisDef { id: string; name: string; field: CrisisField; draw: DrawRule; text: string; flavor?: string; art: Art }

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
export const MISC = miscJson;

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

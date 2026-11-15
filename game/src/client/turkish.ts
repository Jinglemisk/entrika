// Case suffixes for player names, so sentences read "Mert'e itiraz etti" rather than "Mert oyuncusuna".
// Vowel harmony from the last vowel; a buffer letter after a final vowel; hard consonants harden the locative/ablative.
export type Case = 'dat' | 'acc' | 'gen' | 'loc' | 'abl';

const BACK = 'aıou';
const FRONT = 'eiöü';
const VOWELS = BACK + FRONT;
const HARD = 'çfhkpsşt';
// how a final digit is spoken: its last vowel, and whether the word ends in a vowel
const DIGITS: Record<string, [string, boolean]> = {
  '0': ['ı', false], '1': ['i', false], '2': ['i', true], '3': ['ü', false], '4': ['ö', false],
  '5': ['e', false], '6': ['ı', true], '7': ['i', true], '8': ['i', false], '9': ['u', false],
};

export function suffix(name: string, c: Case): string {
  const w = name.trim();
  if (!w) return name;
  const low = w.toLocaleLowerCase('tr');
  const end = low[low.length - 1];
  let vowel: string;
  let endsVowel: boolean;
  if (DIGITS[end]) [vowel, endsVowel] = DIGITS[end];
  else {
    vowel = [...low].reverse().find(ch => VOWELS.includes(ch)) ?? 'e';
    endsVowel = VOWELS.includes(end);
  }
  const back = BACK.includes(vowel);
  const four = back ? (vowel === 'o' || vowel === 'u' ? 'u' : 'ı') : vowel === 'ö' || vowel === 'ü' ? 'ü' : 'i';
  const two = back ? 'a' : 'e';
  const hard = !endsVowel && HARD.includes(end);
  const s =
    c === 'dat' ? (endsVowel ? 'y' : '') + two :
    c === 'acc' ? (endsVowel ? 'y' : '') + four :
    c === 'gen' ? (endsVowel ? 'n' : '') + four + 'n' :
    c === 'loc' ? (hard ? 't' : 'd') + two :
    (hard ? 't' : 'd') + two + 'n';
  return `${w}'${s}`;
}

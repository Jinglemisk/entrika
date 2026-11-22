// Home: name, then make a room or join one with its code. A test game puts every seat on this phone.
import { useEffect, useState } from 'react';
import { RULES } from '../../engine/index.ts';
import { send, useNet } from '../net.ts';
import { t, tIn } from '../strings.ts';
import { setPrefs, usePrefs } from '../prefs.ts';
import { LANGS, MODS, modName } from '../words.ts';
import { CreditsSheet } from '../game/Sheets.tsx';
import { DEVMODE } from '../devmode.ts';
import { openRules } from '../ui/Rules.tsx';
import { Frieze } from './Frieze.tsx';

const NAME = 'entrika:name';
// DEV ONLY: a test game goes straight to the deal, every seat on this device, in the picked world. ?hizli=got&n=6 does
// it from a link (n defaults to 7); the world picked last is remembered.
const TEST_MOD = 'entrika:testMod';
const QUICK = new URLSearchParams(location.search);
const hotseat = (name: string, test: number, mod: string) => send({ t: 'create', name, test, mod, start: true });

export function Home() {
  const net = useNet();
  const [name, setName] = useState(() => localStorage.getItem(NAME) ?? '');
  const [code, setCode] = useState(() => new URLSearchParams(location.search).get('oda')?.toUpperCase() ?? '');
  const [test, setTest] = useState(7);
  const [credits, setCredits] = useState(false);
  const [testMod, setTestMod] = useState(() => localStorage.getItem(TEST_MOD) ?? MODS[0].id);
  const pickTestMod = (m: string) => { setTestMod(m); try { localStorage.setItem(TEST_MOD, m); } catch { /* private mode */ } };
  const keep = (v: string) => { setName(v); try { localStorage.setItem(NAME, v); } catch { /* private mode */ } };
  const busy = net.status !== 'open';
  const { lang } = usePrefs();
  const other = LANGS.find(l => l !== lang)!;
  useEffect(() => {
    if (!DEVMODE || busy || !QUICK.has('hizli')) return;
    const mod = MODS.find(m => m.id === QUICK.get('hizli'))?.id ?? MODS[0].id;
    hotseat(name.trim(), Number(QUICK.get('n')) || 7, mod);
    history.replaceState(null, '', location.pathname);   // once: leaving the game must not start another
    QUICK.delete('hizli');
  }, [busy]);
  // with a code typed or brought by a shared link, joining is the main button and making a new room steps back
  const joining = code.length === 4;
  return (
    <div className="full zp homescreen">
      <Frieze />
      <div className="bd block">
        <div className="title">
          <b>Entrika</b>
          <p className="vo">{t('tagline')}</p>
          <span className="links">
            <button type="button" className="rules-link" onClick={() => openRules()}>{t('rules')}</button>
            <button type="button" className="rules-link" onClick={() => setCredits(true)}>{t('credits')}</button>
            {/* the other language, named in itself */}
            <button type="button" className="rules-link" lang={other} onClick={() => setPrefs({ lang: other })}>{tIn(other, 'langName')}</button>
          </span>
        </div>
        <div className="panel">
          <label className="field"><span>{t('home.name')}</span>
            <input value={name} maxLength={18} placeholder={t('home.namePh')} onChange={e => keep(e.target.value)} autoComplete="nickname" />
          </label>
          <div className="row2">
            <label className="field code-in"><span>{t('home.code')}</span>
              <input value={code} maxLength={4} placeholder="ABCD" onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))} autoCapitalize="characters" />
            </label>
            <button type="button" className={`b ${joining ? 'pri' : ''}`} disabled={busy || !joining || !name.trim()} onClick={() => send({ t: 'join', code, name: name.trim() })}>{t('home.join')}</button>
          </div>
          <div className="bt">
            <button type="button" className={`b ${joining ? 'quiet' : 'pri'}`} disabled={busy || !name.trim()} onClick={() => send({ t: 'create', name: name.trim() })}>{t('home.create')}</button>
          </div>
          {DEVMODE && (
            <div className="testline">
              <span>{t('home.test')}</span>
              <select value={test} onChange={e => setTest(Number(e.target.value))}>
                {Array.from({ length: RULES.players.max - RULES.players.min + 1 }, (_, i) => RULES.players.min + i).map(n => <option key={n} value={n}>{t('nPlayers', { n })}</option>)}
              </select>
              <select value={testMod} onChange={e => pickTestMod(e.target.value)}>
                {MODS.map(m => <option key={m.id} value={m.id}>{modName(m)}</option>)}
              </select>
              <button type="button" className="b small" disabled={busy} onClick={() => hotseat(name.trim(), test, testMod)}>{t('home.testGo')}</button>
            </div>
          )}
          {busy && <p className="wait">{t('connecting')}</p>}
        </div>
      </div>
      {credits && <CreditsSheet close={() => setCredits(false)} />}
    </div>
  );
}

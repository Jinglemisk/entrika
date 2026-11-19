// Home: name, then make a room or join one with its code. A test game puts every seat on this phone.
import { useState } from 'react';
import { RULES } from '../../engine/index.ts';
import { send, useNet } from '../net.ts';
import { t } from '../strings.ts';
import { Frieze } from './Frieze.tsx';

const NAME = 'entrika:name';
// DEV ONLY: test games are offered on the computer running the server, or with ?test (remove with test rooms)
const TESTABLE = ['localhost', '127.0.0.1'].includes(location.hostname) || new URLSearchParams(location.search).has('test');

export function Home() {
  const net = useNet();
  const [name, setName] = useState(() => localStorage.getItem(NAME) ?? '');
  const [code, setCode] = useState(() => new URLSearchParams(location.search).get('oda')?.toUpperCase() ?? '');
  const [test, setTest] = useState(7);
  const keep = (v: string) => { setName(v); try { localStorage.setItem(NAME, v); } catch { /* private mode */ } };
  const busy = net.status !== 'open';
  // with a code typed or brought by a shared link, joining is the main button and making a new room steps back
  const joining = code.length === 4;
  return (
    <div className="full zp homescreen">
      <Frieze />
      <div className="bd block">
        <div className="title">
          <b>Entrika</b>
          <p className="vo">{t('tagline')}</p>
          <a className="rules-link" href="/kurallar" target="_blank" rel="noopener">{t('rules')}</a>
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
          {TESTABLE && (
            <div className="testline">
              <span>{t('home.test')}</span>
              <select value={test} onChange={e => setTest(Number(e.target.value))}>
                {Array.from({ length: RULES.players.max - RULES.players.min + 1 }, (_, i) => RULES.players.min + i).map(n => <option key={n} value={n}>{t('nPlayers', { n })}</option>)}
              </select>
              <button type="button" className="b small" disabled={busy} onClick={() => send({ t: 'create', name: name.trim(), test })}>{t('home.testGo')}</button>
            </div>
          )}
          {busy && <p className="wait">{t('connecting')}</p>}
        </div>
      </div>
    </div>
  );
}

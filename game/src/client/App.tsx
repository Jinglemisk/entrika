// Picks the screen from the connection state: home, lobby or the game. Errors from the server show as a toast.
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { clearError, useNet } from './net.ts';
import { Stage } from './Stage.tsx';
import { Home } from './screens/Home.tsx';
import { Lobby } from './screens/Lobby.tsx';
import { Game } from './game/Game.tsx';
import { RulesSheet } from './ui/Rules.tsx';
import { t } from './strings.ts';
import { usePrefs } from './prefs.ts';
import { DEFAULT_MOD, setWords } from './words.ts';

export function App() {
  const net = useNet();
  useEffect(() => {
    if (!net.error) return;
    const id = setTimeout(clearError, 3500);
    return () => clearTimeout(id);
  }, [net.errorAt]);
  const room = net.room;
  // every word below comes from the room's mod, in this phone's language (home has no room: the default mod)
  const { lang } = usePrefs();
  setWords(room?.mod ?? DEFAULT_MOD, lang);
  return (
    <Stage upright={!room?.game}>
      {room?.game ? <Game key={room.code} room={room} /> : room ? <Lobby room={room} /> : <Home />}
      <RulesSheet />
      <AnimatePresence>
        {net.error && (
          <motion.div className="toast" key={net.errorAt} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} onClick={clearError}>
            {t(net.error.key, net.error.vars)}
          </motion.div>
        )}
      </AnimatePresence>
      {net.status === 'closed' && room && <div className="offline-bar">{t('reconnecting')}</div>}
    </Stage>
  );
}

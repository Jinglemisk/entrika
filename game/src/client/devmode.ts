// DEV ONLY (remove with test rooms before release): the test aids show only with ?devmode=on in the address: the home
// screen's quick-test row, the seat switches and the bot button. The flag lasts for the tab (a reload or going home keeps
// it); ?devmode=off clears it, and a ?hizli= link turns it on. Test rooms themselves are the server's business.
const KEY = 'entrika:devmode';
const q = new URLSearchParams(location.search);
const asked = q.get('devmode') === 'on' || q.has('hizli') ? true : q.get('devmode') === 'off' ? false : null;

function read(): boolean {
  try {
    if (asked === true) sessionStorage.setItem(KEY, 'on');
    if (asked === false) sessionStorage.removeItem(KEY);
    return sessionStorage.getItem(KEY) === 'on';
  } catch {
    return asked === true;   // storage blocked: the flag lasts for this page only
  }
}

export const DEVMODE = read();

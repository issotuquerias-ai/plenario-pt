// PLENÁRIO PT — ponto de entrada
import { Engine } from './three/engine.js';
import { SETTINGS, G } from './core/state.js';
import { registerScreen, go } from './ui/app.js';
import { setPollsters } from './sim/polls.js';
import { POLLSTERS } from './data/campaign.js';
import * as title from './ui/screens/title.js';
import * as setup from './ui/screens/setup.js';
import * as campaign from './ui/screens/campaign.js';
import * as debate from './ui/screens/debate.js';
import { arruada, cartazes, comicio } from './ui/screens/scenes.js';
import * as election from './ui/screens/election.js';
import * as formation from './ui/screens/formation.js';
import * as parliament from './ui/screens/parliament.js';
import * as government from './ui/screens/government.js';
import * as legislation from './ui/screens/legislation.js';
import * as constitution from './ui/screens/constitution.js';
import * as endgame from './ui/screens/endgame.js';

function boot() {
  try { Engine.init(document.getElementById('three-root')); Engine.setQuality(SETTINGS.quality || 'high'); }
  catch (e) { console.error('WebGL indisponível', e); }
  if (POLLSTERS?.length) setPollsters(POLLSTERS);
  const screens = { title, setup, campaign, debate, arruada, cartazes, comicio, election, formation, parliament, government, legislation, constitution, endgame };
  for (const [k, v] of Object.entries(screens)) registerScreen(k, v);
  go('title');
  window.PLENARIO_DEBUG = { getG: () => G, go };
  const b = document.getElementById('boot');
  if (b) { b.style.opacity = '0'; setTimeout(() => b.remove(), 650); }
}

window.addEventListener('error', e => console.error('[PLENÁRIO]', e.message, e.error));
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

// Página de testes das cenas 3D (não faz parte do jogo).
import { Engine } from '../src/three/engine.js';
import { createHemicycle } from '../src/three/hemicycle.js';
import { createStudio } from '../src/three/studio.js';
import { createStreet } from '../src/three/street.js';

const params = new URLSearchParams(location.search);
const S = params.get('s') || 'hemicycle';
const Q = params.get('q') || 'high';
const log = (t) => { document.getElementById('log').textContent += t + '\n'; };
window.__frames = 0;
(function count() { window.__frames++; requestAnimationFrame(count); })();

function fakeLogo(text, color) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, 256, 256);
  g.fillStyle = color; g.beginPath(); g.arc(128, 110, 80, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#fff'; g.font = '900 64px Segoe UI, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 128, 112);
  g.fillStyle = color; g.font = '800 34px Segoe UI, Arial'; g.fillText(text, 128, 222);
  return c.toDataURL('image/png');
}
function fakePhoto(seed) {
  const c = document.createElement('canvas'); c.width = c.height = 200;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, 200); grd.addColorStop(0, '#5a7da8'); grd.addColorStop(1, '#22344d');
  g.fillStyle = grd; g.fillRect(0, 0, 200, 200);
  g.fillStyle = '#1b2230'; g.beginPath(); g.ellipse(100, 205, 80, 60, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = ['#e8b48f', '#d39b72', '#f1c9a5'][seed % 3]; g.beginPath(); g.ellipse(100, 95, 42, 52, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#2a1d16'; g.beginPath(); g.ellipse(100, 58, 44, 22, 0, Math.PI, 0); g.fill();
  return c.toDataURL('image/jpeg', 0.9);
}

const PARTIES = [
  { id: 'be', short: 'BE', color: '#c8102e', seats: 1 },
  { id: 'cdu', short: 'CDU', color: '#d71920', seats: 3 },
  { id: 'livre', short: 'L', color: '#6ab023', seats: 6 },
  { id: 'pan', short: 'PAN', color: '#0b8a8f', seats: 1 },
  { id: 'ps', short: 'PS', color: '#ff66a3', seats: 58 },
  { id: 'jpp', short: 'JPP', color: '#2bb673', seats: 1 },
  { id: 'ad', short: 'AD', color: '#f68a21', seats: 91 },
  { id: 'il', short: 'IL', color: '#00aeef', seats: 9 },
  { id: 'ch', short: 'CH', color: '#1d2f6f', seats: 60 },
];
const NAMES = ['Ana Ferreira', 'João Silva', 'Maria Costa', 'Pedro Santos', 'Rita Almeida', 'Rui Gomes', 'Inês Lopes', 'Carlos Pinto', 'Sofia Rocha', 'Miguel Sousa', 'Teresa Martins', 'Nuno Ribeiro'];
function seats230() {
  const out = []; let k = 0;
  for (const p of PARTIES) for (let i = 0; i < p.seats; i++) out.push({ partyId: p.id, color: p.color, personName: NAMES[(k++ * 7) % NAMES.length] + ' ' + k, district: 'Lisboa' });
  return out;
}

Engine.setQuality(Q);
Engine.init(document.getElementById('root'));

async function run() {
  if (S.startsWith('hemicycle') || S === 'title') {
    const h = createHemicycle({
      seats: seats230(), interactive: true, cinematic: S === 'title',
      government: Array.from({ length: 17 }, (_, i) => ({ name: NAMES[i % NAMES.length], color: '#f68a21' })),
      onHover: (i) => { if (i != null) log('hover ' + i); }, onClick: (i) => log('click ' + i),
    });
    Engine.setScene(h);
    if (S === 'hemicycle-mesa') h.setCamera('mesa', false);
    if (S === 'hemicycle-tribuna') { h.setCamera('tribuna', false); h.setSpeaker(true, '#ff66a3'); }
    if (S === 'hemicycle-galeria') h.setCamera('galeria', false);
    if (S === 'hemicycle-bancadas') h.setCamera('bancadas', false);
    if (S === 'hemicycle-vote') {
      setTimeout(() => h.voteSequence({ ad: 'favor', il: 'favor', ch: 'contra', ps: 'abstencao', livre: 'contra', cdu: 'contra', be: 'contra', pan: 'abstencao', jpp: 'favor' }, (ph) => log('fase: ' + ph)), 200);
    }
    if (S === 'hemicycle-night') { h.setSeatsVisible(0); setTimeout(() => h.setSeatsVisible(120), 300); }
    if (S === 'hemicycle-hl') h.highlight('ps');
    if (S === 'hemicycle-stand') h.standUp(['ch', 'ad']);
    window.__ctrl = h;
  }
  if (S.startsWith('studio')) {
    const n = S.startsWith('studio6') ? 6 : 2;
    const roster = [['André Ventura', 'CH', '#1d2f6f'], ['Mariana Leitão', 'IL', '#00aeef'], ['Luís Montenegro', 'AD', '#f68a21'], ['José Luís Carneiro', 'PS', '#ff66a3'], ['Rui Tavares', 'L', '#6ab023'], ['Paulo Raimundo', 'CDU', '#d71920']];
    const participants = roster.slice(0, n).map(([name, short, color], i) => ({ name, partyShort: short, color, logo: fakeLogo(short, color), photo: i % 2 ? fakePhoto(i) : null }));
    const st = createStudio({ channel: { id: 'rtp', name: 'RTP', color: '#0b3d91', color2: '#e30613' }, title: 'Debate Legislativas 2027', participants, moderator: { name: 'Clara Sousa' } });
    Engine.setScene(st);
    st.setScreenText('Habitação: o que propõem os partidos para baixar as rendas?');
    if (S.endsWith('close')) { st.shot(0); st.setTalking(0); }
    else if (S.endsWith('mod')) { st.shot('moderator'); st.setTalking('moderator'); }
    else { st.setTalking(1); st.react(0, 'shake'); }
    window.__ctrl = st;
  }
  if (S.startsWith('street')) {
    const [, style, mode] = S.split('-');
    const rivals = [{ id: 'ps', short: 'PS', color: '#ff66a3', logo: fakeLogo('PS', '#ff66a3'), slogan: 'Portugal inteiro' }, { id: 'ch', short: 'CH', color: '#1d2f6f', logo: fakeLogo('CH', '#1d2f6f'), slogan: 'Salvar Portugal' }, { id: 'ad', short: 'AD', color: '#f68a21', slogan: 'Mais Portugal' }];
    const sc = createStreet({ style, mode, town: 'Braga', party: { id: 'novo', short: 'MRP', color: '#7c3aed', color2: '#fde047', logo: fakeLogo('MRP', '#7c3aed'), leaderName: 'Joana Marques', leaderPhoto: fakePhoto(1) }, rivals, npcCount: 26, seed: 7,
      onNpcClick: (id) => log('npc ' + id), onGroundClick: (p) => log('chão ' + p.x.toFixed(1)), onSlotClick: (id) => log('slot ' + id) });
    Engine.setScene(sc);
    if (mode === 'arruada') {
      const n = sc.getNpcs(); ['supporter', 'undecided', 'hostile', 'converted', 'done'].forEach((m, i) => n[i] && sc.setNpcMarker(n[i].id, m));
      sc.moveLeaderTo(1, -4); setTimeout(() => sc.flash('+3 apoiantes', '#fde047'), 1500); sc.addFollower();
    }
    if (mode === 'cartazes') { log(JSON.stringify(sc.getSlots().slice(0, 2))); const free = sc.getSlots().find(x => !x.occupiedBy); if (free) sc.setPoster(free.id, fakeLogo('MRP', '#7c3aed')); if (S.endsWith('focus')) sc.focusSlot('slot0'); }
    if (mode === 'comicio') { sc.setCrowd(0.8); sc.setSpeaker(true); setTimeout(() => sc.cheer(1), 1000); }
    if (mode === 'protesto') { sc.setCrowd(0.7); }
    window.__ctrl = sc;
  }
}
run().catch(e => { console.error(e); log('ERRO: ' + e.message); });

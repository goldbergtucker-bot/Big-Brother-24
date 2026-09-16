import { activePlayers, findPlayer, addEvent } from './game-state.js';
import { pickWinner, competitionName } from './competitions.js';

function weekKey(state){ return String(state.currentWeek); }
function weekData(state){ return state.seasonConfig.weeks[weekKey(state)] || state.seasonConfig.weeks[state.currentWeek] || {}; }

function chooseNominees(state, eligible) {
  const pool = eligible.filter(p => p.id !== state.currentHOH?.id);
  pool.sort((a,b)=>((a.stats.social||5)+(a.stats.strategy||5)+Math.random()*20)-((b.stats.social||5)+(b.stats.strategy||5)+Math.random()*20));
  return pool.slice(0,2);
}

export function startSeason(state) {
  state.started = true; state.finished = false; state.currentWeek = 1; state.currentCycle = 1; state.currentStage = 'hoh';
  state.houseguests.forEach(p=>{p.status='Active';});
  addEvent(state,'The Big Brother 24 season has begun.');
}

export function runHOH(state) {
  const players = activePlayers(state);
  const winner = pickWinner(players,'hoh');
  state.currentHOH = winner;
  state.currentStage = 'nominations';
  addEvent(state, `${winner.nickname} won HOH: ${competitionName('hoh', state.currentWeek, state.seasonConfig)}.`);
  return winner;
}

export function runNominations(state) {
  const players = activePlayers(state);
  let nominees;
  if (state.currentWeek >= 3 && state.currentWeek <= 5 && state.bestieGroups.length) {
    const groups = state.bestieGroups.filter(g=>g.some(p=>p.id!==state.currentHOH?.id));
    const g = groups[Math.floor(Math.random()*groups.length)];
    nominees = g.filter(p=>p.status==='Active' && p.id!==state.currentHOH?.id);
    if (!nominees.length) nominees = chooseNominees(state, players);
  } else nominees = chooseNominees(state, players);
  state.nominees = nominees;
  state.currentStage = 'povPlayers';
  addEvent(state, `${state.currentHOH.nickname} nominated ${nominees.map(p=>p.nickname).join(' and ')}.`);
  return nominees;
}

export function selectPOVPlayers(state) {
  const eligible = activePlayers(state).filter(p=>!state.nominees.some(n=>n.id===p.id) && p.id!==state.currentHOH?.id);
  const shuffled=[...eligible].sort(()=>Math.random()-0.5);
  state.povPlayers=[state.currentHOH,...state.nominees,...shuffled].filter(Boolean).slice(0,6);
  state.currentStage='pov';
  addEvent(state, `The Power of Veto players have been selected.`);
}

export function runPOV(state) {
  const winner=pickWinner(state.povPlayers,'pov');
  state.povWinner=winner;
  state.currentStage='vetoCeremony';
  addEvent(state, `${winner.nickname} won the Power of Veto: ${competitionName('pov', state.currentWeek, state.seasonConfig)}.`);
  return winner;
}

export function runVetoCeremony(state) {
  const use = state.povWinner && state.nominees.some(n=>n.id===state.povWinner.id) ? true : Math.random()<0.45;
  if(use && state.nominees.length) {
    const saved=state.nominees[Math.floor(Math.random()*state.nominees.length)];
    const replacement=activePlayers(state).filter(p=>p.id!==state.currentHOH.id && p.id!==saved.id && !state.nominees.some(n=>n.id===p.id));
    if(replacement.length) {
      state.nominees=state.nominees.filter(n=>n.id!==saved.id);
      state.replacementNominee=replacement[Math.floor(Math.random()*replacement.length)];
      state.nominees.push(state.replacementNominee);
      addEvent(state, `${state.povWinner.nickname} used the Veto on ${saved.nickname}; ${state.replacementNominee.nickname} is the replacement nominee.`);
    }
  } else addEvent(state,'The Power of Veto was not used.');
  state.currentStage='evictionVoting';
}

export function runEviction(state) {
  if (state.seasonConfig.weeks[state.currentWeek]?.eviction === false) { state.currentStage='nextWeek'; addEvent(state,'There was no eviction this week.'); return null; }
  const nominees=state.nominees.filter(p=>p.status==='Active');
  if (!nominees.length) { state.currentStage='nextWeek'; return null; }
  const votes={}; nominees.forEach(n=>votes[n.id]=0);
  activePlayers(state).filter(p=>!nominees.some(n=>n.id===p.id) && p.id!==state.currentHOH?.id).forEach(voter=>{
    const choice=[...nominees].sort((a,b)=>{
      const ra=(state.relationships[`${voter.id}->${a.id}`]?.score||0), rb=(state.relationships[`${voter.id}->${b.id}`]?.score||0);
      return ra-rb+Math.random()*40;
    })[0]; votes[choice.id]++;
  });
  const evicted=nominees.sort((a,b)=>votes[b.id]-votes[a.id])[0];
  evicted.status='Evicted'; state.evictedHouseguests.push(evicted); state.jury.push(evicted); state.evictionVotes=votes;
  addEvent(state, `${evicted.nickname} was evicted by a vote of ${votes[evicted.id]}-${Object.values(votes).reduce((a,b)=>a+b,0)-votes[evicted.id]}.`);
  state.currentStage='nextWeek';
  return evicted;
}

export function advanceWeek(state) {
  state.currentHOH=null; state.nominees=[]; state.povPlayers=[]; state.povWinner=null; state.replacementNominee=null; state.evictionVotes={};
  const active=activePlayers(state);
  if(active.length<=3){ state.currentStage='finalHOH1'; return; }
  state.currentWeek = state.currentWeek===9 ? 9.5 : state.currentWeek+1;
  if(state.currentWeek>12){state.currentStage='finalHOH1';} else state.currentStage='hoh';
}

export function runFinalHOHPart(state, part) {
  const finalists=activePlayers(state);
  let players=finalists;
  if(part===2 && state.finalHOH.part1) players=finalists.filter(p=>p.id!==state.finalHOH.part1.id);
  if(part===3) players=[state.finalHOH.part1,state.finalHOH.part2].filter(Boolean);
  const winner=pickWinner(players,'final');
  state.finalHOH[`part${part}`]=winner;
  addEvent(state, `${winner.nickname} won Final HOH Part ${part}: ${competitionName('finalHOH',part,state.seasonConfig)}.`);
  if(part<3) state.currentStage=`finalHOH${part+1}`; else {state.finalHOH.winner=winner; state.currentStage='finalEviction';}
  return winner;
}

export function runFinalEviction(state) {
  const hoh=state.finalHOH.winner; const options=activePlayers(state).filter(p=>p.id!==hoh.id);
  const evicted=options.sort((a,b)=>(a.stats.social+a.stats.strategy)-(b.stats.social+b.stats.strategy)+Math.random()*20)[0];
  evicted.status='Evicted'; state.evictedHouseguests.push(evicted); state.jury.push(evicted); state.currentStage='juryVote';
  addEvent(state, `${hoh.nickname} evicted ${evicted.nickname} from the Final 3.`);
}

export function runJuryVote(state) {
  const finalists=activePlayers(state); const votes={}; finalists.forEach(p=>votes[p.id]=0);
  state.jury.forEach(j=>{ const winner=finalists.sort((a,b)=>((state.relationships[`${j.id}->${b.id}`]?.score||0)+b.stats.strategy*2+b.stats.social*2+Math.random()*20)-((state.relationships[`${j.id}->${a.id}`]?.score||0)+a.stats.strategy*2+a.stats.social*2+Math.random()*20))[0]; votes[winner.id]++; });
  state.finaleWinner=finalists.sort((a,b)=>votes[b.id]-votes[a.id])[0]; state.finalVoteTotals=votes; state.finished=true; state.currentStage='finished';
  addEvent(state, `${state.finaleWinner.nickname} won Big Brother 24.`);
  return state.finaleWinner;
}

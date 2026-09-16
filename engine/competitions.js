export const BB24_COMPETITIONS = {
  hoh: {
    1:'Drumming for Power', 2:'The BB Pie Fest', 3:'Get Lit', 4:'The Invitation', 5:'Mind Your Step',
    6:'Conspiracy Fest', 7:'Do You See The VIP?', 8:'Carni-Small', 9:'Burning Bot', '9.5':'Laser Focus',
    10:'Horror Fest Lockdown', 11:'Fashion Fest', 12:'Wiener-Palooza'
  },
  pov: {
    1:'Ren Fest', 2:'Mermaid Fest', 3:'Woodstack', 4:'Trippy Watch Party', 5:'OTEV the Singing Stageroach',
    6:'Punkaroo', 7:'Pride Slide / Lunch is Served', 8:'Pride Slide', 9:'BB Comics', '9.5':'Amp It Up',
    10:'Snooze Fest', 11:'Mathletes'
  },
  finalHOH: ['Wiener-Palooza','Festival Lineup','Jury Fest']
};

export function competitionName(type, week, config) {
  if (type === 'finalHOH') return BB24_COMPETITIONS.finalHOH[week-1] || 'Final HOH';
  return BB24_COMPETITIONS[type]?.[week] || config.weeks[week]?.[type] || type.toUpperCase();
}

export function scoreForCompetition(player, type='hoh') {
  const s = player.stats || {};
  if (type === 'hoh') return (s.physical||5)*2 + (s.mental||5) + (s.strategy||5) + Math.random()*20;
  if (type === 'pov') return (s.physical||5) + (s.mental||5)*2 + (s.social||5) + Math.random()*20;
  return (s.mental||5)*2 + (s.social||5) + (s.strategy||5) + Math.random()*20;
}

export function pickWinner(players, type='hoh') {
  return [...players].sort((a,b)=>scoreForCompetition(b,type)-scoreForCompetition(a,type))[0] || null;
}

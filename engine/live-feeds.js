export function createFeedEntry(state, text, type='General') {
  const entry = { week: state.currentWeek, type, timestamp: new Date().toLocaleString(), text };
  state.liveFeeds.unshift(entry);
  return entry;
}

export function generateFeedEvent(state) {
  const active = state.houseguests.filter(p=>p.status==='Active');
  if (active.length < 2) return null;
  const a = active[Math.floor(Math.random()*active.length)];
  let b = active[Math.floor(Math.random()*active.length)];
  while (b.id === a.id) b = active[Math.floor(Math.random()*active.length)];
  const rel = state.relationships[`${a.id}->${b.id}`];
  const line = rel?.type === 'hate'
    ? `${a.nickname} and ${b.nickname} had a tense conversation in the house.`
    : rel?.type === 'love'
      ? `${a.nickname} and ${b.nickname} spent time together and reinforced their bond.`
      : `${a.nickname} and ${b.nickname} talked game and compared notes.`;
  return createFeedEntry(state, line, 'Live Feed');
}

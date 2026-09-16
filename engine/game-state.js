export function createGameState(config, cast) {
  return {
    selectedSeasonTemplate: config.id,
    seasonConfig: config,
    houseguests: structuredClone(cast),
    currentWeek: 1,
    currentCycle: 1,
    currentStage: 'opening',
    currentHOH: null,
    nominees: [],
    povPlayers: [],
    povWinner: null,
    replacementNominee: null,
    evictionVotes: {},
    jury: [],
    evictedHouseguests: [],
    finalHOH: { part1: null, part2: null, part3: null, winner: null },
    finaleWinner: null,
    alliances: [],
    twists: structuredClone(config.twists),
    relationships: {},
    eventLog: [],
    liveFeeds: [],
    bestieGroups: [],
    splitHouse: null,
    started: false,
    finished: false
  };
}

export function activePlayers(state) { return state.houseguests.filter(p => p.status === 'Active'); }
export function findPlayer(state, idOrName) {
  return state.houseguests.find(p => p.id === idOrName || p.nickname === idOrName || p.firstName === idOrName);
}
export function addEvent(state, text) {
  state.eventLog.unshift({ time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}), text });
}
export function addFeed(state, text, day = `Week ${state.currentWeek}`) {
  state.liveFeeds.unshift({ day, time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}), text });
}

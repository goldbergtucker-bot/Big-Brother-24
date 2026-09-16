const TYPE_SCORE = { love: 35, like: 20, neutral: 0, dislike: -20, hate: -35 };
export function relationshipKey(a,b){ return `${a}->${b}`; }
export function setRelationship(state, from, to, type='neutral', note='') {
  state.relationships[relationshipKey(from,to)] = { from, to, type, note, score: TYPE_SCORE[type] ?? 0 };
}
export function getRelationship(state, from, to) { return state.relationships[relationshipKey(from,to)] || { from,to,type:'neutral',note:'',score:0 }; }
export function deleteRelationship(state, from, to) { delete state.relationships[relationshipKey(from,to)]; }
export function relationshipScore(state, from, to) { return getRelationship(state,from,to).score || 0; }
export function areAllied(state,a,b) { return state.alliances.some(x => x.members.includes(a.id) && x.members.includes(b.id)); }

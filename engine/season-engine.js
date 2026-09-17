/*
 * BIG BROTHER 24 CUSTOM SIMULATOR — SEASON ENGINE
 *
 * One source of truth for the complete season simulation. Implements:
 *   1. Backstage Boss (Week 1): random safety draw, three Backstage Passes,
 *      a secret America save, a secret Boss save, and a Hit the Road duel
 *      between the house's evictee and the last unsaved Backstage houseguest.
 *   2. Festie Besties (from Week 3): duo/trio pairing at the Week 3 HOH,
 *      whole-group nominations, group-eligible POV pool (up to 8 players,
 *      or the full house if a trio/quartet is nominated), whole-group veto
 *      saves and replacements, and a plurality house vote to decide which
 *      single member of a nominated group is evicted.
 *   3. Split House Double Eviction (Week 7): the house is divided into two
 *      groups that each run a fully separate HOH → nominations → POV →
 *      eviction cycle, with one eviction per group the same night.
 *   4. Standard weeks, jury, Final 3 three-part Final HOH and the finale.
 *
 * The engine pre-simulates the season into state.history. The UI reveals
 * those records one at a time, preserving the BrantSteele-style chain.
 *
 * NOTE ON SIMPLIFICATIONS: a few real-world edge cases from the actual BB24
 * broadcast (e.g. the Backstage Boss twist being cancelled mid-season after
 * a contestant walked, or Festie Besties groups occasionally re-merging
 * later in the season) are not reproduced exactly. This engine implements
 * the twists as fully playable custom-cast mechanics instead.
 */
(function(){
  const C=()=>window.Competitions;
  const R=()=>window.RelEngine;
  const CFG=()=>window.BB24_CONFIG;

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const living=s=>s.houseguests.filter(h=>h.active);
  const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const pick=a=>a&&a.length?a[Math.floor(Math.random()*a.length)]:null;
  const hg=(s,id)=>s.houseguests.find(h=>h.id===id)||null;
  const displayName=h=>{const n=`${h?.firstName||""} ${h?.lastName||""}`.trim();return n||`Houseguest ${h?.slot||""}`;};
  const ordinal=n=>{const v=n%100;const suf=v>=11&&v<=13?"th":({1:"st",2:"nd",3:"rd"}[n%10]||"th");return `${n}${suf}`;};
  const groupOf=(s,id)=>s.bestieGroups.find(g=>g.memberIds.includes(id))||null;

  function snapshot(s){return {
    phase:s.phase,week:s.week,currentHOH:s.currentHOH,originalHOH:s.originalHOH||null,
    nominees:(s.nominees||[]).slice(),nomineeGroupId:s.nomineeGroupId||null,intendedTarget:s.intendedTarget||null,targetHistory:(s.targetHistory||[]).slice(),
    povPlayers:(s.povPlayers||[]).slice(),vetoWinners:(s.vetoWinners||[]).slice(),evictionVotes:(s.evictionVotes||[]).slice(),evicted:(s.evicted||[]).slice(),jury:(s.jury||[]).slice(),
    backstage:s.backstage?JSON.parse(JSON.stringify(s.backstage)):null,
    bestieGroups:JSON.parse(JSON.stringify(s.bestieGroups||[])),
    splitHouse:s.splitHouse?JSON.parse(JSON.stringify(s.splitHouse)):null,
    houseguests:s.houseguests.map(h=>({id:h.id,slot:h.slot,firstName:h.firstName,lastName:h.lastName,portraitUrl:h.portraitUrl,gender:h.gender||"",active:h.active,safe:h.safe,nominated:h.nominated,juryMember:h.juryMember,evicted:h.evicted,placement:h.placement})),
    finale:s.finale?JSON.parse(JSON.stringify(s.finale)):null
  };}

  function eventData(s,e){
    const ids=a=>Array.isArray(a)?a.slice():[];
    const d={...(e.data||{})};
    d.competition=e.competition?JSON.parse(JSON.stringify(e.competition)):d.competition||null;
    d.participants=ids(e.participants||d.participants);d.nomineeIds=ids(e.nomineeIds||d.nomineeIds||s.nominees);d.povPlayers=ids(e.povPlayers||d.povPlayers||s.povPlayers);
    d.winnerId=e.winnerId||d.winnerId||null;d.hohId=e.hohId||d.hohId||s.currentHOH||null;d.evictedId=e.evictedId||d.evictedId||null;
    if(e.type==="veto-ceremony"){d.vetoUsed=!!(e.vetoUsed ?? d.vetoUsed);d.finalNomineeIds=ids(e.finalNomineeIds||d.finalNomineeIds||e.nomineeIds||d.nomineeIds||s.nominees);}
    if(e.type==="eviction-voting")d.votes=(s.evictionVotes||[]).map(v=>({...v})),d.voterIds=d.votes.map(v=>v.voterId);
    if(e.type==="eviction"){
      d.voteCounts={...(e.voteCounts||d.voteCounts||{})};
      d.tieBreakVoteId=e.tieBreakVoteId||d.tieBreakVoteId||null;
      d.evictedVoteCount=Number(e.evictedVoteCount ?? d.evictedVoteCount ?? 0);
      if(e.stayVoteCount!=null||d.stayVoteCount!=null) d.stayVoteCount=Number(e.stayVoteCount ?? d.stayVoteCount ?? 0);
    }
    if(e.type==="backstage-boss"||e.type==="backstage-passes"||e.type==="backstage-america-save"||e.type==="backstage-boss-save"||e.type==="backstage-duel") d.backstage=JSON.parse(JSON.stringify(s.backstage||{}));
    if(e.type==="bestie-groups") d.bestieGroups=JSON.parse(JSON.stringify(s.bestieGroups));
    if(e.type==="split-house") d.splitHouse=JSON.parse(JSON.stringify(s.splitHouse));
    if(e.type==="jury-vote")d.votes=(s._juryVotes||[]).map(v=>({...v})),d.voterIds=d.votes.map(v=>v.voterId),d.finalistIds=living(s).map(h=>h.id);
    if(e.type==="final-decision")d.finalistIds=living(s).map(h=>h.id);
    if(e.type==="winner"){d.runnerUpId=e.runnerUpId||d.runnerUpId||s.finale?.runnerUpId||null;d.afpId=e.afpId||d.afpId||s.finale?.americasFavoriteId||null;d.afpVotes=e.afpVotes||d.afpVotes||s.finale?.americasFavoriteVotes||{};d.thirdPlaceId=e.thirdPlaceId||d.thirdPlaceId||s.finale?.thirdPlaceId||null;}
    return d;
  }
  function log(s,e){const r={id:s.history.length+1,...e};r.snapshot=snapshot(s);r.data=eventData(s,r);s.history.push(r);}

  function ensureState(s){
    s.evicted=Array.isArray(s.evicted)?s.evicted:[];s.jury=Array.isArray(s.jury)?s.jury:[];
    s.nominees=s.nominees||[];s.povPlayers=s.povPlayers||[];s.vetoWinners=s.vetoWinners||[];s.evictionVotes=s.evictionVotes||[];
    s.teams=Array.isArray(s.teams)?s.teams:[];s.history=s.history||[];
    s.backstage=s.backstage||null;s.bestieGroups=Array.isArray(s.bestieGroups)?s.bestieGroups:[];s.splitHouse=s.splitHouse||null;
    s.nomineeGroupId=s.nomineeGroupId||null;s._priorHohIds=Array.isArray(s._priorHohIds)?s._priorHohIds:[];
    s.houseguests.forEach(h=>{h.gender=h.gender||"";h.allianceIds=h.allianceIds||[];h.ratings=h.ratings||{general:50,physical:50,mental:50,social:50,strategic:50};});
  }

  function relationshipScore(s,a,b){const r=s.relationships?.[a.id]?.[b.id]||{friendship:50,trust:50,loyalty:50,respect:50,attraction:0,rivalry:0};return (r.friendship||0)*.30+(r.trust||0)*.25+(r.loyalty||0)*.15+(r.respect||0)*.20+(r.attraction||0)*.10-(r.rivalry||0)*.35;}
  function randomizeRelationships(s){if(s.season.relationshipsRandomized||s.season.relationshipsCustomized)return;s.houseguests.forEach(a=>s.houseguests.forEach(b=>{if(a.id===b.id)return;const r=s.relationships[a.id][b.id];const n=()=>Math.round(Math.random()*40-20);r.friendship=clamp(r.friendship+n(),15,85);r.trust=clamp(r.trust+n(),15,85);r.loyalty=clamp(r.loyalty+n(),15,85);r.respect=clamp(r.respect+n(),15,85);r.rivalry=Math.round(Math.random()*25);r.attraction=Math.round(Math.random()*30);}));s.season.relationshipsRandomized=true;}

  /* ------------------------------ BACKSTAGE BOSS (WEEK 1) ------------------------------ */
  function runBackstageBoss(s){
    const all=living(s);
    const boss=pick(shuffle(all));
    s.backstage={bossId:boss.id,passIds:[],americaSavedId:null,bossSavedId:null,duelistId:null,duelWinnerId:null,duelLoserId:null};
    boss.safe=true;
    log(s,{week:1,phase:"premiere",type:"backstage-boss",winnerId:boss.id,participants:all.map(p=>p.id),title:"Move-In Night — Backstage Boss",lines:[`All ${all.length} houseguests draw a ticket on Move-In Night.`,`${displayName(boss)} unknowingly draws the Backstage Boss ticket.`,`${displayName(boss)} is safe for the week and cannot compete in any Week 1 competition.`]});
    return boss;
  }
  function runBackstagePasses(s,hoh){
    const boss=hg(s,s.backstage.bossId);
    const pool=living(s).filter(p=>p.id!==hoh.id&&p.id!==boss.id);
    const scored=pool.map(p=>({p,score:relationshipScore(s,boss,p)+Math.random()*20-10})).sort((a,b)=>a.score-b.score);
    const passes=scored.slice(0,3).map(x=>x.p);
    passes.forEach(p=>{p.nominated=true;});
    s.backstage.passIds=passes.map(p=>p.id);
    log(s,{week:1,phase:"premiere",type:"backstage-passes",hohId:hoh.id,winnerId:boss.id,participants:passes.map(p=>p.id),title:"Backstage Boss — Passes Given",lines:[`${displayName(boss)} must secretly select three houseguests to receive Backstage Passes.`,`${passes.map(displayName).join(", ")} receive Backstage Passes.`,`None of the three can compete in any competition this week, and America will secretly save one of them from the Backstage Duel pool.`]});
  }
  function runBackstageAmericaSave(s){
    const passes=s.backstage.passIds.map(id=>hg(s,id));
    const scored=passes.map(p=>{
      const others=living(s).filter(x=>x.id!==p.id);
      const avgRel=others.length?others.reduce((sum,o)=>sum+relationshipScore(s,p,o),0)/others.length:50;
      return {p,score:Number(p.ratings.social||50)*.5+Number(p.ratings.general||50)*.2+avgRel*.2+Math.random()*15};
    }).sort((a,b)=>b.score-a.score);
    const saved=scored[0].p;
    s.backstage.americaSavedId=saved.id;
    log(s,{week:1,phase:"premiere",type:"backstage-america-save",winnerId:saved.id,participants:passes.map(p=>p.id),title:"America Votes — Backstage Save",lines:[`America secretly votes to save one Backstage Pass houseguest from the duel pool.`,`${displayName(saved)} is saved and cannot be sent to the Backstage Duel.`]});
  }
  function runBackstageBossSave(s){
    const boss=hg(s,s.backstage.bossId);
    const remaining=s.backstage.passIds.filter(id=>id!==s.backstage.americaSavedId).map(id=>hg(s,id));
    const scored=remaining.map(p=>({p,score:relationshipScore(s,boss,p)+Math.random()*15})).sort((a,b)=>b.score-a.score);
    const bossSaved=scored[0].p;
    const duelist=remaining.find(p=>p.id!==bossSaved.id);
    s.backstage.bossSavedId=bossSaved.id;
    s.backstage.duelistId=duelist.id;
    log(s,{week:1,phase:"premiere",type:"backstage-boss-save",winnerId:bossSaved.id,participants:remaining.map(p=>p.id),title:"Backstage Boss — Final Save",lines:[`${displayName(boss)} privately chooses to save one of the two remaining Backstage Pass houseguests.`,`${displayName(bossSaved)} is safe.`,`${displayName(duelist)} will face the house's eviction-night evictee in the Backstage Duel.`]});
  }

  /* ------------------------------ FESTIE BESTIES (FROM WEEK 3) ------------------------------ */
  function formBestieGroups(s){
    const pool=shuffle(living(s));
    const groups=[];
    while(pool.length>=2){
      const a=pool.shift();
      let bestIdx=0,bestScore=-Infinity;
      pool.forEach((b,i)=>{const sc=relationshipScore(s,a,b)+Math.random()*10;if(sc>bestScore){bestScore=sc;bestIdx=i;}});
      const b=pool.splice(bestIdx,1)[0];
      groups.push({id:`bestie-${groups.length+1}`,memberIds:[a.id,b.id]});
    }
    if(pool.length===1){
      const leftover=pool[0];
      let bestG=null,bestScore=-Infinity;
      groups.forEach(g=>{
        const members=g.memberIds.map(id=>hg(s,id));
        const avg=members.reduce((sum,m)=>sum+relationshipScore(s,leftover,m),0)/members.length;
        if(avg>bestScore){bestScore=avg;bestG=g;}
      });
      if(bestG) bestG.memberIds.push(leftover.id); else groups.push({id:`bestie-${groups.length+1}`,memberIds:[leftover.id]});
    }
    s.bestieGroups=groups;
    log(s,{week:3,phase:"standard",type:"bestie-groups",participants:living(s).map(p=>p.id),title:"Festie Besties — Groups Formed",lines:groups.map(g=>`${g.memberIds.map(id=>displayName(hg(s,id))).join(" & ")} are Festie Besties.`)});
  }

  function chooseNomineeGroup(s,hoh){
    const hohGroup=groupOf(s,hoh.id);
    const candidates=s.bestieGroups.filter(g=>g.id!==hohGroup?.id&&g.memberIds.some(id=>{const p=hg(s,id);return p&&p.active;}));
    if(!candidates.length) return null;
    const scored=candidates.map(g=>{
      const members=g.memberIds.map(id=>hg(s,id)).filter(p=>p&&p.active);
      const avg=members.length?members.reduce((sum,p)=>sum+relationshipScore(s,hoh,p),0)/members.length:50;
      return {g,score:avg+Math.random()*20-10};
    }).sort((a,b)=>a.score-b.score);
    return scored[0].g;
  }

  /* ---------------------------- NOMINATIONS ---------------------------- */
  function backstageExcludedIds(s,week){
    if(week===CFG().backstageBossWeek&&s.backstage) return new Set([s.backstage.bossId,...s.backstage.passIds]);
    return new Set();
  }
  function eligibleForNominations(s,hoh,week){
    let pool=living(s).filter(p=>p.id!==hoh.id&&!p.safe);
    const exclude=backstageExcludedIds(s,week);
    if(exclude.size) pool=pool.filter(p=>!exclude.has(p.id));
    if(pool.length<2)pool=living(s).filter(p=>p.id!==hoh.id);
    return pool;
  }
  function chooseIndividualNominees(s,hoh,week){
    const pool=eligibleForNominations(s,hoh,week);
    if(R()?.pickNominees){try{return R().pickNominees(s,hoh,pool,Math.min(2,pool.length));}catch(e){/* fall through */}}
    return shuffle(pool).slice(0,2);
  }
  function planTarget(s,hoh,noms){
    const ranked=noms.map(p=>({p,score:relationshipScore(s,hoh,p)})).sort((a,b)=>a.score-b.score);
    const target=ranked[0]?.p;
    return {text:target?displayName(target):null};
  }
  function runNominations(s,week){
    const hoh=hg(s,s.currentHOH);
    let noms=null,groupId=null;
    if(week>=CFG().festieBestiesFormWeek && s.bestieGroups.length){
      const group=chooseNomineeGroup(s,hoh);
      if(group){
        noms=group.memberIds.map(id=>hg(s,id)).filter(p=>p&&p.active);
        groupId=group.id;
      }
    }
    if(!noms||!noms.length) noms=chooseIndividualNominees(s,hoh,week);
    if(noms.length===1){
      const excludeIds=backstageExcludedIds(s,week);
      const extra=living(s).filter(p=>p.id!==hoh.id&&!noms.some(n=>n.id===p.id)&&!excludeIds.has(p.id));
      if(extra.length) noms.push(pick(extra));
    }
    noms.forEach(n=>n.nominated=true);
    s.nominees=noms.map(n=>n.id);
    s.nomineeGroupId=groupId;
    const plan=planTarget(s,hoh,noms);
    s.intendedTarget=plan.text;
    s.targetHistory=[{text:plan.text,reason:"Initial target"}];
    const lines=[groupId
      ? `${displayName(hoh)} nominates the Festie Besties group of ${noms.map(displayName).join(", ")} for eviction.`
      : `${displayName(hoh)} nominates ${noms.map(displayName).join(" and ")} for eviction.`];
    log(s,{week,phase:s.phase,type:"nominations",hohId:hoh.id,nomineeIds:s.nominees,nomineeGroupId:groupId,intendedTarget:s.intendedTarget,targetHistory:s.targetHistory,title:"Nomination Ceremony",lines});
  }

  function selectPOVPlayers(s,week){
    const noms=s.nominees.map(id=>hg(s,id)).filter(Boolean),hoh=hg(s,s.currentHOH);
    const festieActive=week>=CFG().festieBestiesFormWeek && week<=5 && s.bestieGroups.length>0;
    let pool=[];
    let pickedIds=[];
    if(festieActive && s.nomineeGroupId){
      // Festie Besties Weeks 3–5: the HOH, the HOH's Bestie, and the
      // nominated Bestie group are automatic. The remaining slots are
      // filled by individual random draws until the POV pool reaches six.
      const hohGroup=groupOf(s,hoh.id);
      const automatic=[];
      const addUnique=p=>{if(p&&p.active&&!automatic.some(x=>x.id===p.id))automatic.push(p);};
      addUnique(hoh);
      (hohGroup?.memberIds||[]).forEach(id=>addUnique(hg(s,id)));
      noms.forEach(addUnique);
      pool=automatic.slice();
      const remaining=6-pool.length;
      if(remaining>0){
        const candidates=shuffle(living(s).filter(p=>!pool.some(x=>x.id===p.id)));
        candidates.slice(0,remaining).forEach(p=>{pool.push(p);pickedIds.push(p.id);});
      }
    }else if(festieActive && !s.nomineeGroupId){
      // Safety fallback if a Festie group could not be assigned: normal
      // six-player POV selection, while still respecting the HOH.
      pool=[hoh,...noms];
      const candidates=shuffle(living(s).filter(p=>!pool.some(x=>x.id===p.id)));
      candidates.slice(0,Math.max(0,6-pool.length)).forEach(p=>{pool.push(p);pickedIds.push(p.id);});
    }else{
      const excludeIds=backstageExcludedIds(s,week);
      pool=[hoh,...noms];
      const candidates=shuffle(living(s).filter(p=>!pool.some(x=>x.id===p.id)&&!excludeIds.has(p.id)));
      candidates.slice(0,Math.max(0,6-pool.length)).forEach(p=>{pool.push(p);pickedIds.push(p.id);});
    }
    s.povPlayers=pool.map(p=>p.id);
    const automaticIds=pool.map(p=>p.id).filter(id=>!pickedIds.includes(id));
    const line=festieActive && s.nomineeGroupId
      ? `${displayName(hoh)} and ${displayName(hg(s,groupOf(s,hoh.id)?.memberIds?.find(id=>id!==hoh.id))||hoh)} are automatically selected, along with the nominated Festie Besties group (${noms.map(displayName).join(", ")}). ${pickedIds.length} additional houseguest${pickedIds.length===1?" is":"s are"} randomly selected.`
      : `${displayName(hoh)} and the nominees are automatically selected; ${pickedIds.length} additional houseguest${pickedIds.length===1?" is":"s are"} randomly drawn.`;
    log(s,{week,phase:s.phase,type:"pov-players",hohId:hoh.id,nomineeIds:s.nominees,povPlayers:s.povPlayers,participants:s.povPlayers,automaticIds,pickedIds,title:"POV Picked Players",lines:[line]});
    return pool;
  }
  function runPOVCompetition(s,week,pool,type="pov"){
    const comp=C().runCompetition(pool,{week,type}),winner=comp.winner;s.vetoWinners=[winner.id];
    log(s,{week,phase:s.phase,type:"veto",winnerId:winner.id,participants:pool.map(p=>p.id),competition:comp,title:`Power of Veto — ${comp.label}`,lines:[`${displayName(winner)} wins the Power of Veto.`]});
    return {pool,winner};
  }

  function applyVeto(s,week,veto){
    let noms=s.nominees.map(id=>hg(s,id)).filter(Boolean);
    const hoh=hg(s,s.currentHOH),winner=veto.winner;
    const decision=R().decideVetoUse(s,winner,hoh,noms);
    if(!decision.use){
      log(s,{week,phase:s.phase,type:"veto-ceremony",hohId:hoh.id,winnerId:winner.id,nomineeIds:s.nominees,finalNomineeIds:s.nominees,vetoUsed:false,title:"Veto Ceremony — Not Used",lines:[`${displayName(winner)} does not use the Power of Veto.`]});
      return;
    }
    if(s.nomineeGroupId){
      noms.forEach(n=>{n.nominated=false;});
      const hohGroupId=groupOf(s,hoh.id)?.id;
      const excludeIds=new Set([s.nomineeGroupId,hohGroupId].filter(Boolean));
      const candidates=s.bestieGroups.filter(g=>!excludeIds.has(g.id)&&g.memberIds.some(id=>{const p=hg(s,id);return p&&p.active;}));
      const replacementGroup=pick(candidates);
      let replacementMembers=[];
      if(replacementGroup){
        replacementMembers=replacementGroup.memberIds.map(id=>hg(s,id)).filter(p=>p&&p.active);
        replacementMembers.forEach(p=>p.nominated=true);
        s.nomineeGroupId=replacementGroup.id;
      }else{
        // No eligible replacement Bestie group remains (rare, small-cast edge case).
        // Fall back to a normal individual replacement pair so the block is never empty.
        s.nomineeGroupId=null;
        const indivPool=living(s).filter(p=>p.id!==hoh.id&&!p.safe);
        replacementMembers=shuffle(indivPool).slice(0,Math.min(2,indivPool.length));
        replacementMembers.forEach(p=>p.nominated=true);
      }
      s.nominees=replacementMembers.map(p=>p.id);
      log(s,{week,phase:s.phase,type:"veto-ceremony",hohId:hoh.id,winnerId:winner.id,nomineeIds:s.nominees,finalNomineeIds:s.nominees,vetoUsed:true,title:"Veto Ceremony — Used",lines:[`${displayName(winner)} uses the Power of Veto, removing the entire nominated Bestie group from the block.`,replacementMembers.length?`${displayName(hoh)} names a new group as the replacement nominees: ${replacementMembers.map(displayName).join(", ")}.`:`No eligible replacement group remains, so the block is empty this week.`]});
      return;
    }
    const saved=noms.find(n=>n.id===decision.saveId)||noms[0];
    saved.nominated=false;
    const excludeIds=backstageExcludedIds(s,week);
    const pool=living(s).filter(p=>p.id!==hoh.id&&!p.safe&&!noms.some(n=>n.id===p.id)&&p.id!==saved.id&&p.id!==winner.id&&!excludeIds.has(p.id));
    const replacement=R().pickReplacement?R().pickReplacement(s,hoh,pool,noms.map(n=>n.id)):pick(pool);
    let finalNoms=noms.filter(n=>n.id!==saved.id);
    if(replacement){replacement.nominated=true;finalNoms.push(replacement);}
    s.nominees=finalNoms.map(n=>n.id);
    log(s,{week,phase:s.phase,type:"veto-ceremony",hohId:hoh.id,winnerId:winner.id,nomineeIds:s.nominees,finalNomineeIds:s.nominees,vetoUsed:true,title:"Veto Ceremony — Used",lines:[`${displayName(winner)} uses the Power of Veto on ${displayName(saved)}${replacement?`; ${displayName(hoh)} names ${displayName(replacement)} as the replacement nominee.`:"."}`]});
  }

  function evictionCycle(s,week,voterPool=null,phaseOverride=null){
    const phase=phaseOverride||s.phase;
    let noms=s.nominees.map(id=>hg(s,id)).filter(Boolean);
    if(!noms.length)return null;
    const hoh=hg(s,s.currentHOH);
    const nomineeIds=new Set(noms.map(n=>n.id));
    const basePool=voterPool||living(s);
    const voters=basePool.filter(p=>p.id!==hoh.id&&!nomineeIds.has(p.id));
    const counts={};noms.forEach(n=>counts[n.id]=0);
    s.evictionVotes=[];
    voters.forEach(v=>{
      let out=noms.length===2?R().decideVote(s,v,noms[0],noms[1],hoh):R().decideVoteMulti(s,v,noms,hoh);
      if(!(out in counts))out=noms[0].id;
      counts[out]++;s.evictionVotes.push({voterId:v.id,targetId:out});
    });
    const maxVotes=Math.max(...Object.values(counts));
    const topIds=Object.keys(counts).filter(id=>counts[id]===maxVotes);
    let evictedId,tieBreakVoteId=null;
    if(topIds.length>1){
      const tied=topIds.map(id=>hg(s,id));
      const scored=tied.map(p=>({p,score:relationshipScore(s,hoh,p)+Math.random()*6-3})).sort((a,b)=>a.score-b.score);
      evictedId=scored[0].p.id;tieBreakVoteId=evictedId;
    }else{
      evictedId=topIds[0];
    }
    const evicted=hg(s,evictedId);
    const others=noms.filter(n=>n.id!==evictedId);
    log(s,{week,phase,type:"eviction-voting",nomineeIds:noms.map(n=>n.id),voterIds:voters.map(v=>v.id),votes:s.evictionVotes,tieBreakVoteId,title:"Eviction Vote",lines:[...s.evictionVotes.map(v=>`${displayName(hg(s,v.voterId))} votes to evict ${displayName(hg(s,v.targetId))}.`),...(tieBreakVoteId?[`${displayName(hoh)} breaks the tie and votes to evict ${displayName(hg(s,tieBreakVoteId))}.`]:[])]});
    evicted.active=false;evicted.evicted=true;s.season.evictionCount++;evicted.placement=s.season.castSize-s.season.evictionCount+1;
    const juryThreshold=CFG().juryThresholdPlacement||11;
    if(evicted.placement<=juryThreshold&&!s.jury.includes(evicted.id)){evicted.juryMember=true;s.jury.push(evicted.id);}
    s.evicted.push(evicted.id);
    const grp=groupOf(s,evicted.id);
    if(grp) grp.memberIds=grp.memberIds.filter(id=>id!==evicted.id);
    // During Festie Besties (Weeks 3–5), nobody may remain without a
    // Bestie. If an eviction leaves a one-person group, that survivor joins
    // another active Bestie group and becomes part of a trio.
    if(week>=CFG().festieBestiesFormWeek && week<=5 && grp){
      const survivorId=grp.memberIds.find(id=>{const p=hg(s,id);return p&&p.active;});
      if(survivorId){
        const survivor=hg(s,survivorId);
        const targets=s.bestieGroups.filter(g=>g.id!==grp.id&&g.memberIds.some(id=>{const p=hg(s,id);return p&&p.active;}));
        const target=pick(targets);
        if(target){
          target.memberIds.push(survivor.id);
          grp.memberIds=[];
          log(s,{week,phase,type:"bestie-groups",participants:living(s).map(p=>p.id),title:"Festie Besties — Groups Updated",lines:[`${displayName(survivor)}'s Festie Bestie was evicted, so ${displayName(survivor)} joins ${target.memberIds.filter(id=>id!==survivor.id).map(id=>displayName(hg(s,id))).join(" and ")} to form a three-person Festie Besties group.`,...s.bestieGroups.filter(g=>g.memberIds.length).map(g=>`${g.memberIds.map(id=>displayName(hg(s,id))).join(" & ")} are Festie Besties.`)]});
        }
      }
    }
    s.bestieGroups=s.bestieGroups.filter(g=>g.memberIds.some(id=>{const p=hg(s,id);return p&&p.active;}));
    const evictedVoteCount=counts[evictedId];
    const stayVoteCount=others.length===1?counts[others[0].id]:undefined;
    log(s,{week,phase,type:"eviction",evictedId:evicted.id,voteCounts:counts,evictedVoteCount,stayVoteCount,tieBreakVoteId,nomineeIds:noms.map(n=>n.id),title:"Eviction",lines:[others.length===1?`By a vote of ${counts[evictedId]} to ${counts[others[0].id]}, ${displayName(evicted)}, you have been evicted.`:`By a vote of the house, ${displayName(evicted)}, you have been evicted.`,...(tieBreakVoteId?[`${displayName(hoh)} broke the tie and voted to evict ${displayName(evicted)}.`]:[]),evicted.juryMember?`${displayName(evicted)} joins the jury.`:`${displayName(evicted)} finishes in ${ordinal(evicted.placement)} place.`]});
    s.nominees=[];s.povPlayers=[];s.vetoWinners=[];s.evictionVotes=[];s.nomineeGroupId=null;
    return evicted;
  }

  /* ----------------------------- WEEK 1 ----------------------------- */
  function runWeek1(s){
    s.week=1;s.phase="premiere";
    randomizeRelationships(s);
    s.houseguests.forEach(h=>{h.active=true;h.safe=false;h.nominated=false;});
    const boss=runBackstageBoss(s);
    const pool=living(s).filter(p=>p.id!==boss.id);
    const comp=C().runCompetition(pool,{week:1,type:"hoh"});
    const hoh=comp.winner;
    s.currentHOH=hoh.id;s._priorHohIds=[hoh.id];
    log(s,{week:1,phase:"premiere",type:"hoh",winnerId:hoh.id,participants:pool.map(p=>p.id),competition:comp,title:`Head of Household — ${comp.label}`,lines:[`${displayName(hoh)} wins the Week 1 HOH. ${displayName(boss)} could not compete as the Backstage Boss.`]});
    runBackstagePasses(s,hoh);
    runBackstageAmericaSave(s);
    runBackstageBossSave(s);
    runNominations(s,1);
    const povPool=selectPOVPlayers(s,1);
    const veto=runPOVCompetition(s,1,povPool);
    applyVeto(s,1,veto);
    const houseEvictee=evictionCycle(s,1);
    const duelist=hg(s,s.backstage.duelistId);
    if(duelist&&duelist.active&&houseEvictee){
      const duelComp=C().runCompetition([houseEvictee,duelist],{week:1,type:"backstage-duel"});
      const duelWinner=duelComp.winner,duelLoser=[houseEvictee,duelist].find(p=>p.id!==duelWinner.id);
      s.backstage.duelWinnerId=duelWinner.id;s.backstage.duelLoserId=duelLoser.id;
      if(duelWinner.id===houseEvictee.id){
        houseEvictee.active=true;houseEvictee.evicted=false;
        const wasJury=houseEvictee.juryMember;houseEvictee.juryMember=false;houseEvictee.placement=null;
        s.evicted=s.evicted.filter(id=>id!==houseEvictee.id);
        if(wasJury)s.jury=s.jury.filter(id=>id!==houseEvictee.id);
        s.season.evictionCount--;
        duelist.active=false;duelist.evicted=true;s.season.evictionCount++;
        duelist.placement=s.season.castSize-s.season.evictionCount+1;
        const juryThreshold=CFG().juryThresholdPlacement||11;
        if(duelist.placement<=juryThreshold&&!s.jury.includes(duelist.id)){duelist.juryMember=true;s.jury.push(duelist.id);}
        s.evicted.push(duelist.id);
        log(s,{week:1,phase:"premiere",type:"backstage-duel",winnerId:houseEvictee.id,evictedId:duelist.id,participants:[houseEvictee.id,duelist.id],competition:duelComp,title:"Backstage Duel — Hit the Road",lines:[`${displayName(houseEvictee)} and ${displayName(duelist)} face off in the Backstage Duel.`,`${displayName(houseEvictee)} wins the duel and remains in the game.`,`${displayName(duelist)} is eliminated instead.`]});
      }else{
        log(s,{week:1,phase:"premiere",type:"backstage-duel",winnerId:duelist.id,evictedId:houseEvictee.id,participants:[houseEvictee.id,duelist.id],competition:duelComp,title:"Backstage Duel — Hit the Road",lines:[`${displayName(houseEvictee)} and ${displayName(duelist)} face off in the Backstage Duel.`,`${displayName(duelist)} wins the duel and remains in the game.`,`${displayName(houseEvictee)} is eliminated as originally voted.`]});
      }
    }
  }

  /* --------------------------- STANDARD WEEKS --------------------------- */
  function runStandardWeek(s,week){
    s.week=week;s.phase="standard";
    s.houseguests.forEach(h=>{h.safe=false;h.nominated=false;});
    const priorIds=new Set(s._priorHohIds.length?s._priorHohIds:(s.currentHOH?[s.currentHOH]:[]));
    let pool=living(s).filter(p=>!priorIds.has(p.id));
    if(pool.length<2)pool=living(s);
    const comp=C().runCompetition(pool,{week,type:"hoh"});
    const hoh=comp.winner;
    s.currentHOH=hoh.id;s._priorHohIds=[hoh.id];
    log(s,{week,phase:"standard",type:"hoh",winnerId:hoh.id,participants:pool.map(p=>p.id),competition:comp,title:`Head of Household — ${comp.label}`,lines:[`${displayName(hoh)} wins HOH.`]});
    if(week===CFG().festieBestiesFormWeek) formBestieGroups(s);
    else if(week>=CFG().festieBestiesFormWeek && week<=5 && s.bestieGroups.length){
      log(s,{week,phase:"standard",type:"bestie-groups",participants:living(s).map(p=>p.id),title:`Festie Besties — Week ${week} Update`,lines:[`Festie Besties remain active this week.`,...s.bestieGroups.map(g=>`${g.memberIds.map(id=>displayName(hg(s,id))).join(" & ")} are Festie Besties.`)]});
    }
    runNominations(s,week);
    const povPool=selectPOVPlayers(s,week);
    const veto=runPOVCompetition(s,week,povPool);
    applyVeto(s,week,veto);
    evictionCycle(s,week);
  }

  /* ----------------------- SPLIT HOUSE (WEEK 7) ----------------------- */
  function runSplitHouse(s,week){
    const pool=shuffle(living(s));
    const half=Math.ceil(pool.length/2);
    const groups=[
      {id:"brochella",label:"Big BroChella",memberIds:pool.slice(0,half).map(p=>p.id)},
      {id:"dyrefest",label:"Dyre Fest",memberIds:pool.slice(half).map(p=>p.id)}
    ];
    s.splitHouse={week,groups};
    log(s,{week,phase:"split-house",type:"split-house",participants:pool.map(p=>p.id),title:"Split House — Groups Chosen",lines:[`The house is divided by schoolyard pick into two groups for the week; the two groups cannot communicate.`,`Big BroChella (main house): ${groups[0].memberIds.map(id=>displayName(hg(s,id))).join(", ")}.`,`Dyre Fest (backyard): ${groups[1].memberIds.map(id=>displayName(hg(s,id))).join(", ")}.`]});
    return groups;
  }
  function runSplitGroupCycle(s,week,group){
    const members=group.memberIds.map(id=>hg(s,id)).filter(p=>p&&p.active);
    if(members.length<2)return;
    const hohType=`hoh-${group.id}`,povType=`pov-${group.id}`;
    const comp=C().runCompetition(members,{week,type:hohType});
    const hoh=comp.winner;
    s.currentHOH=hoh.id;
    log(s,{week,phase:"split-house",type:hohType,winnerId:hoh.id,participants:members.map(p=>p.id),competition:comp,title:`${group.label} HOH — ${comp.label}`,lines:[`${displayName(hoh)} wins HOH for ${group.label}.`]});
    let pool=members.filter(p=>p.id!==hoh.id);
    let noms;
    if(R()?.pickNominees){try{noms=R().pickNominees(s,hoh,pool,Math.min(2,pool.length));}catch(e){noms=shuffle(pool).slice(0,2);}}
    else noms=shuffle(pool).slice(0,2);
    noms.forEach(n=>n.nominated=true);
    s.nominees=noms.map(n=>n.id);s.nomineeGroupId=null;
    const plan=planTarget(s,hoh,noms);
    s.intendedTarget=plan.text;s.targetHistory=[{text:plan.text,reason:"Initial target"}];
    log(s,{week,phase:"split-house",type:"nominations",hohId:hoh.id,nomineeIds:s.nominees,intendedTarget:s.intendedTarget,targetHistory:s.targetHistory,title:`${group.label} Nomination Ceremony`,lines:[`${displayName(hoh)} nominates ${noms.map(displayName).join(" and ")} for eviction.`]});
    const povPool=members.slice();
    s.povPlayers=povPool.map(p=>p.id);
    log(s,{week,phase:"split-house",type:"pov-players",hohId:hoh.id,nomineeIds:s.nominees,povPlayers:s.povPlayers,participants:s.povPlayers,title:`${group.label} POV Players`,lines:[`All remaining ${group.label} houseguests compete for this Veto.`]});
    const povComp=C().runCompetition(povPool,{week,type:povType});
    const vetoWinner=povComp.winner;s.vetoWinners=[vetoWinner.id];
    log(s,{week,phase:"split-house",type:"veto",winnerId:vetoWinner.id,participants:povPool.map(p=>p.id),competition:povComp,title:`${group.label} Power of Veto — ${povComp.label}`,lines:[`${displayName(vetoWinner)} wins the Power of Veto for ${group.label}.`]});
    const decision=R().decideVetoUse(s,vetoWinner,hoh,noms);
    if(decision.use){
      const saved=noms.find(n=>n.id===decision.saveId)||noms[0];
      saved.nominated=false;
      const replPool=members.filter(p=>p.id!==hoh.id&&p.id!==saved.id&&!noms.some(n=>n.id===p.id)&&p.id!==vetoWinner.id);
      const replacement=R().pickReplacement?R().pickReplacement(s,hoh,replPool,noms.map(n=>n.id)):pick(replPool);
      let finalNoms=noms.filter(n=>n.id!==saved.id);
      if(replacement){replacement.nominated=true;finalNoms.push(replacement);}
      s.nominees=finalNoms.map(n=>n.id);
      log(s,{week,phase:"split-house",type:"veto-ceremony",hohId:hoh.id,winnerId:vetoWinner.id,nomineeIds:s.nominees,finalNomineeIds:s.nominees,vetoUsed:true,title:`${group.label} Veto Ceremony — Used`,lines:[`${displayName(vetoWinner)} uses the Power of Veto on ${displayName(saved)}${replacement?`; ${displayName(hoh)} names ${displayName(replacement)} as the replacement nominee.`:"."}`]});
    }else{
      log(s,{week,phase:"split-house",type:"veto-ceremony",hohId:hoh.id,winnerId:vetoWinner.id,nomineeIds:s.nominees,finalNomineeIds:s.nominees,vetoUsed:false,title:`${group.label} Veto Ceremony — Not Used`,lines:[`${displayName(vetoWinner)} does not use the Power of Veto.`]});
    }
    evictionCycle(s,week,members,"split-house");
  }
  function runSplitHouseWeek(s,week){
    s.week=week;s.phase="split-house";
    s.houseguests.forEach(h=>{h.safe=false;h.nominated=false;});
    const groups=runSplitHouse(s,week);
    const hohIds=[];
    groups.forEach(g=>{runSplitGroupCycle(s,week,g);if(s.currentHOH)hohIds.push(s.currentHOH);});
    s._priorHohIds=hohIds;
  }

  /* ----------------------------- FINALE -------------------------------- */
  function runFinale(s){s.week="Final";s.phase="finale";const three=living(s);if(three.length!==3)return;const p1=C().runCompetition(three,{week:12,type:"final-hoh-1"});log(s,{week:"Final",phase:"finale",type:"final3-part1",winnerId:p1.winner.id,participants:three.map(p=>p.id),competition:p1,title:`Final HOH Part 1 — ${p1.label}`,lines:[`${displayName(p1.winner)} wins Part 1 and advances directly to Part 3.`]});const rem=three.filter(p=>p.id!==p1.winner.id);const p2=C().runCompetition(rem,{week:12,type:"final-hoh-2"});log(s,{week:"Final",phase:"finale",type:"final3-part2",winnerId:p2.winner.id,participants:rem.map(p=>p.id),competition:p2,title:`Final HOH Part 2 — ${p2.label}`,lines:[`${displayName(p2.winner)} wins Part 2 and advances to Part 3.`]});const p3=C().runCompetition([p1.winner,p2.winner],{week:12,type:"final-hoh-3"});const finalHoh=p3.winner;const other=three.filter(p=>p.id!==finalHoh.id);const chosen=R().decideFinalTwoPick(s,finalHoh,other);const third=other.find(p=>p.id!==chosen.id);log(s,{week:"Final",phase:"finale",type:"final3-part3",winnerId:finalHoh.id,participants:[p1.winner.id,p2.winner.id],competition:p3,title:`Final HOH Part 3 — ${p3.label}`,lines:[`${displayName(finalHoh)} wins Part 3 and becomes the final HOH.`]});third.active=false;third.evicted=true;third.placement=3;third.juryMember=true;if(!s.jury.includes(third.id))s.jury.push(third.id);s.evicted.push(third.id);s.currentHOH=finalHoh.id;log(s,{week:"Final",phase:"finale",type:"final-decision",hohId:finalHoh.id,thirdPlaceId:third.id,finalistIds:[finalHoh.id,chosen.id],title:"Final HOH's Decision",lines:[`${displayName(finalHoh)} takes ${displayName(chosen)} to the Final 2 and evicts ${displayName(third)}.`,`${displayName(third)} finishes in 3rd place and joins the jury.`]});const finalists=[finalHoh,chosen],jurors=s.jury.map(id=>hg(s,id)).filter(Boolean),tally={[finalists[0].id]:0,[finalists[1].id]:0};s._juryVotes=[];jurors.forEach(j=>{const vote=R().decideJuryVote(s,j,finalists[0],finalists[1]);tally[vote]++;s._juryVotes.push({voterId:j.id,targetId:vote});});log(s,{week:"Final",phase:"finale",type:"jury-vote",votes:s._juryVotes,finalistIds:finalists.map(p=>p.id),title:"The Jury Votes",lines:s._juryVotes.map(v=>`${displayName(hg(s,v.voterId))} votes for ${displayName(hg(s,v.targetId))}.`)});const winnerId=tally[finalists[0].id]>=tally[finalists[1].id]?finalists[0].id:finalists[1].id;const runnerId=winnerId===finalists[0].id?finalists[1].id:finalists[0].id;hg(s,winnerId).placement=1;hg(s,runnerId).placement=2;hg(s,winnerId).active=false;hg(s,runnerId).active=false;
    const afpCandidates=s.houseguests.slice();
    const afpScores=afpCandidates.map(h=>{const others=afpCandidates.filter(x=>x.id!==h.id);const social=Number(h.ratings?.social||50),general=Number(h.ratings?.general||50);const avgRel=others.length?others.reduce((sum,o)=>sum+relationshipScore(s,h,o),0)/others.length:50;return {id:h.id,score:social*.45+general*.20+avgRel*.20+Math.random()*15};}).sort((a,b)=>b.score-a.score);
    const afpId=afpScores[0]?.id||winnerId;const raw={};afpScores.forEach(x=>raw[x.id]=Math.max(.5,x.score));const total=Object.values(raw).reduce((a,b)=>a+b,0)||1;const afpVotes={};Object.keys(raw).forEach(id=>afpVotes[id]=Math.max(1,Math.round(raw[id]/total*100000)));const voteTotal=Object.values(afpVotes).reduce((a,b)=>a+b,0);afpVotes[afpId]+=(100000-voteTotal);
    s.finale={winnerId,runnerUpId:runnerId,thirdPlaceId:third.id,finalHohId:finalHoh.id,votes:tally,jurySize:jurors.length,prize:750000,runnerUpPrize:75000,americasFavoritePrize:50000,americasFavoriteId:afpId,americasFavoriteVotes:afpVotes};s.phase="complete";log(s,{week:"Final",phase:"finale",type:"winner",winnerId,runnerUpId:runnerId,thirdPlaceId:third.id,finalistIds:[winnerId,runnerId],afpId,afpVotes,title:`${displayName(hg(s,winnerId))} Wins Big Brother!`,lines:[`By a vote of ${tally[winnerId]}-${tally[runnerId]}, ${displayName(hg(s,winnerId))} wins Big Brother.`,`${displayName(hg(s,runnerId))} finishes as the Runner-Up and receives $75,000.`,`America's Favorite Player: ${displayName(hg(s,afpId))} wins $50,000.`]});}

  function simulateSeason(s,config){
    ensureState(s);
    s.history=[];s.jury=[];s.evicted=[];s.evictionVotes=[];s.nominees=[];s.povPlayers=[];s.vetoWinners=[];
    s.currentHOH=null;s.originalHOH=null;s.finale=null;
    s.backstage=null;s.bestieGroups=[];s.splitHouse=null;s.nomineeGroupId=null;s._priorHohIds=[];
    s.season.evictionCount=0;s.season.castSize=s.houseguests.length;s.teams=[];
    s.houseguests.forEach(h=>{h.active=true;h.safe=false;h.nominated=false;h.juryMember=false;h.evicted=false;h.placement=null;});
    runWeek1(s);
    let week=2,guard=0;
    while(living(s).length>3&&week<=30&&guard<40){
      if(week===CFG().splitHouseWeek&&living(s).length>=6) runSplitHouseWeek(s,week);
      else runStandardWeek(s,week);
      week++;guard++;
    }
    runFinale(s);
    if(window.LiveFeeds?.addToSeason)window.LiveFeeds.addToSeason(s);
    return s;
  }
  window.SeasonEngine={simulateSeason,displayName,ordinal};
})();

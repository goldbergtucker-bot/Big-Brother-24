/*
 * BIG BROTHER 24 CUSTOM SIMULATOR
 * BB23-Simulator presentation/controller architecture adapted to BB24.
 * The presentation intentionally mirrors the BB23 site: setup -> pre-simulated
 * event history -> reveal navigation -> memory wall -> results/summary/alliance tabs.
 */
(() => {
  const CONFIG = window.BB24_CONFIG;
  const DEMO = window.BB24_HOUSEGUESTS;
  const STORAGE_KEY = 'bb24CustomSimulatorBrantsteeleV1';
  const $ = id => document.getElementById(id);
  let state = makeState();
  let history = [];
  let pointer = -1;
  let activeTab = 'event';
  let liveFeeds = true;
  let nextPlacement = 16;

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const name=h=>`${h?.firstName||''} ${h?.lastName||''}`.trim() || `Houseguest ${h?.slot||''}`;
  const displayName=h=>String(h?.nickname||h?.displayName||h?.firstName||name(h)).trim();
  const ordinal=n=>{const v=n%100;return `${n}${v>=11&&v<=13?'th':({1:'st',2:'nd',3:'rd'}[n%10]||'th')}`};
  const weekLabel=w=>String(w)==='Final'?'FINALE':`WEEK ${w}`;
  const living=s=>s.houseguests.filter(h=>h.active);
  const byId=(view,id)=>view?.houseguests?.find(h=>h.id===id)||state.houseguests.find(h=>h.id===id);
  const portrait=(h,cls='event-portrait')=>h?.portraitUrl?`<img class="${cls}" src="${esc(h.portraitUrl)}" alt="${esc(name(h))}">`:`<div class="${cls} placeholder-portrait">?</div>`;
  const card=(h,role='',full=false)=>h?`<div class="player-card"><div class="portrait-box">${portrait(h)}</div><strong>${esc(full?name(h):displayName(h))}</strong>${role?`<span>${esc(role)}</span>`:''}</div>`:'';

  function makeState(){
    // BB23-style setup: start with 16 completely blank custom Houseguest slots.
    // No real BB24 names or portraits are loaded into the simulator.
    const houseguests=Array.from({length:16},(_,i)=>({
      id:`bb24-${i+1}`, slot:i+1, firstName:'', lastName:'', nickname:'', gender:'',
      imageUrl:'', portraitUrl:'', status:'Active', active:true, evicted:false, juryMember:false, placement:null,
      ratings:{general:50,physical:50,mental:50,social:50,strategic:50},
      relationships:{}, alliances:[], bestieGroup:null, backstage:false
    }));
    const relationships={};
    houseguests.forEach(a=>{
      relationships[a.id]={};
      houseguests.forEach(b=>{
        if(a.id!==b.id) relationships[a.id][b.id]={friendship:50,trust:50,loyalty:50,rivalry:0,respect:50,attraction:0,type:'Unspecified',note:''};
      });
    });
    return {
      season:{name:'Big Brother 24',themeUrl:'',logoUrl:'',liveFeedsEnabled:true,liveFeedProfile:{}},
      houseguests,relationships,alliances:[],currentWeek:1,currentHOH:null,nominees:[],povPlayers:[],povWinner:null,
      evictionVotes:[],jury:[],evicted:[],finale:null,finished:false,
      bestieGroups:[],splitHouse:{},backstageBossId:null,backstageIds:[],backstageResolved:false
    };
  }
  function snapshot(){return {currentWeek:state.currentWeek,currentHOH:state.currentHOH,nominees:[...state.nominees],povPlayers:[...state.povPlayers],povWinner:state.povWinner,evictionVotes:state.evictionVotes.map(v=>({...v})),jury:[...state.jury],houseguests:state.houseguests.map(h=>({...h,ratings:{...(h.ratings||{})}})),finale:state.finale?JSON.parse(JSON.stringify(state.finale)):null}};

  function makeRelationshipMatrix(houseguests, existing){
    const matrix={...(existing||{})};
    houseguests.forEach(a=>{
      matrix[a.id]={...(matrix[a.id]||{})};
      houseguests.forEach(b=>{
        if(a.id===b.id)return;
        matrix[a.id][b.id]={friendship:50,trust:50,loyalty:50,rivalry:0,respect:50,attraction:0,type:'Unspecified',note:'',...(matrix[a.id][b.id]||{})};
      });
    });
    return matrix;
  }

  function normalizeImportedState(raw){
    const base=makeState();
    const incoming=raw && typeof raw==='object' ? raw : {};
    const imported=Object.assign(base,incoming);
    imported.season=Object.assign(base.season||{},incoming.season||{});
    imported.houseguests=Array.isArray(incoming.houseguests)?incoming.houseguests.map((h,i)=>({
      id:h.id||`bb24-${i+1}`,slot:h.slot||i+1,firstName:h.firstName||'',lastName:h.lastName||'',nickname:h.nickname||'',displayName:h.displayName||'',gender:h.gender||'',imageUrl:h.imageUrl||'',portraitUrl:h.portraitUrl||'',status:h.status||'Active',active:h.active!==false,evicted:!!h.evicted,juryMember:!!h.juryMember,placement:h.placement??null,ratings:{...{general:50,physical:50,mental:50,social:50,strategic:50},...(h.ratings||{})},relationships:h.relationships||{},alliances:Array.isArray(h.alliances)?h.alliances:[],bestieGroup:h.bestieGroup??null,backstage:!!h.backstage,backstageBoss:!!h.backstageBoss
    })):base.houseguests;
    imported.relationships=makeRelationshipMatrix(imported.houseguests,incoming.relationships);
    imported.alliances=Array.isArray(incoming.alliances)?incoming.alliances:[];
    imported.nominees=Array.isArray(incoming.nominees)?incoming.nominees:[];
    imported.povPlayers=Array.isArray(incoming.povPlayers)?incoming.povPlayers:[];
    imported.evictionVotes=Array.isArray(incoming.evictionVotes)?incoming.evictionVotes:[];
    imported.jury=Array.isArray(incoming.jury)?incoming.jury:[];
    imported.evicted=Array.isArray(incoming.evicted)?incoming.evicted:[];
    imported.bestieGroups=Array.isArray(incoming.bestieGroups)?incoming.bestieGroups:[];
    imported.splitHouse=incoming.splitHouse&&typeof incoming.splitHouse==='object'?incoming.splitHouse:{};
    imported.backstageIds=Array.isArray(incoming.backstageIds)?incoming.backstageIds:[];
    imported.backstageBossId=incoming.backstageBossId||null;
    imported.finished=!!incoming.finished;
    return imported;
  }

  function normalizeHistory(rawHistory, importedState){
    if(!Array.isArray(rawHistory))return [];
    return rawHistory.filter(Boolean).map((e,i)=>({
      id:e.id||i+1,week:(e.week ?? importedState.currentWeek ?? 1),phase:e.phase||'event',type:e.type||'event',title:e.title||e.type||'Event',competition:e.competition||null,data:e.data||{},lines:Array.isArray(e.lines)?e.lines:[],...e
    }));
  }

  function applyImportedPayload(payload){
    if(!payload || typeof payload!=='object') throw new Error('Invalid save file.');
    const importedRaw=payload.state||payload.gameState||payload.seasonState||payload.data||payload.season||payload;
    if(!importedRaw || typeof importedRaw!=='object') throw new Error('No season state found.');
    const importedState=normalizeImportedState(importedRaw);
    if(!importedState.houseguests.length) throw new Error('The save contains no Houseguests.');
    state=importedState;
    history=normalizeHistory(payload.history||importedState.history,state);
    pointer=Number.isInteger(payload.pointer)?payload.pointer:(Number.isInteger(payload.revealIndex)?payload.revealIndex:(history.length?history.length-1:-1));
    pointer=Math.max(-1,Math.min(pointer,Math.max(-1,history.length-1)));
    liveFeeds=payload.liveFeeds!==false;
    if(payload.liveFeedProfile && state.season)state.season.liveFeedProfile=payload.liveFeedProfile;
    renderAll();
  }
  function logEvent(e){const rec={id:history.length+1,...e};rec.snapshot=snapshot();history.push(rec);}
  function comp(week,type,side){
    let w=CONFIG.weeks[String(week)]||{}; let n=type==='hoh'?w.hoh:type==='pov'?(typeof w.pov==='object'?(side==='BroChella'?w.pov.bigBroChella:w.pov.dyreFest):w.pov):null;
    if(type==='final-hoh-1')n='Wiener-Palooza'; if(type==='final-hoh-2')n='Festival Lineup'; if(type==='final-hoh-3')n='Jury Fest';
    if(String(week)==='9.5'&&type==='hoh')n='Laser Focus'; if(String(week)==='9.5'&&type==='pov')n='Amp It Up';
    const descriptions={
      'Drumming for Power':'Players race through a music-festival setup while keeping rhythm and completing the power challenge.','The BB Pie Fest':'A festival-themed skill and balance competition involving giant pies and precision.','Get Lit':'Players manipulate illuminated festival pieces and race to complete the objective.','The Invitation':'A precision competition built around invitations, placement and speed.','Mind Your Step':'Players navigate a balance course while avoiding incorrect spaces.','Conspiracy Fest':'A memory and information challenge based on BB events and clues.','Do You See The VIP?':'Players identify VIP clues and race to complete a festival-themed objective.','Carni-Small':'A carnival-style balance and dexterity competition.','Burning Bot':'Players race through a robot-themed festival challenge.','Laser Focus':'A precision and speed Double Eviction HOH.','Horror Fest Lockdown':'A horror-festival themed endurance and control challenge.','Fashion Fest':'Players solve a fashion-themed timed challenge.','Wiener-Palooza':'Final HOH Part 1 endurance on the festival course.','Festival Lineup':'Final HOH Part 2 tests memory of the season.','Jury Fest':'Final HOH Part 3 tests knowledge of jurors and season events.','Ren Fest':'Players compete in a Renaissance-festival themed Power of Veto.','Mermaid Fest':'A mermaid/festival themed veto challenge.','Woodstack':'Players build and balance pieces in a Woodstock-themed veto.','Trippy Watch Party':'A colorful festival-themed puzzle and timing veto.','OTEV the Singing Stageroach':'A classic OTEV-style answer retrieval elimination.','Punkaroo':'A punk-festival themed physical veto.','Pride Slide':'Players race down a slide and complete the veto objective.','Lunch is Served':'Players serve and organize a meal-themed veto challenge.','One, Two, Three, VIP':'A precision VIP-themed Power of Veto.','BB Comics':'Players race through the comic challenge.','Amp It Up':'A music-themed precision and speed veto.','Snooze Fest':'A sleep/festival themed skill challenge.','Mathletes':'A math and memory Power of Veto.'};
    return n?{name:n,description:descriptions[n]||'Official-style Big Brother 24 competition.',category:type.includes('hoh')?'mental':'physical'}:null;
  }
  function competitionCard(e){if(!e.competition)return'';return `<section class="competition-card"><div class="competition-top"><span class="competition-kicker">${esc(e.type.includes('hoh')?'HEAD OF HOUSEHOLD':e.type==='veto'?'POWER OF VETO':'COMPETITION')}</span><span class="official-badge">REAL BB24 COMPETITION</span></div><h3>${esc(e.competition.name)}</h3><div class="competition-meta"><span>${esc(String(e.competition.category||'GENERAL').toUpperCase())}</span><span>WEEK ${esc(e.week)}</span></div><p>${esc(e.competition.description||'')}</p></section>`}

  function score(h,kind){const r=h.ratings||{};const base=kind==='physical'?r.physical:kind==='mental'?r.mental:kind==='social'?r.social:r.strategic;return Number(base||50)+Math.random()*35}
  function choose(arr,kind){return arr.slice().sort((a,b)=>score(b,kind)-score(a,kind))[0]}
  function chooseNominees(pool,hoh,count=2){return pool.filter(h=>h.id!==hoh.id).slice().sort((a,b)=>((a.ratings.social+a.ratings.strategic)+Math.random()*50)-((b.ratings.social+b.ratings.strategic)+Math.random()*50)).slice(0,count)}
  function votesFor(nominees,voters){const votes=[];voters.forEach(v=>{const target=nominees.slice().sort((a,b)=>{const ra=state.relationships[v.id]?.[a.id]?.friendship||50;const rb=state.relationships[v.id]?.[b.id]?.friendship||50;return (ra-rb)+Math.random()*60})[0];votes.push({voterId:v.id,targetId:target.id})});return votes}
  function setEviction(evicted,votes){if(!evicted||!evicted.active)return;evicted.active=false;evicted.evicted=true;evicted.placement=nextPlacement--; if(evicted.placement>=2&&evicted.placement<=11){evicted.juryMember=true;state.jury.push(evicted)} state.evicted.push(evicted.id);}

  function activeBestieGroups(week){
    const raw=bestieGroups(week);
    return raw.map(group=>group.map(id=>byId(snapshot(),id)).filter(h=>h&&h.active));
  }

  function chooseBestieNomination(groups,hoh){
    // Festie Besties: the HOH's own Bestie group is immune. The HOH nominates
    // one other Bestie group; if the group is a trio, all three are nominated.
    const eligible=groups.filter(g=>g.length && !g.some(h=>h.id===hoh.id));
    if(!eligible.length) return chooseNominees(living(state),hoh);
    return eligible[Math.floor(Math.random()*eligible.length)];
  }

  function festieVetoPlayers(groups,hoh,nominees){
    // During Festie Besties, the nominated group competes together and one
    // additional Bestie group is selected, alongside the HOH group.
    const nominatedIds=new Set(nominees.map(h=>h.id));
    const nominatedGroup=groups.find(g=>g.some(h=>nominatedIds.has(h.id)))||nominees;
    const other=groups.filter(g=>g!==nominatedGroup&&!g.some(h=>h.id===hoh.id));
    const pickedGroup=other.length?other[Math.floor(Math.random()*other.length)]:[];
    const ids=[hoh.id,...nominatedGroup.map(h=>h.id),...pickedGroup.map(h=>h.id)];
    return [...new Set(ids)].map(id=>byId(snapshot(),id)).filter(h=>h&&h.active);
  }

  function updateBestiesAfterEviction(week,evictedId){
    // A surviving Festie Bestie may join another group after their partner is
    // evicted. The configured BB24 groups model the actual season's pair/trio
    // transitions and are used as the canonical starting arrangement.
    const groups=activeBestieGroups(week);
    state.bestieGroups=groups.map(g=>g.map(h=>h.id));
    state.houseguests.forEach(h=>h.bestieGroup=null);
    state.bestieGroups.forEach((group,index)=>group.forEach(id=>{const h=state.houseguests.find(x=>x.id===id);if(h)h.bestieGroup=index;}));
    if(week>=3&&week<=5){
      logEvent({week,phase:'twist',type:'twist-update',title:'Festie Besties Update',twist:'festie-besties',participants:state.bestieGroups.flat(),lines:[`Festie Besties remain active. The surviving Houseguests are grouped into ${state.bestieGroups.length} Bestie group${state.bestieGroups.length===1?'':'s'}.`]});
    }
  }

  function regularWeek(week,side=null){
    state.currentWeek=week;
    const pool=living(state);
    if(!pool.length)return;

    // WEEK 1 — Backstage Boss is an active BB24-style twist.
    // The Backstage Boss is safe and cannot compete. After the HOH is crowned,
    // the Boss selects three other Houseguests for the Backstage. Those three
    // cannot compete or vote and cannot be nominated, but they remain eligible
    // to leave the game through the Backstage mechanism. In this custom simulator
    // one of the three always self-evicts, so the planned Backstage eviction vote
    // never occurs.
    if(String(week)==='1'){
      const boss=choose(pool,'strategic');
      state.backstageBossId=boss.id;
      boss.backstageBoss=true;
      logEvent({week,phase:'twist',type:'backstage-boss',title:`${displayName(boss)} Is the Backstage Boss`,twist:'backstage-boss',bossId:boss.id,participants:[boss.id],lines:[`${displayName(boss)} is named the Backstage Boss. The Backstage Boss is safe from eviction and cannot compete in competitions.`]});

      // The Backstage Boss does not compete in the opening HOH.
      const eligibleForHOH=pool.filter(h=>h.id!==boss.id);
      const hoh=choose(eligibleForHOH,'physical');
      state.currentHOH=hoh.id;
      logEvent({week,phase:'hoh',type:'hoh',title:`${displayName(hoh)} Wins HOH`,winnerId:hoh.id,participants:eligibleForHOH.map(h=>h.id),competition:comp(week,'hoh',side),lines:[`${displayName(hoh)} wins Head of Household.`]});

      // The Boss selects exactly three Backstage Houseguests after the HOH.
      const backstagePool=pool.filter(h=>h.id!==boss.id&&h.id!==hoh.id).sort(()=>Math.random()-.5);
      const backstage=backstagePool.slice(0,3);
      state.backstageIds=backstage.map(h=>h.id);
      backstage.forEach(h=>h.backstage=true);
      logEvent({week,phase:'twist',type:'backstage-selection',title:'Backstage Houseguests Selected',twist:'backstage-boss',bossId:boss.id,backstageIds:state.backstageIds,participants:state.backstageIds,lines:[`${displayName(boss)} selects three Houseguests to be Backstage.`,`The three Backstage Houseguests cannot compete in competitions or vote, and cannot be nominated. They remain eligible to leave the game through the Backstage twist.`]});

      // Backstage Houseguests are NOT eligible for normal nominations.
      const nominationPool=living(state).filter(h=>h.id!==hoh.id&&!state.backstageIds.includes(h.id)&&!h.backstageBoss);
      const nominees=chooseNominees(nominationPool,hoh);
      state.nominees=nominees.map(h=>h.id);
      logEvent({week,phase:'nominations',type:'nominations',title:'Nomination Ceremony',hohId:hoh.id,nomineeIds:state.nominees,lines:[`${displayName(hoh)} nominates ${nominees.map(displayName).join(' and ')}.`,'The three Backstage Houseguests are not eligible for nomination under the Backstage twist.']});

      const auto=[hoh,...nominees];
      const picked=eligibleForHOH.filter(h=>!auto.some(x=>x.id===h.id)&&!state.backstageIds.includes(h.id)).sort(()=>Math.random()-.5).slice(0,3);
      state.povPlayers=[...auto,...picked].map(h=>h.id);
      logEvent({week,phase:'veto',type:'pov-players',title:'Power of Veto Players Selected',hohId:hoh.id,nomineeIds:state.nominees,povPlayers:state.povPlayers,participants:state.povPlayers,lines:['The six Power of Veto players have been selected. The Backstage Houseguests cannot compete.']});
      const pv=choose(state.povPlayers.map(id=>byId(snapshot(),id)),'physical');
      state.povWinner=pv.id;
      logEvent({week,phase:'veto',type:'veto',title:`${displayName(pv)} Wins the Power of Veto`,winnerId:pv.id,participants:state.povPlayers,competition:comp(week,'pov',side),lines:[`${displayName(pv)} wins the Power of Veto.`]});
      const replacementPool=living(state).filter(h=>h.id!==hoh.id&&!state.nominees.includes(h.id)&&!state.backstageIds.includes(h.id)&&!h.backstageBoss);
      const replacement=replacementPool[0]||null;
      const saved=nominees.find(h=>h.id===pv.id)||null;
      if(saved&&replacement){state.nominees=[...nominees.filter(h=>h.id!==saved.id),replacement].map(h=>h.id);}
      logEvent({week,phase:'veto',type:'veto-ceremony',title:'Veto Ceremony',hohId:hoh.id,winnerId:pv.id,nomineeIds:nominees.map(h=>h.id),finalNomineeIds:state.nominees,vetoUsed:!!saved,lines:[saved?`${displayName(pv)} uses the Veto on ${displayName(saved)} and a replacement nominee is named.`:'The Power of Veto is not used.']});

      // Custom BB24 behavior requested: one Backstage Houseguest always self-evicts.
      // There is no eviction vote and no "0 to 0" result. The other two remain in
      // the game once the Backstage twist ends.
      const selfEvicter=backstage[Math.floor(Math.random()*backstage.length)];
      selfEvicter.active=false;
      selfEvicter.evicted=true;
      selfEvicter.placement=16;
      selfEvicter.backstage=false;
      state.evicted.push(selfEvicter.id);
      state.backstageResolved=true;
      backstage.filter(h=>h.id!==selfEvicter.id).forEach(h=>h.backstage=false);
      boss.backstageBoss=false;
      logEvent({week,phase:'eviction',type:'self-eviction',title:'Backstage Houseguest Self-Evicts',evictedId:selfEvicter.id,selfEviction:true,backstageIds:state.backstageIds,nomineeIds:state.nominees,evictedVoteCount:null,stayVoteCount:null,lines:[`${displayName(selfEvicter)} self-evicts from the Big Brother house.`]});
      return;
    }

    const hoh=choose(pool,'physical'); state.currentHOH=hoh.id;
    logEvent({week,phase:side?'split-house':'hoh',type:'hoh',title:`${side?side+': ':''}${displayName(hoh)} Wins HOH`,winnerId:hoh.id,participants:pool.map(h=>h.id),competition:comp(week,'hoh',side),lines:[`${displayName(hoh)} wins Head of Household${side?' for '+side:''}.`]});

    let nominees,groups=[];
    if(week>=3&&week<=5){
      groups=activeBestieGroups(week);
      nominees=chooseBestieNomination(groups,hoh);
      state.bestieGroups=groups.map(g=>g.map(h=>h.id));
      logEvent({week,phase:'twist',type:'twist',title:'Festie Besties Active',twist:'festie-besties',participants:groups.flat().map(h=>h.id),lines:['The Festie Besties twist is active. Bestie groups are tied together for nominations and veto safety.']});
    } else {
      nominees=chooseNominees(living(state),hoh);
    }
    state.nominees=nominees.map(h=>h.id);
    logEvent({week,phase:'nominations',type:'nominations',title:`${side?side+': ':''}Nomination Ceremony`,hohId:hoh.id,nomineeIds:state.nominees,lines:[`${displayName(hoh)} nominates ${nominees.map(displayName).join(' and ')}.`]});

    let povPlayers;
    if(week>=3&&week<=5){
      povPlayers=festieVetoPlayers(groups,hoh,nominees);
      logEvent({week,phase:'twist',type:'twist',title:'Festie Besties Veto Format',twist:'festie-besties',participants:povPlayers.map(h=>h.id),lines:['The nominated Bestie group and another Bestie group compete together for the Power of Veto.']});
    } else {
      const auto=[hoh,...nominees];const picked=living(state).filter(h=>!auto.some(x=>x.id===h.id)).sort(()=>Math.random()-.5).slice(0,3);povPlayers=[...auto,...picked];
    }
    state.povPlayers=povPlayers.map(h=>h.id);
    logEvent({week,phase:'veto',type:'pov-players',title:'Power of Veto Players Selected',hohId:hoh.id,nomineeIds:state.nominees,povPlayers:state.povPlayers,participants:state.povPlayers,lines:['The Power of Veto players have been selected.']});
    const pv=choose(povPlayers,'physical');state.povWinner=pv.id;
    logEvent({week,phase:'veto',type:'veto',title:`${displayName(pv)} Wins the Power of Veto`,winnerId:pv.id,participants:state.povPlayers,competition:comp(week,'pov',side),lines:[`${displayName(pv)} wins the Power of Veto.`]});

    let finalNominees=nominees.slice(),used=false;
    if(!nominees.some(n=>n.id===pv.id)&&Math.random()<.5){
      const save=nominees[Math.floor(Math.random()*nominees.length)];
      const rep=living(state).find(h=>h.id!==hoh.id&&!nominees.some(n=>n.id===h.id));
      if(rep){finalNominees=[...nominees.filter(n=>n.id!==save.id),rep];used=true;}
    }
    state.nominees=finalNominees.map(h=>h.id);
    logEvent({week,phase:'veto',type:'veto-ceremony',title:`${side?side+': ':''}Veto Ceremony`,hohId:hoh.id,winnerId:pv.id,nomineeIds:nominees.map(h=>h.id),finalNomineeIds:state.nominees,vetoUsed:used,lines:[used?`${displayName(pv)} uses the Veto and ${displayName(finalNominees[0])} is saved; a replacement nominee is named.`:'The Power of Veto is not used.']});

    if(week>=3&&week<=5&&used){
      logEvent({week,phase:'twist',type:'twist',title:'Bestie Safety Applies',twist:'festie-besties',participants:finalNominees.map(h=>h.id),lines:['Because Bestie groups are tied together, the Veto result protects the applicable Bestie group.']});
    }
    const voters=living(state).filter(h=>!state.nominees.includes(h.id)&&h.id!==hoh.id);
    const voteList=votesFor(finalNominees,voters);state.evictionVotes=voteList;
    logEvent({week,phase:side?'split-house':'eviction',type:'eviction-voting',title:`${side?side+': ':''}Eviction Voting`,votes:voteList,lines:voteList.map(v=>`${displayName(byId(snapshot(),v.voterId))} votes to evict ${displayName(byId(snapshot(),v.targetId))}.`)});
    const counts={};voteList.forEach(v=>counts[v.targetId]=(counts[v.targetId]||0)+1);
    const evicted=finalNominees.slice().sort((a,b)=>(counts[b.id]||0)-(counts[a.id]||0))[0];const stay=finalNominees.find(h=>h.id!==evicted.id);setEviction(evicted,voteList);
    logEvent({week,phase:side?'split-house':'eviction',type:'eviction',title:`${side?side+': ':''}${displayName(evicted)} Is Evicted`,evictedId:evicted.id,nomineeIds:finalNominees.map(h=>h.id),evictedVoteCount:counts[evicted.id]||0,stayVoteCount:counts[stay?.id]||0,lines:[`By a vote of ${counts[evicted.id]||0} to ${counts[stay?.id]||0}, ${displayName(evicted)} is evicted.`]});
    if(week>=3&&week<=5) updateBestiesAfterEviction(week,evicted.id);
  }
  function bestieGroups(week){
    // BB24-style Festie Besties, generated from the user's custom cast.
    if(state.bestieGroups?.length){
      return state.bestieGroups.map(g=>g.map(id=>byId(snapshot(),id)).filter(h=>h&&h.active));
    }
    const pool=living(state).slice().sort(()=>Math.random()-.5);
    const groups=[];
    while(pool.length) groups.push(pool.splice(0,2));
    state.bestieGroups=groups.map(g=>g.map(h=>h.id));
    groups.forEach((g,i)=>g.forEach(h=>h.bestieGroup=i));
    return groups;
  }
  function splitWeek(){
    state.currentWeek=7;
    const pool=living(state).slice();
    // BB24 Split House: the final 10 are divided 5-and-5 after two HOHs are crowned.
    const shuffled=pool.slice().sort(()=>Math.random()-.5);
    const halves=[['Big BroChella',shuffled.slice(0,5)],['Dyre Fest',shuffled.slice(5,10)]];
    state.splitHouse={};
    logEvent({week:7,phase:'twist',type:'twist',title:'Split House Double Eviction Begins',twist:'split-house',participants:pool.map(h=>h.id),lines:['The house splits into two isolated games: Big BroChella and Dyre Fest. The two groups cannot communicate and each side will conduct its own HOH, nominations, Power of Veto and eviction.']});
    halves.forEach(([side,players])=>{
      state.splitHouse[side]=players.map(h=>h.id);
      const hoh=choose(players,'physical'); state.currentHOH=hoh.id;
      logEvent({week:7,phase:'split-house',type:'hoh',title:`${side}: ${displayName(hoh)} Wins HOH`,winnerId:hoh.id,participants:players.map(h=>h.id),competition:comp(7,'hoh',side),splitSide:side,lines:[`${displayName(hoh)} wins the HOH for ${side}.`],twist:'split-house'});
      const noms=chooseNominees(players,hoh);state.nominees=noms.map(h=>h.id);
      logEvent({week:7,phase:'split-house',type:'nominations',title:`${side}: Nomination Ceremony`,hohId:hoh.id,nomineeIds:state.nominees,splitSide:side,lines:[`${displayName(hoh)} nominates ${noms.map(displayName).join(' and ')} for eviction.`]});
      const auto=[hoh,...noms],picked=players.filter(h=>!auto.some(x=>x.id===h.id)).sort(()=>Math.random()-.5).slice(0,3),pvPlayers=[...auto,...picked];
      state.povPlayers=pvPlayers.map(h=>h.id);
      logEvent({week:7,phase:'split-house',type:'pov-players',title:`${side}: POV Players Selected`,hohId:hoh.id,nomineeIds:state.nominees,povPlayers:state.povPlayers,participants:state.povPlayers,splitSide:side,lines:[`${side} selects its own six Power of Veto players.`]});
      const pv=choose(pvPlayers,'physical');state.povWinner=pv.id;
      logEvent({week:7,phase:'split-house',type:'veto',title:`${side}: ${displayName(pv)} Wins POV`,winnerId:pv.id,participants:state.povPlayers,competition:comp(7,'pov',side),splitSide:side,lines:[`${displayName(pv)} wins the ${side} Power of Veto.`]});
      let finalNominees=noms.slice(),used=false;
      if(!noms.some(n=>n.id===pv.id)&&Math.random()<.5){const save=noms[Math.floor(Math.random()*noms.length)];const rep=players.find(h=>h.id!==hoh.id&&!noms.some(n=>n.id===h.id));if(rep){finalNominees=[...noms.filter(n=>n.id!==save.id),rep];used=true;}}
      state.nominees=finalNominees.map(h=>h.id);
      logEvent({week:7,phase:'split-house',type:'veto-ceremony',title:`${side}: Veto Ceremony`,hohId:hoh.id,winnerId:pv.id,nomineeIds:noms.map(h=>h.id),finalNomineeIds:state.nominees,vetoUsed:used,splitSide:side,lines:[used?`${displayName(pv)} uses the Veto and a replacement nominee is named.`:'The Power of Veto is not used.']});
      const voters=players.filter(h=>!state.nominees.includes(h.id)&&h.id!==hoh.id),vl=votesFor(finalNominees,voters);state.evictionVotes=vl;
      logEvent({week:7,phase:'split-house',type:'eviction-voting',title:`${side}: Eviction Voting`,votes:vl,splitSide:side,lines:vl.map(v=>`${displayName(byId(snapshot(),v.voterId))} votes to evict ${displayName(byId(snapshot(),v.targetId))}.`)});
      const counts={};vl.forEach(v=>counts[v.targetId]=(counts[v.targetId]||0)+1);const ev=finalNominees.slice().sort((a,b)=>(counts[b.id]||0)-(counts[a.id]||0))[0];const stay=finalNominees.find(n=>n.id!==ev.id);setEviction(ev,vl);
      logEvent({week:7,phase:'split-house',type:'eviction',title:`${side}: ${displayName(ev)} Is Evicted`,evictedId:ev.id,nomineeIds:finalNominees.map(h=>h.id),evictedVoteCount:counts[ev.id]||0,stayVoteCount:counts[stay?.id]||0,splitSide:side,lines:[`By a vote of ${counts[ev.id]||0} to ${counts[stay?.id]||0}, ${displayName(ev)} is evicted from ${side}.`],twist:'split-house'});
    });
    logEvent({week:7,phase:'twist',type:'twist',title:'Split House Ends',twist:'split-house',participants:living(state).map(h=>h.id),lines:['The two groups reunite after both simultaneous evictions.']});
  }
  function simulate(){state=makeState();nextPlacement=16;state.season.name=$('seasonName').value.trim()||'Big Brother 24 — Custom Cast';state.season.themeUrl=$('themeUrl').value.trim();state.season.logoUrl=$('logoUrl').value.trim();state.season.liveFeedsEnabled=liveFeeds;history=[];pointer=-1;
    // Week 1 is the cancelled-eviction premiere; Paloma's departure is recorded separately.
    regularWeek(1); regularWeek(2); regularWeek(3); regularWeek(4); regularWeek(5); regularWeek(6); splitWeek(); regularWeek(8); regularWeek(9); regularWeek('9.5'); regularWeek(10); regularWeek(11);
    // After Week 11, BB24 is at the Final 3. The finale begins here; there is
    // no extra Final 4 eviction because the Week 11 eviction leaves exactly
    // three Houseguests.
    const finalists=living(state);
    if(finalists.length!==3) throw new Error(`BB24 finale expected 3 finalists, found ${finalists.length}`);
    state.currentWeek='Final'; const p1=choose(finalists,'physical');logEvent({week:'Final',phase:'finale',type:'final-hoh-1',title:'Final HOH Part 1',winnerId:p1.id,participants:finalists.map(h=>h.id),competition:comp('Final','final-hoh-1'),lines:[`${displayName(p1)} wins Final HOH Part 1.`]});const rem=finalists.filter(h=>h.id!==p1.id);const p2=choose(rem,'mental');logEvent({week:'Final',phase:'finale',type:'final-hoh-2',title:'Final HOH Part 2',winnerId:p2.id,participants:rem.map(h=>h.id),competition:comp('Final','final-hoh-2'),lines:[`${displayName(p2)} wins Final HOH Part 2.`]});const p3=choose(finalists,'mental');logEvent({week:'Final',phase:'finale',type:'final-hoh-3',title:'Final HOH Part 3',winnerId:p3.id,participants:finalists.map(h=>h.id),competition:comp('Final','final-hoh-3'),lines:[`${displayName(p3)} wins Final HOH Part 3 and becomes the Final HOH.`]});
    const third=finalists.find(h=>h.id!==p3.id); setEviction(third,[]);logEvent({week:'Final',phase:'finale',type:'final-decision',title:'Final HOH Decision',winnerId:p3.id,evictedId:third.id,finalistIds:finalists.filter(h=>h.id!==third.id).map(h=>h.id),lines:[`${displayName(p3)} evicts ${displayName(third)} and chooses the Final 2.`]});
    const final2=living(state), votes=[];state.jury.forEach(j=>{const target=choose(final2,'social');votes.push({voterId:j.id,targetId:target.id})});const tally={};votes.forEach(v=>tally[v.targetId]=(tally[v.targetId]||0)+1);const winner=final2.slice().sort((a,b)=>(tally[b.id]||0)-(tally[a.id]||0))[0], runner=final2.find(h=>h.id!==winner.id);winner.placement=1;runner.placement=2;third.placement=3;state.finale={winnerId:winner.id,runnerUpId:runner.id,thirdPlaceId:third.id,votes:tally};state.finished=true;logEvent({week:'Final',phase:'finale',type:'jury-vote',title:'Final Two — Jury Voting',finalistIds:final2.map(h=>h.id),votes,lines:[`${displayName(winner)} wins Big Brother 24 by a jury vote of ${tally[winner.id]||0} to ${tally[runner.id]||0}.`]});logEvent({week:'Final',phase:'finale',type:'winner',title:`${displayName(winner)} Wins Big Brother 24`,winnerId:winner.id,runnerUpId:runner.id,thirdPlaceId:third.id,lines:[`${displayName(winner)} is the winner of Big Brother 24.`,`${displayName(runner)} is the runner-up.`,`${displayName(third)} finishes in 3rd place.`]});
    // Assign any missing placements from eviction order, preserving Paloma as 16th.
    const outs=state.houseguests.filter(h=>!h.active&&!h.placement).reverse(); outs.forEach(h=>{if(!h.placement)h.placement=nextPlacement--;});
    // Re-snapshot final winner event after placements are complete.
    history=history.map((e,i)=>i===history.length-1?({...e,snapshot:snapshot()}):e);
    renderAll(); $('setupView').classList.add('hidden');$('seasonView').classList.remove('hidden');toast('Season simulated. Reveal the events one at a time.');
  }

  function eventData(e,view){let body=competitionCard(e),d=e; if(e.type==='nominations'){const hoh=byId(view,d.hohId),ns=(d.nomineeIds||[]).map(id=>byId(view,id)).filter(Boolean);body+=`<div class="ceremony-layout"><div class="ceremony-role-section"><div class="ceremony-label">HEAD OF HOUSEHOLD</div><div class="ceremony-hoh">${card(hoh,'HOH')}</div></div><div class="ceremony-arrow">▼</div><div class="ceremony-role-section"><div class="ceremony-label">NOMINEES</div><div class="ceremony-players">${ns.map(h=>card(h,'NOMINEE')).join('')}</div></div></div>`}
    else if(e.type==='pov-players'){const hoh=byId(view,d.hohId),ns=(d.nomineeIds||[]).map(id=>byId(view,id)).filter(Boolean),picked=(d.povPlayers||[]).map(id=>byId(view,id)).filter(h=>h&&!ns.some(n=>n.id===h.id)&&h.id!==hoh?.id);body+=`<div class="pov-picked-layout"><div class="ceremony-role-section"><div class="ceremony-label">AUTOMATIC PLAYERS</div><div class="ceremony-players">${card(hoh,'HOH')}${ns.map(h=>card(h,'NOMINEE')).join('')}</div></div><div class="ceremony-arrow">+</div><div class="ceremony-role-section"><div class="ceremony-label">POV PICKED PLAYERS</div><div class="ceremony-players">${picked.map(h=>card(h,'PICKED')).join('')}</div></div></div>`}
    else if(e.type==='veto'){body+=`<div class="hero-players veto-winner-only">${card(byId(view,d.winnerId),'POV WINNER')}</div>`}
    else if(e.type==='veto-ceremony'){const hoh=byId(view,d.hohId),holder=byId(view,d.winnerId),ns=(d.finalNomineeIds||d.nomineeIds||[]).map(id=>byId(view,id)).filter(Boolean);body+=`<div class="ceremony-layout"><div class="ceremony-role-section"><div class="ceremony-label">HEAD OF HOUSEHOLD</div><div class="ceremony-hoh">${card(hoh,'HOH')}</div></div><div class="ceremony-arrow">▼</div><div class="ceremony-role-section"><div class="ceremony-label">NOMINEES</div><div class="ceremony-players">${ns.map(h=>card(h,'NOMINEE')).join('')}</div></div><div class="ceremony-arrow">▼</div><div class="ceremony-role-section"><div class="ceremony-label">POV HOLDER</div><div class="ceremony-players">${card(holder,'POV HOLDER')}</div></div><div class="ceremony-arrow">▼</div><div class="ceremony-role-section"><div class="ceremony-label">FINAL NOMINEES</div><div class="ceremony-players">${ns.map(h=>card(h,'NOMINEE')).join('')}</div></div></div>`}
    else if(e.type==='eviction-voting'){body+=`<div class="vote-list">${(d.votes||[]).map(v=>{const a=byId(view,v.voterId),t=byId(view,v.targetId);return `<div class="vote-row"><div class="vote-person">${portrait(a,'vote-portrait')}<strong>${esc(displayName(a))}</strong></div><div class="vote-arrow">VOTES TO EVICT</div><div class="vote-person target">${portrait(t,'vote-portrait')}<strong>${esc(displayName(t))}</strong></div></div>`}).join('')}</div>`}
    else if(e.type==='eviction'||e.type==='self-eviction'||e.type==='final-decision'){const h=byId(view,d.evictedId);const selfEvict=e.type==='self-eviction'||d.selfEviction;body+=`<div class="eviction-result">${card(h,selfEvict?'LEFT THE GAME':'EVICTED')}<div class="eviction-vote-count">${selfEvict?`${esc(displayName(h))} self-evicted from the Big Brother house.`:e.type==='eviction'?`By a vote of <strong>${d.evictedVoteCount||0} to ${d.stayVoteCount||0}</strong>, ${esc(displayName(h))} is evicted.`:`${esc(displayName(byId(view,d.winnerId)))} makes the Final 2 decision and evicts ${esc(displayName(h))}.`}</div></div>`}
    else if(e.type==='jury-vote'){body=juryVoteScreen(e,view)}
    else if(e.type.startsWith('final-hoh')){body+=`<div class="hero-players">${(d.participants||[]).map(id=>card(byId(view,id),id===d.winnerId?'WINNER':'')).join('')}</div>`}
    else {const players=(d.participants||[]).map(id=>byId(view,id)).filter(Boolean);if(players.length)body+=`<div class="hero-players">${players.map(h=>card(h,h.id===d.winnerId?'WINNER':'')).join('')}</div>`}
    return body;
  }
  function juryVoteScreen(e,view){const fs=(e.finalistIds||[]).map(id=>byId(view,id)).filter(Boolean);return `<section class="jury-vote-screen"><header class="jury-vote-screen-header"><div class="jury-vote-screen-kicker">THE FINAL TWO</div><h3>FINALISTS</h3><p>These two Houseguests are competing to become the winner of Big Brother.</p></header><div class="jury-finalists-screen">${fs.map(h=>card(h,'FINALIST',true)).join('')}</div><header class="jury-vote-screen-header jury-voting-header"><div class="jury-vote-screen-kicker">JURY VOTING</div><h3>HOW THE JURY VOTED</h3></header><div class="jury-vote-list">${(e.votes||[]).map(v=>{const a=byId(view,v.voterId),t=byId(view,v.targetId);return `<article class="jury-vote-row"><div class="jury-voter">${portrait(a,'jury-vote-portrait')}<div><span>JUROR</span><strong>${esc(displayName(a))}</strong></div></div><div class="jury-vote-arrow">VOTES FOR</div><div class="jury-target">${portrait(t,'jury-vote-portrait')}<div><span>VOTED FOR</span><strong>${esc(displayName(t))}</strong></div></div></article>`}).join('')}</div></section>`}
  function eventText(e){return e.lines?.length?`<ul class="event-lines">${e.lines.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}
  function renderEvent(){const e=history[pointer];if(!e){$('eventKicker').textContent='READY TO SIMULATE';$('eventTitle').textContent='Your season is ready';$('eventBody').innerHTML='<div class="empty-event"><div class="empty-icon">BB</div><h2>Click Simulate Season</h2><p>Events will appear here one at a time in classic BrantSteele-style order.</p></div>';$('eventCounter').textContent='0 / 0';return}$('eventKicker').textContent=`${weekLabel(e.week)}  •  ${(e.phase||'EVENT').replaceAll('-',' ').toUpperCase()}`;$('eventTitle').textContent=e.title;$('eventBody').innerHTML=eventData(e,e.snapshot)+eventText(e);$('eventCounter').textContent=`${pointer+1} / ${history.length}`}
  function status(h,view){if(!h.active){if(h.placement===1)return'<span class="pill winner">WINNER</span>';if(h.placement===2)return'<span class="pill runner">RUNNER-UP</span>';if(h.juryMember)return`<span class="pill jury">JURY · ${ordinal(h.placement)}</span>`;return`<span class="pill out">${ordinal(h.placement||16)}</span>`}if(view?.currentHOH===h.id)return'<span class="pill hoh">HOH</span>';if(view?.nominees?.includes(h.id))return'<span class="pill nom">NOMINATED</span>';if(view?.povPlayers?.includes(h.id))return'<span class="pill pov">POV</span>';return'<span class="pill in">IN HOUSE</span>'}
  function renderMemory(view=history[pointer]?.snapshot||null){const hs=view?.houseguests||state.houseguests;const active=hs.filter(h=>h.active),out=hs.filter(h=>!h.active).sort((a,b)=>(a.placement||99)-(b.placement||99));$('memoryWall').innerHTML=`<div class="wall-section"><h3>IN THE HOUSE · ${active.length}</h3><div class="memory-grid">${active.map(h=>`<div class="memory-card">${portrait(h,'memory-portrait')}<div>${esc(name(h))}</div>${status(h,view)}</div>`).join('')}</div></div><div class="wall-section"><h3>ELIMINATED</h3><div class="memory-grid eliminated">${out.map(h=>`<div class="memory-card">${portrait(h,'memory-portrait')}<div>${esc(name(h))}</div>${status(h,view)}</div>`).join('')}</div></div>`}
  function renderTimeline(){$('timeline').innerHTML=history.map((e,i)=>`<button class="timeline-item ${i===pointer?'selected':''} ${i<=pointer?'revealed':'locked'}" data-index="${i}"><span>${i+1}</span><div><strong>${esc(i<=pointer?e.title:'Locked Event')}</strong><small>${esc(i<=pointer?weekLabel(e.week):'UNREVEALED')}</small></div></button>`).join('')}
  function renderResults(){if(pointer!==history.length-1){$('tabContent').innerHTML='<div class="tab-panel results-locked"><div class="results-lock-icon">🔒</div><h2>Season Results Locked</h2><p>The final placements and winner stay hidden until you actually reach the final winner reveal.</p></div>';return}const hs=state.houseguests.slice().sort((a,b)=>(a.placement||99)-(b.placement||99));const rows=[hs.slice(0,5),hs.slice(5,11),hs.slice(11,16)];const winner=hs[0],runner=hs[1];$('tabContent').innerHTML=`<div class="season-results-panel"><h2>Season Results</h2><div class="final-awards"><div class="final-award winner-award"><span>WINNER</span>${portrait(winner,'award-portrait')}<strong>${esc(name(winner))}</strong><small>${state.finale?.votes?.[winner.id]||0} Jury Votes</small></div><div class="final-award"><span>RUNNER-UP</span>${portrait(runner,'award-portrait')}<strong>${esc(name(runner))}</strong><small>${state.finale?.votes?.[runner.id]||0} Jury Votes</small></div><div class="final-award afp-award"><span>FINAL 3</span>${portrait(hs[2],'award-portrait')}<strong>${esc(name(hs[2]))}</strong><small>Final HOH Decision</small></div></div><h3 class="results-subhead">FINAL PLACEMENTS</h3><div class="final-placements-grid">${rows.map((r,i)=>`<div class="final-placement-row row-${i+1}">${r.map(h=>`<div class="final-placement-card"><div class="final-placement-portrait">${portrait(h,'final-placement-img')}</div><strong>${esc(name(h))}</strong><span>${ordinal(h.placement)}</span><small>${h.placement<=2?`${state.finale?.votes?.[h.id]||0} Jury Vote${(state.finale?.votes?.[h.id]||0)===1?'':'s'}`:h.placement===3?'Final HOH Decision':'Jury / Eviction'}</small></div>`).join('')}</div>`).join('')}</div></div>`}
  function renderSummary(){const cards=[];for(let w=1;w<=11;w++){const es=history.filter(e=>String(e.week)===String(w));if(!es.length)continue;const hoh=es.find(e=>e.type==='hoh'),nom=es.find(e=>e.type==='nominations'),veto=es.find(e=>e.type==='veto'),ev=es.find(e=>e.type==='eviction');cards.push(`<article class="weekly-summary-card"><h3>Week ${w}</h3><div class="weekly-summary-rows"><div><strong>HOH Winner</strong><span>${esc(displayName(byId(null,hoh?.winnerId)))}</span></div><div><strong>Initial Nominees</strong><span>${(nom?.nomineeIds||[]).map(id=>displayName(byId(null,id))).join(' & ')||'—'}</span></div><div><strong>PoV Winner</strong><span>${esc(displayName(byId(null,veto?.winnerId)))}</span></div><div><strong>Evicted</strong><span>${esc(displayName(byId(null,ev?.evictedId)))||'No eviction'}</span></div></div></article>`)}$('tabContent').innerHTML=`<div class="weekly-summary-list">${cards.join('')}</div>`}
  function renderAlliances(){if(!state.alliances.length){$('tabContent').innerHTML='<div class="tab-panel"><h2>Alliances</h2><p>No custom alliances were entered before the simulation.</p></div>';return}$('tabContent').innerHTML=`<div class="tab-panel"><h2>Alliances</h2>${state.alliances.map(a=>`<div class="alliance-card"><div class="alliance-heading"><h3>${esc(a.name)}</h3><small>${esc(a.type||'Custom')}</small></div><div class="alliance-members">${a.members.map(id=>card(byId(null,id),'MEMBER')).join('')}</div></div>`).join('')}</div>`}
  function renderTab(){document.querySelectorAll('.view-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===activeTab));const sim=document.querySelector('.sim-layout');if(activeTab==='stats'){sim.classList.add('results-mode');$('tabContent').classList.remove('hidden');renderResults()}else{sim.classList.remove('results-mode');if(activeTab==='weekly-summary'){renderSummary();$('tabContent').classList.remove('hidden')}else if(activeTab==='alliances'){renderAlliances();$('tabContent').classList.remove('hidden')}else{$('tabContent').classList.add('hidden')}}}
  function renderCast(){
    const hs=state.houseguests;
    $('castGrid').innerHTML=hs.map((h,i)=>`<article class="cast-card">
      <div class="setup-portrait">${portrait(h,'setup-img')}</div>
      <div class="cast-body">
        <div class="cast-number">HOUSEGUEST ${i+1}</div>
        <div class="cast-name">${esc(displayName(h))}</div>
        <label>First Name<input data-field="firstName" data-id="${h.id}" value="${esc(h.firstName)}"></label>
        <label>Last Name<input data-field="lastName" data-id="${h.id}" value="${esc(h.lastName)}"></label>
        <label>Nickname<input data-field="nickname" data-id="${h.id}" value="${esc(h.nickname||'')}"></label>
        <label>Gender<select data-field="gender" data-id="${h.id}">
          <option value="" ${!h.gender?'selected':''}>Select Gender</option>
          <option value="Male" ${h.gender==='Male'?'selected':''}>Male</option>
          <option value="Female" ${h.gender==='Female'?'selected':''}>Female</option>
          <option value="Non-binary" ${h.gender==='Non-binary'?'selected':''}>Non-binary</option>
        </select></label>
        <label>Portrait URL<input data-field="portraitUrl" data-id="${h.id}" value="${esc(h.portraitUrl||'')}"></label>
        <div class="portrait-tools">
          <label class="upload-portrait">Upload Photo<input type="file" accept="image/*" data-upload-portrait="${h.id}"></label>
          ${h.portraitUrl?'<button type="button" class="clear-portrait" data-clear-portrait="'+h.id+'">Clear Photo</button>':''}
        </div>
        <div class="portrait-help">Upload a photo from your computer or paste an image URL above.</div>
        <div class="rating-grid">${['physical','mental','social','strategic'].map(k=>`<label><span class="rating-label">${k}<span>${h.ratings[k]||50}</span></span><input type="range" min="1" max="100" data-rating="${k}" data-id="${h.id}" value="${h.ratings[k]||50}"></label>`).join('')}</div>
      </div>
    </article>`).join('');
  }
  function renderTeams(){const groups=[['BroChella','Week 7 split-house side'],['Dyre Fest','Week 7 split-house side'],['Festie Besties','Weeks 3–5 — custom pairs/trios'],['Backstage Boss','Week 1 — three selected Houseguests are restricted from competing and voting']];$('teamsGrid').innerHTML=groups.map(g=>`<section class="team"><h3>${esc(g[0])}</h3><p>${esc(g[1])}</p></section>`).join('')}
  function renderTwists(){const el=$('twistsGrid');if(!el)return;el.innerHTML=CONFIG.twists.map(t=>`<article class="twist-card ${t.cancelled?'cancelled':''}"><div class="twist-card-top"><span>${t.cancelled?'CANCELLED':'ACTIVE'}</span><small>WEEK${t.weeks.length>1?'S':''} ${t.weeks.join(', ')}</small></div><h3>${esc(t.name)}</h3><p>${esc(t.description)}</p>${t.mechanics?`<ul>${t.mechanics.map(m=>`<li>${esc(m)}</li>`).join('')}</ul>`:''}</article>`).join('')}
  function renderSocial(){
    const opts=state.houseguests.map(h=>`<option value="${h.id}">${esc(displayName(h))}</option>`).join('');
    $('relationshipsGrid').innerHTML=`
      <div class="relationship-editor">
        <div class="relationship-selects">
          <label>From<select id="relFrom">${opts}</select></label>
          <div class="relationship-person" id="relFromPerson"></div>
          <label>To<select id="relTo">${opts}</select></label>
          <div class="relationship-person" id="relToPerson"></div>
        </div>
        <div class="relationship-sliders">${['friendship','trust','loyalty','rivalry','respect','attraction'].map(k=>`<label><span>${k}<b id="rel-${k}-value">50</b></span><input id="rel-${k}" type="range" min="0" max="100" value="50"></label>`).join('')}</div>
        <button id="saveRelationship" class="primary">Save Relationship</button>
        <p class="relationship-help">Relationships are directional, so A → B can differ from B → A.</p>
      </div>`;
    $('allianceSetup').innerHTML=`
      <div class="alliance-create">
        <label>Alliance Name<input id="allianceName" placeholder="Alliance name"></label>
        <label>Type<select id="allianceType"><option>Majority Alliance</option><option>Core Alliance</option><option>Final Two</option><option>Final Three</option><option>Showmance</option><option>Custom</option></select></label>
        <div class="member-picker">${state.houseguests.map(h=>`<label class="member-picker-card"><input type="checkbox" value="${h.id}"><span class="member-picker-portrait">${portrait(h,'setup-social-portrait')}</span><span class="member-picker-info"><strong data-social-name="${h.id}">${esc(displayName(h))}</strong><small>Houseguest ${h.slot}</small></span></label>`).join('')}</div>
        <button id="createAlliance" class="primary">Create</button>
      </div>
      <div class="custom-alliance-list">${state.alliances.map((a,i)=>`<div class="setup-alliance"><strong>${esc(a.name)}</strong><span class="setup-alliance-members">${a.members.map(id=>{const h=byId(null,id);return `<span class="mini-alliance-member">${portrait(h,'mini-social-portrait')}<span data-social-name="${id}">${esc(displayName(h))}</span></span>`}).join('')}</span><button class="danger-link" data-delete-alliance="${i}">Delete</button></div>`).join('')}</div>`;
    updateRelationshipPeople();
  }

  function updateRelationshipPeople(){
    const from=$('relFrom')?.value, to=$('relTo')?.value;
    const fh=state.houseguests.find(h=>h.id===from), th=state.houseguests.find(h=>h.id===to);
    if($('relFromPerson')) $('relFromPerson').innerHTML=fh?`${portrait(fh,'setup-social-portrait')}<strong>${esc(displayName(fh))}</strong>`:'';
    if($('relToPerson')) $('relToPerson').innerHTML=th?`${portrait(th,'setup-social-portrait')}<strong>${esc(displayName(th))}</strong>`:'';
    document.querySelectorAll('[data-social-name]').forEach(el=>{const h=state.houseguests.find(x=>x.id===el.dataset.socialName);if(h)el.textContent=displayName(h);});
  }

  function renderSetup(){renderCast();renderTeams();renderTwists();renderSocial();$('seasonName').value=state.season.name;$('themeUrl').value=state.season.themeUrl;$('logoUrl').value=state.season.logoUrl}
  function renderAll(){renderSetup();renderTimeline();renderEvent();renderMemory();renderTab();$('seasonHeading').textContent=state.season.name.replace(' — Custom Cast','');$('seasonStatusLine').textContent=history.length?`${history.length} EVENTS · ${pointer<0?'READY':`REVEALED ${pointer+1}`}`:'READY'}
  function toast(m){$('toast').textContent=m;$('toast').classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>$('toast').classList.remove('show'),2200)}

  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-index]');if(b&&b.closest('#timeline')){const i=Number(b.dataset.index);if(i<=pointer){pointer=i;renderAll()}return}
    const tab=e.target.closest('.view-tabs button');if(tab){activeTab=tab.dataset.tab;renderTab();return}
    const del=e.target.closest('[data-delete-alliance]');if(del){state.alliances.splice(Number(del.dataset.deleteAlliance),1);renderSetup()}
  });
  $('simulateBtn').onclick=simulate;$('resimulateBtn').onclick=simulate;$('previousBtn').onclick=()=>{if(pointer>0){pointer--;renderAll()}};$('nextBtn').onclick=()=>{if(pointer<history.length-1){pointer++;renderAll()}};$('revealSeasonBtn').onclick=()=>{pointer=history.length-1;renderAll()};$('revealWeekBtn').onclick=()=>{if(pointer<0){pointer=0}else{const current=history[pointer]?.week;const next=history.findIndex((e,i)=>i>pointer&&String(e.week)!==String(current));pointer=next<0?history.length-1:next-1}renderAll()};$('backToSetupBtn').onclick=()=>{$('seasonView').classList.add('hidden');$('setupView').classList.remove('hidden')};$('saveBtn').onclick=()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify({format:'BB24-SIMULATOR-SAVE',version:2,state,history,pointer,liveFeeds}));toast('Season setup saved.')};$('resetBtn').onclick=()=>{state=makeState();history=[];pointer=-1;renderAll();toast('Simulator reset.')};$('exportBtn').onclick=()=>{const payload={format:'BB24-SIMULATOR-SAVE',version:2,seasonVersion:2,exportedAt:new Date().toISOString(),state,history,pointer,liveFeeds};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='BB24-simulator-save.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},0)};$('importInput').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const text=await f.text();const x=JSON.parse(text);applyImportedPayload(x);toast('Season imported successfully.')}catch(err){console.error('BB24 import error:',err);toast(`Could not import that save: ${err.message||'invalid file'}`)}e.target.value=''};
  document.addEventListener('change',e=>{if(e.target.id==='relFrom'||e.target.id==='relTo')updateRelationshipPeople();});
  $('liveFeedsToggle').onclick=()=>{liveFeeds=!liveFeeds;$('liveFeedsToggle').textContent=`Live Feeds: ${liveFeeds?'ON':'OFF'}`;$('liveFeedsToggle').classList.toggle('off',!liveFeeds)};
  $('castGrid').addEventListener('input',e=>{const id=e.target.dataset.id,h=state.houseguests.find(x=>x.id===id);if(!h)return;if(e.target.dataset.field)h[e.target.dataset.field]=e.target.value;if(e.target.dataset.rating)h.ratings[e.target.dataset.rating]=Number(e.target.value);if(e.target.dataset.rating){const label=e.target.closest('label')?.querySelector('.rating-label span');if(label)label.textContent=e.target.value;}if(e.target.dataset.field){const title=e.target.closest('.cast-body')?.querySelector('.cast-name');if(title)title.textContent=displayName(h);updateRelationshipPeople();}});
  $('castGrid').addEventListener('change',e=>{
    const id=e.target.dataset.id;
    const h=state.houseguests.find(x=>x.id===id);
    if(!h)return;
    if(e.target.dataset.field){h[e.target.dataset.field]=e.target.value;updateRelationshipPeople();}
  });
  $('castGrid').addEventListener('change',e=>{
    const id=e.target.dataset.uploadPortrait;
    if(!id || !e.target.files?.[0]) return;
    const file=e.target.files[0];
    if(!file.type.startsWith('image/')){toast('Please choose an image file.');return;}
    const h=state.houseguests.find(x=>x.id===id);
    if(!h)return;
    const reader=new FileReader();
    reader.onload=()=>{h.portraitUrl=reader.result;renderCast();toast(`${displayName(h)} photo uploaded.`);};
    reader.onerror=()=>toast('Could not read that photo.');
    reader.readAsDataURL(file);
  });
  $('castGrid').addEventListener('click',e=>{
    const b=e.target.closest('[data-clear-portrait]');
    if(!b)return;
    const h=state.houseguests.find(x=>x.id===b.dataset.clearPortrait);
    if(!h)return;
    h.portraitUrl='';
    renderCast();
  });
  document.addEventListener('click',e=>{if(e.target.id==='saveRelationship'){const a=$('relFrom').value,b=$('relTo').value;if(a===b)return;const r=state.relationships[a][b];['friendship','trust','loyalty','rivalry','respect','attraction'].forEach(k=>r[k]=Number($('rel-'+k).value));toast('Relationship saved.')}if(e.target.id==='createAlliance'){const namev=$('allianceName').value.trim();const members=[...document.querySelectorAll('.member-picker input:checked')].map(x=>x.value);if(namev&&members.length>=2){state.alliances.push({name:namev,type:$('allianceType').value,members});renderSetup();toast('Alliance created.')}}});
  renderAll();
})();

/*
 * BIG BROTHER 24 — SEASON CONFIGURATION
 * Official BB24 competition database + twist configuration + custom social setup.
 */
window.BB24_CONFIG = Object.freeze({
  seasonId: "bb24-custom",
  seasonNumber: 24,
  originalYear: 2022,
  defaultCastSize: 16,

  /* BB24 has no opening teams. Houseguests move in as individuals. */
  teams: [],

  ratingKeys: ["general","physical","mental","social","strategic"],
  relationshipKeys: ["friendship","trust","loyalty","rivalry","respect","attraction"],

  /* ---------------------------- TWIST TIMING ---------------------------- */
  backstageBossWeek: 1,
  festieBestiesFormWeek: 3,
  splitHouseWeek: 7,
  juryThresholdPlacement: 11,

  /* Official BB24 competition names and descriptions of the formats used on the show. */
  competitionSchedule: [
    {week:1,type:"hoh",name:"Drumming for Power",category:"physical",description:"Houseguests split into three mini-qualifier groups (\"Potty Talk,\" \"Piercing Station,\" and \"Hangin' Tough\"). Each station's winner advanced to a head-to-head final: unlock a gear box and assemble a large 3D drum-kit puzzle. The Backstage Boss did not compete."},
    {week:1,type:"pov",name:"Ren Fest",category:"physical",description:"A Renaissance-festival themed Veto. Houseguests rode a mechanical horse and used a lance to collect rings along the course. The player collecting the most rings in the allotted time won the Power of Veto."},
    {week:1,type:"backstage-duel",name:"Hit the Road",category:"physical",cancelled:true,description:"Announced as the planned Backstage Boss duel, but it was never played because Paloma Aguilar left the game and the Backstage Boss twist was cancelled."},

    {week:2,type:"hoh",name:"The BB Pie Fest",category:"physical",description:"A pie-themed race/obstacle course. Houseguests moved oversized pies through the course and raced to complete the challenge without losing their pies. The fastest successful player won HOH."},
    {week:2,type:"pov",name:"Mermaid Fest",category:"physical",description:"A mermaid-themed Veto competition featuring a slippery underwater-style obstacle course. Houseguests navigated the course while collecting and transferring the required pieces; the fastest successful player won the Veto."},

    {week:3,type:"hoh",name:"Get Lit",category:"mental",description:"A memory/observation HOH. Houseguests watched festival-lighting sequences and answered questions about details they had just seen. The competition also established the original Festie Besties pairings."},
    {week:3,type:"pov",format:"Co-POV",name:"Woodstack",category:"physical",description:"Played by three Festie Bestie groups. Each pair worked together to build and balance a stack of wooden logs; the best-performing group won the Power of Veto together."},

    {week:4,type:"hoh",name:"The Invitation",category:"physical",description:"A festival-themed shuffleboard competition. Houseguests slid oversized pieces down a slick board, trying to land them in the highest-scoring areas without going off the edge. The highest score won HOH."},
    {week:4,type:"pov",format:"Co-POV",name:"Trippy Watch Party",category:"mental",description:"A visual-memory competition. Houseguests watched a trippy performance/video and then answered questions about what they had just seen. The winning Festie Bestie group won the Power of Veto together."},

    {week:5,type:"hoh",name:"Mind Your Step",category:"physical",description:"A timed balance-beam course set in a dog-park theme. Houseguests chose routes across beams of different widths; falling meant restarting. The fastest player to cross the course and hit the button won HOH."},
    {week:5,type:"pov",format:"Co-POV",name:"OTEV the Singing Stageroach",category:"physical",description:"The classic OTEV format with a singing Stageroach: houseguests raced down a slippery ramp to find the answer to each riddle and return to an available seat. One player was eliminated each round until the last remaining player won the Power of Veto."},

    {week:6,type:"hoh",name:"Conspiracy Fest",category:"physical",description:"The season’s endurance Wall competition. Houseguests stood on small ledges built into a tilting wall while enduring movement and weather effects. The last houseguest holding on won HOH."},
    {week:6,type:"pov",name:"Punkaroo",category:"physical",description:"A giant rock-and-roll pinball machine. Houseguests manually angled a launch ramp, rolling balls to bounce off bumpers and land in high-scoring slots for the best cumulative score."},

    {week:7,type:"hoh-brochella",name:"Do You See The VIP?",category:"mental",splitGroup:"brochella",description:"Played by the Big BroChella group during the Split House twist. Houseguests studied a crowded festival/VIP scene and answered questions about details hidden in the image."},
    {week:7,type:"hoh-dyrefest",name:"Do You See The VIP?",category:"mental",splitGroup:"dyrefest",description:"This was the same Week 7 HOH competition used to determine both split-house HOHs. Houseguests faced off two at a time and identified which section of a festival-crowd image contained a hidden VIP sign. Michael won the final matchup and became Big BroChella HOH; Terrance, the runner-up, became Dyre Fest HOH."},
    {week:7,type:"pov-brochella",name:"One, Two, Three, VIP",category:"strategic",splitGroup:"brochella",description:"Played by the Big BroChella group. Houseguests used clues to determine the correct order of VIPs in the festival lineup; the winning player earned the Power of Veto for the group."},
    {week:7,type:"pov-dyrefest",name:"Lunch is Served",category:"physical",splitGroup:"dyrefest",description:"Played by the Dyre Fest group. Houseguests completed a food-themed balancing/building challenge in the backyard; the fastest successful player won the group’s Power of Veto."},

    {week:8,type:"hoh",name:"Carni-Small",category:"physical",description:"A carnival-themed slip-and-slide race. Houseguests slid down a slick course, collected liquid and transferred it into a container to raise a ball. The first player to release the ball and complete the challenge won HOH."},
    {week:8,type:"pov",name:"Pride Slide",category:"physical",description:"A colorful slippery-slope Veto competition. Houseguests raced down a slick course to collect and transfer liquid, with the fastest successful run winning the Power of Veto."},

    {week:9,type:"hoh",name:"Burning Bot",category:"physical",description:"Houseguests race through a festival-themed obstacle course while carrying and placing pieces to complete the Burning Bot challenge. The fastest successful run wins HOH."},
    {week:9,type:"pov",name:"BB Comics",category:"mental",description:"Houseguests race through a comic-book-themed challenge, memorizing and matching cast comic covers while completing the course as quickly as possible."},
    {week:9,type:"hoh-double",name:"Laser Focus",category:"mental",description:"During the Week 9 Double Eviction, houseguests watch sequences of colored laser lights and answer questions about the exact order and colors shown. The highest score wins the second HOH."},
    {week:9,type:"pov-double",name:"Amp It Up",category:"physical",description:"During the Week 9 Double Eviction, houseguests untangle a long cable and race to reach and plug it into an amp. The first houseguest to complete the task wins the Veto."},

    {week:10,type:"hoh",name:"Horror Fest Lockdown",category:"physical",description:"A horror-themed Black Box/Haunting competition. The house was dark and transformed into a frightening maze; players navigated by touch and limited visibility to locate the required objects and complete the mission."},
    {week:10,type:"pov",name:"Snooze Fest",category:"physical",description:"A gear-and-puzzle Power of Veto competition. Houseguests assembled interlocking gears so that the finished mechanism worked together correctly; the first player to complete the mechanism won the Veto."},

    {week:11,type:"hoh",name:"Fashion Fest",category:"mental",description:"A video-memory quiz. Houseguests watched Julie Chen Moonves perform a rapid sequence of outfit changes, then answered questions about the outfits and details shown in the video."},
    {week:11,type:"pov",name:"Mathletes",category:"mental",description:"A numbers-and-memory Veto. Houseguests solved mathematical questions based on facts and quantities from events that occurred earlier in the season. The highest-performing player won the Veto."},

    {week:12,type:"final-hoh-1",name:"Final HOH Part 1",category:"physical",description:"Final HOH Part 1, an endurance competition. The final three held onto moving handles while the apparatus spun and jolted them and the set delivered additional physical effects. The last houseguest holding on advanced directly to Part 3."},
    {week:12,type:"final-hoh-2",name:"Final HOH Part 2",category:"mental",description:"Final HOH Part 2, a timed season-memory competition. The two players who did not win Part 1 completed individual runs through a festival-themed set, collecting competition-name tiles and placing the correct titles in chronological order. The faster time won."},
    {week:12,type:"final-hoh-3",name:"Final HOH Part 3",category:"mental",description:"Final HOH Part 3. The Part 1 and Part 2 winners answered eight questions about the jury, with each question presenting three statements and asking the players to identify the false statement. The player with the most points became the Final HOH."}
  ],

  /* --------------------------- TWIST REFERENCE --------------------------- */
  twists: [
    {
      id: "backstage-boss",
      name: "Backstage Boss",
      week: 1,
      summary: "On Move-In Night, all houseguests draw a random ticket. One unknowingly draws the Backstage Boss pass and is safe for the week, sitting out of all competitions. After the Week 1 HOH is crowned, the Backstage Boss must select three houseguests to receive Backstage Passes — also unable to compete, and at risk. America secretly votes to save one of the three, and the Backstage Boss then privately chooses to save one of the remaining two. The last unsaved Backstage Pass houseguest faces the house's eviction-night evictee in a head-to-head 'Hit the Road' duel; the loser is evicted."
    },
    {
      id: "festie-besties",
      name: "Festie Besties",
      week: 3,
      summary: "During the Week 3 HOH, houseguests are grouped into pairs (and, if the cast size is odd, one trio) as they're eliminated from the competition. From then on, the HOH nominates one entire Bestie group for eviction — the whole group goes on the block together, though only one member is actually evicted. One additional Bestie group joins the HOH and nominees in the POV; if a nominated trio makes the pool larger than six, every houseguest plays. If POV is used, it removes the whole nominated group, and the HOH names a full replacement group. On eviction night, the house votes on which member of the block group goes home; survivors keep their Bestie tie for future weeks."
    },
    {
      id: "split-house",
      name: "Split House Double Eviction",
      week: 7,
      summary: "Before the Week 7 HOH, the house is divided by schoolyard pick into two groups of five: Big BroChella, who stay in the main house, and Dyre Fest, secluded to the backyard for the week. The two groups cannot communicate. Each group crowns its own HOH and runs its own nominations, Veto, and eviction — Dyre Fest even builds its own Veto competition. One houseguest from each group is evicted the same night, without goodbyes between the two sides."
    }
  ],

  notes: [
    "16-houseguest custom cast, no opening teams",
    "Backstage Boss twist runs during Week 1 only",
    "Festie Besties groups form at the Week 3 HOH and remain active only through Week 5; the twist ends before Week 6",
    "Split House Double Eviction occurs in Week 7, splitting the house into BroChella and Dyre Fest",
    "Final 3 uses the three-part Final HOH format",
    "Custom relationships and alliances can be entered before simulation"
  ]
});

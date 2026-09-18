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
    {week:1,type:"hoh",name:"Drumming for Power",category:"physical",description:"Houseguests race on giant festival drums, navigating a timed physical course to be the first to complete the required sequence."},
    {week:1,type:"pov",name:"Ren Fest",category:"physical",description:"Houseguests race through a Renaissance-festival obstacle course, collecting and placing oversized festival pieces as quickly as possible."},

    {week:2,type:"hoh",name:"The BB Pie Fest",category:"physical",description:"Houseguests compete in a pie-themed festival race, navigating the course and completing the required pie challenges to finish fastest."},
    {week:2,type:"pov",name:"Mermaid Fest",category:"physical",description:"A mermaid-themed festival competition requiring houseguests to navigate the course and complete the underwater-themed challenge as quickly as possible."},

    {week:3,type:"hoh",name:"Get Lit",category:"mental",description:"Houseguests answer questions about details from a series of festival lighting displays while surviving successive rounds of elimination."},
    {week:3,type:"pov",name:"Woodstack",category:"physical",description:"A Festie Besties Co-POV competition in which Bestie partners work together in a wood-stacking challenge; the winning pair earns the Power of Veto."},

    {week:4,type:"hoh",name:"The Invitation",category:"physical",description:"Houseguests compete in a festival-themed invitation challenge, maneuvering and placing oversized invitations through the course."},
    {week:4,type:"pov",name:"Trippy Watch Party",category:"mental",description:"A Festie Besties Co-POV challenge requiring partners to identify changes and details in psychedelic festival images."},

    {week:5,type:"hoh",name:"Mind Your Step",category:"physical",description:"Houseguests carefully navigate a narrow path while completing the required steps of the festival-themed challenge; the fastest successful run wins HOH."},
    {week:5,type:"pov",name:"OTEV the Singing Stageroach",category:"mental",description:"The Festie Besties play OTEV together, racing to retrieve the correct answers and return to their seats before the next round; the last pair eliminated loses."},

    {week:6,type:"hoh",name:"Conspiracy Fest",category:"physical",description:"The classic endurance wall competition. Houseguests hold onto the wall while it tilts and the elements make the challenge increasingly difficult; the last houseguest remaining wins HOH."},
    {week:6,type:"pov",name:"Punkaroo",category:"physical",description:"Houseguests play a punk-rock themed pinball challenge, launching and directing balls toward scoring targets to earn the highest score."},

    {week:7,type:"hoh-brochella",name:"Do You See The VIP?",category:"mental",splitGroup:"brochella",description:"The Big BroChella group competes in a VIP-themed memory challenge. Only houseguests in the indoor group participate."},
    {week:7,type:"hoh-dyrefest",name:"Do You See The VIP?",category:"mental",splitGroup:"dyrefest",description:"The Dyre Fest group competes separately in the same VIP-themed HOH challenge. Only houseguests in the outdoor group participate."},
    {week:7,type:"pov-brochella",name:"One, Two, Three, VIP",category:"mental",splitGroup:"brochella",description:"The Big BroChella group competes in the VIP-themed Power of Veto competition."},
    {week:7,type:"pov-dyrefest",name:"Lunch is Served",category:"physical",splitGroup:"dyrefest",description:"The Dyre Fest group competes separately in Lunch is Served for its Power of Veto."},

    {week:8,type:"hoh",name:"Carni-Small",category:"physical",description:"Houseguests race through the carnival-themed Carni-Small competition, sliding through the course and completing the challenge as quickly as possible."},
    {week:8,type:"pov",name:"Pride Slide",category:"physical",description:"Houseguests slide through the Pride-themed course, collecting and transferring the required material to complete the challenge."},

    {week:9,type:"hoh",name:"Burning Bot",category:"physical",description:"A Zingbot-themed competition in which houseguests race to complete the Burning Bot challenge and post the fastest successful time."},
    {week:9,type:"pov",name:"BB Comics",category:"mental",description:"Houseguests race through the BB Comics challenge, memorizing and matching comic-book images featuring the houseguests."},
    {week:9,type:"hoh-double",name:"Laser Focus",category:"mental",description:"The second HOH of the double eviction is a rapid laser-focused challenge played immediately after the first eviction."},
    {week:9,type:"pov-double",name:"Amp It Up",category:"physical",description:"The second Power of Veto of the double eviction is an amp-themed challenge played during the second half of the night."},

    {week:10,type:"hoh",name:"Horror Fest Lockdown",category:"physical",description:"Houseguests compete in a horror-festival challenge while navigating the lockdown course and trying to complete it in the fastest time."},
    {week:10,type:"pov",name:"Snooze Fest",category:"mental",description:"Houseguests compete in the Snooze Fest Power of Veto challenge, testing memory and attention through the festival-themed setup."},

    {week:11,type:"hoh",name:"Fashion Fest",category:"mental",description:"Houseguests compete in a fashion-themed memory and observation challenge based on details from the season."},
    {week:11,type:"pov",name:"Mathletes",category:"mental",description:"Houseguests solve numerical and mathematical questions based on events and details from the season; the fastest correct performance wins the Veto."},

    {week:12,type:"final-hoh-1",name:"Wiener-Palooza",category:"physical",description:"Final HOH Part 1 is an endurance competition in which the final three must hold on through increasingly difficult conditions; the last houseguest remaining advances to Part 3."},
    {week:12,type:"final-hoh-2",name:"Festival Lineup",category:"mental",description:"Final HOH Part 2 is a timed memory challenge in which the two remaining finalists reconstruct the season's competition lineup in chronological order."},
    {week:12,type:"final-hoh-3",name:"Jury Fest",category:"mental",description:"Final HOH Part 3 is a live jury-based question competition between the winners of Parts 1 and 2."}
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

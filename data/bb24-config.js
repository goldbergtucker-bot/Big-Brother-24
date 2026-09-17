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
  festieBestiesEndWeek: 5,
  splitHouseWeek: 7,
  juryThresholdPlacement: 11,

  /* Official BB24 competition names and descriptions of the formats used on the show. */
  competitionSchedule: [
    {week:1,type:"hoh",name:"Drumming for Power",category:"physical",description:"Houseguests split into three mini-qualifier groups (\"Potty Talk,\" \"Piercing Station,\" and \"Hangin' Tough\"). Each station's winner advanced to a head-to-head final: unlock a gear box and assemble a large 3D drum-kit puzzle. The Backstage Boss did not compete."},
    {week:1,type:"pov",name:"Ren Fest",category:"physical",description:"A medieval festival challenge. Houseguests rode a mechanical horse down a track, using a foam lance to snatch swinging metal rings as they passed. Most rings collected in the time limit won the Power of Veto."},
    {week:1,type:"backstage-duel",name:"Hit the Road",category:"physical",description:"A head-to-head duel between the house's eviction-night evictee and the remaining Backstage Pass houseguest. The loser of the duel is eliminated from the game; the winner remains a houseguest."},

    {week:2,type:"hoh",name:"The BB Pie Fest",category:"physical",description:"A head-to-head bracket race across a backyard obstacle course. Houseguests sprinted a runway carrying oversized, unstable pies, trying to plant them on a finish-line stand without dropping them."},
    {week:2,type:"pov",name:"Mermaid Fest",category:"physical",description:"An under-the-sea obstacle course. Houseguests crawled through a shallow, water-logged maze under a low net, transferring decorative pearls to a collection bin to win the Power of Veto."},

    {week:3,type:"hoh",name:"Get Lit",category:"mental",description:"Houseguests watched elaborate music-festival lighting sequences and answered true/false memory questions about the colors and patterns. As players were eliminated, they chose tables to form the season's Festie Besties pairs."},
    {week:3,type:"pov",name:"Woodstack",category:"physical",description:"Played in Festie Bestie pairs. Partners coordinated to stack large, uneven wooden logs into a balanced, free-standing tower that could hold itself up once they stepped away."},

    {week:4,type:"hoh",name:"The Invitation",category:"physical",description:"A festival-themed shuffleboard challenge. Houseguests slid oversized, weighted envelopes down a long slippery table, aiming to land them in high-scoring zones without sliding into the gutter."},
    {week:4,type:"pov",name:"Trippy Watch Party",category:"mental",description:"Played in pairs. Houseguests compared a baseline image against a slightly altered version on a giant tie-dye kaleidoscope screen, racing to spot the visual discrepancies."},

    {week:5,type:"hoh",name:"Mind Your Step",category:"physical",description:"A balance-and-assembly challenge. Houseguests walked narrow elevated beams to transfer 3D puzzle pieces one at a time to a build station, reconstructing a giant graphic design."},
    {week:5,type:"pov",name:"The OTB (On the Block)",category:"strategic",description:"A prize-and-punishment board game. Houseguests rolled balls down a ramp into numbered slots, balancing the push to win the Veto against tempting luxury prizes and grueling punishments along the way."},

    {week:6,type:"hoh",name:"Fly High, Sky High",category:"physical",description:"The classic endurance wall. Houseguests stood on narrow foot ledges against a tilting, festival-themed wall while being pelted with freezing water, slime and confetti; the last one holding on won HOH."},
    {week:6,type:"pov",name:"Punkaroo",category:"physical",description:"A giant rock-and-roll pinball machine. Houseguests manually angled a launch ramp, rolling balls to bounce off bumpers and land in high-scoring slots for the best cumulative score."},

    {week:7,type:"hoh-brochella",name:"Do You See the VIP?",category:"mental",splitGroup:"brochella",description:"Played only by the indoor Big BroChella group during the Split House twist. Houseguests briefly studied a chaotic, crowded concert image, then were quizzed on hidden VIP-guest details."},
    {week:7,type:"hoh-dyrefest",name:"Backyard Holdout",category:"physical",splitGroup:"dyrefest",description:"Played only by the outdoor Dyre Fest group, secluded to the backyard for the week. Houseguests stood on a vibrating platform, gripping a single overhead handle; the last one standing won HOH for the outdoor group."},
    {week:7,type:"pov-brochella",name:"One, Two, Three, VIP",category:"strategic",splitGroup:"brochella",description:"Played by the indoor group. Houseguests used logic clues at interlocking festival-lineup puzzle stations to determine the exact scheduling order of the VIP guests."},
    {week:7,type:"pov-dyrefest",name:"Lunch is Served",category:"physical",splitGroup:"dyrefest",description:"Played by the outdoor group with a rustic, DIY setup. Houseguests built a tower of oversized food replicas on a handheld tray while balancing on a narrow beam, without dropping any of it."},

    {week:8,type:"hoh",name:"Carni-Small (Slippery Slope)",category:"physical",description:"The classic slip-and-slide competition. Houseguests ran and slid down an oil-slicked runway, scooping liquid with a shot glass and depositing it into a giant funnel to release a floating ping-pong ball."},
    {week:8,type:"pov",name:"Microbrews",category:"physical",description:"Using two independent ropes attached to a small ring, houseguests gently cradled a ball up the face of a massive vertical board dotted with holes, aiming for the winning slot at the top."},

    {week:9,type:"hoh",name:"Red, White, and Bloom",category:"mental",description:"A head-to-head bracket trivia quiz. Two houseguests at a time viewed a rapid sequence of colored festival flowers and were quizzed on what they saw; the fastest correct buzz-in knocked out their opponent."},
    {week:9,type:"pov",name:"BB Comics",category:"mental",description:"An individual time-trial. Houseguests ziplined past a studio window to memorize a wall of custom superhero comic covers featuring the cast, then arranged a matching set on a display board, watching for near-identical fakes."},

    {week:10,type:"hoh",name:"BB Horror Fest",category:"physical",description:"The house was blacked out and turned into a haunted maze. Houseguests entered one at a time with a flashlight, hunting for specific items; the fastest individual time to find them and escape won HOH."},
    {week:10,type:"pov",name:"Cruel Summer",category:"physical",description:"A high-speed spatial puzzle. The remaining houseguests raced to assemble a massive 3D block puzzle shaped like a retro boombox; first to lock every piece and buzz in won the Veto."},

    {week:11,type:"hoh",name:"Fashion Fest",category:"mental",description:"A final-four memory quiz. Houseguests watched a fast-paced montage of Julie Chen Moonves changing into outfits worn throughout the summer, then were quizzed on exact visual details of the clips and outfits."},
    {week:11,type:"pov",name:"Mathletes",category:"mental",description:"The Final 4 raced to solve numerical and mathematical puzzles built around specific quantities and events that occurred earlier in the season."},

    {week:12,type:"final-hoh-1",name:"Final HOH Part 1",category:"physical",description:"The final three houseguests hung on to massive, swinging rope handles as they spun and repeatedly smashed into a padded wall while sprayed with fluids. The last person still holding on advanced directly to Part 3."},
    {week:12,type:"final-hoh-2",name:"Final HOH Part 2",category:"mental",description:"The two houseguests who didn't win Part 1 raced individually in zipline harnesses, retrieving physical signs of the season's HOH and Veto competitions and sorting them into exact chronological order."},
    {week:12,type:"final-hoh-3",name:"Final HOH Part 3",category:"mental",description:"A live, eight-question A/B multiple-choice quiz between the winners of Parts 1 and 2, based on statements made by members of the jury."}
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
    "Festie Besties groups form at the Week 3 HOH and persist (shrinking as members are evicted) for the rest of the season",
    "Split House Double Eviction occurs in Week 7, splitting the house into BroChella and Dyre Fest",
    "Final 3 uses the three-part Final HOH format",
    "Custom relationships and alliances can be entered before simulation"
  ]
});

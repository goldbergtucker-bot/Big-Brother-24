window.BB24_CONFIG = {
  id: 'bb24',
  name: 'Big Brother 24',
  theme: 'Summer Festival',
  startingPlayers: 16,
  jurySize: 9,
  juryStartAfterEvictions: 5,
  nominationCount: 2,
  finaleFinalists: 3,
  seasonStart: '2022-07-06',
  seasonEnd: '2022-09-25',
  twists: [
    {
      id: 'backstage-boss',
      name: 'Backstage Boss',
      active: true,
      cancelled: false,
      weeks: [1],
      description: 'A Backstage Boss selects three Houseguests to be Backstage for Week 1. The three Backstage Houseguests cannot compete in competitions or vote, but remain eligible for eviction. One of the three always self-evicts before the planned eviction mechanism can occur.',
      mechanics: ['A Backstage Boss is selected at the start of Week 1.', 'The Backstage Boss selects three Houseguests for the Backstage.', 'The three Backstage Houseguests cannot compete in competitions or vote.', 'The three Backstage Houseguests cannot be nominated, but remain eligible to leave through the Backstage eviction mechanism.', 'One of the three Backstage Houseguests always self-evicts during Week 1.', 'The twist is shown and played as an active twist, but its planned eviction mechanism never occurs because of the self-eviction.']
    },
    {
      id: 'festie-besties',
      name: 'Festie Besties',
      active: true,
      weeks: [3, 4, 5],
      description: 'Houseguests are paired into Bestie groups. Nominations and veto safety are tied to the Bestie group while the twist is active.',
      mechanics: ['The Week 3 HOH competition creates the Bestie groups.', 'The HOH nominates a Bestie group rather than two unrelated individuals.', 'A Bestie group nominated together competes together for veto safety.', 'If a partner leaves, the surviving Houseguest can join another group, creating a trio.', 'If a trio or larger group is nominated, all members are on the block and participate in the veto.']
    },
    {
      id: 'split-house',
      name: 'Split House Double Eviction',
      active: true,
      weeks: [7],
      description: 'The house splits into Big BroChella and Dyre Fest. Each side is isolated and plays its own HOH, nominations, Power of Veto and eviction.',
      mechanics: ['The final 10 are divided into two groups of five.', 'Big BroChella remains inside while Dyre Fest is isolated in the backyard.', 'The groups cannot communicate during the split.', 'Each side has its own HOH, two nominees, POV and eviction.', 'Two Houseguests are evicted during the same Double Eviction week.', 'The two groups reunite after the simultaneous evictions.']
    }
  ],
  besties: {
    week3: [
      ['Alyssa', 'Indy'], ['Ameerah', 'Terrance'], ['Brittany', 'Michael'],
      ['Daniel', 'Kyle'], ['Jasmine', 'Turner'], ['Joseph', 'Monte'], ['Nicole', 'Taylor']
    ],
    week4AfterAmeerah: [['Alyssa','Indy'], ['Brittany','Michael'], ['Daniel','Kyle'], ['Jasmine','Turner'], ['Joseph','Monte','Terrance'], ['Nicole','Taylor']],
    week5AfterNicole: [['Alyssa','Indy','Taylor'], ['Brittany','Michael'], ['Daniel','Kyle'], ['Jasmine','Turner'], ['Joseph','Monte','Terrance']]
  },
  weeks: {
    1: { format: 'normal', hoh: 'Drumming for Power', pov: 'Ren Fest', eviction: false, notes: 'Paloma walked; Week 1 eviction was cancelled.' },
    2: { format: 'normal', hoh: 'The BB Pie Fest', pov: 'Mermaid Fest', eviction: true },
    3: { format: 'festie-besties', hoh: 'Get Lit', pov: 'Woodstack', eviction: true },
    4: { format: 'festie-besties', hoh: 'The Invitation', pov: 'Trippy Watch Party', eviction: true },
    5: { format: 'festie-besties', hoh: 'Mind Your Step', pov: 'OTEV the Singing Stageroach', eviction: true },
    6: { format: 'normal', hoh: 'Conspiracy Fest', pov: 'Punkaroo', eviction: true },
    7: { format: 'split-house', hoh: 'Do You See The VIP?', pov: { bigBroChella: 'Pride Slide', dyreFest: 'Lunch is Served' }, eviction: true, doubleEviction: true },
    8: { format: 'normal', hoh: 'Carni-Small', pov: 'One, Two, Three, VIP', eviction: true },
    9: { format: 'normal', hoh: 'Burning Bot', pov: 'BB Comics', eviction: true },
    '9.5': { format: 'double-eviction', hoh: 'Laser Focus', pov: 'Amp It Up', eviction: true },
    10: { format: 'normal', hoh: 'Horror Fest Lockdown', pov: 'Snooze Fest', eviction: true },
    11: { format: 'normal', hoh: 'Fashion Fest', pov: 'Mathletes', eviction: true },
    12: { format: 'final-four', hoh: 'Wiener-Palooza', pov: null, eviction: true },
    13: { format: 'finale', finalHOH: ['Wiener-Palooza','Festival Lineup','Jury Fest'] }
  }
};

window.BB24_HOUSEGUESTS = Array.from({length:16}, (_, i) => ({
  id: `bb24-${i+1}`, firstName: '', lastName: '', nickname: '', gender: '', imageUrl: '', portraitUrl: '',
  status: 'Active', stats: { physical: 5, mental: 5, social: 5, strategy: 5 }, relationships: {}, alliances: [], bestieGroup: null
}));

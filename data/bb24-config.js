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
      active: false,
      cancelled: true,
      weeks: [1],
      description: 'Originally planned for Week 1. The twist was cancelled after Paloma Aguilar left the game; no Backstage eviction took place.'
    },
    {
      id: 'festie-besties',
      name: 'Festie Besties',
      active: true,
      weeks: [3, 4, 5],
      description: 'Houseguests are paired into Bestie groups. Nominations are made by group, and veto results apply to the nominated group.'
    },
    {
      id: 'split-house',
      name: 'Split House Double Eviction',
      active: true,
      weeks: [7],
      description: 'The house splits into Big BroChella and Dyre Fest. Each side has its own HOH, nominations, veto and eviction.'
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

window.BB24_HOUSEGUESTS = [
  ['Daniel','Durston','Daniel'], ['Alyssa','Snider','Alyssa'], ['Ameerah','Jones','Ameerah'],
  ['Brittany','Hoopes','Brittany'], ['Indy','Santos','Indy'], ['Jasmine','Davis','Jasmine'],
  ['Joe','Pooch','Pooch'], ['Joseph','Abdin','Joseph'], ['Kyle','Capener','Kyle'],
  ['Michael','Bruner','Michael'], ['Monte','Taylor','Monte'], ['Nicole','Layog','Nicole'],
  ['Paloma','Aguilar','Paloma'], ['Taylor','Hale','Taylor'], ['Terrance','Higgins','Terrance'],
  ['Turner','McDonald','Turner']
].map(([firstName,lastName,nickname], i) => ({
  id: `bb24-${i+1}`,
  firstName, lastName, nickname,
  imageUrl: '',
  status: 'Active',
  stats: { physical: 5, mental: 5, social: 5, strategy: 5 },
  relationships: {},
  alliances: [],
  bestieGroup: null
}));

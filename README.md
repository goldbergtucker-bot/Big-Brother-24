[README.md](https://github.com/user-attachments/files/32319740/README.md)
# Big Brother 24 Custom Simulator

A BrantSteele-style simulator for Big Brother 24: build your own 16-person
custom cast, portraits, ratings, starting relationships and alliances, then
simulate the full season — official BB24 competitions and twists included —
one event at a time.

## Implemented gameplay

- **Backstage Boss (Week 1):** all 16 houseguests draw a ticket; one becomes
  the Backstage Boss and sits out the week entirely. The Boss secretly hands
  out three Backstage Passes, America saves one of the three, the Boss
  privately saves a second, and the last unsaved Backstage houseguest faces
  the house's eviction-night evictee in a "Hit the Road" duel — only one of
  the two leaves the game.
- **Festie Besties (Week 3 onward):** houseguests pair up (with one trio if
  the cast is odd) at the Week 3 HOH. From then on, nominations, the POV
  player pool (waived past six players for a nominated trio/quartet), veto
  saves, and replacement nominees are all decided at the *group* level — only
  one member of a nominated group is actually evicted each week.
- **Split House Double Eviction (Week 7):** the house divides into two
  groups that each run a fully separate HOH → Nominations → Veto → Eviction
  cycle the same night, with no shared information between the two sides.
- Official BB24 competition names, types and descriptions for every HOH and
  POV of the season, plus the three-part Final HOH.
- Nine-member jury (11th through 3rd place), Final 3, jury vote, and
  $750,000 / $75,000 / $50,000 finale prize settings.
- Editable starting relationships and custom alliances, portraits, and full
  event history with a BrantSteele-style reveal timeline.

## Known simplifications

A few real-broadcast edge cases are not reproduced exactly, since this is a
fully playable engine for a *custom* cast rather than a re-enactment of one
specific season:

- The real Backstage Boss twist was cancelled mid-week after a contestant
  walked from the game; this simulator always plays the twist out in full.
- Festie Besties groups here only shrink as members are evicted — they don't
  occasionally re-merge or re-pair later in the season the way a couple of
  real-season storylines did.
- The backdoor-planning logic BB23's engine used for individual nominees
  isn't carried over, since BB24's group nominations don't map onto it
  cleanly.

## Files

- `data/bb24-config.js` — cast defaults, the full competition schedule, and
  twist metadata.
- `engine/game-state.js` — initial state shape.
- `engine/competitions.js` — generic competition simulator, reads the season
  config's schedule.
- `engine/relationships.js` — alliance/relationship AI (nominations, votes,
  veto use, jury votes).
- `engine/season-engine.js` — the season simulator: Backstage Boss, Festie
  Besties, Split House, standard weeks, and the finale.
- `engine/live-feeds.js` — optional daily live-feed story generator.
- `app.js` / `index.html` / `style.css` — UI.

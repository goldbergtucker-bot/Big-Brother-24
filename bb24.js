/*
 * BIG BROTHER 24 — SEASON TEMPLATE + SEASON-SPECIFIC RULES
 * Built as an extension layer for the existing BB simulator.
 *
 * Historical BB24 competition/twist data is kept here so the core simulator
 * can continue to support custom seasons and other templates.
 */
(function () {
    "use strict";

    const BB24 = {
        id: "bb24",
        name: "Big Brother 24",
        startingPlayers: 16,
        nominationCount: 2,
        jurySize: 9,
        seasonLength: 13,
        doubleEvictionWeeks: [9],
        splitHouseWeek: 7,

        competitions: {
            1: { hoh: "Drumming for Power", pov: "Ren Fest" },
            2: { hoh: "The BB Pie Fest", pov: "Mermaid Fest" },
            3: { hoh: "Get Lit", pov: "Woodstack", besties: true },
            4: { hoh: "The Invitation", pov: "Trippy Watch Party", besties: true },
            5: { hoh: "Mind Your Step", pov: "OTEV the Singing Stageroach", besties: true },
            6: { hoh: "Conspiracy Fest", pov: "Punkaroo" },
            7: { hoh: "Do You See The VIP?", pov: "One, Two, Three, VIP", splitHouse: true, secondPov: "Lunch is Served" },
            8: { hoh: "Carni-Small", pov: "Pride Slide" },
            9: { hoh: "Burning Bot", pov: "BB Comics", doubleEviction: true, secondHOH: "Laser Focus", secondPOV: "Amp It Up" },
            10: { hoh: "Horror Fest Lockdown", pov: "Snooze Fest" },
            11: { hoh: "Fashion Fest", pov: "Mathletes" },
            12: {
                hoh: "Wiener-Palooza",
                finalHOH: ["Wiener-Palooza", "Festival Lineup", "Jury Fest"]
            }
        },

        descriptions: {
            "Drumming for Power": "Houseguests competed in a rhythm-based opening Head of Household challenge, keeping time and completing the required sequence to earn power.",
            "Ren Fest": "Players raced through a Renaissance-fair themed challenge involving a mounted course and collecting the required pieces before completing the final task.",
            "The BB Pie Fest": "Houseguests answered questions about the BB Motel by digging through pies to find the correct true-or-false answer.",
            "Mermaid Fest": "Players moved a pearl through a mermaid-themed ramp and bowling-style course, with the first player to complete the required set winning the Veto.",
            "Get Lit": "A physical Head of Household competition built around lighting and balancing elements in the BB Fest setting.",
            "Woodstack": "Bestie teams worked together on a height-based puzzle challenge, with the fastest team earning the Power of Veto.",
            "The Invitation": "Houseguests navigated a party-invitation themed Head of Household challenge requiring speed, balance and accuracy.",
            "Trippy Watch Party": "Players answered visual and memory questions from a distorted watch-party presentation, with the fastest correct players advancing.",
            "Mind Your Step": "A balance and precision Head of Household competition requiring players to carefully navigate a hazardous path.",
            "OTEV the Singing Stageroach": "OTEV returned as the Singing Stageroach. Players retrieved the correct answers and returned to the stage before their opponents.",
            "Conspiracy Fest": "A BB Fest themed Head of Household competition combining observation, memory and conspiracy-style clues.",
            "Punkaroo": "Players competed in a Punkaroo-themed competition featuring multiple rounds and prizes, with the Power of Veto among the available outcomes.",
            "Do You See The VIP?": "The opening competition of the Split House week determined the two Heads of Household who would lead the two sides of the house.",
            "One, Two, Three, VIP": "A Big BroChella Veto competition based on a numbered VIP challenge and memory/observation skills.",
            "Lunch is Served": "A Dyre Fest Veto competition in which players transported a large number of food containers without dropping them.",
            "Carni-Small": "A carnival-themed competition combining precision, speed and balance.",
            "Pride Slide": "Players raced through a slippery Pride-themed course while completing the required task at the end.",
            "Burning Bot": "A speed-and-memory Head of Household competition requiring players to identify and assemble the correct sequence.",
            "BB Comics": "Houseguests raced through comic-book covers based on their season, identifying the correct images and arranging them in the required order.",
            "Laser Focus": "A memory competition involving sequences of colored lights. Players reproduced increasingly difficult sequences to remain in the game.",
            "Amp It Up": "Players untangled and connected their cable through a rotating apparatus, racing to reach and power their amplifier.",
            "Horror Fest Lockdown": "A Halloween/Horror Fest themed Head of Household competition combining memory and precision.",
            "Snooze Fest": "A sleepover-themed Veto competition requiring players to solve the challenge while racing against the clock.",
            "Fashion Fest": "A fashion-themed Head of Household competition combining observation, memory and speed.",
            "Mathletes": "Players solved mathematical problems under pressure, advancing through rounds until one player remained.",
            "Wiener-Palooza": "The Final HOH Part 1 was an endurance competition in which the Final 3 battled to remain on the course the longest.",
            "Festival Lineup": "The Final HOH Part 2 was a timed competition combining physical navigation and memory/precision tasks.",
            "Jury Fest": "The Final HOH Part 3 was the final two-player jury/season knowledge competition used to determine the last Head of Household."
        },

        twists: [
            {
                id: "bb24-backstage",
                name: "Backstage Boss",
                startWeek: 1,
                endWeek: 1,
                active: false,
                effectType: "display",
                description: "A Week 1 Backstage Boss twist was introduced at move-in. Pooch became the Backstage Boss and selected Alyssa, Brittany and Paloma. The twist was cancelled after Paloma left the game, so it should not alter the simulation beyond being displayed as a historical twist."
            },
            {
                id: "bb24-festie-besties",
                name: "Festie Besties",
                startWeek: 3,
                endWeek: 5,
                active: true,
                effectType: "festieBesties",
                description: "From Weeks 3–5, Houseguests compete in Bestie groups. The HOH's Bestie group is immune. The HOH nominates another Bestie group, and the nominated group competes for the Veto as a unit. If the Veto is used, the whole nominated group is saved and a replacement Bestie group is nominated. After an eviction, the surviving Bestie can choose a new Bestie, allowing groups to become trios."
            },
            {
                id: "bb24-split-house",
                name: "Split House — Big BroChella / Dyre Fest",
                startWeek: 7,
                endWeek: 7,
                active: true,
                effectType: "splitHouse",
                description: "Week 7 splits the remaining Houseguests into two groups. The first- and second-place finishers in the opening HOH become the two HOHs, and the HOHs select their groups. Each side plays its own HOH, nominations, Veto and eviction cycle without contact with the other side."
            }
        ]
    };

    window.BB24 = BB24;

    // Add/repair the template definition without replacing other season formats.
    if (typeof seasonTemplates !== "undefined") {
        seasonTemplates.bb24 = {
            name: BB24.name,
            startingPlayers: BB24.startingPlayers,
            nominationCount: BB24.nominationCount,
            jurySize: BB24.jurySize,
            juryStartAfterEvictions: 7,
            seasonLength: BB24.seasonLength
        };
    }

    function bb24Description(name) {
        return BB24.descriptions[name] || "";
    }

    function bb24WeekData() {
        const data = BB24.competitions[currentWeek] || {};
        if (currentCycle === 2 && data.doubleEviction) {
            return {
                ...data,
                hoh: data.secondHOH || data.hoh,
                pov: data.secondPOV || data.pov
            };
        }
        return data;
    }

    // Competition lookup used by the existing engine.
    const originalGetCurrentWeekData = typeof getCurrentWeekData === "function" ? getCurrentWeekData : null;
    getCurrentWeekData = function () {
        if (selectedSeasonTemplate === "bb24") return bb24WeekData();
        return originalGetCurrentWeekData ? originalGetCurrentWeekData() : null;
    };

    const originalGetCurrentHOHCompetition = typeof getCurrentHOHCompetition === "function" ? getCurrentHOHCompetition : null;
    getCurrentHOHCompetition = function () {
        if (selectedSeasonTemplate === "bb24") return bb24WeekData().hoh || "Head of Household";
        return originalGetCurrentHOHCompetition ? originalGetCurrentHOHCompetition() : "Head of Household";
    };

    const originalGetCurrentPOVCompetition = typeof getCurrentPOVCompetition === "function" ? getCurrentPOVCompetition : null;
    getCurrentPOVCompetition = function () {
        if (selectedSeasonTemplate === "bb24") return bb24WeekData().pov || "Power of Veto";
        return originalGetCurrentPOVCompetition ? originalGetCurrentPOVCompetition() : "Power of Veto";
    };

    const originalGetFinalHOHCompetition = typeof getFinalHOHCompetition === "function" ? getFinalHOHCompetition : null;
    getFinalHOHCompetition = function (part) {
        if (selectedSeasonTemplate === "bb24") return BB24.competitions[12].finalHOH[part - 1];
        return originalGetFinalHOHCompetition ? originalGetFinalHOHCompetition(part) : "Final HOH";
    };

    // Give the simulator a BB24-aware season info panel.
    const originalUpdateSelectedSeasonInfo = typeof updateSelectedSeasonInfo === "function" ? updateSelectedSeasonInfo : null;
    updateSelectedSeasonInfo = function () {
        if (selectedSeasonTemplate !== "bb24") {
            if (originalUpdateSelectedSeasonInfo) originalUpdateSelectedSeasonInfo();
            return;
        }
        const el = $("selectedSeasonInfo");
        if (!el) return;
        let html = `<h3>${escapeHTML(BB24.name)}</h3>
            <p>Starting Houseguests: <strong>16</strong></p>
            <p>Nominees: <strong>2 normally</strong>; Bestie groups determine nominations in Weeks 3–5.</p>
            <p>Jury: <strong>7</strong></p>
            <hr><h4>Competition Schedule</h4>`;
        Object.entries(BB24.competitions).forEach(([week, d]) => {
            html += `<div><strong>Week ${week}</strong>: HOH — ${escapeHTML(d.hoh || "Finale")} | POV — ${escapeHTML(d.pov || "—")}${d.doubleEviction ? " | DOUBLE EVICTION" : ""}${d.splitHouse ? " | SPLIT HOUSE" : ""}</div>`;
        });
        html += `<hr><h4>Twists</h4>`;
        BB24.twists.forEach(t => html += `<div><strong>${escapeHTML(t.name)}</strong>: ${escapeHTML(t.description)}</div>`);
        el.innerHTML = html;
    };

    // --- Festie Besties ---------------------------------------------------
    function ensureBestieState() {
        window.bb24State = window.bb24State || { groups: [], split: null, week: null };
        const state = window.bb24State;
        const active = getActivePlayers();
        const ids = new Set(active.map(p => p.id));
        state.groups = (state.groups || []).map(g => g.filter(id => ids.has(id))).filter(g => g.length);
        return state;
    }

    function makeInitialBesties() {
        const state = ensureBestieState();
        const active = getActivePlayers().slice();
        active.sort(() => Math.random() - 0.5);
        state.groups = [];
        while (active.length) state.groups.push(active.splice(0, 2).map(p => p.id));
        state.week = 3;
    }

    function bestieGroupFor(id) {
        const state = ensureBestieState();
        return state.groups.find(g => g.includes(id)) || [];
    }

    function chooseBestieGroupsForWeek() {
        const state = ensureBestieState();
        const activeIds = new Set(getActivePlayers().map(p => p.id));
        state.groups = state.groups.map(g => g.filter(id => activeIds.has(id))).filter(g => g.length);

        // After an eviction, the surviving member of that group chooses a new
        // Bestie. For simulation purposes the choice is randomized from active
        // players not already in that group, matching the mechanic without
        // hard-coding a historical alliance outcome.
        while (state.groups.some(g => g.length === 1)) {
            const solo = state.groups.find(g => g.length === 1);
            const choices = getActivePlayers().filter(p => p.id !== solo[0] && !solo.includes(p.id));
            if (!choices.length) break;
            const choice = choices[Math.floor(Math.random() * choices.length)];
            const old = state.groups.find(g => g.includes(choice.id));
            if (old && old !== solo) {
                old.splice(old.indexOf(choice.id), 1);
                if (!old.length) state.groups = state.groups.filter(g => g !== old);
            }
            solo.push(choice.id);
        }
        state.week = currentWeek;
    }

    function bestieEligibleNominationGroups(hohId) {
        const hohGroup = bestieGroupFor(hohId);
        return ensureBestieState().groups.filter(g => g.length && !g.includes(hohId) && !g.some(id => g === hohGroup));
    }

    const originalMakeNominations = makeNominations;
    makeNominations = function () {
        if (selectedSeasonTemplate !== "bb24" || currentWeek < 3 || currentWeek > 5) {
            return originalMakeNominations();
        }

        if (currentWeek === 3 && !window.bb24State?.groups?.length) makeInitialBesties();
        if (currentWeek > 3) chooseBestieGroupsForWeek();

        const hoh = houseguests.find(p => p.id === currentHOH);
        if (!hoh) return;
        const choices = bestieEligibleNominationGroups(hoh.id);
        if (!choices.length) return originalMakeNominations();

        const chosenGroup = choices[Math.floor(Math.random() * choices.length)];
        nominees = chosenGroup.map(id => houseguests.find(p => p.id === id)).filter(Boolean);
        addEvent(`${getDisplayName(hoh)} nominated the Besties group: ${nominees.map(getDisplayName).join(" and ")}.`);
        setStage("povDraw");
    };

    const originalDrawPOVPlayers = drawPOVPlayers;
    drawPOVPlayers = function () {
        if (selectedSeasonTemplate !== "bb24" || currentWeek < 3 || currentWeek > 5) return originalDrawPOVPlayers();

        const hohGroup = bestieGroupFor(currentHOH);
        const nominatedGroup = nominees.map(p => p.id);
        const state = ensureBestieState();
        const otherGroups = state.groups.filter(g => !g.some(id => hohGroup.includes(id)) && !g.some(id => nominatedGroup.includes(id)));
        const third = otherGroups.length ? otherGroups[Math.floor(Math.random() * otherGroups.length)] : [];
        const groups = [hohGroup, nominatedGroup, third].filter(g => g.length);
        const ids = [...new Set(groups.flat())];
        povPlayers = ids.map(id => houseguests.find(p => p.id === id)).filter(Boolean);
        addEvent(`Festie Besties Veto players: ${povPlayers.map(getDisplayName).join(", ")}.`);
        setStage("pov");
    };

    const originalUsePOV = usePOV;
    usePOV = function () {
        if (selectedSeasonTemplate !== "bb24" || currentWeek < 3 || currentWeek > 5) return originalUsePOV();

        if (!povWinner) return setStage("evictionVoting");
        const nominatedWinner = nominees.some(p => p.id === povWinner.id);
        const useVeto = nominatedWinner || Math.random() < (0.25 + povWinner.social / 30);
        if (!useVeto) {
            addEvent(`${getDisplayName(povWinner)} chose not to use the Power of Veto.`);
            setStage("evictionVoting");
            return;
        }

        const savedGroup = bestieGroupFor(povWinner.id);
        // A Veto won by any member of a Bestie group can save the nominated group.
        const isInNominatedGroup = savedGroup.some(id => nominees.some(n => n.id === id));
        if (!isInNominatedGroup) {
            const remainingGroups = ensureBestieState().groups.filter(g => g.length && !g.some(id => nominees.some(n => n.id === id)) && !g.includes(currentHOH));
            const replacementGroup = remainingGroups[Math.floor(Math.random() * remainingGroups.length)] || [];
            nominees.forEach(n => { n.__bb24Saved = true; });
            nominees = [];
            if (replacementGroup.length) nominees = replacementGroup.map(id => houseguests.find(p => p.id === id)).filter(Boolean);
            addEvent(`${getDisplayName(povWinner)} used the Power of Veto to save the nominated Besties. ${nominees.map(getDisplayName).join(" and ")} were named as the replacement Besties.`);
        } else {
            addEvent(`${getDisplayName(povWinner)} used the Power of Veto, but the nominated Besties remain safe as a group.`);
        }
        setStage("evictionVoting");
    };

    // --- Split House Week 7 ----------------------------------------------
    function splitWeekSetup() {
        const active = getActivePlayers().slice();
        if (active.length < 10) return;
        active.sort(() => Math.random() - 0.5);
        const first = active[0], second = active[1];
        currentHOH = first.id;
        const groupA = [first, ...active.slice(2, 6)];
        const groupB = [second, ...active.slice(6, 10)];
        window.bb24State.split = {
            bigBroChella: { hoh: first.id, players: groupA.map(p => p.id), cycle: 1 },
            dyreFest: { hoh: second.id, players: groupB.map(p => p.id), cycle: 1 },
            side: "bigBroChella",
            completed: false
        };
        addEvent(`${getDisplayName(first)} and ${getDisplayName(second)} became the two Week 7 HOHs. The house is split between Big BroChella and Dyre Fest.`);
    }

    function activeForSplitSide(side) {
        const ids = new Set(window.bb24State.split?.[side]?.players || []);
        return getActivePlayers().filter(p => ids.has(p.id));
    }

    const originalRunHOH = runHOH;
    runHOH = function () {
        if (selectedSeasonTemplate === "bb24" && currentWeek === 7 && currentCycle === 1 && !window.bb24State?.split) {
            splitWeekSetup();
            // The first-place HOH leads Big BroChella; the second-place HOH is stored
            // as the Dyre Fest HOH. We immediately begin the Big BroChella side.
            setStage("nominations");
            return;
        }
        return originalRunHOH();
    };

    // During the split-house week, run one side at a time using the same engine.
    const originalGetActivePlayers = getActivePlayers;
    // We cannot safely replace getActivePlayers globally because many editor
    // systems depend on it. Instead, the split-week wrappers temporarily filter
    // the state while each event is being calculated.
    function withSplitSide(side, fn) {
        const split = window.bb24State?.split;
        if (!split) return fn();
        const allActive = getActivePlayers();
        const sideIds = new Set(split[side].players);
        const hidden = allActive.filter(p => !sideIds.has(p.id));
        hidden.forEach(p => { p.__bb24Hidden = p.status; p.status = "Evicted"; });
        const result = fn();
        hidden.forEach(p => { p.status = p.__bb24Hidden || "Active"; delete p.__bb24Hidden; });
        return result;
    }

    const originalMakeNominationsSplit = makeNominations;
    makeNominations = function () {
        if (selectedSeasonTemplate === "bb24" && currentWeek === 7 && window.bb24State?.split) {
            const side = window.bb24State.split.side;
            return withSplitSide(side, originalMakeNominationsSplit);
        }
        return originalMakeNominationsSplit();
    };

    const originalDrawPOVPlayersSplit = drawPOVPlayers;
    drawPOVPlayers = function () {
        if (selectedSeasonTemplate === "bb24" && currentWeek === 7 && window.bb24State?.split) {
            return withSplitSide(window.bb24State.split.side, originalDrawPOVPlayersSplit);
        }
        return originalDrawPOVPlayersSplit();
    };

    const originalRunPOVSplit = runPOV;
    runPOV = function () {
        if (selectedSeasonTemplate === "bb24" && currentWeek === 7 && window.bb24State?.split) {
            return withSplitSide(window.bb24State.split.side, originalRunPOVSplit);
        }
        return originalRunPOVSplit();
    };

    const originalUsePOVSplit = usePOV;
    usePOV = function () {
        if (selectedSeasonTemplate === "bb24" && currentWeek === 7 && window.bb24State?.split) {
            return withSplitSide(window.bb24State.split.side, originalUsePOVSplit);
        }
        return originalUsePOVSplit();
    };

    const originalPrepareEvictionVotes = prepareEvictionVotes;
    prepareEvictionVotes = function () {
        if (selectedSeasonTemplate === "bb24" && currentWeek === 7 && window.bb24State?.split) {
            return withSplitSide(window.bb24State.split.side, originalPrepareEvictionVotes);
        }
        return originalPrepareEvictionVotes();
    };

    // For Week 7, switch to the other side after the first side's eviction.
    const originalResolveEviction = resolveEviction;
    resolveEviction = function () {
        if (selectedSeasonTemplate === "bb24" && currentWeek === 7 && window.bb24State?.split) {
            const side = window.bb24State.split.side;
            return withSplitSide(side, () => {
                const before = getActivePlayers().length;
                originalResolveEviction();
                const split = window.bb24State.split;
                split[side].completed = true;
                const other = side === "bigBroChella" ? "dyreFest" : "bigBroChella";
                if (!split[other].completed) {
                    split.side = other;
                    currentHOH = split[other].hoh;
                    nominees = [];
                    povWinner = null;
                    povPlayers = [];
                    currentCycle = 1;
                    setStage("nominations");
                    addEvent(`The ${side === "bigBroChella" ? "Big BroChella" : "Dyre Fest"} eviction is complete. The ${other === "bigBroChella" ? "Big BroChella" : "Dyre Fest"} side now begins its eviction cycle.`);
                } else {
                    split.completed = true;
                    currentWeek = 8;
                    currentCycle = 1;
                    setStage("hoh");
                    addEvent("Both Split House evictions are complete. The house is reunited and Week 8 begins.");
                }
            });
        }
        return originalResolveEviction();
    };

    // Start-season override. All custom cast data remains untouched.
    const originalStartNewSeason = startNewSeason;
    startNewSeason = function () {
        if (selectedSeasonTemplate !== "bb24") return originalStartNewSeason();
        normalizeAllHouseguests();
        const template = seasonTemplates.bb24;
        if (houseguests.length !== 16) {
            if (!confirm(`Big Brother 24 expects 16 Houseguests, but you currently have ${houseguests.length}. Continue anyway?`)) return;
        }
        seasonStarted = true;
        currentWeek = 1;
        currentCycle = 1;
        currentHOH = null;
        nominees = [];
        povWinner = null;
        povPlayers = [];
        hackerWinner = null;
        hackerVoteNullified = null;
        hackerSelectedVetoPlayer = null;
        evictedHouseguests = [];
        jury = [];
        evictionHistory = [];
        voteHistory = [];
        battleBackUsed = false;
        finaleWinner = null;
        finalHOH = { part1:null, part2:null, part3:null, winner:null };
        window.bb24State = { groups: [], split: null, week: null };
        houseguests.forEach(player => {
            player.status = "Active";
            player.safety = false;
            player.app = null;
            player.punishment = null;
            player.appUsed = false;
            player.cloudAvailable = false;
            player.identityTheftAvailable = false;
            player.bonusLifeAvailable = false;
        });
        addEvent("Big Brother 24 has begun. The BB Fest format is active.");
        addEvent("The Backstage Boss twist is recorded for Week 1, but it does not alter the simulation because the twist was cancelled.");
        currentStage = "hoh";
        updateAllDisplays();
        showSection("game");
        saveGameSilently();
    };

    // Ensure BB24 final-three competitions are explicitly visible.
    const originalRunFinalHOHPart = runFinalHOHPart;
    runFinalHOHPart = function (part) {
        if (selectedSeasonTemplate === "bb24") {
            const old = getFinalHOHCompetition;
            getFinalHOHCompetition = p => BB24.competitions[12].finalHOH[p - 1];
            try { return originalRunFinalHOHPart(part); }
            finally { getFinalHOHCompetition = old; }
        }
        return originalRunFinalHOHPart(part);
    };

    // Make the visible format label useful while BB24 is selected.
    const oldUpdateFormat = typeof updateFormatStatus === "function" ? updateFormatStatus : null;
    if (typeof updateFormatStatus === "function") {
        updateFormatStatus = function () {
            if (selectedSeasonTemplate === "bb24") {
                const el = $("formatStatus");
                if (!el) return;
                if (currentWeek >= 3 && currentWeek <= 5) el.textContent = "Festie Besties";
                else if (currentWeek === 7) el.textContent = "Split House — Big BroChella / Dyre Fest";
                else if (currentWeek === 9 && currentCycle === 2) el.textContent = "Double Eviction";
                else el.textContent = "Normal Week";
                return;
            }
            oldUpdateFormat();
        };
    }

    // Expose a compact schedule for future extensions/debugging.
    window.BB24_COMPETITION_SCHEDULE = BB24.competitions;
    window.BB24_TWISTS = BB24.twists;
})();

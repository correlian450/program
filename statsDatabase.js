const StatsDatabase = {
    stats: [
        {
            name: "Aarakocra",
            stats: {
                size: "Medium",
                ac: "12",
                hp: "13 (3d8)",
                speed: "20 ft., fly 50 ft.",
                str: 10,
                dex: 14,
                con: 10,
                int: 11,
                wis: 12,
                cha: 11,
                skills: "Perception +5",
                senses: "passive Perception 15",
                languages: "Aarakocra, Auran",
                actions: [
                    { name: "Talon", description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 4 (1d4 + 2) slashing damage." }
                ],
                traits: [
                    { name: "Dive Attack", description: "If the aarakocra is flying and dives at least 30 feet straight toward a target and then hits it with a melee weapon attack, the attack deals an extra 3 (1d6) damage to the target." }
                ]
            }
        },
        {
            name: "Aboleth",
            stats: {
                size: "Large",
                ac: "17 (natural armor)",
                hp: "135 (18d10 + 36)",
                speed: "10 ft., swim 40 ft.",
                str: 21,
                dex: 9,
                con: 15,
                int: 18,
                wis: 15,
                cha: 18,
                savingThrows: "Con +6, Int +8, Wis +6",
                skills: "History +12, Perception +10",
                senses: "darkvision 120 ft., passive Perception 20",
                languages: "Deep Speech, telepathy 120 ft.",
                actions: [
                    { name: "Multiattack", description: "The aboleth makes three tentacle attacks." },
                    { name: "Tentacle", description: "Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 12 (2d6 + 5) bludgeoning damage. If the target is a creature, it must succeed on a DC 14 Constitution saving throw or become diseased." }
                ],
                traits: [
                    { name: "Amphibious", description: "The aboleth can breathe air and water." },
                    { name: "Mucous Cloud", description: "While underwater, the aboleth is surrounded by transformative mucus. A creature that touches the aboleth or that hits it with a melee attack while within 5 feet of it must make a DC 14 Constitution saving throw." }
                ],
                legendaryActions: [
                    { name: "Detect", description: "The aboleth makes a Wisdom (Perception) check." }
                ]
            }
        }
    ],

    addStats(statsEntry) {
        this.stats.push(statsEntry);
    },

    getStatsByName(name) {
        return this.stats.find(stat => stat.name === name)?.stats || {};
    }
};
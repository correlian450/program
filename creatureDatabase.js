const CreatureDatabase = {
    creatures: [
        {
            name: "Aarakocra",
            alignment: "neutral good",
            type: "humanoid",
            cr: 0.25
        },
        {
            name: "Aboleth",
            alignment: "lawful evil",
            type: "aberration",
            cr: 10
        }
    ],

    addCreature(creature) {
        this.creatures.push(creature);
    },

    getFilteredCreatures({ name, alignment, type, cr }) {
        return this.creatures.filter(creature => {
            let matches = true;
            if (name && !creature.name.toLowerCase().includes(name.toLowerCase())) {
                matches = false;
            }
            if (alignment && creature.alignment !== alignment) {
                matches = false;
            }
            if (type && creature.type !== type) {
                matches = false;
            }
            if (cr) {
                if (cr.includes('-')) {
                    const [min, max] = cr.split('-').map(Number);
                    if (creature.cr < min || creature.cr > max) {
                        matches = false;
                    }
                } else {
                    if (creature.cr !== Number(cr)) {
                        matches = false;
                    }
                }
            }
            return matches;
        });
    }
};
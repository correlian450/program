const LoreDatabase = {
    lore: [
        {
            name: "Aarakocra",
            lore: "Aarakocra are avian humanoids with a strong connection to the Elemental Plane of Air. They resemble large birds with humanoid features, covered in feathers and possessing powerful wings. Aarakocra are nomadic, often dwelling in high mountain peaks or floating cities. They value freedom and are wary of ground-dwellers, preferring the open sky."
        },
        {
            name: "Aboleth",
            lore: "Aboleths are ancient, aquatic aberrations that predate the gods themselves. These eel-like creatures lurk in subterranean lakes and oceans, wielding powerful psionic abilities to enslave other creatures. Aboleths possess vast intellects and memories that stretch back eons, harboring grudges against the divine beings that overthrew their primordial empires."
        }
    ],

    addLore(loreEntry) {
        this.lore.push(loreEntry);
    },

    getLoreByName(name) {
        return this.lore.find(lore => lore.name === name)?.lore || "No lore available.";
    }
};
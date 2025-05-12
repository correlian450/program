function searchCreatures() {
    const name = document.getElementById('name').value;
    const alignment = document.getElementById('alignment').value;
    const type = document.getElementById('type').value;
    const cr = document.getElementById('cr').value;
    const filteredCreatures = CreatureDatabase.getFilteredCreatures({ name, alignment, type, cr });
    UIModule.renderCreatureList(filteredCreatures, 'creatureList');
    UIModule.clearDetails();
}

// Initialize after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    UIModule.updateFavoritesTabState();
    UIModule.renderFavorites();
});
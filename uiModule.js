const UIModule = {
    favorites: JSON.parse(localStorage.getItem('favorites')) || [],

    toggleFavorite(creatureName) {
        const index = this.favorites.indexOf(creatureName);
        if (index === -1) {
            this.favorites.push(creatureName);
        } else {
            this.favorites.splice(index, 1);
        }
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.updateFavoritesTabState();
        this.renderFavorites();
        // Refresh current view if creature is displayed
        const details = document.getElementById('creatureDetails');
        if (details.classList.contains('active') && details.querySelector('h2')?.textContent === creatureName) {
            const creature = CreatureDatabase.creatures.find(c => c.name === creatureName);
            this.renderCreatureDetails(creature);
        }
        // Refresh search results if active
        if (document.getElementById('search')?.classList.contains('active')) {
            searchCreatures();
        }
    },

    updateFavoritesTabState() {
        const favoritesTab = document.getElementById('favoritesTab');
        if (favoritesTab) {
            if (this.favorites.length === 0) {
                favoritesTab.classList.add('disabled');
                favoritesTab.onclick = null;
            } else {
                favoritesTab.classList.remove('disabled');
                favoritesTab.onclick = () => this.switchContentTab('favorites', favoritesTab);
            }
        }
    },

    renderCreatureList(creatures, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with ID ${containerId} not found`);
            return;
        }
        container.innerHTML = '';
        creatures.forEach(creature => {
            const card = document.createElement('div');
            card.className = 'creature-card';
            card.innerHTML = `
                <h3>${creature.name}</h3>
                <p>Type: ${creature.type}</p>
                <p>Alignment: ${creature.alignment}</p>
                <p>CR: ${creature.cr}</p>
                <button class="favorite-btn ${this.favorites.includes(creature.name) ? 'favorited' : ''}" onclick="UIModule.toggleFavorite('${creature.name}')">
                    <i class="fas fa-star"></i>
                </button>
            `;
            card.onclick = (e) => {
                if (!e.target.closest('.favorite-btn')) {
                    this.renderCreatureDetails(creature);
                }
            };
            container.appendChild(card);
        });
    },

    renderFavorites() {
        if (!this.favorites) {
            console.error('Favorites array is undefined');
            return;
        }
        const favoriteCreatures = CreatureDatabase.creatures.filter(c => this.favorites.includes(c.name));
        this.renderCreatureList(favoriteCreatures, 'favoritesList');
    },

    // Helper function to generate tooltip HTML for dice rolls
    generateTooltipHtml(numCount, numDieSize, modValue, sign, modifier) {
        // Generate random rolls
        const rolls = Array.from({ length: numCount }, () => 
            Math.floor(Math.random() * numDieSize) + 1
        );
        const total = rolls.reduce((sum, roll) => sum + roll, 0) + modValue;

        // Build tooltip HTML
        let tooltipHtml = '<span class="dice-tooltip">';

        // Split rolls into rows of six
        const rollsPerRow = 6;
        for (let i = 0; i < rolls.length; i += rollsPerRow) {
            tooltipHtml += '<span class="dice-row">';
            const rowRolls = rolls.slice(i, i + rollsPerRow);
            rowRolls.forEach(roll => {
                tooltipHtml += `<span class="dice-box">${roll}</span>`;
            });
            // Add modifier to the last row of dice rolls
            if (i + rollsPerRow >= rolls.length && modValue !== 0) {
                tooltipHtml += `<span class="dice-modifier">${sign}${modifier}</span>`;
            }
            tooltipHtml += '</span>';
        }

        tooltipHtml += '<span class="total-row">';
        // Calculate range for coloring
        const minTotal = numCount + modValue;
        const maxTotal = numCount * numDieSize + modValue;
        const range = maxTotal - minTotal;
        const lowThreshold = minTotal + range * 0.25;
        const highThreshold = minTotal + range * 0.75;

        // Determine total color
        let totalColorClass = 'total-silver';
        if (total <= lowThreshold) {
            totalColorClass = 'total-red';
        } else if (total >= highThreshold) {
            totalColorClass = 'total-gold';
        }

        console.log(`Tooltip reroll: Count: ${numCount}, Die: ${numDieSize}, Mod: ${modValue}, Total: ${total}, Min: ${minTotal}, Max: ${maxTotal}, LowThreshold: ${lowThreshold}, HighThreshold: ${highThreshold}, Color: ${totalColorClass}`);

        tooltipHtml += `<span class="dice-total ${totalColorClass}">${total}</span>`;
        tooltipHtml += '</span></span>';

        return tooltipHtml;
    },

    // Helper function to process dice strings
    processDiceString(diceString) {
        // Match dice string (e.g., "18d10+36", "2d6", "1d8-2")
        const match = diceString.match(/(\d{1,2})d(\d{1,2})(?:([+-])(\d{1,2}))?/);
        if (!match) {
            console.log(`Invalid dice string: ${diceString}`);
            return diceString;
        }

        const [, count, dieSize, sign, modifier] = match;
        const numCount = parseInt(count);
        const numDieSize = parseInt(dieSize);
        const modValue = modifier ? parseInt(modifier) * (sign === '+' ? 1 : -1) : 0;

        // Calculate min and max for range display
        const minTotal = numCount + modValue;
        const maxTotal = numCount * numDieSize + modValue;

        // Generate initial tooltip HTML
        const tooltipHtml = this.generateTooltipHtml(numCount, numDieSize, modValue, sign, modifier);

        console.log(`Processed dice string: ${diceString}, Range: [${minTotal} - ${maxTotal}], Initial tooltip: ${tooltipHtml}`);
        // Include parentheses and min-max range in the displayed text
        return `<span class="dice-roll" data-count="${numCount}" data-die-size="${numDieSize}" data-mod-value="${modValue}" data-sign="${sign || ''}" data-modifier="${modifier || ''}">(${diceString})[${minTotal} - ${maxTotal}]${tooltipHtml}</span>`;
    },

    // Scan creature details for dice rolls and apply tooltips
    applyDiceTooltips() {
        const details = document.getElementById('creatureDetails');
        if (!details) {
            console.error('Creature details container not found');
            return;
        }

        // Get all text nodes within creatureDetails
        const walker = document.createTreeWalker(details, NodeFilter.SHOW_TEXT, {
            acceptNode: (node) => {
                return node.nodeValue.trim().length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        });
        const textNodes = [];
        let node;
        while ((node = walker.nextNode())) {
            textNodes.push(node);
        }

        // Process each text node for dice roll patterns
        textNodes.forEach(textNode => {
            const text = textNode.nodeValue;
            console.log(`Scanning text node: "${text}"`);
            // Simplified regex to match (XdX), (XdX + X), (XdX - X)
            const regex = /\((\d{1,2}d\d{1,2}(?:\s*[+-]\s*\d{1,2})?)\)/g;
            const matches = text.match(regex);
            if (matches) {
                console.log(`Regex matches in "${text}": ${matches.join(', ')}`);
                const parent = textNode.parentNode;
                const fragment = document.createDocumentFragment();
                let lastIndex = 0;

                // Reset regex for exec
                regex.lastIndex = 0;
                let match;
                while ((match = regex.exec(text))) {
                    const fullMatch = match[0]; // e.g., "(18d10 + 36)"
                    const diceString = match[1].replace(/\s+/g, ''); // e.g., "18d10+36"
                    console.log(`Found dice string: ${diceString} in ${fullMatch}`);
                    fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
                    const span = document.createElement('span');
                    span.innerHTML = this.processDiceString(diceString);
                    fragment.appendChild(span);
                    lastIndex = match.index + fullMatch.length;
                }

                fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
                parent.replaceChild(fragment, textNode);
            } else {
                console.log(`No dice roll matches in "${text}"`);
            }
        });

        // Add mouseover event listeners to reroll dice on hover
        const diceRolls = details.querySelectorAll('.dice-roll');
        diceRolls.forEach(roll => {
            roll.addEventListener('mouseover', () => {
                const numCount = parseInt(roll.dataset.count);
                const numDieSize = parseInt(roll.dataset.dieSize);
                const modValue = parseInt(roll.dataset.modValue) || 0;
                const sign = roll.dataset.sign;
                const modifier = roll.dataset.modifier;
                const tooltip = roll.querySelector('.dice-tooltip');
                if (tooltip) {
                    tooltip.innerHTML = this.generateTooltipHtml(numCount, numDieSize, modValue, sign, modifier);
                }
            });
        });
    },

    renderCreatureDetails(creature) {
        const stats = StatsDatabase.getStatsByName(creature.name);
        const lore = LoreDatabase.getLoreByName(creature.name);
        const details = document.getElementById('creatureDetails');
        if (!details) {
            console.error('Creature details container not found');
            return;
        }

        details.className = 'creature-details active';
        details.innerHTML = `
            <h2>${creature.name}</h2>
            <button class="favorite-btn ${this.favorites.includes(creature.name) ? 'favorited' : ''}" onclick="UIModule.toggleFavorite('${creature.name}')">
                <i class="fas fa-star"></i>
            </button>
            <div class="tabs">
                <div class="tab active" onclick="UIModule.switchTab('stats', this)">Stats</div>
                <div class="tab" onclick="UIModule.switchTab('lore', this)">Lore</div>
            </div>
            <div id="stats" class="tab-content active">
                <div class="stat-block">
                    <p><strong>Size:</strong> ${stats.size || 'N/A'}</p>
                    <p><strong>AC:</strong> ${stats.ac || 'N/A'}</p>
                    <p><strong>HP:</strong> ${stats.hp || 'N/A'}</p>
                    <p><strong>Speed:</strong> ${stats.speed || 'N/A'}</p>
                    <div class="abilities">
                        <span><strong>STR:</strong> ${stats.str || 'N/A'}</span>
                        <span><strong>DEX:</strong> ${stats.dex || 'N/A'}</span>
                        <span><strong>CON:</strong> ${stats.con || 'N/A'}</span>
                        <span><strong>INT:</strong> ${stats.int || 'N/A'}</span>
                        <span><strong>WIS:</strong> ${stats.wis || 'N/A'}</span>
                        <span><strong>CHA:</strong> ${stats.cha || 'N/A'}</span>
                    </div>
                    ${stats.savingThrows ? `<p><strong>Saving Throws:</strong> ${stats.savingThrows}</p>` : ''}
                    ${stats.skills ? `<p><strong>Skills:</strong> ${stats.skills}</p>` : ''}
                    <p><strong>Senses:</strong> ${stats.senses || 'N/A'}</p>
                    <p><strong>Languages:</strong> ${stats.languages || 'N/A'}</p>
                    ${stats.traits?.length ? `
                        <h3>Traits</h3>
                        <div class="traits">
                            ${stats.traits.map((trait, index) => `
                                <span class="trait">
                                    <strong>${trait.name}</strong>
                                    <span class="trait-tooltip">${trait.description}</span>
                                    ${index < stats.traits.length - 1 ? '<span class="trait-separator"> · </span>' : ''}
                                </span>
                            `).join('')}
                        </div>
                    ` : ''}
                    ${stats.actions?.length ? `<h3>Actions</h3>${stats.actions.map(action => `<p><strong>${action.name}:</strong> ${action.description}</p>`).join('')}` : ''}
                    ${stats.legendaryActions?.length ? `<h3>Legendary Actions</h3>${stats.legendaryActions.map(action => `<p><strong>${action.name}:</strong> ${action.description}</p>`).join('')}` : ''}
                </div>
            </div>
            <div id="lore" class="tab-content">
                <p>${lore}</p>
            </div>
        `;

        // Apply dice tooltips after DOM is updated
        setTimeout(() => this.applyDiceTooltips(), 0);
    },

    switchTab(tabId, element) {
        const creatureDetails = document.getElementById('creatureDetails');
        if (!creatureDetails) return;
        const tabs = creatureDetails.querySelectorAll('.tab');
        const contents = creatureDetails.querySelectorAll('.tab-content');
        tabs.forEach(tab => tab.classList.remove('active'));
        contents.forEach(content => content.classList.remove('active'));
        element.classList.add('active');
        const selectedContent = creatureDetails.querySelector(`#${tabId}`);
        if (selectedContent) {
            selectedContent.classList.add('active');
        }
    },

    switchContentTab(tabId, element) {
        if (element.classList.contains('disabled')) return;
        const contentArea = document.querySelector('.content-area');
        if (!contentArea) return;
        const tabs = contentArea.parentElement.querySelectorAll('.content-tabs .tab');
        const contents = contentArea.querySelectorAll('.content-tab');
        tabs.forEach(tab => tab.classList.remove('active'));
        contents.forEach(content => content.classList.remove('active'));
        element.classList.add('active');
        const selectedContent = contentArea.querySelector(`#${tabId}`);
        if (selectedContent) {
            selectedContent.classList.add('active');
        }
        if (tabId === 'favorites') {
            this.renderFavorites();
        }
    },

    clearDetails() {
        const details = document.getElementById('creatureDetails');
        if (details) {
            details.className = 'creature-details';
            details.innerHTML = '';
        }
    }
};
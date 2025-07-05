// Fantasy Slot Quest - Game Logic with PuterJS Integration

class FantasySlotGame {
    constructor() {
        // Game state
        this.gold = 1000;
        this.highScore = 0;
        this.level = 1;
        this.currentBet = 25;
        this.isSpinning = false;
        this.isLoggedIn = false;
        this.username = 'Guest';
        this.totalSpins = 0;
        this.totalWins = 0;
        this.biggestWin = 0;

        // Slot symbols with their values and rarities
        this.symbols = [
            { emoji: '🐉', value: 1000, weight: 1, name: 'Dragon' },
            { emoji: '👑', value: 500, weight: 2, name: 'Crown' },
            { emoji: '🧙‍♂️', value: 250, weight: 3, name: 'Wizard' },
            { emoji: '💎', value: 200, weight: 4, name: 'Diamond' },
            { emoji: '🔮', value: 150, weight: 5, name: 'Crystal Ball' },
            { emoji: '⚔️', value: 100, weight: 6, name: 'Sword' },
            { emoji: '🏰', value: 75, weight: 7, name: 'Castle' },
            { emoji: '🛡️', value: 50, weight: 8, name: 'Shield' },
            { emoji: '🗡️', value: 25, weight: 9, name: 'Blade' }
        ];

        // Achievement system
        this.achievements = [
            { id: 'first_spin', name: 'First Adventure', desc: 'Spin the reels for the first time', icon: '🎰', unlocked: false },
            { id: 'first_win', name: 'Lucky Beginner', desc: 'Win your first spin', icon: '🍀', unlocked: false },
            { id: 'big_win', name: 'Dragon Slayer', desc: 'Win 1000+ gold in a single spin', icon: '🐉', unlocked: false },
            { id: 'level_5', name: 'Seasoned Adventurer', desc: 'Reach level 5', icon: '⚔️', unlocked: false },
            { id: 'high_roller', name: 'High Roller', desc: 'Bet 250 gold in a single spin', icon: '💰', unlocked: false },
            { id: 'triple_dragon', name: 'Dragon Master', desc: 'Get three dragons in a row', icon: '🐲', unlocked: false },
            { id: 'spin_master', name: 'Spin Master', desc: 'Complete 100 spins', icon: '🎯', unlocked: false },
            { id: 'gold_hoarder', name: 'Gold Hoarder', desc: 'Accumulate 10,000 gold', icon: '💎', unlocked: false }
        ];

        // Initialize game
        this.init();
    }

    async init() {
        this.showLoading(true);

        try {
            // Initialize PuterJS and check authentication
            await this.initializePuter();

            // Load saved game data
            await this.loadGameData();

            // Setup event listeners
            this.setupEventListeners();

            // Initialize achievements display
            this.renderAchievements();

            // Update UI
            this.updateUI();

            // Add welcome message
            this.addLogEntry('🌟 Welcome to Fantasy Slot Quest! Your adventure begins...');

        } catch (error) {
            console.error('Game initialization error:', error);
            this.addLogEntry('⚠️ Game loaded in offline mode. Login to save progress.');
        } finally {
            this.showLoading(false);
        }
    }

    async initializePuter() {
        try {
            // Check if user is already signed in
            if (puter.auth && await puter.auth.isSignedIn()) {
                const user = await puter.auth.getUser();
                this.isLoggedIn = true;
                this.username = user.username || user.email || 'Player';
                this.updateAuthUI();
                this.addLogEntry(`👋 Welcome back, ${this.username}!`);
            }
        } catch (error) {
            console.error('PuterJS initialization error:', error);
        }
    }

    async loadGameData() {
        if (!this.isLoggedIn) return;

        try {
            // Load game state from PuterJS KV store
            const savedGold = await puter.kv.get('fantasy_slot_gold');
            const savedHighScore = await puter.kv.get('fantasy_slot_high_score');
            const savedLevel = await puter.kv.get('fantasy_slot_level');
            const savedAchievements = await puter.kv.get('fantasy_slot_achievements');
            const savedStats = await puter.kv.get('fantasy_slot_stats');

            if (savedGold !== null) this.gold = parseInt(savedGold);
            if (savedHighScore !== null) this.highScore = parseInt(savedHighScore);
            if (savedLevel !== null) this.level = parseInt(savedLevel);
            if (savedStats !== null) {
                const stats = JSON.parse(savedStats);
                this.totalSpins = stats.totalSpins || 0;
                this.totalWins = stats.totalWins || 0;
                this.biggestWin = stats.biggestWin || 0;
            }
            if (savedAchievements !== null) {
                const achievements = JSON.parse(savedAchievements);
                this.achievements.forEach(achievement => {
                    if (achievements[achievement.id]) {
                        achievement.unlocked = true;
                    }
                });
            }

            this.addLogEntry('💾 Game progress loaded successfully!');
        } catch (error) {
            console.error('Error loading game data:', error);
            this.addLogEntry('⚠️ Could not load saved progress.');
        }
    }

    async saveGameData() {
        if (!this.isLoggedIn) return;

        try {
            // Save game state to PuterJS KV store
            await puter.kv.set('fantasy_slot_gold', this.gold.toString());
            await puter.kv.set('fantasy_slot_high_score', this.highScore.toString());
            await puter.kv.set('fantasy_slot_level', this.level.toString());

            // Save achievements
            const achievementData = {};
            this.achievements.forEach(achievement => {
                achievementData[achievement.id] = achievement.unlocked;
            });
            await puter.kv.set('fantasy_slot_achievements', JSON.stringify(achievementData));

            // Save stats
            const stats = {
                totalSpins: this.totalSpins,
                totalWins: this.totalWins,
                biggestWin: this.biggestWin
            };
            await puter.kv.set('fantasy_slot_stats', JSON.stringify(stats));

        } catch (error) {
            console.error('Error saving game data:', error);
        }
    }

    setupEventListeners() {
        // Authentication buttons
        document.getElementById('login-btn').addEventListener('click', () => this.handleLogin());
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());

        // Game controls
        document.getElementById('spin-btn').addEventListener('click', () => this.spin());
        document.getElementById('max-bet-btn').addEventListener('click', () => this.maxBet());
        document.getElementById('bet-amount').addEventListener('change', (e) => {
            this.currentBet = parseInt(e.target.value);
        });

        // Close win display on click
        document.getElementById('win-display').addEventListener('click', () => {
            document.getElementById('win-display').classList.add('hidden');
        });
    }

    async handleLogin() {
        try {
            this.showLoading(true);

            // Use PuterJS authentication
            await puter.ui.authenticateWithPuter();

            // Check if authentication was successful
            if (await puter.auth.isSignedIn()) {
                const user = await puter.auth.getUser();
                this.isLoggedIn = true;
                this.username = user.username || user.email || 'Player';
                this.updateAuthUI();

                // Load saved data
                await this.loadGameData();
                this.updateUI();

                this.addLogEntry(`🎉 Successfully logged in as ${this.username}!`);
                this.addLogEntry('💾 Your progress will now be saved automatically.');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.addLogEntry('❌ Login failed. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    async handleLogout() {
        try {
            await puter.auth.signOut();
            this.isLoggedIn = false;
            this.username = 'Guest';
            this.updateAuthUI();
            this.addLogEntry('👋 Logged out successfully. Progress will not be saved.');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    updateAuthUI() {
        const loginBtn = document.getElementById('login-btn');
        const userDisplay = document.getElementById('user-display');
        const usernameSpan = document.getElementById('username');

        if (this.isLoggedIn) {
            loginBtn.classList.add('hidden');
            userDisplay.classList.remove('hidden');
            usernameSpan.textContent = `👤 ${this.username}`;
        } else {
            loginBtn.classList.remove('hidden');
            userDisplay.classList.add('hidden');
        }
    }

    updateUI() {
        document.getElementById('gold-amount').textContent = this.gold.toLocaleString();
        document.getElementById('high-score').textContent = this.highScore.toLocaleString();
        document.getElementById('player-level').textContent = this.level;

        // Update bet amount selector
        document.getElementById('bet-amount').value = this.currentBet;

        // Disable spin button if not enough gold
        const spinBtn = document.getElementById('spin-btn');
        spinBtn.disabled = this.gold < this.currentBet || this.isSpinning;

        // Check for level up
        const requiredGold = this.level * 1000;
        if (this.gold >= requiredGold && this.level < 10) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.addLogEntry(`🎊 Level Up! You are now level ${this.level}!`);

        // Add level up visual effect
        const statsPanel = document.querySelector('.stats-panel');
        statsPanel.classList.add('level-up');
        setTimeout(() => statsPanel.classList.remove('level-up'), 2000);

        // Check level achievements
        if (this.level === 5) {
            this.unlockAchievement('level_5');
        }

        this.saveGameData();
    }

    maxBet() {
        const maxBetOptions = [10, 25, 50, 100, 250];
        const affordableBets = maxBetOptions.filter(bet => bet <= this.gold);
        if (affordableBets.length > 0) {
            this.currentBet = Math.max(...affordableBets);
            document.getElementById('bet-amount').value = this.currentBet;

            if (this.currentBet === 250) {
                this.unlockAchievement('high_roller');
            }
        }
    }

    async spin() {
        if (this.isSpinning || this.gold < this.currentBet) return;

        this.isSpinning = true;
        this.gold -= this.currentBet;
        this.totalSpins++;

        // First spin achievement
        if (this.totalSpins === 1) {
            this.unlockAchievement('first_spin');
        }

        // Spin master achievement
        if (this.totalSpins === 100) {
            this.unlockAchievement('spin_master');
        }

        this.updateUI();
        this.addLogEntry(`🎰 Spinning with ${this.currentBet} gold bet...`);

        // Pre-determine the final result before animation
        const finalResults = this.generateFinalResults();

        // Animate reels with predetermined results
        this.animateReels(finalResults);

        // Process results after animation completes
        setTimeout(() => {
            this.processSpinResult(finalResults);
        }, 2000);
    }

    generateFinalResults() {
        const results = [];
        // Generate final symbols for each reel
        for (let i = 0; i < 3; i++) {
            results.push(this.getRandomSymbol());
        }
        return results;
    }

    animateReels(finalResults) {
        const reels = document.querySelectorAll('.reel');

        reels.forEach((reel, index) => {
            reel.classList.add('spinning');

            // Change symbols rapidly during spin
            const spinInterval = setInterval(() => {
                const randomSymbol = this.getRandomSymbol();
                reel.querySelector('.symbol').textContent = randomSymbol.emoji;
            }, 100);

            // Stop spinning after delay and set final symbol
            setTimeout(() => {
                clearInterval(spinInterval);
                reel.classList.remove('spinning');
                // Set the predetermined final symbol
                reel.querySelector('.symbol').textContent = finalResults[index].emoji;
            }, 1500 + (index * 200));
        });
    }

    processSpinResult(results) {
        // Check for wins using the predetermined results
        const winResult = this.checkWin(results);

        if (winResult.isWin) {
            this.handleWin(winResult, results);
        } else {
            this.handleLoss();
        }

        this.isSpinning = false;
        this.updateUI();
        this.saveGameData();
    }

    getRandomSymbol() {
        // Weighted random selection
        const totalWeight = this.symbols.reduce((sum, symbol) => sum + symbol.weight, 0);
        let random = Math.random() * totalWeight;

        for (const symbol of this.symbols) {
            random -= symbol.weight;
            if (random <= 0) {
                return symbol;
            }
        }

        return this.symbols[this.symbols.length - 1];
    }

    checkWin(results) {
        // Check for three of a kind
        if (results[0].emoji === results[1].emoji && results[1].emoji === results[2].emoji) {
            const symbol = results[0];
            const winAmount = symbol.value * (this.currentBet / 25); // Scale with bet
            return {
                isWin: true,
                type: 'triple',
                symbol: symbol,
                winAmount: Math.floor(winAmount),
                combo: `${symbol.emoji}${symbol.emoji}${symbol.emoji}`
            };
        }

        // Check for two of a kind (smaller win)
        const symbolCounts = {};
        results.forEach(result => {
            symbolCounts[result.emoji] = (symbolCounts[result.emoji] || 0) + 1;
        });

        for (const [emoji, count] of Object.entries(symbolCounts)) {
            if (count === 2) {
                const symbol = this.symbols.find(s => s.emoji === emoji);
                const winAmount = Math.floor(symbol.value * 0.1 * (this.currentBet / 25));
                return {
                    isWin: true,
                    type: 'double',
                    symbol: symbol,
                    winAmount: winAmount,
                    combo: `${emoji}${emoji}`
                };
            }
        }

        return { isWin: false };
    }

    handleWin(winResult, results) {
        this.gold += winResult.winAmount;
        this.totalWins++;

        if (winResult.winAmount > this.biggestWin) {
            this.biggestWin = winResult.winAmount;
        }

        if (this.gold > this.highScore) {
            this.highScore = this.gold;
        }

        // Show win animation
        this.showWinDisplay(winResult);

        // Add winning symbol animation
        const symbols = document.querySelectorAll('.symbol');
        symbols.forEach(symbol => {
            if (symbol.textContent === winResult.symbol.emoji) {
                symbol.classList.add('winning-symbol');
                setTimeout(() => symbol.classList.remove('winning-symbol'), 1500);
            }
        });

        // Show payline
        const payline = document.querySelector('.payline');
        payline.classList.add('active');
        setTimeout(() => payline.classList.remove('active'), 2000);

        // Log the win
        this.addLogEntry(`🎉 ${winResult.type === 'triple' ? 'TRIPLE' : 'DOUBLE'} ${winResult.symbol.name.toUpperCase()}! Won ${winResult.winAmount} gold!`);

        // Check achievements
        if (this.totalWins === 1) {
            this.unlockAchievement('first_win');
        }

        if (winResult.winAmount >= 1000) {
            this.unlockAchievement('big_win');
        }

        if (winResult.symbol.emoji === '🐉' && winResult.type === 'triple') {
            this.unlockAchievement('triple_dragon');
        }

        if (this.gold >= 10000) {
            this.unlockAchievement('gold_hoarder');
        }
    }

    handleLoss() {
        this.addLogEntry('💸 No luck this time. Try again!');

        // Encourage player if gold is low
        if (this.gold < 100) {
            this.addLogEntry('💡 Tip: Lower your bet to make your gold last longer!');
        }

        // Give bonus gold if player runs out
        if (this.gold < this.currentBet) {
            this.gold += 100;
            this.addLogEntry('🎁 Bonus! You received 100 gold to continue your adventure!');
        }
    }

    showWinDisplay(winResult) {
        const winDisplay = document.getElementById('win-display');
        const winTitle = document.getElementById('win-title');
        const winMessage = document.getElementById('win-message');
        const winAmount = document.getElementById('win-amount');
        const winCombo = document.getElementById('win-combo');

        winTitle.textContent = winResult.type === 'triple' ? '🎉 EPIC WIN! 🎉' : '🎊 NICE WIN! 🎊';
        winAmount.textContent = winResult.winAmount.toLocaleString();
        winCombo.textContent = winResult.combo;

        winDisplay.classList.remove('hidden');

        // Auto-hide after 3 seconds
        setTimeout(() => {
            winDisplay.classList.add('hidden');
        }, 3000);
    }

    unlockAchievement(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.addLogEntry(`🏅 Achievement Unlocked: ${achievement.name}!`);
            this.renderAchievements();

            // Show achievement notification
            this.showAchievementNotification(achievement);
        }
    }

    showAchievementNotification(achievement) {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <span class="achievement-icon">${achievement.icon}</span>
                <div>
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.desc}</div>
                </div>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--primary-gold), var(--dark-gold));
            color: var(--shadow-black);
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
            z-index: 1500;
            animation: slideInRight 0.5s ease, fadeOut 0.5s ease 2.5s forwards;
        `;

        document.body.appendChild(notification);

        // Remove after animation
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    renderAchievements() {
        const achievementsList = document.getElementById('achievements-list');
        achievementsList.innerHTML = '';

        this.achievements.forEach(achievement => {
            const achievementEl = document.createElement('div');
            achievementEl.className = `achievement ${achievement.unlocked ? 'unlocked' : ''}`;
            achievementEl.innerHTML = `
                <span class="achievement-icon">${achievement.icon}</span>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
            `;
            achievementsList.appendChild(achievementEl);
        });
    }

    addLogEntry(message) {
        const logContent = document.getElementById('log-content');
        const entry = document.createElement('p');
        entry.className = 'log-entry';
        entry.textContent = `${new Date().toLocaleTimeString()} - ${message}`;

        logContent.appendChild(entry);
        logContent.scrollTop = logContent.scrollHeight;

        // Keep only last 20 entries
        while (logContent.children.length > 20) {
            logContent.removeChild(logContent.firstChild);
        }
    }

    showLoading(show) {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (show) {
            loadingOverlay.classList.remove('hidden');
        } else {
            loadingOverlay.classList.add('hidden');
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS animations for achievement notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }

        .achievement-notification .achievement-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .achievement-notification .achievement-icon {
            font-size: 2rem;
        }

        .achievement-notification .achievement-name {
            font-weight: bold;
            margin-bottom: 2px;
        }

        .achievement-notification .achievement-desc {
            font-size: 0.9rem;
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);

    // Start the game
    window.game = new FantasySlotGame();
});

// Add service worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

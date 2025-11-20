class RiverCrossingGame {
    constructor() {
        this.monks = 3;
        this.devils = 3;
        this.boatCapacity = 2;
        this.boatPosition = 'left'; // 'left' or 'right'

        // Game state
        this.leftBankMonks = 3;
        this.leftBankDevils = 3;
        this.rightBankMonks = 0;
        this.rightBankDevils = 0;
        this.boatMonks = 0;
        this.boatDevils = 0;

        this.selectedCharacter = null;
        this.gameOver = false;

        this.initializeEventListeners();
        this.render();
        this.updateStatus('Move all characters to the right bank to win!');
    }

    initializeEventListeners() {
        // Boat move button
        document.getElementById('move-boat').addEventListener('click', () => {
            this.moveBoat();
        });

        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });
    }

    resetGame() {
        this.leftBankMonks = 3;
        this.leftBankDevils = 3;
        this.rightBankMonks = 0;
        this.rightBankDevils = 0;
        this.boatMonks = 0;
        this.boatDevils = 0;
        this.boatPosition = 'left';
        this.selectedCharacter = null;
        this.gameOver = false;

        document.getElementById('move-boat').disabled = true;
        this.render();
        this.updateStatus('Move all characters to the right bank to win!');
        this.clearStatusClasses();
    }

    moveBoat() {
        if (this.gameOver) return;

        // Move boat to opposite bank
        const newPosition = this.boatPosition === 'left' ? 'right' : 'left';

        // Unload passengers
        if (newPosition === 'left') {
            this.leftBankMonks += this.boatMonks;
            this.leftBankDevils += this.boatDevils;
        } else {
            this.rightBankMonks += this.boatMonks;
            this.rightBankDevils += this.boatDevils;
        }

        this.boatMonks = 0;
        this.boatDevils = 0;
        this.boatPosition = newPosition;

        // Check game conditions
        if (this.checkWinCondition()) {
            this.gameOver = true;
            this.updateStatus('🎉 Congratulations! You won! 🎉', 'success');
            document.getElementById('move-boat').disabled = true;
        } else if (this.checkLoseCondition()) {
            this.gameOver = true;
            this.updateStatus('💀 Game Over! Devils overpowered the monks! 💀', 'danger');
            document.getElementById('move-boat').disabled = true;
        } else {
            // Check if boat should be disabled (no boatman)
            if (this.boatPosition === 'left' && this.leftBankMonks + this.leftBankDevils === 0) {
                this.updateStatus('No one on left bank to operate the boat!', 'danger');
            } else if (this.boatPosition === 'right' && this.rightBankMonks + this.rightBankDevils === 0) {
                this.updateStatus('No one on right bank to operate the boat!', 'danger');
            } else {
                this.updateStatus('Select characters to load into the boat');
            }
        }

        this.selectedCharacter = null;
        this.render();
    }

    loadCharacter(type, bank) {
        if (this.gameOver) return;

        // Check if boat is on the same bank
        if (this.boatPosition !== bank) {
            this.updateStatus(`Boat is on the ${this.boatPosition} bank!`, 'danger');
            return;
        }

        // Check boat capacity
        if (this.boatMonks + this.boatDevils >= this.boatCapacity) {
            this.updateStatus('Boat is full! Maximum 2 passengers allowed.', 'danger');
            return;
        }

        // Load character into boat
        if (type === 'monk') {
            if (bank === 'left' && this.leftBankMonks > 0) {
                this.leftBankMonks--;
                this.boatMonks++;
            } else if (bank === 'right' && this.rightBankMonks > 0) {
                this.rightBankMonks--;
                this.boatMonks++;
            }
        } else if (type === 'devil') {
            if (bank === 'left' && this.leftBankDevils > 0) {
                this.leftBankDevils--;
                this.boatDevils++;
            } else if (bank === 'right' && this.rightBankDevils > 0) {
                this.rightBankDevils--;
                this.boatDevils++;
            }
        }

        // Check if move is valid after loading
        if (this.isCurrentStateValid()) {
            this.updateStatus('Good move! Continue loading or cross the river');
        } else {
            // Undo the move if it's invalid
            if (type === 'monk') {
                if (bank === 'left') {
                    this.leftBankMonks++;
                    this.boatMonks--;
                } else {
                    this.rightBankMonks++;
                    this.boatMonks--;
                }
            } else if (type === 'devil') {
                if (bank === 'left') {
                    this.leftBankDevils++;
                    this.boatDevils--;
                } else {
                    this.rightBankDevils++;
                    this.boatDevils--;
                }
            }
            this.updateStatus('❌ Invalid move! Devils would outnumber monks!', 'danger');
        }

        this.render();
    }

    unloadCharacter(type) {
        if (this.gameOver) return;

        if (type === 'monk' && this.boatMonks > 0) {
            this.boatMonks--;
            if (this.boatPosition === 'left') {
                this.leftBankMonks++;
            } else {
                this.rightBankMonks++;
            }
        } else if (type === 'devil' && this.boatDevils > 0) {
            this.boatDevils--;
            if (this.boatPosition === 'left') {
                this.leftBankDevils++;
            } else {
                this.rightBankDevils++;
            }
        }

        this.render();
    }

    isCurrentStateValid() {
        // Check left bank
        if (this.leftBankMonks > 0 && this.leftBankDevils > this.leftBankMonks) {
            return false;
        }

        // Check right bank
        if (this.rightBankMonks > 0 && this.rightBankDevils > this.rightBankMonks) {
            return false;
        }

        return true;
    }

    checkWinCondition() {
        return this.rightBankMonks === 3 && this.rightBankDevils === 3;
    }

    checkLoseCondition() {
        // Check left bank
        if (this.leftBankMonks > 0 && this.leftBankDevils > this.leftBankMonks) {
            return true;
        }

        // Check right bank
        if (this.rightBankMonks > 0 && this.rightBankDevils > this.rightBankMonks) {
            return true;
        }

        return false;
    }

    updateStatus(message, type = '') {
        const statusElement = document.getElementById('status-text');
        statusElement.textContent = message;

        // Remove existing classes
        statusElement.classList.remove('success', 'danger');

        // Add new class if specified
        if (type) {
            statusElement.classList.add(type);
        }
    }

    clearStatusClasses() {
        const statusElement = document.getElementById('status-text');
        statusElement.classList.remove('success', 'danger');
    }

    render() {
        // Clear existing characters
        document.getElementById('left-monks').innerHTML = '';
        document.getElementById('left-devils').innerHTML = '';
        document.getElementById('right-monks').innerHTML = '';
        document.getElementById('right-devils').innerHTML = '';
        document.getElementById('boat-passengers').innerHTML = '';

        // Render left bank characters
        for (let i = 0; i < this.leftBankMonks; i++) {
            const monk = this.createCharacter('monk', 'left');
            document.getElementById('left-monks').appendChild(monk);
        }

        for (let i = 0; i < this.leftBankDevils; i++) {
            const devil = this.createCharacter('devil', 'left');
            document.getElementById('left-devils').appendChild(devil);
        }

        // Render right bank characters
        for (let i = 0; i < this.rightBankMonks; i++) {
            const monk = this.createCharacter('monk', 'right');
            document.getElementById('right-monks').appendChild(monk);
        }

        for (let i = 0; i < this.rightBankDevils; i++) {
            const devil = this.createCharacter('devil', 'right');
            document.getElementById('right-devils').appendChild(devil);
        }

        // Render boat characters
        for (let i = 0; i < this.boatMonks; i++) {
            const monk = this.createCharacter('monk', 'boat');
            document.getElementById('boat-passengers').appendChild(monk);
        }

        for (let i = 0; i < this.boatDevils; i++) {
            const devil = this.createCharacter('devil', 'boat');
            document.getElementById('boat-passengers').appendChild(devil);
        }

        // Update boat position
        const boatElement = document.getElementById('boat');
        if (this.boatPosition === 'right') {
            boatElement.classList.add('right-side');
        } else {
            boatElement.classList.remove('right-side');
        }

        // Update boat move button
        const moveButton = document.getElementById('move-boat');
        moveButton.disabled = this.gameOver || (this.boatMonks + this.boatDevils === 0);

        // Update counts
        document.getElementById('left-count').textContent = `👼${this.leftBankMonks} 😈${this.leftBankDevils}`;
        document.getElementById('right-count').textContent = `👼${this.rightBankMonks} 😈${this.rightBankDevils}`;
        document.getElementById('boat-count').textContent = `👼${this.boatMonks} 😈${this.boatDevils}`;
    }

    createCharacter(type, location) {
        const character = document.createElement('div');
        character.className = 'character';
        character.textContent = type === 'monk' ? '👼' : '😈';

        character.addEventListener('click', () => {
            if (location === 'boat') {
                this.unloadCharacter(type);
            } else {
                this.loadCharacter(type, location);
            }
        });

        return character;
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new RiverCrossingGame();
});
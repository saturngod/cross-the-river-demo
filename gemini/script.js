document.addEventListener('DOMContentLoaded', () => {
    // Game State
    const state = {
        leftBank: [],
        rightBank: [],
        boat: [],
        boatPosition: 'left', // 'left' or 'right'
        isGameOver: false
    };

    // DOM Elements
    const leftBankEl = document.getElementById('left-bank');
    const rightBankEl = document.getElementById('right-bank');
    const boatContainerEl = document.getElementById('boat-container');
    const seats = document.querySelectorAll('.seat');
    const moveBtn = document.getElementById('move-btn');
    const resetBtn = document.getElementById('reset-btn');
    const messageBox = document.getElementById('message-box');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalRestartBtn = document.getElementById('modal-restart-btn');

    // Initialize Game
    function initGame() {
        state.leftBank = [
            { type: 'monk', id: 'm1' },
            { type: 'monk', id: 'm2' },
            { type: 'monk', id: 'm3' },
            { type: 'devil', id: 'd1' },
            { type: 'devil', id: 'd2' },
            { type: 'devil', id: 'd3' }
        ];
        state.rightBank = [];
        state.boat = [];
        state.boatPosition = 'left';
        state.isGameOver = false;

        render();
        hideModal();
        showMessage('');
    }

    // Render Game State
    function render() {
        // Clear areas
        leftBankEl.innerHTML = '';
        rightBankEl.innerHTML = '';
        seats.forEach(seat => seat.innerHTML = '');

        // Render Left Bank
        state.leftBank.forEach(char => {
            leftBankEl.appendChild(createCharacterEl(char));
        });

        // Render Right Bank
        state.rightBank.forEach(char => {
            rightBankEl.appendChild(createCharacterEl(char));
        });

        // Render Boat
        state.boat.forEach((char, index) => {
            if (index < 2) {
                seats[index].appendChild(createCharacterEl(char, true));
            }
        });

        // Update Boat Position
        if (state.boatPosition === 'left') {
            boatContainerEl.classList.remove('right-side');
            boatContainerEl.classList.add('left-side');
            moveBtn.innerText = 'GO ->';
        } else {
            boatContainerEl.classList.remove('left-side');
            boatContainerEl.classList.add('right-side');
            moveBtn.innerText = '<- GO';
        }
    }

    // Create Character Element
    function createCharacterEl(char, inBoat = false) {
        const el = document.createElement('div');
        el.classList.add('character');
        el.dataset.id = char.id;
        el.dataset.type = char.type;
        
        const img = document.createElement('img');
        img.src = `assets/${char.type}.svg`;
        img.alt = char.type;
        img.draggable = false; // Prevent default drag
        
        el.appendChild(img);

        el.addEventListener('click', () => handleCharacterClick(char));
        
        return el;
    }

    // Handle Character Click
    function handleCharacterClick(char) {
        if (state.isGameOver) return;

        // Check if character is in boat
        const boatIndex = state.boat.findIndex(c => c.id === char.id);
        
        if (boatIndex !== -1) {
            // Disembark
            disembark(char);
        } else {
            // Board
            board(char);
        }
    }

    // Board Character
    function board(char) {
        // Can only board from the side the boat is on
        const currentBank = state.boatPosition === 'left' ? state.leftBank : state.rightBank;
        const charIndex = currentBank.findIndex(c => c.id === char.id);

        if (charIndex === -1) {
            showMessage("Boat is on the other side!");
            return;
        }

        if (state.boat.length >= 2) {
            showMessage("Boat is full!");
            return;
        }

        // Move from bank to boat
        currentBank.splice(charIndex, 1);
        state.boat.push(char);
        
        showMessage("");
        render();
    }

    // Disembark Character
    function disembark(char) {
        const boatIndex = state.boat.findIndex(c => c.id === char.id);
        if (boatIndex === -1) return;

        // Move from boat to current bank
        state.boat.splice(boatIndex, 1);
        
        if (state.boatPosition === 'left') {
            state.leftBank.push(char);
        } else {
            state.rightBank.push(char);
        }

        showMessage("");
        render();
    }

    // Move Boat
    function moveBoat() {
        if (state.isGameOver) return;

        if (state.boat.length === 0) {
            showMessage("Boat cannot move empty!");
            return;
        }

        // Move boat
        state.boatPosition = state.boatPosition === 'left' ? 'right' : 'left';
        render();

        // Check Rules after arrival
        setTimeout(() => {
            checkGameRules();
        }, 1000); // Wait for animation
    }

    // Check Game Rules
    function checkGameRules() {
        // Count characters on each side (including boat if it's on that side)
        // Actually, standard rules usually count the boat passengers as being on the bank they just arrived at OR leaving from.
        // But the "unsafe" condition is usually checked when the boat is AT a bank.
        // So, effectively:
        // Left Side Count = Left Bank + (Boat if Left)
        // Right Side Count = Right Bank + (Boat if Right)

        const leftMonks = countType(state.leftBank, 'monk') + (state.boatPosition === 'left' ? countType(state.boat, 'monk') : 0);
        const leftDevils = countType(state.leftBank, 'devil') + (state.boatPosition === 'left' ? countType(state.boat, 'devil') : 0);

        const rightMonks = countType(state.rightBank, 'monk') + (state.boatPosition === 'right' ? countType(state.boat, 'monk') : 0);
        const rightDevils = countType(state.rightBank, 'devil') + (state.boatPosition === 'right' ? countType(state.boat, 'devil') : 0);

        // Check Lose Condition
        if ((leftMonks > 0 && leftDevils > leftMonks) || (rightMonks > 0 && rightDevils > rightMonks)) {
            gameOver(false);
            return;
        }

        // Check Win Condition
        // Win if all 6 characters are on the right side (Right Bank + Boat at Right)
        const totalRight = state.rightBank.length + (state.boatPosition === 'right' ? state.boat.length : 0);
        if (totalRight === 6) {
            gameOver(true);
        }
    }

    function countType(list, type) {
        return list.filter(c => c.type === type).length;
    }

    function showMessage(msg) {
        messageBox.innerText = msg;
        if (msg) {
            messageBox.classList.remove('hidden');
        } else {
            messageBox.classList.add('hidden');
        }
    }

    function gameOver(win) {
        state.isGameOver = true;
        if (win) {
            modalTitle.innerText = "You Win!";
            modalTitle.style.color = "#2ecc71";
            modalMessage.innerText = "All monks and devils crossed safely!";
        } else {
            modalTitle.innerText = "Game Over";
            modalTitle.style.color = "#e74c3c";
            modalMessage.innerText = "The devils outnumbered the monks!";
        }
        showModal();
    }

    function showModal() {
        modalOverlay.classList.remove('hidden');
    }

    function hideModal() {
        modalOverlay.classList.add('hidden');
    }

    // Event Listeners
    moveBtn.addEventListener('click', moveBoat);
    resetBtn.addEventListener('click', initGame);
    modalRestartBtn.addEventListener('click', initGame);

    // Start
    initGame();
});

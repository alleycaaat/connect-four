const gameboard = document.querySelector('.gameboard'),
    rulesBtn = document.querySelector('#rules'),
    rules = document.querySelector('#mobileRules'),
    reset = document.getElementById('reset'),
    players = document.querySelector('.players');

let message = document.querySelector('h2'),
    seconds = document.getElementById('seconds'),
    minutes = document.getElementById('minutes'),
    currentPlayer = document.querySelectorAll('.checkmark');

const board = [
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
];
let player = 'yellow',
    num = 1,
    currentColor = 'yellow',
    turns = 0,
    sec = 0,
    timer,
    inc = (val) => {
        return val > 9 ? val : '0' + val;
    };
//for mobile screens, add functionality to the rules button
rulesBtn.addEventListener('click', function () {
    mobileRules.classList.toggle('hide');
    let ariaValue = rules.getAttribute('aria-expanded');
    ariaValue =
        ariaValue === 'true'
            ? rules.setAttribute('aria-expanded', 'false')
            : rules.setAttribute('aria-expanded', 'true');
});

const timing = () => {
    timer = setInterval(() => {
        minutes.innerHTML = inc(parseInt(sec / 60, 10));
        seconds.innerHTML = inc(++sec % 60);
    }, 1000);
};

board.forEach((rows, rowIndex) => {
    const row = document.createElement('div');
    row.classList.add('row');
    board.forEach((cols, colIndex) => {
        const puck = document.createElement('button');
        puck.setAttribute('id', `row: ${rowIndex} -- col: ${colIndex}`);
        puck.setAttribute('name', 'empty');
        puck.setAttribute('aria-label', `row: ${rowIndex} -- col: ${colIndex}`);
        puck.classList.add('puck');
        puck.addEventListener('click', () => handlePuck(puck));
        //add pucks to the rows
        row.appendChild(puck);
    });
    //add rows of pucks to the board
    gameboard.appendChild(row);
});

const resetGame = () => {
    resetButtons();
    turns = 0;
    sec = 0;
    message.innerHTML = '';
    minutes.innerHTML = '00';
    seconds.innerHTML = '00';
    player = 'yellow';
    currentPlayer[1].classList.value = 'checkmark hide';
    currentPlayer[0].classList.value = 'checkmark';
    clearInterval(timer);
};

reset.addEventListener('click', resetGame);

//get all da pucks
const buttons = document.querySelectorAll('button.puck');

//reset pucks to original specs
const resetButtons = () => {
    for (const button of buttons) {
        button.className = 'puck';
        button.name = 'empty';
        button.removeAttribute('disabled');
    }
    players.classList.remove('hide');
    message.classList = 'hide';
};

//handle the click of pucks
const handlePuck = (puck) => {
    message.innerHTML = '';
    message.classList = 'hide';
    if (turns === 0) {
        timing();
    }
    let id = puck.id,
        y = id.slice(-1),
        x = id.slice(5, 6),
        topPuck,
        bottomPuck;
    //check if the column is already full
    topPuck = document.getElementById(`row: ${0} -- col: ${y}`);
    if (topPuck.name !== 'empty') {
        message.classList.remove('hide');
        return (message.innerHTML = 'Column full, select another');
    }
    //determine which color puck should be dropped
    player = player === 'purple' ? 'yellow' : 'purple';
    //switch the checkmark to indicate the current player
    if (player === 'purple') {
        currentPlayer[0].classList.value = 'checkmark hide';
        currentPlayer[1].classList.value = 'checkmark';
    } else {
        currentPlayer[1].classList.value = 'checkmark hide';
        currentPlayer[0].classList.value = 'checkmark';
    }
    turns++;
    //start on the bottom row to find the first open puck
    for (let i = 5; i >= 0; ) {
        bottomPuck = document.getElementById(`row: ${i} -- col: ${y}`);
        //once an empty puck is found, set it to current player
        if (bottomPuck.name === 'empty') {
            bottomPuck.setAttribute('name', `${player}`);
            bottomPuck.classList.add(`${player}`);
            //check for a winner
            if (turns > 2) {
                gameWon(i, y, bottomPuck);
            }
            return;
        }
        i--;
    }
};

//check for a horizontal, vertical or diaganol win each time
const gameWon = (x, y, player) => {
    return (
        checkGame(x, y, player, 'horizontal') ||
        checkGame(x, y, player, 'vert') ||
        checkGame(x, y, player, 'diag') ||
        checkGame(x, y, player, 'diag2')
    );
};

//check if the puck has been used
const isUsed = (x, y) => {
    let puck = document.getElementById(`row: ${x} -- col: ${y}`);
    return puck !== null;
};
//check if the current player has the puck
const colorMatch = (x, y, color) => {
    let puck = document.getElementById(`row: ${x} -- col: ${y}`);
    return puck.name === color;
};
//x and y are strings when sent in
const checkGame = (sx, sy, player, direction) => {
    //checkDirections array has the coordinates to check
    let puckcount = 1,
        color = player.name,
        checkDirections = {
            horizontal: [
                [0, -1],
                [0, 1],
            ],
            vert: [
                [-1, 0],
                [1, 0],
            ],
            diag: [
                [-1, -1],
                [1, 1],
            ],
            //diagonal needs to be split to check each direction separately
            //or it will inciment the puckcount incorrectly for how the
            //rules of the game work
            diag2: [
                [-1, 1],
                [1, -1],
            ],
        };
    //check each different direction and each coordinate of the direction
    checkDirections[direction].forEach((cords) => {
        let i = 1,
            x = parseInt(sx),
            y = parseInt(sy);
        //while loop because if the isUsed = true and colorMatch = true, need to keep checking the other coordinates
        while (
            isUsed(x + cords[0] * i, y + cords[1] * i) &&
            colorMatch(x + cords[0] * i, y + cords[1] * i, color)
        ) {
            puckcount++;
            i++;
            if (puckcount > 3) {
                for (const button of buttons) {
                    button.setAttribute('disabled', 'true');
                }
                players.classList.add('hide');
                message.classList.remove('hide');
                clearInterval(timer);
                return (message.innerHTML = `${color} wins!`);
            }
        }
    });
};

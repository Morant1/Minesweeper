'use strict';
var gLevel = {
    SIZE: 4,
    MINES: 2
};
var FLAG = '🚩';
var MINE = '💥';
var HAPPY = '😀';
var SAD = '😪';
var WINNER = '🏆';

var gFirstClick = 0;
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gBoard;
var gCellsWithMines;
var gTimerInterval;

function addLevel(level) {
    switch (level) {
        case "Beginner":
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            break;
        case "Medium":
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            break;
        case "Expert":
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            break;
    }
    initGame();

}

function initGame() {
    gameOver();
    document.querySelector('.emoji').innerText = HAPPY;
    gBoard = buildBoard();
    gGame.isOn = true;
    renderBoard(gBoard);

    document.querySelector('.timerDisplay').style.display = 'block';
    gGame.secsPassed = 0;
    timer();


}

function gameOver() {
    clearInterval(gTimerInterval);
    gTimerInterval = null;

    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    };
    gBoard = '';
    var elTable = document.querySelector('.board');
    elTable.innerHTML = '';
    gFirstClick = 0;

}



function createRandomMine(board) {
    gCellsWithMines = [];
    for (let i = 0; i < gLevel.MINES; i++) {
        var random_idxI = getRandomInteger(0, gLevel.SIZE);
        var random_idxJ = getRandomInteger(0, gLevel.SIZE);

        board[random_idxI][random_idxJ].isMine = true;
        gCellsWithMines.push([random_idxI, random_idxJ]);
    };




}
function renderBoard() {
    var strHTML = '';;
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < gLevel.SIZE; j++) {
            var tdId = `${i}-${j}`;
            strHTML += `\t<td><button id=${tdId} oncontextmenu="callMarked(this,${i},${j})" onclick="cellClicked(this, ${i}, ${j})">
            </button></td>\n`;

        }
        strHTML += '</tr>\n';
    }


    var elTable = document.querySelector('.board');
    elTable.innerHTML = strHTML;

}


function callMarked(elCell, cellI, cellJ) {
    var cell = gBoard[cellI][cellJ];
    if (!cell.isMarked) {
        cell.isMarked = true;
        gGame.markedCount++
        elCell.innerText = FLAG;
    } else {
        cell.isMarked = false;
        gGame.markedCount--;
        elCell.innerText = '';
    }
}

function timer() {
    var min = 0;
    var sec = 0
    var time;
    gTimerInterval = setInterval(function () {
        time = `0${min}:${sec < 10 ? '0' : ''}${sec}`;
        document.querySelector('.timerDisplay').innerHTML = time;

        sec++;
        if (sec === 60) {
            min++
            sec = 0;
        }
        gGame.secsPassed = time;
    }, 1000);


    // if (!gGame.isOn) {
    //     clearInterval(gTimerInterval);
    // }
}









function cellClicked(elCell, i, j) {

    var cell = gBoard[i][j];
    if (!cell.isMarked && !cell.isShown && gGame.isOn) {
        cell.isShown = true;
        elCell.classList.add('clicked');

        gGame.shownCount++;

        if (cell.isMine) {
            elCell.innerText = MINE;
            var idx = 0;
            while (idx < gCellsWithMines.length) {
                var elId = document.getElementById(`${gCellsWithMines[idx][0]}-${gCellsWithMines[idx][1]}`);
                elId.innerText = MINE;
                elId.classList.add('clicked');
                idx++;
            }
            setTimeout(function () {
                document.querySelector('.emoji').innerText = SAD;
                document.querySelector('.timerDisplay').style.display = 'none';
                gameOver();
            }, 2000);
        }
        else if (cell.minesAroundCount) {
            elCell.innerText = cell.minesAroundCount;

        } else {
            expandShown(elCell, i, j);

        }

        checkGameOver()
    }
}

function expandShown(elCell, i, j) {
    elCell.innerText = '';
    elCell.classList.add('clicked');

    for (var x = i - 1; x <= i + 1; x++) {
        if (x < 0 || x >= gLevel.SIZE) continue;

        for (var y = j - 1; y <= j + 1; y++) {
            if (y < 0 || y >= gLevel.SIZE) continue;
            if (!gBoard[x][y].isShown) {
                gBoard[x][y].isShown = true;
                gGame.shownCount++
                var elID = document.getElementById(`${x}-${y}`);
                elID.innerText = (gBoard[x][y].minesAroundCount ? gBoard[x][y].minesAroundCount : '');
                elID.classList.add('clicked');
            }

        }
    }

}

function checkGameOver() {
    if (gGame.shownCount === ((gLevel.SIZE ** 2) - (gLevel.MINES))&&
    gGame.markedCount === gLevel.MINES){
        document.querySelector('.emoji').innerText = WINNER;
        gameOver();


    }

}

function buildBoard() {//bulid board and set MINES
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
            board[i][j] = cell;
        }
    }
    createRandomMine(board)
    setMinesNegsCount(board);
    return board;
}
function setMinesNegsCount(board) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            countNeighbors(i, j, board);
        }
    }

}

function countNeighbors(i, j, board) {
    var cellI = i;
    var cellJ = j;
    var neighborsSum = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;
            if (board[i][j].isMine) neighborsSum++;
        }
    }
    board[cellI][cellJ].minesAroundCount = neighborsSum;

}



// function addDifficulties() {
//     if (isGameStart) {
//         if (CELLS === 16) {
//             CELLS = 25;
//         } else {
//             CELLS = 36;
//             var elSpeed = document.querySelector('.difficult');
//             elSpeed.textContent = 'Most difficult';
//             elSpeed.style.color = 'red';
//         }

//         clearInterval(interval);
//         initGame();
//     }

// }


// function closeGame() {
//     clearInterval(interval);
//     isGameStart = false;
//     targets = [];
//     var elTable = document.querySelector('.board');
//     elTable.innerHTML = '';
//     CELLS = 16;
//     var elSpeed = document.querySelector('.difficult');
//     elSpeed.textContent = 'Add Difficulty';
//     elSpeed.style.color = 'black';


// }

// function getRandomColor() {
//     var letters = 'BCDEF';
//     var color = '#';
//     for (var i = 0; i < 6; i++) {
//         color += letters[Math.floor(Math.random() * 4)];
//     }
//     return color;
// }



// function catchEvent() {

// }
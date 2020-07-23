'use strict';
var gLevel = { //If user does not press level, default is SIZE 4;
    SIZE: 4,
    MINES: 2,
    LIGHTS: 3
};
var FLAG = '🚩';
var MINE = '💥';
var HAPPY = '😀';
var SAD = '😪';
var WINNER = '🏆';

var gFirstClick = 1;
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: ''
}


var gBoard;
var gCellsWithMines;
var gTimerInterval;
var gIsHint = false;
var gSafeClick = 3; //BONUS



function initGame() { 
    gFirstClick = 1;
    gCellsWithMines = [];
    document.querySelector('.emoji').innerText = HAPPY;
    gBoard = buildBoard();
    gGame.isOn = true;
    renderBoard(gBoard);

    document.querySelector('.timerDisplay').style.display = 'none';
    document.querySelector('.timerDisplay').innerHTML = '';
    document.querySelector('.light').style.display = 'none';

    if (gTimerInterval) {
        clearInterval(gTimerInterval);
        gGame.secsPassed = '';
    }

    gGame.shownCount = 0;
    gGame.markedCount = 0;
    document.querySelector('.safe_click').style.display = 'none';
    gSafeClick = 3;
    document.querySelector('.safe_click span').innerText = gSafeClick;

}

function gameOver() {
    document.querySelector('.timerDisplay').style.display = 'none';
    gGame.isOn = false;
    gBoard = '';
    document.querySelector('.light').style.display = 'none';
    var elTable = document.querySelector('.board');
    elTable.innerHTML = '';
    gCellsWithMines = [];

}




function createRandomMine(board, i, j) {
    var arr = [];
    for (var idx = 0; idx < gLevel.MINES; idx++) {
        var random_idxI = getRandomInteger(0, gLevel.SIZE);
        var random_idxJ = getRandomInteger(0, gLevel.SIZE);

        var random = [random_idxI, random_idxJ];
     
        while (arr.includes(random.toString()) || random_idxI === i && random_idxJ === j) {
            random_idxI = getRandomInteger(0, gLevel.SIZE);
            random_idxJ = getRandomInteger(0, gLevel.SIZE);
            random = [random_idxI, random_idxJ];
        }
        board[random_idxI][random_idxJ].isMine = true;
        gCellsWithMines.push(random);
        arr.push(random.toString());

    }
  
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
        if (gFirstClick === 1) {
            startMineAfterFirstClick(gBoard, cellI, cellJ);
        }
        cell.isMarked = true;
        gGame.markedCount++
        elCell.innerText = FLAG;
        checkGameOver()

    } else {
        cell.isMarked = false;
        gGame.markedCount--;
        elCell.innerText = '';
    }

}

function timer() {

    document.querySelector('.timerDisplay').style.display = 'block';
    var min = 0;
    var sec = 0
    gTimerInterval = setInterval(function () {

        gGame.secsPassed = `0${min}:${sec < 10 ? '0' : ''}${sec}`;
        document.querySelector('.timerDisplay').innerHTML = gGame.secsPassed;

        sec++;
        if (sec === 60) {
            min++
            sec = 0;
        }
    }, 1000);

}


function getHint(num) {
    if (gGame.isOn && gFirstClick === 0) {
        document.getElementById(`light_${num}`).style.display = 'none';
        gIsHint = true;
    }
}


function startMineAfterFirstClick(gBoard, i, j) {
    createRandomMine(gBoard, i, j);
    setMinesNegsCount(gBoard);

    document.querySelector('.light').style.display = 'block';
    for (var i = 0; i < gLevel.LIGHTS; i++) {
        document.getElementById(`light_${i + 1}`).style.display = 'block';
    }
    document.querySelector('.safe_click').style.display = 'block';
    timer();
    gFirstClick = 0;

}


function cellClicked(elCell, i, j) {
    if (!gIsHint) {
        var cell = gBoard[i][j];
        if (gFirstClick === 1) startMineAfterFirstClick(gBoard, i, j);

        if (!cell.isMarked && !cell.isShown && gGame.isOn) {
            cell.isShown = true;
            elCell.classList.add('clicked');
            gGame.shownCount++;

            if (cell.isMine) {
                elCell.innerText = MINE;
                StepOnMine();

            } else if (cell.minesAroundCount) {
                elCell.innerText = cell.minesAroundCount;

            } else {
                expandShown(elCell, i, j);
            }

            checkGameOver()
        }

    } else {
        revealAndClose(elCell, i, j);
        gIsHint = false;
        
    }
}

function expandShown(elCell, i, j) {
    elCell.innerText = '';
    elCell.classList.add('clicked');

    for (var x = i - 1; x <= i + 1; x++) {
        if (x < 0 || x >= gLevel.SIZE) continue;

        for (var y = j - 1; y <= j + 1; y++) {
            if (y < 0 || y >= gLevel.SIZE) continue;
            if (!gBoard[x][y].isShown && !gBoard[x][y].isMarked) {
                gBoard[x][y].isShown = true;
                gGame.shownCount++
                var elID = document.getElementById(`${x}-${y}`);
                elID.innerText = (gBoard[x][y].minesAroundCount ? gBoard[x][y].minesAroundCount : '');
                elID.classList.add('clicked');
            }

        }
    }

}

function StepOnMine() {
    var idx = 0;
    while (idx < gCellsWithMines.length) {
        var elId = document.getElementById(`${gCellsWithMines[idx][0]}-${gCellsWithMines[idx][1]}`);
        elId.innerText = MINE;
        elId.classList.add('clicked');
        idx++;
    }
    setTimeout(function () {
        document.querySelector('.emoji').innerText = SAD;
        gameOver();
    }, 500);

}

function checkGameOver() {
    if (gGame.shownCount === ((gLevel.SIZE ** 2) - (gLevel.MINES)) &&
        gGame.markedCount === gLevel.MINES) {
        document.querySelector('.emoji').innerText = WINNER;
        setTimeout(function () { gameOver(); }, 1000)


    }

}

function buildBoard() {
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

function revealAndClose(elCell, i, j) {
    var cell = gBoard[i][j];
    if (cell.isShown) return;
    if (cell.isMine) {
        elCell.innerText = MINE;
    } else {
        elCell.innerText = (cell.minesAroundCount) ? cell.minesAroundCount : '';
    }

    elCell.classList.add('green');

    addColorToNeighbors(i, j)

    setTimeout(function () {

        elCell.innerText = '';
        elCell.classList.remove('green');
        removeColorToNeighbors(i, j);

    }, 2000)

}

function removeColorToNeighbors(i, j) {
    var cellI = i;
    var cellJ = j;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= gBoard[i].length) continue;
            var cell = gBoard[i][j];
            if (cell.isShown) continue;
            var elCell = document.getElementById(`${i}-${j}`);
            elCell.innerText = (cell.isMarked) ? FLAG : '';
            elCell.classList.remove('green');
        }
    }
}


function addColorToNeighbors(i, j) {
    var cellI = i;
    var cellJ = j;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= gBoard[i].length) continue;
            var cell = gBoard[i][j];
            var elCell = document.getElementById(`${i}-${j}`);
            if (cell.isShown) continue;

            if (cell.isMine) {
                elCell.innerText = MINE;
            } else {
                elCell.innerText = (cell.minesAroundCount) ? cell.minesAroundCount : '';
            }

            elCell.classList.add('green');
        }
    }

}

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

    gameOver(); //User can restart the game by switching levels and jump to a new phase any time.
    initGame();

}


// -----------------------------------BONUS Safe Click-----------------------------------
function addSafeClick() {
    if (gGame.isOn && gSafeClick>0) {
    gSafeClick--;
    if (gSafeClick < 0) gSafeClick = 0;
    document.querySelector('.safe_click span').innerText = gSafeClick;

    var arr = addColorToNeighborsRandomly();

    var setTime = setTimeout(function(){
        removeColorToNeighborsRandomly(arr);
    },1000)

    }

}

function addColorToNeighborsRandomly() {
    var coloredArray = [];

    var cellI = getRandomInteger(0, gLevel.SIZE);
    var cellJ = getRandomInteger(0, gLevel.SIZE);
    var currCell = gBoard[cellI][cellJ];

    while (currCell.isMine || currCell.isShown) {
        cellI = getRandomInteger(0, gLevel.SIZE);
        cellJ = getRandomInteger(0, gLevel.SIZE);

        currCell = gBoard[cellI][cellJ];

    }

    var elCurrCell = document.getElementById(`${cellI}-${cellJ}`);
    elCurrCell.innerText = (currCell.minesAroundCount) ? currCell.minesAroundCount : '';
    elCurrCell.classList.add('black');
    coloredArray.push([cellI,cellJ]);

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= gBoard[i].length) continue;
            var cell = gBoard[i][j];
            var elCell = document.getElementById(`${i}-${j}`);
            if (!cell.isShown && !cell.isMine) {
                elCell.innerText = (cell.minesAroundCount) ? cell.minesAroundCount : '';
                elCell.classList.add('black');
                coloredArray.push([i,j]);
            } else {
                 continue;
            }

        }
    }
    return coloredArray;
}


function removeColorToNeighborsRandomly(arr) {
    var indexI;
    var indexJ;
    var cell;

    for (var i =0 ; i <arr.length ; i++) {
        indexI = arr[i][0];
        indexJ = arr[i][1];
        cell = gBoard[indexI][indexJ];

        var elCell = document.getElementById(`${indexI}-${indexJ}`);
        elCell.innerText = (cell.isMarked) ? FLAG : '';
        elCell.classList.remove('black');


    }
}


function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// function countNeighbors(cellI, cellJ, mat) {
//   var neighborsSum = 0;
//   for (var i = cellI - 1; i <= cellI + 1; i++) {
//       if (i < 0 || i >= mat.length) continue;
//       for (var j = cellJ - 1; j <= cellJ + 1; j++) {
//           if (i === cellI && j === cellJ) continue;
//           if (j < 0 || j >= mat[i].length) continue;
//           if (mat[i][j] === LIFE || mat[i][j] === SUPER_LIFE) neighborsSum++;
//       }
//   }
//   return neighborsSum;
// }

function getRandomInteger(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  var random = Math.floor(Math.random() * (max - min)) + min;

  return random;
};

function printMat(mat, selector) {
  var strHTML = '<table border="0"><tbody>';
  for (var i = 0; i < mat.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < mat[0].length; j++) {
      var cell = mat[i][j];
      var className = 'cell cell' + i + '-' + j;
      strHTML += '<td class="' + className + '"> ' + cell + ' </td>'
    }
    strHTML += '</tr>'
  }
  strHTML += '</tbody></table>';
  var elContainer = document.querySelector(selector);
  elContainer.innerHTML = strHTML;
}

function renderCell(location, value) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
  elCell.innerHTML = value;
}



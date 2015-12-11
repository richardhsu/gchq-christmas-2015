// GCHQ's Christmas 2015 Card Puzzle
// http://www.bbc.com/news/uk-35058761
// Quickly written by Richard Hsu

var ROWHINTS = [
  [7, 3, 1, 1, 7],
  [1, 1, 2, 2, 1, 1],
  [1, 3, 1, 3, 1, 1, 3, 1],
  [1, 3, 1, 1, 6, 1, 3, 1],
  [1, 3, 1, 5, 2, 1, 3, 1],
  [1, 1, 2, 1, 1],
  [7, 1, 1, 1, 1, 1, 7],
  [3, 3],
  [1, 2, 3, 1, 1, 3, 1, 1, 2],
  [1, 1, 3, 2, 1, 1],
  [4, 1, 4, 2, 1, 2],
  [1, 1, 1, 1, 1, 4, 1, 3],
  [2, 1, 1, 1, 2, 5],
  [3, 2, 2, 6, 3, 1],
  [1, 9, 1, 1, 2, 1],
  [2, 1, 2, 2, 3, 1],
  [3, 1, 1, 1, 1, 5, 1],
  [1, 2, 2, 5],
  [7, 1, 2, 1, 1, 1, 3],
  [1, 1, 2, 1, 2, 2, 1],
  [1, 3, 1, 4, 5, 1],
  [1, 3, 1, 3, 10, 2],
  [1, 3, 1, 1, 6, 6],
  [1, 1, 2, 1, 1, 2],
  [7, 2, 1, 2, 5]
];

var COLHINTS = [
  [7, 2, 1, 1, 7],
  [1, 1, 2, 2, 1, 1],
  [1, 3, 1, 3, 1, 3, 1, 3, 1],
  [1, 3, 1, 1, 5, 1, 3, 1],
  [1, 3, 1, 1, 4, 1, 3, 1],
  [1, 1, 1, 2, 1, 1],
  [7, 1, 1, 1, 1, 1, 7],
  [1, 1, 3],
  [2, 1, 2, 1, 8, 2, 1],
  [2, 2, 1, 2, 1, 1, 1, 2],
  [1, 7, 3, 2, 1],
  [1, 2, 3, 1, 1, 1, 1, 1],
  [4, 1, 1, 2, 6],
  [3, 3, 1, 1, 1, 3 ,1],
  [1, 2, 5, 2, 2],
  [2, 2, 1, 1, 1, 1, 1, 2, 1],
  [1, 3, 3, 2, 1, 8, 1],
  [6, 2, 1],
  [7, 1, 4, 1, 1, 3],
  [1, 1, 1, 1, 4],
  [1, 3, 1, 3, 7, 1],
  [1, 3, 1, 1, 1, 2, 1, 1, 4],
  [1, 3, 1, 4, 3, 3],
  [1, 1, 2, 2, 2, 6, 1],
  [7, 1, 3, 2, 1, 1]
];

// 0 indexed
// Row => Cols
var SHADED = {
  '3': [3, 4, 12, 13, 21],
  '8': [6, 7, 10, 14, 15, 18],
  '16': [6, 11, 16, 20],
  '21': [3, 4, 9, 10, 15, 20, 21]
}

function Grid(rowHints, colHints, shaded){
   this.rowHints = rowHints;
   this.colHints = colHints;
   this.shaded = shaded;

   this.gridRows = this.rowHints.length;
   this.gridCols = this.colHints.length;
   this.colHintHeight = Math.max.apply(Math, this.colHints.map(function (e) { return e.length }));
   this.rowHintHeight = Math.max.apply(Math, this.rowHints.map(function(e) { return e.length }));
}

Grid.prototype.generateTable = function() {
  var table = document.createElement('table');
  for (var i = 0; i < this.gridRows + this.colHintHeight; i++) {
    var tr = document.createElement('tr');
    var shadedRow = this.shaded[i - this.colHintHeight];
    for (var j = 0; j < this.gridCols + this.rowHintHeight; j++) {
      var td = document.createElement('td');
      td.data
      if (i < this.colHintHeight || j < this.rowHintHeight) {
        // Hint Cell
        td.className = "hint";
        if (i < this.colHintHeight && j >= this.rowHintHeight) { // Column Hints (TOP)
          var colHint = this.getColHint(j);
          var emptySpaceOffset = this.colHintHeight - colHint.length;
          if (i >= emptySpaceOffset) { td.innerHTML = colHint[i - emptySpaceOffset]; }
        } else if (j < this.rowHintHeight && i >= this.colHintHeight) { // Row Hints (LEFT)
          var rowHint = this.getRowHint(i);
          var emptySpaceOffset = this.rowHintHeight - rowHint.length;
          if (j >= emptySpaceOffset) { td.innerHTML = rowHint[j - emptySpaceOffset]; }
        }
      } else { // Actual grid item
        if (shadedRow && shadedRow.indexOf(j - this.rowHintHeight) >= 0) {
          // Shaded permanently
          td.className = "shaded";
        } else {
          // Can toggle
          var obj = this;
          td.addEventListener("click", function() {
            this.className = (this.className === "shaded") ? "" : "shaded";
            obj.analyzeClick(this.dataset.row, this.dataset.col);
          });
        }
      }
      td.dataset.col = j;
      td.dataset.row = i;
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  this.table = table;
  for (var i = this.colHintHeight; i < this.colHintHeight + this.gridRows; i++) {
    this.analyzeClick(i, this.rowHintHeight);
  }
  for (var j = this.rowHintHeight; j < this.rowHintHeight + this.gridCols; j++) {
    this.analyzeClick(this.colHintHeight, j);
  }
  return table;
}

Grid.prototype.analyzeClick = function(clickedRow, clickedCol) {
  var rowHint = this.getRowHint(clickedRow);
  var colHint = this.getColHint(clickedCol);
  var rows = this.table.childNodes;
  // Analyze the row
  var row = rows[clickedRow].childNodes;
  var consecutive = [];
  var current = 0;
  for (var j = 0; j < row.length; j++) {
    if (j < this.rowHintHeight) { continue; }
    if (row[j].className === "shaded") {
      current += 1;
    } else {
      if (current > 0) { consecutive.push(current); }
      current = 0;
    }
  }
  if (current > 0) { consecutive.push(current); }
  var consecutiveIdx = 0;
  for (var j = this.rowHintHeight - rowHint.length; j < this.rowHintHeight; j++) {
    row[j].className = "hint"; // reset
  }
  for (var j = this.rowHintHeight - rowHint.length; j < this.rowHintHeight; j++) {
    if (consecutiveIdx > consecutive.length) { break; }
    if (consecutive[consecutiveIdx] == row[j].innerHTML) {
      row[j].className = "checked";
      consecutiveIdx += 1;
    } else {
      break;
    }
  }
  // Analyze the col
  consecutive = [];
  current = 0;
  for (var i = 0; i < rows.length; i++) {
    if (i < this.colHintHeight) { continue; }
    if (rows[i].childNodes[clickedCol].className === "shaded") {
      current += 1;
    } else {
      if (current > 0) { consecutive.push(current); }
      current = 0;
    }
  }
  if (current > 0) { consecutive.push(current); }
  var consecutiveIdx = 0;
  for (var i = this.colHintHeight - colHint.length; i < this.colHintHeight; i++) {
    rows[i].childNodes[clickedCol].className = "hint"; // reset
  }
  for (var i = this.colHintHeight - colHint.length; i < this.colHintHeight; i++) {
    if (consecutiveIdx > consecutive.length) { break; }
    if (consecutive[consecutiveIdx] == rows[i].childNodes[clickedCol].innerHTML) {
      rows[i].childNodes[clickedCol].className = "checked";
      consecutiveIdx += 1;
    } else {
      break;
    }
  }
}

Grid.prototype.getRowHint = function(i) {
  return this.rowHints[i - this.colHintHeight];
}

Grid.prototype.getColHint = function(j) {
  return this.colHints[j - this.rowHintHeight];
}

window.onload = function() {
   var body =  document.body;
   var grid = new Grid(ROWHINTS, COLHINTS, SHADED);
   body.appendChild(grid.generateTable());
}

var grid = grid || {};

grid.options = {
    fieldWidth: 9,
    fieldHeight: 9,
    borderWidth: 1,
    padding: 5
};

grid.field = new Array();

//рисует сетку
grid.drawGrid = function (field) {
    var fieldWidth = grid.options.fieldWidth;
    var fieldHeight = grid.options.fieldHeight;
    var cellWidth = (setup.params.cellHalfWidth * 2) + grid.options.borderWidth + grid.options.padding;
    var widthValue = fieldWidth * cellWidth;
    field.style.width = widthValue + 'px';
    field.style.height = widthValue + 'px';

    for (var x = 0; x < fieldWidth; x++) {
        for (var y = 0; y < fieldHeight; y++) {
            var cellElem = Cell.createCellElement();
            var isLastInRow = x == (fieldWidth - 1);
            var isLastInCol = y == (fieldHeight - 1);
            if (!isLastInCol) {
                cellElem.classList.add("border-right");
            }
            if (!isLastInRow) {
                cellElem.classList.add("border-bottom");
            }
            var cell = new Cell(x, y, cellElem);
            field.appendChild(cellElem);
            grid.setCell(x, y, cell);
        }
    }
};

grid.getCell = function(x, y) {
    return grid.field[x][y];
};

grid.setCell = function (x, y, cell) {
    if (!grid.field[x]){
        grid.field[x] = new Array();
    }
    grid.field[x][y] = cell;
};

grid.setNextBalls = function(ballElements) {
    var nextBallsField = document.getElementsByClassName('next-balls')[0];
    nextBallsField.innerHTML = '';
    for (var i = 0; i < ballElements.length; i++) {
        nextBallsField.appendChild(ballElements[i]);
    }
};

//           +---+---+---+
//        *  |   | 0 |   |
//        *  +---+---+---+
//        *  | 3 |   | 1 |
//        *  +---+---+---+
//        *  |   | 2 |   |
//        *  +---+---+---+
grid.getNeighbours = function(x, y) {
    var f = grid.field;
    var n = new Array();
    //top
    if (grid.isWalkable(x, y - 1)) {
        n.push(f[x][y - 1]);
    }
    //right
    if (grid.isWalkable(x + 1, y)) {
        n.push(f[x + 1][y]);
    }
    //bottom
    if (grid.isWalkable(x, y + 1)) {
        n.push(f[x][y + 1]);
    }
    //left
    if (grid.isWalkable(x - 1, y)) {
        n.push(f[x - 1][y]);
    }

    return n;
};

grid.isWalkable = function(x, y) {
    var f = grid.field;
    if (x >= 0 && y >= 0 && f.length > x && f[x].length > y){
        var cell = f[x][y];
        if (cell.hasBall()) return false;
        return true;
    }

    return false;
};
function Cell(x, y, elem, ball) {
    this.x = x;
    this.y = y;
    this.elem = elem;
    this.ball = ball;
    var self = this;
    this.elem.addEventListener('click', function () {
        self.clickHandler.call(self);
    });
};

Cell.prototype.hasBall = function () {
    if (this.ball)
        return true;
    return false;
//    if (this.elem.children.length > 0) return true;
//    return false;
};

Cell.createCellElement = function () {
    var c = document.createElement('div');
    c.classList.add('cell');
    return c;
};

Cell.createMoveLineElement = function () {
    var l = document.createElement('div');
    l.classList.add('move-ball');
    return l;
};

Cell.prototype.clickHandler = function () {
    if (!this.hasBall() && engine.selectedBall) {
        var x = engine.selectedBall.x;
        var y = engine.selectedBall.y;
        var searchAlgorithm = new aStarSearch();
        var path = searchAlgorithm.findPath(grid.getCell(x, y), this);
        if (path.length > 0) {
            this.highlight();
            var time = engine.animateMoving(path);
            var cell = this;
            setTimeout(function () {
                cell.removeHighlight();
                engine.moveSelectedBall(cell);
            }, time);
            setTimeout(function () {
                var paths = engine.detectCollision(cell.x, cell.y);
                engine.destroyBalls(paths);
                engine.drawBalls();
            }, time + setup.params.showBallsDelay);
        }
    }
};

Cell.prototype.highlight = function () {
    this.elem.classList.add('cell-highlight');
};

Cell.prototype.removeHighlight = function () {
    this.elem.classList.remove('cell-highlight');
};

Cell.prototype.insertBall = function (ball) {
    this.elem.innerHTML = '';
    this.elem.appendChild(ball.elem);
    this.ball = ball;
};

Cell.prototype.clear = function () {
    this.elem.innerHTML = '';
    this.ball = null;
};
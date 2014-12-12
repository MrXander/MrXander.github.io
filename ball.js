function Ball(color, x, y) {
    this.color = color;
    this.x = x;
    this.y = y;
    this.order = 0;
    this.elem = null;
};

Ball.prototype.drawBall = function() {
    var b = this.createBallElement();
    this.elem = b;
    var cell = grid.field[this.x][this.y];
    cell.insertBall(this);
    var self = this;
    b.addEventListener('click', function(e) {
        e.stopPropagation();
        self.clickHandler();
    });
};

Ball.prototype.getNextBallElement = function() {
    var cell = Cell.createCellElement();
    var ball = this.createBallElement();
    cell.appendChild(ball);
    return cell;
};

Ball.prototype.createBallElement = function() {
    var b = document.createElement('div');
    b.classList.add('ball');
    b.classList.add(this.color);
    return b;
};

Ball.prototype.clickHandler = function() {
    var ball = this.elem;
    var isSelected = ball.classList.contains('ball-active');

    engine.deselectBalls();

    if (isSelected)
        this.deselect();
    else
        this.select();
};

Ball.prototype.deselect = function() {
    var ball = this.elem;
    if (ball.classList.contains('ball-active'))
        ball.classList.remove('ball-active');

    engine.selectedBall = null;
};

Ball.prototype.select = function() {
    var ball = this.elem;
    if (!ball.classList.contains('ball-active'))
        ball.classList.add('ball-active');

    engine.selectedBall = this;
};
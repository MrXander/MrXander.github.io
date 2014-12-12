var engine = engine || {};

engine.balls = []; //текущие шары на поле
engine.selectedBall = null; //выбранный шар
engine.availableBalls = new Array(); //заранее сгенерированные и рандомно отсортированные шары
engine.points = 0;

engine.getRandom = function (max) {
    return Math.floor(Math.random() * (max - 0 + 1)) + 0;
};

engine.getRandomPositions = function () {
    var positions = [];
    var counter = 0;
    while (true) {
        var x = engine.getRandom(grid.options.fieldWidth - 1);
        var y = engine.getRandom(grid.options.fieldWidth - 1);
        var key = x + "|" + y;
        if (!positions[key]) {
            positions[key] = [x, y];
            counter++;

            if (counter == setup.params.defaultBallsCount) {
                return positions;
            }
        }
    }
};

engine.deselectBalls = function () {
    var balls = engine.balls;
    for (var i = 0; i < balls.length; i++) {
            for (var j = 0; j < balls[i].length; j++) {
                if (balls[i][j]) {
                    balls[i][j].deselect();
                }
            }
        }
};

//заранее генерируем шары для появления и сортируем по order(он рандомный)
engine.initialize = function () {
    for (var x = 0; x < grid.options.fieldWidth; x++) {
        engine.balls[x] = new Array();
        for (var y = 0; y < grid.options.fieldHeight; y++) {
            var ball = engine.getBall(x, y);
            engine.availableBalls.push(ball);
            engine.balls[x][y] = null;
        }
    }
    //order by ascending
    engine.availableBalls.sort(function (a, b) {
        return a.order - b.order;
    });
};

//create ball object
engine.getBall = function (x, y) {
    var colorIdx = engine.getRandom(setup.colorClass.length - 1);
    var color = setup.colorClass[colorIdx];
    var ball = new Ball(color, x, y);
    ball.order = engine.getRandom(grid.options.fieldWidth * grid.options.fieldHeight);
    return ball;
};

//берем из доступных шаров сколько нужно(как в настройках указано)
engine.getBalls = function () {
    var balls = engine.availableBalls.slice(0, setup.params.defaultBallsCount);
    engine.availableBalls = engine.availableBalls.slice(setup.params.defaultBallsCount);

    for (var i = 0; i < balls.length; i++) {
        var b = balls[i];
        var x = b.x;
        var y = b.y;
        //добавляем в шары на поле
        engine.balls[x][y] = b;
    }

    if (engine.availableBalls.length === 0)
    {
        alert('game over');
    }

    return balls;
};

//берет шары из доступных, отрисовывает шары, проверяет собралась ли линия из шаров одного цвета
//и показывает какие следующие шары будут
engine.drawBalls = function () {
    var balls = engine.getBalls();
    for (var i = 0; i < balls.length; i++) {
        var b = balls[i];
        b.drawBall();
        grid.field[b.x][b.y].ball = b;
        var paths = engine.detectCollision(b.x, b.y);
        engine.destroyBalls(paths);
    }

    engine.drawNextBalls();
};

//отрисовывает какие след шары будут
engine.drawNextBalls = function () {
    var ballElements = new Array();
    var length;
    if (engine.availableBalls.length >= setup.params.defaultBallsCount) {
        length = setup.params.defaultBallsCount;
    }
    else {
        length = engine.availableBalls.length;
    }

    for (var i = 0; i < length; i++) {
        var ball = engine.availableBalls[i];
        var nextBallElement = ball.getNextBallElement();
        ballElements.push(nextBallElement);
    }
    grid.setNextBalls(ballElements);
};

//перемещает шар в пустое место на поле.
//в availableBalls хранятся заранее сгенерированные шары с позициями. Нужно поменять местами координаты нашего шара и клетки, куда шар перемещается
engine.moveSelectedBall = function (cell) {
    //console.log('moveSelectedBall');
    //console.log('cell: x = ' + cell.x + '; y = ' + cell.y);
    for (var i = 0; i < engine.availableBalls.length; i++) {
        var b = engine.availableBalls[i];
        //console.log('b: x = ' + b.x + '; y = ' + b.y);
        if (cell.x === b.x && cell.y === b.y) {
            //console.log('bingo');

            cell.insertBall(engine.selectedBall);

            var sb = engine.selectedBall;
            var currentCell = grid.field[sb.x][sb.y];
            currentCell.clear();

            engine.changeBalls(b);

            engine.selectedBall.deselect();
            engine.selectedBall = null;
            break;
        }
    }
};

//обновляет позицию шара в текущих шарах на поле и в доступных шарах
engine.changeBalls = function(availableBall) {
    var selectedBall = engine.selectedBall;

    engine.balls[selectedBall.x][selectedBall.y] = null;

    var tmp = availableBall.x;
    availableBall.x = selectedBall.x;
    selectedBall.x = tmp;

    tmp = availableBall.y;
    availableBall.y = selectedBall.y;
    selectedBall.y = tmp;

    engine.balls[selectedBall.x][selectedBall.y] = selectedBall;
};

//определяет совпадение шаров в линию
engine.detectCollision = function (x, y) {
    var w = grid.options.fieldWidth;
    var h = grid.options.fieldHeight;
    var length = Math.max(w, h);
    var detector = [];

    //для поиска диалогонали начиная слева сверху нужно подняться по этой диагонали до края поля
    var leftToRightDiagonalStartX = x;
    var leftToRightDiagonalStartY = y;
    while (leftToRightDiagonalStartX > 0 && leftToRightDiagonalStartY > 0) {
        leftToRightDiagonalStartX--;
        leftToRightDiagonalStartY--;
    }

    //для поиска диагоняли справа сверху и влево вниз нужно подняться по этой диагонали до края
    var rightToLeftDiagonalStartX = x;
    var rightToLeftDiagonalStartY = y;
    while (rightToLeftDiagonalStartX > 0 && rightToLeftDiagonalStartY != (w - 1)) {
        rightToLeftDiagonalStartX--;
        rightToLeftDiagonalStartY++;
    }

//    console.log('leftToRightDiagonalStartX = ' + leftToRightDiagonalStartX);
//    console.log('leftToRightDiagonalStartY = ' + leftToRightDiagonalStartY);
//    console.log('rightToLeftDiagonalStartX = ' + rightToLeftDiagonalStartX);
//    console.log('rightToLeftDiagonalStartY = ' + rightToLeftDiagonalStartY);

    for (var i = 0; i < length; i++) {
        var cell = grid.field[x][i];
        engine.increaseCounter(x, i, detector, "horizontal", cell);

        cell = grid.field[i][y];
        engine.increaseCounter(i, y, detector, "vertical", cell);

        //left to right diagonal
        var dx = leftToRightDiagonalStartX + i;
        var dy = leftToRightDiagonalStartY + i;
        if (dx < h && dy < w) {
            cell = grid.field[dx][dy];
            engine.increaseCounter(dx, dy, detector, "leftToRightDiagonal", cell);
        }

        //right to left diagonal
        dx = rightToLeftDiagonalStartX + i;
        dy = rightToLeftDiagonalStartY - i;
        if (dx >= 0 && dx < h && dy >= 0 && dy < w) {
            cell = grid.field[dx][dy];
            engine.increaseCounter(dx, dy, detector, "rightToLeftDiagonal", cell);
        }
    }
    var paths = engine.getCollision(detector);
    return paths;
};


//перебирает словарь detector с с ключом "цвет:направление"
engine.getCollision = function (d) {
    var pathsToDestroy = [];
    for (var p in d) {
        var colorCounter = d[p];
        var coords = colorCounter.coordinates;
        var line = [[ { x : coords[0].x, y : coords[0].y } ]];
        var lineIndex = 0;
        for (var i = 1; i < coords.length; i++) {
            var cCurrent = coords[i];
            var cPrevious = coords[i - 1];
            var c = { x : cCurrent.x, y : cCurrent.y };
            //если координаты идут друг за другом(мы идет всегда сверху вниз), то добаляем, если нет - записываем в другой массив, чтобы позже выбрать самую длинную последовательность
            if (cCurrent.x === (cPrevious.x + 1) || cCurrent.y === (cPrevious.y + 1)) {
                line[lineIndex].push(c);
            } else if (line.length < setup.params.lineLength) {
                lineIndex++;
                line[lineIndex] = new Array();
            }
        }
        //если получилось несколько совпадение(на случай большого поля)
        for (var i = 0; i < line.length; i++)         {
            if (line[i].length >= setup.params.lineLength) {
                pathsToDestroy.push(line[i]);
            }
        }
    }
    return pathsToDestroy;
};

//detector - словарь с ключом "цвет:направление", значение координаты шаров с таким цветом по этому направлению
engine.increaseCounter = function (x, y, detector, direction, cell) {
    //console.log('increaseCounter: x = ' + x + '; y = ' + y);
    if (cell.hasBall()) {
        var color = cell.ball.color;
        var key = color + ':' + direction;
        var colorCounter = detector[key];
        if (colorCounter) {
            colorCounter.coordinates.push({x: x, y: y});
        } else {
            colorCounter = { coordinates: [ { x: x, y: y } ]};
        }
        detector[key] = colorCounter;
    }
};

//удаляет шары с поля, генерируем новые шары под пустые места и добавляем в availableBalls
engine.destroyBalls = function (paths) {
    for (var i = 0; i < paths.length; i++) {
        engine.points = engine.points + engine.countPoints(paths[i]);
        for (var j = 0; j < paths[i].length; j++) {
            var x = paths[i][j].x;
            var y = paths[i][j].y;
            var cell = grid.field[x][y];

            //TO DO: destroy animation here

            cell.clear();

            engine.balls[x][y] = null;

            //adding new ball to this position
            var ball = engine.getBall(x, y);
            engine.availableBalls.push(ball);
        }
    }
    engine.availableBalls.sort(function(a, b) { return a.order - b.order; });
    engine.showPoints();
};

engine.countPoints = function(path) {
    var lineLength = setup.params.lineLength;
    var defaultPoints = setup.params.defaultPointForBall;
    var points = 0;
    for (var i = 0; i < path.length; i++) {
        if (i < setup.params.lineLength) {
            points = points + defaultPoints;
        } else {
            points = points + ((i + 1 - lineLength) * defaultPoints * setup.params.pointMultiplier);
        }
    }
    return points;
};

engine.showPoints = function() {
    var e = document.getElementById('points');
    e.innerHTML = engine.points;
};

engine.animateMoving = function (path) {
    path = path.length > 2 ? path.slice(1, path.length - 1) : [];
    var length = path.length;
    var halfTime = setup.params.moveLineTime / 2;
    var oneItemShowTime = halfTime / length;
    var oneItemHideTime = halfTime / length;

    for (var i = 0; i < length; i++) {
        var coordinates = path[i];
        var x = coordinates[0];
        var y = coordinates[1];
        engine.drawMoveLine(x, y, i, oneItemShowTime);
        engine.hideMoveLine(x, y, i, oneItemHideTime, halfTime);
    }
    return halfTime;
};

engine.drawMoveLine = function (x, y, i, oneItemShowTime) {
    setTimeout(function () {
            (function (x, y) {
                var cell = grid.field[x][y];
                var moveLine = Cell.createMoveLineElement();
                cell.elem.appendChild(moveLine);
            })(x, y);
        },
            (i + 1) * oneItemShowTime);
};

engine.hideMoveLine = function (x, y, i, oneItemHideTime, showTime) {
    setTimeout(function () {
            (function (x, y) {
                var cell = grid.field[x][y];
                cell.elem.innerHTML = '';
            })(x, y);
        },
            (i + 1) * oneItemHideTime + showTime);
};
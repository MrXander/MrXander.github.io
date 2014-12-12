var setup = setup || {};

setup.params = {
    defaultBallsCount: 3, //по сколько шаров появляется
    lineLength: 5, //сколько подряд шаров нужно собрать
    cellHalfWidth: 38, //из css. + padding + border
    moveLineTime: 500, //длительность анимации перемещения
    showBallsDelay: 300, //задержка перед показом шаров после анимации,
    defaultPointForBall: 10,
    pointMultiplier: 2
};

//css класс из style.css с названиями классов цветов
setup.colorClass = [
    "red",
    "green",
    "blue",
    "yellow",
    "aqua",
    "purple"
];

window.onload = function () {
    var id = "field";
    var field = document.getElementById(id);

    grid.drawGrid(field);
    engine.initialize();
    engine.drawBalls();
};

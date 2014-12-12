function Node(cell) {
    this.x = cell.x;
    this.y = cell.y;
    this.isOpen = false;
    this.isClosed = false;
    this.parent = null;
    this.g = 0;
    this.f = 0;

    //для де
    this.e = cell.elem;

    aStarSearch.nodes[this.x][this.y] = this;
}

Node.map = function(cells) {
  var result = new Array();
    for(var i = 0; i < cells.length; i++) {
        var c = cells[i];
        var n;
        if (!aStarSearch.nodes[c.x][c.y]) {
            n = new Node(cells[i]);
        }
        result.push(aStarSearch.nodes[c.x][c.y]);
    }
    return result;
};

function aStarSearch() {
    aStarSearch.nodes = new Array();
      for(var x = 0; x < grid.options.fieldHeight; x++) {
          aStarSearch.nodes[x] = new Array();
          for(var y = 0; y < grid.options.fieldWidth; y++) {
              aStarSearch.nodes[x][y] = null;
          }
      }
};

aStarSearch.prototype.findPath = function(startCell, endCell) {
    var openList = new Array();
    var xEnd = endCell.x;
    var yEnd = endCell.y;
    var startNode = new Node(startCell);
    var endNode = new Node(endCell);
    var heuristicManhattan = function(dx, dy) { return dx + dy; };

    openList.push(startNode);
    startNode.isOpen = true;

    while(openList.length > 0) {
        var node = openList.pop();
        node.isClosed = true;

//        var b = document.createElement('b');
//        b.innerHTML = 'Cur node';
//        node.e.appendChild(b);

        if (node.x === endNode.x && node.y === endNode.y) {
            return this.buildPath(node);
        }

        //console.log('current node: x = ' + node.x + '; y = ' + node.y);

        var neighbours = Node.map(grid.getNeighbours(node.x, node.y));
        for (var i = 0; i < neighbours.length; i++) {
            var n = neighbours[i];

            //console.log('neighbour: x = ' + n.x + '; y = ' + n.y);
//            var b = document.createElement('b');
//            b.innerHTML = 'n ' + i;
//            n.e.appendChild(b);

            if (n.isClosed) {
                continue;
            }

            //вычисляем расстояние от текущей клетки до соседней и считаем функцию стоимости достижения рассматриваемой вершины g
            //var ng = node.g + ((n.x - node.x === 0 || n.y - node.y === 0) ? 1 : Math.SQRT2);
            var ng = node.g + 1;

            //проверяем, что клетку еще не проверяли или до неё можно добраться с меньшей стоимостью
            if (!n.isOpen || ng < n.g) {
                n.g = ng;
                n.h = n.h || heuristicManhattan(Math.abs(n.x - xEnd), Math.abs(n.y - yEnd));
                n.f = n.g + n.h;
                n.parent = node;

                if (!n.isOpen) {
                    n.isOpen = true;
                    openList.push(n);
                }

                openList = openList.sort(function(a, b) { return b.f - a.f; }); //по убыванию для pop()
            }
        }
    }

    //не удалось найти путь
    return [];
};

aStarSearch.prototype.buildPath = function(endNode) {
    var node = endNode;

    console.log('x = ' + node.x + '; y = ' + node.y);

      var path = [[endNode.x, endNode.y]];
      while(node.parent) {
          node = node.parent;
          path.push([node.x, node.y]);

          console.log('x = ' + node.x + '; y = ' + node.y);
      }

    return path.reverse();
};
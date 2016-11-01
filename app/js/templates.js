angular.module('chessApp').run(['$templateCache', function($templateCache) {$templateCache.put('components/chessboard/chessboard.html','<div>\r\n\t<div ng-repeat="row in ctrl.board.rows" class="row">\r\n\t\t<div ng-repeat="cell in row.cells" class="cell" ng-class="{\'black-cell\': cell.black}" ng-click="ctrl.selectCell($event, cell)">\r\n\t\t\t<img ng-if="cell.figure" ng-src="{{cell.figure.img}}" alt="" class="figure">\r\n\t\t\t\r\n\t\t\t<div ng-if="cell.rowName" class="row-name">{{cell.rowName}}</div>\r\n\t\t\t<div ng-if="cell.collName" class="coll-name">{{cell.collName}}</div>\r\n\t\t\t<div ng-if="cell.isSelected" class="selected"></div>\r\n\t\t</div>\t\t\t\r\n\t</div>\t\r\n</div>\t\r\n');}]);
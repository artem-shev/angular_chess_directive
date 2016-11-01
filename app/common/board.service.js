(function () {
	'use strict';
	angular.module('chessApp.common')
		.service('boardService', boardService);

		function boardService () {
			var service = {
				constructor: Board
			};


			function Board (rows, colls, player1, player2) {
				var self = this;
			//variables
				var chars = getCharArr('a', 'z'),
					numbers = getNumberArr(1, 26),
					isBlack = true,
					i,
					titles = {
						rows: numbers.slice(0, rows),
						colls: chars.slice(0, colls)
					};
			//properties of board
				self.player1 = player1;
				self.player2 = player2;
				self.figures = _.concat(self.player1.figures, self.player2.figures);
				self.movesLog = [];
				self.deadFigures = [];

				activate();


				function activate () {
					buildRows();
					buildCells();
					getCellsArr(); //get single array of all cells	
					self.bindFigures(); //set binding between cell and figure
					self.getAvailableMoves(self.cells); 
				}

				function getCharArr (charStart, charLast) {
					var arr = [], start = charStart.charCodeAt(0), finish = charLast.charCodeAt(0);
					for (var i = start; i <= finish; i++) {
						arr.push(String.fromCharCode(i));
					}
					return arr;
				}

				function getNumberArr (start, finish) {
					var arr = [];
					for(var i = start; i <= finish; i++) {
						arr.push(i);
					}
					return arr;
				}

				function buildRows () {
					self.rows = [];

					for (i = 0; i < rows; i++) {
						self.rows.push({
							row: i+1,
							cells: [],
							firstCellBlack: isBlack
						});
						isBlack = !isBlack;
					}
					self.rows = self.rows.reverse();
				}

				function buildCells () {
					self.rows.forEach(function(row) {
						for(i = 0; i < colls; i++) {
							var obj = {
								row: row.row,
								coll: i+1,
								black: row.firstCellBlack,
								cellName: getCollName(i+1) + row.row
							};
							if (i === 0) {
								obj.rowName = row.row;
							}
							if (row.row === 1) {
								obj.collName = getCollName(i+1);
								// obj.collName = i+1;
							}

							row.cells.push(obj);
							row.firstCellBlack = !row.firstCellBlack;
						} 
					});
				}

				function getCellsArr () {
					self.cells = [];
					_.each(self.rows, function (row) {
						self.cells.push(row.cells);
					});
					self.cells = _.flatten(self.cells); 	
				}

				function getCollName (coll) {
					if (coll <= titles.colls.length) {
						return titles.colls[(coll-1)];
					} else {
						throw new Error('unexpected number of collumns');
					}
				}

			}

			Board.prototype.bindFigures = function() {
				var self = this;
				_.each(self.figures, function (item) {	
					_.find(self.cells, item.cordinats).figure = item; 
				});
			};

			Board.prototype.getAvailableMoves = function(cells) {
				var self = this;
				self.availableMoves = [];
				_.each(self.figures, function (figure, i) {
					self.availableMoves.push(figure.getAvailableMoves(cells));

					if (i === self.figures.length - 1) {
						self.availableMoves = _.flatten(self.availableMoves);
					} 
				});
			};

			Board.prototype.removeFigure = function(figure) {
				var self = this;
				var index = self.figures.indexOf(figure);
				self.deadFigures.push(figure);
				self.figures.splice(index, 1);
			};

			Board.prototype.validateMove = function (selectedCells) {
				var self = this;
				var validation = {
					startCell: _.find(self.cells, selectedCells.position),
					finishCell: _.find(self.cells, selectedCells.dest),
					dest: selectedCells.dest,
					availableMove: _.find(self.availableMoves, selectedCells)
				}

				if (!validation.availableMove) {
					console.log('not valide move');
					return false;
				} else {
					if (!validation.finishCell.figure && validation.availableMove.dest.basic) {
						// console.log('dest is free');
						return validation;
					} else if (validation.finishCell.figure && validation.availableMove.dest.kill && (validation.finishCell.figure.isBlack != validation.startCell.figure.isBlack)) {
						// console.log('U can kill him');
						validation.killMove = true;
						return validation;
					} else {
						// console.log('not today');
						return false;
					}
				}
					
			};

			Board.prototype.makeMove = function(validation) {
				var self = this;

				if (validation) {
					var figure = validation.startCell.figure;

					if (validation.killMove) {
						validation.finishCell.figure.death();

						self.removeFigure(validation.finishCell.figure);
						delete validation.finishCell.figure;			
					}

					figure.move(validation.dest);
					delete validation.startCell.figure;

					self.bindFigures();
					self.getAvailableMoves(self.cells);
				}
			};
			
			return service;
		}
})();

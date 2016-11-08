(function () {
	'use strict';
	angular.module('chessApp.common')
		.service('boardService', boardService);

		function boardService () {
			var service = {
				constructor: Board
			};

			function Board (rows, cols, player1, player2) {
				var self = this;
			//variables
				var chars = getCharArr('a', 'z'),
					numbers = getNumberArr(1, 26),
					isBlack = true,
					i,
					titles = {
						rows: numbers.slice(0, rows),
						cols: chars.slice(0, cols)
					};
			//properties of board
				self.whiteTurn = true;
				self.player1 = player1 || {};
				self.player2 = player2 || {};
				self.figures = _.concat(self.player1.figures, self.player2.figures);
				self.movesLog = [];
				self.deadFigures = [];

				activate();
				// self.start();

				function activate () {
					buildRows();
					buildCells();
					getCellsArr(); //get single array of all cells	
					if (self.figures[0]) {
						self.bindFigures(); //set binding between cell and figure
						self.getAvailableMoves(self.cells); 
					}
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
						for(i = 0; i < cols; i++) {
							var obj = {
								row: row.row,
								col: i+1,
								black: row.firstCellBlack,
								cellName: getColName(i+1) + row.row
							};
							if (i === 0) {
								obj.rowName = row.row;
							}
							if (row.row === 1) {
								obj.colName = getColName(i+1);
								// obj.colName = i+1;
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

				function getColName (col) {
					if (col <= titles.cols.length) {
						return titles.cols[(col-1)];
					} else {
						throw new Error('unexpected number of columns');
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

			Board.prototype.start = function () {
				var self = this;
				self.player1.defaultStart();
				self.player2.defaultStart();
				self.figures = _.concat(self.player1.figures, self.player2.figures);
				self.bindFigures();
				self.getAvailableMoves(self.cells);
				self.gameIsStarted = true;
			};

			Board.prototype.restart = function () {
				var self = this;
				self.cells.forEach(function (item) {
					if (item.figure) {
						delete item.figure;
					}
				});

				self.player1.restart();
				self.player2.restart();
				
				self.whiteTurn = true;
				self.movesLog = [];
				self.deadFigures = [];
				self.figures = _.concat(self.player1.figures, self.player2.figures);
				self.bindFigures();
				self.getAvailableMoves(self.cells);
			};

			Board.prototype.validateMove = function (selectedCells) {
				var self = this;

				if(self.movesLog.length) {
					var lastMove = self.movesLog[self.movesLog.length - 1];
				}
				
				var validation = {
					startCell: _.find(self.cells, selectedCells.position),
					finishCell: _.find(self.cells, selectedCells.dest),
					dest: selectedCells.dest,
					availableMove: _.find(self.availableMoves, selectedCells)
				};
				var mainFigure = validation.startCell.figure;
				var targetFigure = validation.finishCell.figure;


				// check which player shall make move
				if ((validation.startCell.figure.isBlack && self.whiteTurn) || (!validation.startCell.figure.isBlack && !self.whiteTurn)) {return;}

				//check if there any available move
				if (!validation.availableMove) {return;} 

				//check if finish cell is empty and move can't kill
				if (!targetFigure && validation.availableMove.basic) {
					validation.typeOfMove = 'basic';

					//passing move for pawn
					if (validation.availableMove.passing) {
						validation.typeOfMove = 'passing';
						validation.passingThrow = {col: validation.finishCell.col};
						if (!mainFigure.isBlack) {
							validation.passingThrow.row = validation.finishCell.row - 1;
						} else {
							validation.passingThrow.row = validation.finishCell.row + 1;
						}
					}
					return validation;
				}

				//check kill move: in finish cell figure; kill move; figure in finish cell is figure of oponent
				if (targetFigure && validation.availableMove.kill && (targetFigure.isBlack != mainFigure.isBlack)) {
					validation.typeOfMove = 'killMove';
					return validation;
				}

				//in passing pawn attack check
				if (lastMove && lastMove.typeOfMove === 'passing') {
					var passingPawn = _.find(self.figures, {id: lastMove.figureId});
					validation.secondFigure = passingPawn;
					if (mainFigure.name === 'pawn' && validation.availableMove.kill && (mainFigure.isBlack !== passingPawn.isBlack)) {
						var checkCell = (validation.availableMove.dest.col === lastMove.passingThrow.col) && (validation.availableMove.dest.row === lastMove.passingThrow.row)
						if (checkCell) {
							validation.typeOfMove = 'inPassingKill';
							validation.secondFigureCell = _.find(self.cells, {figure: passingPawn});
							return validation;
						}
					}
				}

				//vars for castling
				var rookCell, oponentColor, 
				isEmpty = true, 
				isSafe = true;

				//check castling
				if (validation.availableMove.type && validation.availableMove.type.name === 'castling') {
					if (mainFigure.color === 'white') {
						oponentColor = 'black';
					} else {
						oponentColor = 'white';
					}
					//check type of castling
					if (validation.availableMove.type.long) {
						validation.secondFigureCell = rookCell = _.find(self.cells, {row: selectedCells.position.row, col: selectedCells.position.col - 4});
					} else {
						validation.secondFigureCell = rookCell = _.find(self.cells, {row: selectedCells.position.row, col: selectedCells.position.col + 3});
					}


					if (rookCell.figure && rookCell.figure.name === 'Rook' && rookCell.figure.firstMove) {
						validation.secondFigure = rookCell.figure;
						validation.typeOfMove = validation.availableMove.type;
						if (validation.availableMove.type.long) {
							validation.secondFigureDest = {row: rookCell.row, col: rookCell.col + 3};
						} else {
							validation.secondFigureDest = {row: rookCell.row, col: rookCell.col - 2};
						}
					} else {return;}

					var cellsBetween = self.checkCellsLine(validation.startCell, rookCell, true);

					cellsBetween.forEach(function (cell, i) {
						var attack = _.find(self.availableMoves, {
							color: oponentColor,
							kill: true,
							dest: {
								row: cell.row,
								col: cell.col,
							}
						});
						if (validation.availableMove.type.long && i === 0) {attack = undefined;}
						if (cell.figure) {isEmpty = false;}
						if (attack) {isSafe = false;}
					});
					if (isSafe && isEmpty) {return validation;}
				}	
			};

			Board.prototype.checkCellsLine = function (start, finish, excludeStartAndFinish) {
				var self = this;
				var cells = [];

				var startCell = {}; 
				
				var totalRows = Math.abs(start.row - finish.row);
				var totalCols = Math.abs(start.col - finish.col);

				if (start.row === finish.row) {
					startCell.row = start.row;
					startCell.col = Math.min(start.col, finish.col);
					
					for (var i = 0; i <= totalCols; i++ ) {
						cells.push(_.find(self.cells, {row: startCell.row, col: startCell.col + i}));
					}
				}

				if (start.col === finish.col) {
					startCell.row = Math.min(start.row, finish.row);
					startCell.col = start.col;

					for (var i = 0; i <= totalRows; i++ ) {
						cells.push(_.find(self.cells, {row: startCell.row + i, col: startCell.col}));
					}
				}

				if (excludeStartAndFinish) {
					cells.shift();
					cells.pop();
				}

				// cells.forEach(function(cell) {
				// 	cell.isSelected = true;
				// });
				// console.log('cells', cells);

				return cells;
			};

			Board.prototype.makeMove = function(validation) {
				var self = this;
				var move = {};
				
				if (validation) {
					var figure = validation.startCell.figure;

					if (validation.typeOfMove === 'killMove') {
						validation.finishCell.figure.death();

						self.removeFigure(validation.finishCell.figure);
						delete validation.finishCell.figure;			
					}

					figure.move(validation.dest);

					//complicated moves (castling and in passing pawn attack)					
					if (validation.secondFigure) {
						if (validation.typeOfMove.name === 'castling') {
							validation.secondFigure.move(validation.secondFigureDest);
						}
						if (validation.typeOfMove === 'inPassingKill') {
							validation.secondFigure.death();
							self.removeFigure(validation.secondFigure);
						}
							delete validation.secondFigureCell.figure;
					} 
					delete validation.startCell.figure;
					
					move = {
						startCell: validation.startCell,
						finishCell: validation.finishCell,
						typeOfMove: validation.typeOfMove,
						figureId: figure.id,
						color: figure.color
					};
					
					if (validation.typeOfMove === 'passing') {
						move.passingThrow = validation.passingThrow;
					}

					self.movesLog.push(move);

					self.bindFigures();
					self.getAvailableMoves(self.cells);
					self.whiteTurn = !self.whiteTurn;

					// console.log('self.movesLog', self.movesLog);
					// console.log('self.deadFigures', self.deadFigures);
				}
			};

			return service;
		}
})();

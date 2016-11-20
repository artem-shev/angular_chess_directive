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
				self.players = [player1, player2];
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
				var player = _.find(self.players, {color: figure.color});
				player.buryFigure(figure);
				self.deadFigures.push(figure);
				self.figures.splice(index, 1);
			};

			Board.prototype.resurectFigure = function(figure) {
				var self = this;		
			};

			Board.prototype.start = function () {
				var self = this;
				self.player1.defaultStart();
				self.player2.defaultStart();
				self.figures = _.concat(self.player1.figures, self.player2.figures);
				self.bindFigures();
				self.getAvailableMoves(self.cells);
				self.sortFigures();
				self.gameIsStarted = true;
				self.gameStatus = {currentPlay: true};
			};

			Board.prototype.restart = function () {
				var self = this;
				self.cells.forEach(function (cell) {
					if (cell.figure) {
						delete cell.figure;
					}
					if (cell.isSelected) {
						delete cell.isSelected;
					}
				});

				self.player1.restart();
				self.player2.restart();
				
				self.whiteTurn = true;
				self.movesLog = [];
				self.deadFigures = [];
				self.figures = _.concat(self.player1.figures, self.player2.figures);
				self.figureTransform = undefined;
				self.bindFigures();
				self.getAvailableMoves(self.cells);
				self.sortFigures();
				self.gameStatus = {currentPlay: true};
			};

			//for 
			Board.prototype.sortFigures = function () {
				var self = this;

				self.players.forEach(function (player, i) {
					var playerFigures = self.figures[player.color] = {};
					playerFigures.king = _.find(player.figures, {
						name: 'King'
					});
					
					playerFigures.longRangeFigures = [];

					player.figures.forEach(function (figure) {
						if (figure.isDead) {return;}
						switch(figure.name) {
							case 'Rook': 
							case 'Bishop':
							case 'Queen':	
								playerFigures.longRangeFigures.push(figure);
						}
					});

				});
			};

			Board.prototype.validateMove = function (selectedCells) {
				var self = this;

				if(self.movesLog.length > 1) {
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

				//game over check
				if (!self.gameStatus.currentPlay) {return;}
				
				// check which player shall make move
				if ((validation.startCell.figure.isBlack && self.whiteTurn) || (!validation.startCell.figure.isBlack && !self.whiteTurn)) {return;}

				//check if there any available move
				if (!validation.availableMove) {return;} 

				//validate moves for all figures except kings
				if (mainFigure.name !== 'King') {
					
					//check for check condition
					var kingCond = self.validateKingsMoves(selectedCells, validation, true);
					if (!kingCond) {return;}

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
				}

				//in passing pawn attack check
				if (mainFigure.name === 'pawn' && lastMove && lastMove.typeOfMove === 'passing') {
					var passingPawn = lastMove.figure;
					validation.secondFigure = passingPawn;
					if (passingPawn && validation.availableMove.kill && (mainFigure.isBlack !== passingPawn.isBlack)) {
						var checkCell = (validation.availableMove.dest.col === lastMove.passingThrow.col) && (validation.availableMove.dest.row === lastMove.passingThrow.row)
						if (checkCell) {
							validation.typeOfMove = 'inPassingKill';
							validation.secondFigureCell = _.find(self.cells, {figure: passingPawn});
							return validation;
						}
					}
				}

				if (mainFigure.name === 'King') {
					var valid = self.validateKingsMoves(selectedCells, validation);
					if (valid) {
						return valid;
					} else {
						return false;
					} 
				}	
			};


			Board.prototype.validateKingsMoves = function (selectedCells, validation, forOtherFigures) {
				var self = this;
				var mainFigure = validation.startCell.figure;
				var startCell = validation.startCell;
				var finishCell = validation.finishCell;
				var selfColor = mainFigure.color;
				
				var oponentColor, king, kingCord, 
					isCaptured, capFigure, restrictMove, checkMoves, 
					kingInDanger, availableMoves, 
					captureCheck, underAtack;
				//vars for castling
				var rookCell, 
				isEmpty = true, 
				isSafe = true;

				if (selfColor === 'white') {
					oponentColor = 'black';
				} else {
					oponentColor = 'white';
				}

				king = self.figures[mainFigure.color].king;
				kingCord = {row: king.cordinats.row, col: king.cordinats.col};
				isCaptured = _.filter(self.availableMoves, {color: oponentColor, dest: kingCord, kill: true});
				
				//check king condition for other figures
				if (forOtherFigures) {
					switch (isCaptured.length) {
						case 0:
							self.figures[oponentColor].longRangeFigures.forEach(function (figure) {
								if (figure.isDead) {return;}
								checkMoves = figure.getAvailableMoves(self.cells, validation.startCell, true);
								kingInDanger = _.find(checkMoves, {dest: kingCord});
								if (kingInDanger) {restrictMove = true;}
							});
							
							if (!restrictMove) {
								return true;
							} else {
								return false;
							}
							break;							
						case 1: 
							capFigure = _.find(self.figures, {id: isCaptured[0].figureId});
//kill
							if ((finishCell.col === capFigure.cordinats.col) && (finishCell.row === capFigure.cordinats.row) && validation.availableMove.kill) {return true;}
//protect	
							availableMoves = capFigure.getAvailableMoves(self.cells, validation.finishCell);
							captureCheck = _.find(availableMoves, {dest: kingCord});

							if (!captureCheck) {
								return true;
							} else {
								return false;
							}
							break;							
						default: 
							return false;
					}
				}

				
				//basic king move
				if (!validation.availableMove.type && mainFigure.name === 'King') {
					kingInDanger = [];
					underAtack = _.find(self.availableMoves, {
						color: oponentColor,
						kill: true, 
						dest: {row: finishCell.row, col: finishCell.col}
					});

					if (isCaptured.length !== 0) {
						isCaptured.forEach(function (move) {
							capFigure = _.find(self.figures, {id: move.figureId});
							checkMoves = capFigure.getAvailableMoves(self.cells, startCell, true);
							var dest = {row: finishCell.row, col: finishCell.col};
							var danger = _.find(checkMoves, {dest: dest});
							if (danger) {kingInDanger.push(danger);}						
						});
					} 

					if (!underAtack && kingInDanger.length === 0) {
						if (!validation.finishCell.figure) {
							validation.typeOfMove = 'basic';
						} else {
							if (validation.finishCell.figure.color === selfColor) {return;} 
							validation.typeOfMove = 'killMove';
						}

						return validation;
					}
				}
			

				//castling check
				if (validation.availableMove.type && validation.availableMove.type.name === 'castling') {
					isCaptured = _.find(self.availableMoves, {
						color: oponentColor,
						dest: {row: startCell.row, col: startCell.col}
					});

					if (isCaptured) {return;}

					//check type of castling
					if (validation.availableMove.type.long) {
						validation.secondFigureCell = rookCell = _.find(self.cells, {row: selectedCells.position.row, col: selectedCells.position.col - 4});
					} else {
						validation.secondFigureCell = rookCell = _.find(self.cells, {row: selectedCells.position.row, col: selectedCells.position.col + 3});
					}


					if (rookCell && rookCell.figure && rookCell.figure.name === 'Rook' && rookCell.figure.firstMove) {
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
			Board.prototype.checkGameOverStates = function (showTips) {
				var self = this;											
//check draw state (insufficient material)
				if (self.figures.length <= 4) {
					var drawCheck = [];
					self.players.forEach(function (player, i) {													
						var figures = player.figures;
						switch (figures.length) {
							case 1: 
								if (figures[0].name === 'King') {
									drawCheck.push(true);
								}
								break;
							case 2:
								var bishop = _.find(figures, {name: 'Bishop'});	
								var knight = _.find(figures, {name: 'Knight'});
								var king = _.find(figures, {name: 'King'});
								if (king && (bishop || knight)) {
									drawCheck.push(true);							
								} else {
									drawCheck.push(false);
								}
								break;
							default: 
								drawCheck.push(false);
						}	
					});

					if (drawCheck[0] && drawCheck[1]) {
						self.gameStatus = {
							gameOver: true,
							case: 'draw',
							reason: 'insufficient material'
						};
						console.log('game over', self.gameStatus, drawCheck)
						return;
					}
				}

//checkmate state
				var color, oponentColor;
				if (self.whiteTurn) {
					color = 'white';
					oponentColor = 'black';
				} else {
					color = 'black';
					oponentColor = 'white';
				}

				var king = self.figures[color].king;
				var kingCord = {row: king.cordinats.row, col: king.cordinats.col};
//check for king is captured				
				var isCaptured = _.find(self.availableMoves, {color: oponentColor, dest: kingCord});
//check if there any available move
				var playerMoves = _.filter(self.availableMoves, {color: color});
				var availableMoves = [];

				playerMoves.forEach(function (move, i) {
					var cells = {
						figureId: move.figureId,
						position: move.position,
						dest: move.dest
					}; 
					var validation = self.validateMove(cells);
					if (validation) {
						availableMoves.push(move);
					}

				});
				if (availableMoves.length === 0) {
					if (isCaptured) {
						self.gameStatus = {
							gameOver: true,
							case: 'checkmate',
							winner: _.find(self.players, {color: oponentColor}).name,
							looser: _.find(self.players, {color: color}).name
						};
						console.log('game over', self.gameStatus)
						return;
					} else {
						self.gameStatus = {
							gameOver: true,
							case: 'draw',
							reason: 'stalemate'
						};
						console.log('game over', self.gameStatus)
						return;						
					}
				}
				if (showTips) {self.hints = availableMoves;}

			};

			Board.prototype.getPlayersPiecesValues = function () {
				var self = this;
				self.playersPiecesValues = {};
				self.players.forEach(function (player) {
					self.playersPiecesValues[player.color] = player.piecesValue = player.getPiecesValue();
				});
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



			Board.prototype.pawnTransform = function (transInfo, newFigure) {
				var self = this;
				var player = transInfo.player;
				var validation = transInfo.validation;
				var pawn = transInfo.validation.finishCell.figure;
				
				pawn.death();
				self.removeFigure(pawn);
				delete validation.finishCell.figure;			
				
				var figure = player.addFigure(newFigure, validation.dest);
				var indexOfDead = self.deadFigures.indexOf(figure);

				if (indexOfDead !== -1) {
					self.deadFigures.splice(indexOfDead, 1);
				}

				self.figures.push(figure);

				self.sortFigures();
				self.bindFigures();
				self.getAvailableMoves(self.cells);
				self.checkGameOverStates();
				self.figureTransform = undefined;			
			};





			Board.prototype.makeMove = function(validation) {
				var self = this;
				
				if (validation) {
					var figure = validation.startCell.figure;

					if (validation.typeOfMove === 'killMove') {
						var victimFigure = validation.finishCell.figure;
						victimFigure.death();

						self.removeFigure(victimFigure);
						delete validation.finishCell.figure;			
					}

					figure.move(validation.dest);	

					if (validation.availableMove.transform) {
						var pawn = validation.startCell.figure;
						self.figureTransform = {
							available: true,
							player: _.find(self.players, {color: pawn.color}),
							validation: validation
						};
					}


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
					
					var move = {
						startCell: validation.startCell,
						finishCell: validation.finishCell,
						typeOfMove: validation.typeOfMove,
						figure: figure
					};
					
					if (validation.typeOfMove === 'passing') {
						move.passingThrow = validation.passingThrow;
					}

					if (move.typeOfMove === 'killMove') {
						move.victim = victimFigure;
					}

					self.movesLog.push(move);

					self.bindFigures();
					self.getAvailableMoves(self.cells);
					self.whiteTurn = !self.whiteTurn;
					self.checkGameOverStates();					
				}
			};

			return service;
		}
})();

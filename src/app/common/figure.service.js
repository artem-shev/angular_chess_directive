(function () {
	'use strict';

	angular.module('chessApp.common')
		.factory('figureService', figureService);

		function figureService() {
			var service = {
				constructors: {
					Pawn: Pawn,
					Bishop: Bishop,
					Knight: Knight,
					Rook: Rook,
					Queen: Queen,
					King: King
				},
				restrictions: {
					rows: 8,
					cols: 8
				}
			};

			var figuresId = 1;
			//limits to moves 
			var rows = service.restrictions.rows; 
			var cols = service.restrictions.cols;

			function Figure (userSet, cordinats) {
				var self = this;
				self.isBlack = userSet.isBlack;
				self.cordinats = cordinats;
				self.firstMove = true;
				self.id = figuresId;

				figuresId++;
			}

			Figure.prototype.move = function(position) {
				var self = this;
				self.cordinats = position;
				self.firstMove = false;
			};

			Figure.prototype.death = function() {
				var self = this;
				self.cordinats = undefined;
				self.isDead = true;
			};

			//constructor for major and minor pieces
			function PiecesFigures () {
				var self = this;
				Figure.apply(self, arguments);

				self.moveSettings = {
					movesDescr: [],
					moveLength: 8,
					jump: false
				};
			}

			PiecesFigures.prototype = Object.create(Figure.prototype);
			PiecesFigures.prototype.constructor = PiecesFigures;

			PiecesFigures.prototype.getAvailableMoves = function (cells, checkCell, ignoreCell) {
				var self = this;
				if (self.isDead) {return;}
				var set = self.moveSettings;
				var availableMoves = [];
				var position = self.cordinats;	
				var i, row, col, move;
				
				set.movesDescr.forEach(function (dir) {
					for (i = 1; i <= set.moveLength; i++) {
						row = i*dir.row + position.row;
						col = i*dir.col + position.col;

						if (row === 0 || col === 0) {break;}
						
						if (!dir.custom) {
							move = {
								figureId: self.id,
								color: self.color,
								position: position,
								dest: {
									row: row,
									col: col
								},
								kill: true,
								basic: true
							};
						} else {
							move = {
								figureId: self.id,
								color: self.color,
								position: position,
								dest: {
									row: row,
									col: col
								},
								type: dir.custom
							};
						}

						if (row > 0 && row <= rows && col > 0 && col <= cols) {
							availableMoves.push(move);
						}

						// if (!set.jump) {
							var cell;
							cell = _.find(cells, {row: row, col: col}) || {};						

							if (ignoreCell && cell === checkCell) {continue;}
							
							if (checkCell && cell === checkCell && !ignoreCell) {break;}
							
							if (cell.figure) {break;}	

						// }	
					}
				});

				return availableMoves;
			};

			PiecesFigures.prototype.resurect = function (cords) {
				var self = this;
				self.cordinats = cords;
				delete self.isDead;
			}

			function Pawn (userSet, cordinats) {
				var self = this;
				Figure.apply(self, arguments);
				self.name = 'pawn';
				self.value = 1;

				switch (self.isBlack) {
					case true: 
						self.color = 'black';
						self.img = 'assets/figures/bP.png';
						self.fenName = 'p';
						break;
					case false: 
						self.color = 'white';
						self.img = 'assets/figures/wP.png';
						self.fenName = 'P';						
						break;												
				}
				
				switch (self.color) {
					case 'white': 
						self.moveDir = 1;
						break;
					case 'black': 
						self.moveDir = -1;
						break;
				}
			}

			Pawn.prototype = Object.create(Figure.prototype);
			Pawn.prototype.constructor = Pawn;

			Pawn.prototype.getAvailableMoves = function(cells) {
				var self = this;
				var availableMoves = []; 
				var dir = self.moveDir; 
				var move, nCol;
				var position = self.cordinats;

				//basic move (+1 row)
				move = {
					figureId: self.id,
					color: self.color,
					position: position,
					dest: {
						row: (1*dir + position.row),
						col: (0 + position.col)
					},
					kill: false,
					basic: true					
				};

				if(move.dest.row === 1 || move.dest.row === rows) {
					move.transform = true;
				}
				
				if (prevalidate(move)) {
					availableMoves.push(move);
				}

				//first move (+2 row)
				if (self.firstMove) {
					move = {
						figureId: self.id,
						color: self.color,
						position: position,
						dest: {
							row: (2*dir + position.row),
							col: (0 + position.col)
						},
						kill: false,
						basic: true,
						passing: true							
					};
					if (prevalidate(move)) {
						availableMoves.push(move);
					}
				} 

				//kill move (+||- 1 col; +1 row)
				for (var i = 1; i <= 2; i++) {
					switch (i) {
						case 1: 
							nCol = 1;
							break;
						case 2: 
							nCol = -1;
							break;
					}
					move = {
						figureId: self.id,
						color: self.color,
						position: position,
						dest: {
							row: (1*dir + position.row),
							col: (1*nCol + position.col)
						},
						kill: true,
						basic: false							
					};
					if(move.dest.row === 1 || move.dest.row === rows) {
						move.transform = true;
					}
					if (prevalidate(move)) {
						availableMoves.push(move);
					}
				}

				//check if move dont goes out of board
				function prevalidate (move) {
					var validRow = (move.dest.row > 0) && (move.dest.row <= rows);
					var validCol = (move.dest.col > 0) && (move.dest.col <= cols);
					if (validRow && validCol) {return true;}
				}

				return availableMoves;	
			};

			function Bishop (userSet, cordinats) {	
				var self = this;
				PiecesFigures.apply(self, arguments);
				self.name = 'Bishop';
				self.value = 3;

				switch (self.isBlack) {
					case true: 
						self.color = 'black';
						self.img = 'assets/figures/bB.png';
						self.fenName = 'b';
						break;
					case false: 
						self.color = 'white';
						self.img = 'assets/figures/wB.png';
						self.fenName = 'B';
						break;												
				}

				self.moveSettings = {
					movesDescr: [
						{row: 1, col: 1},
						{row: 1, col: -1},
						{row: -1, col: 1},
						{row: -1, col: -1}
					],
					moveLength: 8,
					jump: false
				};
			}

			Bishop.prototype = Object.create(PiecesFigures.prototype);
			Bishop.prototype.constructor = Bishop;

			function Knight (userSet, cordinats) {
				var self = this;
				PiecesFigures.apply(self, arguments)
				self.name = 'Knight';
				self.value = 3;

				switch (self.isBlack) {
					case true: 
						self.color = 'black';
						self.img = 'assets/figures/bN.png';
						self.fenName = 'n';
						break;
					case false: 
						self.color = 'white';
						self.img = 'assets/figures/wN.png';
						self.fenName = 'N';
						break;												
				}


				self.moveSettings = {
					movesDescr: [
						{row: 2, col: 1},
						{row: 2, col: -1},
						{row: -2, col: 1},
						{row: -2, col: -1},
						{row: 1, col: 2},
						{row: -1, col: 2},
						{row: 1, col: -2},
						{row: -1, col: -2}
					],
					moveLength: 1,
					jump: true
				};
			}

			Knight.prototype = Object.create(PiecesFigures.prototype);
			Knight.prototype.constructor = Knight;

			function Rook (userSet, cordinats) {
				var self = this;
				PiecesFigures.apply(self, arguments);
				self.name = 'Rook';
				self.value = 5;

				switch (self.isBlack) {
					case true: 
						self.color = 'black';
						self.img = 'assets/figures/bR.png';
						self.fenName = 'r';
						break;
					case false: 
						self.color = 'white';
						self.img = 'assets/figures/wR.png';
						self.fenName = 'R';
						break;												
				}

				self.moveSettings = {
					movesDescr: [
						{row: 0, col: 1},
						{row: 0, col: -1},
						{row: 1, col: 0},
						{row: -1, col: 0}
					],
					moveLength: 8,
					jump: false
				};
			}

			Rook.prototype = Object.create(PiecesFigures.prototype);
			Rook.prototype.constructor = Rook;

			function Queen (userSet, cordinats) {
				var self = this;
				PiecesFigures.apply(self, arguments);
				self.name = 'Queen';
				self.value = 9;

				switch (self.isBlack) {
					case true: 
						self.color = 'black';
						self.img = 'assets/figures/bQ.png';
						self.fenName = 'q';
						break;
					case false: 
						self.color = 'white';
						self.img = 'assets/figures/wQ.png';
						self.fenName = 'Q';
						break;												
				}

				self.moveSettings = {
					movesDescr: [
						{row: 0, col: 1},
						{row: 0, col: -1},
						{row: 1, col: 0},
						{row: -1, col: 0},
						{row: 1, col: 1},
						{row: -1, col: -1},
						{row: -1, col: 1},
						{row: 1, col: -1}
					],
					moveLength: 8,
					jump: false
				};	
			}
			Queen.prototype = Object.create(PiecesFigures.prototype);
			Queen.prototype.constructor = Queen;

			function King (userSet, cordinats) {
				var self = this;
				PiecesFigures.apply(self, arguments);
				self.name = 'King';
	
				switch (self.isBlack) {
					case true: 
						self.color = 'black';
						self.img = 'assets/figures/bK.png';
						self.fenName = 'k';
						break;
					case false: 
						self.color = 'white';
						self.img = 'assets/figures/wK.png';
						self.fenName = 'K';
						break;												
				}

				self.value = 0;
				self.moveSettings = {
					movesDescr: [
						{row: 1, col: 1},
						{row: 1, col: 0},
						{row: 1, col: -1},
						{row: 0, col: -1},
						{row: -1, col: -1},
						{row: -1, col: 0},
						{row: -1, col: 1},
						{row: 0, col: 1},
						{row: 0, col: 2, custom: {name: 'castling', long: false}},
						{row: 0, col: -2, custom: {name: 'castling', long: true}}
					],
					moveLength: 1,
					jump: false
				};
			}

			King.prototype = Object.create(PiecesFigures.prototype);
			King.prototype.constructor = King;

			King.prototype.getAvailableMoves = function(cells) {
				var self = this;
				
				if (!self.firstMove && self.moveSettings.movesDescr.length === 10) {
					self.moveSettings.movesDescr.splice(self.moveSettings.movesDescr.length - 2, 2)
				}

				return PiecesFigures.prototype.getAvailableMoves.apply(self, arguments);
			};

			return service;
		}
	
})();

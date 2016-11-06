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
				}
			};

			var figuresId = 1;
			//limits to moves 
			var rows = 8; 
			var colls = 8;

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
			function PiecesFigures (userSet, cordinats) {
				var self = this;
				Figure.apply(self, arguments);
			}

			PiecesFigures.prototype = Object.create(Figure.prototype);
			PiecesFigures.prototype.constructor = PiecesFigures;

			PiecesFigures.prototype.getAvailableMoves = function (set, cells) {
				// set example: {
				// 	movesDescr: [],
				// 	moveLength: 8,
				// 	jump: false
				// } 

				var self = this;
				var availableMoves = [];
				var position = self.cordinats;	
				var i, row, coll, move;

				set.movesDescr.forEach(function (dir) {
					for (i = 1; i <= set.moveLength; i++) {
						row = i*dir.row + position.row;
						coll = i*dir.coll + position.coll;

						if (!dir.custom) {
							move = {
								figureId: self.id,
								color: self.color,
								position: position,
								dest: {
									row: row,
									coll: coll
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
									coll: coll
								},
								type: dir.custom
							};
						}

						if (row > 0 && row <= rows && coll > 0 && coll <= colls) {
							availableMoves.push(move);
						}

						if (!set.jump) {
							var cell = _.find(cells, {row: row, coll: coll}) || {};
							if (cell.figure) {break;}	
						}	
					}
				});

				return availableMoves;
			};

			function Pawn (userSet, cordinats) {
				var self = this;
				Figure.apply(self, arguments);
				self.name = 'pawn';
				self.value = 1;

				if (self.isBlack) {
					self.color = 'black'
					self.img = 'img/bP.png';
				} else {
					self.color = 'white'
					self.img = 'img/wP.png'
				}
			}

			Pawn.prototype = Object.create(Figure.prototype);
			Pawn.prototype.constructor = Pawn;

			Pawn.prototype.getAvailableMoves = function() {
				var self = this;
				var availableMoves = []; 
				var moves = [];
				var move; 
				var nRow, nColl;
				var position = self.cordinats;

				switch (self.color) {
					case 'white': 
						nRow = 1;
						break;
					case 'black': 
						nRow = -1;
						break;
				}
				//basic move (+1 row)
				move = {
					figureId: self.id,
					color: self.color,
					position: position,
					dest: {
						row: (1*nRow + position.row),
						coll: (0 + position.coll)
					},
					kill: false,
					basic: true					
				};

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
							row: (2*nRow + position.row),
							coll: (0 + position.coll)
						},
						kill: false,
						basic: true,
						passing: true							
					};
					if (prevalidate(move)) {
						availableMoves.push(move);
					}
				} 

				//kill move (+||- 1 coll; +1 row)
				for (var i = 1; i <= 2; i++) {
					switch (i) {
						case 1: 
							nColl = 1;
							break;
						case 2: 
							nColl = -1;
							break;
					};
					move = {
						figureId: self.id,
						color: self.color,
						position: position,
						dest: {
							row: (1*nRow + position.row),
							coll: (1*nColl + position.coll)
						},
						kill: true,
						basic: false							
					};
					if (prevalidate(move)) {
						availableMoves.push(move);
					}
				}

				//check if move dont goes out of board
				function prevalidate (move) {
					var validRow = (move.dest.row > 0) && (move.dest.row <= rows);
					var validColl = (move.dest.coll > 0) && (move.dest.coll <= colls);
					if (validRow && validColl) {return true;} else {console.log('false', false);}
				}

				return availableMoves;	
			};

			function Bishop (userSet, cordinats) {	
				var self = this;
				PiecesFigures.apply(self, arguments);
				self.name = 'Bishop';
				self.value = 3;

				if (self.isBlack) {
					self.color = 'black'
					self.img = 'img/bB.png';
				} else {
					self.color = 'white'
					self.img = 'img/wB.png'
				}
			}

			Bishop.prototype = Object.create(PiecesFigures.prototype);
			Bishop.prototype.constructor = Bishop;

			Bishop.prototype.getAvailableMoves = function(cells) {
				var self = this;
				var set = {
					movesDescr: [
						{row: 1, coll: 1},
						{row: 1, coll: -1},
						{row: -1, coll: 1},
						{row: -1, coll: -1}
					],
					moveLength: 8,
					jump: false
				};

				return PiecesFigures.prototype.getAvailableMoves.apply(self, [set, cells]);
			};

			function Knight (userSet, cordinats) {
				var self = this;
				PiecesFigures.apply(self, arguments)
				self.name = 'Knight';
				self.value = 3;

				if (self.isBlack) {
					self.color = 'black'
					self.img = 'img/bN.png';
				} else {
					self.color = 'white'
					self.img = 'img/wN.png'
				}
			}

			Knight.prototype = Object.create(PiecesFigures.prototype);
			Knight.prototype.constructor = Knight;

			Knight.prototype.getAvailableMoves = function(cells) {
				var self = this;
				var set = {
					movesDescr: [
						{row: 2, coll: 1},
						{row: 2, coll: -1},
						{row: -2, coll: 1},
						{row: -2, coll: -1},
						{row: 1, coll: 2},
						{row: -1, coll: 2},
						{row: 1, coll: -2},
						{row: -1, coll: -2}
					],
					moveLength: 1,
					jump: true
				};

				return PiecesFigures.prototype.getAvailableMoves.apply(self, [set,cells]);		
			};

			function Rook (userSet, cordinats) {
				var self = this;
				PiecesFigures.apply(self, arguments);
				self.name = 'Rook';
				self.value = 5;

				if (self.isBlack) {
					self.color = 'black'
					self.img = 'img/bR.png';
				} else {
					self.color = 'white'
					self.img = 'img/wR.png'
				}
			}

			Rook.prototype = Object.create(PiecesFigures.prototype);
			Rook.prototype.constructor = Rook;

			Rook.prototype.getAvailableMoves = function(cells) {
				var self = this;
				var set = {
					movesDescr: [
						{row: 0, coll: 1},
						{row: 0, coll: -1},
						{row: 1, coll: 0},
						{row: -1, coll: 0}
					],
					moveLength: 8,
					jump: false
				};

				return PiecesFigures.prototype.getAvailableMoves.apply(self, [set, cells]);		
			};

			function Queen (userSet, cordinats) {
				var self = this;
				PiecesFigures.apply(self, arguments);
				self.name = 'Queen';
				self.value = 9;

				if (self.isBlack) {
					self.color = 'black'
					self.img = 'img/bQ.png';
				} else {
					self.color = 'white'
					self.img = 'img/wQ.png'
				}	
			}

			Queen.prototype = Object.create(PiecesFigures.prototype);
			Queen.prototype.constructor = Queen;
			Queen.prototype.getAvailableMoves = function (cells) {
				var self = this;
				var set = {
					movesDescr: [
						{row: 0, coll: 1},
						{row: 0, coll: -1},
						{row: 1, coll: 0},
						{row: -1, coll: 0},
						{row: 1, coll: 1},
						{row: -1, coll: -1},
						{row: -1, coll: 1},
						{row: 1, coll: -1}
					],
					moveLength: 8,
					jump: false
				}
				
				return PiecesFigures.prototype.getAvailableMoves.apply(self, [set, cells]);
			}

			function King (userSet, cordinats) {
				var self = this;
				PiecesFigures.apply(self, arguments);
				self.name = 'King';

				if (self.isBlack) {
					self.color = 'black'
					self.img = 'img/bK.png';
				} else {
					self.color = 'white'
					self.img = 'img/wK.png'
				}	
			}

			King.prototype = Object.create(PiecesFigures.prototype);
			King.prototype.constructor = King;

			King.prototype.getAvailableMoves = function(cells) {
				var self = this;
				var set = {
					movesDescr: [
						{row: 1, coll: 1},
						{row: 1, coll: 0},
						{row: 1, coll: -1},
						{row: 0, coll: -1},
						{row: -1, coll: -1},
						{row: -1, coll: 0},
						{row: -1, coll: 1},
						{row: 0, coll: 1},
					],
					moveLength: 1,
					jump: false
				};

				if (self.firstMove) {
					set.movesDescr.push(
						{row: 0, coll: 2, custom: {name: 'castling', long: false}},
						{row: 0, coll: -2, custom: {name: 'castling', long: true}}
					);
				}

				return PiecesFigures.prototype.getAvailableMoves.apply(self, [set, cells]);
			};

			return service;
		}
	
})();

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
				var availableMoves = []; //add info about figure to each move 
				var moves = [];  	
				var position = self.cordinats;	
				var i, row, coll;

				set.movesDescr.forEach(function (dir) {
					for (i = 1; i <= set.moveLength; i++) {
						row = i*dir.coll + position.row;
						coll = i*dir.row + position.coll;

						if (row > 0 && row <= rows && coll > 0 && coll <= colls) {
							moves.push({
								row: row,
								coll: coll,
								kill: true,
								basic: true
							});
						}

						if (!set.jump) {
							var cell = _.find(cells, {row: row, coll: coll}) || {};
							if (cell.figure) {break;}	
						}	
					}
				});

					_.each(moves, function (item) {
						availableMoves.push({
							figureId: self.id,
							color: self.color,
							position: position,
							dest: item,
							basic: item.basic,
							kill: item.kill			
						});
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

			//if oponent pawn +2row => kill
			Pawn.prototype.getAvailableMoves = function() {
				var self = this;
				var availableMoves = []; 
				var moves = [];
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

				moves.push({
					row: (1*nRow + position.row),
					coll: (0 + position.coll),
					kill: false,
					basic: true
				});

				if (self.firstMove) {
					moves.push({
						row: (2*nRow + position.row),
						coll:(0 + position.coll),
						kill: false,
						basic: true
					});
				}

				for (var i = 1; i <= 2; i++) {
					switch (i) {
						case 1: 
							nColl = 1;
							break;
						case 2: 
							nColl = -1;
							break;
					};
					moves.push({
						row: (1*nRow + position.row),
						coll: (1*nColl + position.coll),
						kill: true,
						basic: false
					});	
				}

				_.each(moves, function (item) {
					if ((item.row > 0) && (item.row <= rows) && (item.coll > 0) && (item.coll <= colls)) {
						availableMoves.push({
							figureId: self.id,
							color: self.color,
							position: position,
							dest: item,
							basic: item.basic,
							kill: item.kill			
						});
					}
				});

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
						{row: 0, coll: 1}
					],
					moveLength: 1,
					jump: false
				};
				var availableMoves = PiecesFigures.prototype.getAvailableMoves.apply(self, [set, cells]);

				/*castling
				- check if firstMove for king and rook,
				- check if there any available move for oponent to this cells
				*/

				return availableMoves;		
			};

			return service;
		}
	
})();
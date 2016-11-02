//currently return 2 player objects
//in future will return constructor function 

(function () {
	'use strict';

	angular.module('chessApp.common')
		.factory('userService', userService);

	userService.$inject = ['figureService'];
		
	function userService(figureService) {
		var service = {
			constructor: User,
			player1: {
				isBlack: false,
				figures: []
			},
			player2: {
				isBlack: true,
				figures: []
			}
		};
		var figures = figureService.constructors;
		var figuresOrder = [figures.Rook, figures.Knight, figures.Bishop, figures.Queen, figures.King, figures.Bishop, figures.Knight, figures.Rook];


		init(figuresOrder);
		function init (figuresOrder) {
			figuresOrder.forEach(function (item, i) {
				service.player1.figures.push(new item(service.player1, {row: 1, coll: i + 1}));
				service.player2.figures.push(new item(service.player2, {row: 8, coll: i + 1}));
			});

			for (var i = 1; i <= 8; i++) {
				service.player1.figures.push(new figures.Pawn (service.player1, {row: 2, coll: i}));
				service.player2.figures.push(new figures.Pawn (service.player2, {row: 7, coll: i}));
			}
		}

		function User () {}
		
		return service;
	}
})();

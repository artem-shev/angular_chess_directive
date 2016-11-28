(function() {
	'use strict';
	angular.module('chessApp')
		.directive('chessboard', chessboardFunc);

		function chessboardFunc () {
			var directive = {
				templateUrl: 'app/components/chessboard/chessboard.html',
				controller: 'MainController',
				controllerAs: 'ctrl'
			};

			return directive;
		}

})();

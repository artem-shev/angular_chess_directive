(function() {
	'use strict';
	angular.module('chessApp')
		.directive('chessboard', chessboardFunc);

		function chessboardFunc () {
			var directive = {
				templateUrl: 'components/chessboard/chessboard.html',
				controller: 'MainCtrl',
				controllerAs: 'ctrl'
			};

			return directive;
		}

})();
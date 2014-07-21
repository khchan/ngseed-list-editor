'use strict';

describe('List Editor Controller', function(){
	
	beforeEach(module('ngTable', 'controllers'));

	var $scope, ctrl;
	beforeEach(inject(function ($rootScope, $controller) {
		$scope = $rootScope.$new();
		// Initial mismatched data
		$scope.list = [
			{name: "Moroni", age: 50},
			{name: "Tiancum", age: 43, weight: 189, complexion: "dark"},
			{name: "Jacob", age: 27},
			{name: "Nephi", age: 29, complexion: "fair"}
		];
		
		$scope.columns = [
			{ title: 'Name of Person', field: 'name', type: 'text'},
			{ title: 'Age of Person', field: 'age', type: 'number'}
		];

		ctrl = $controller('ListController', {
			$scope: $scope
		});
	}));

	describe('Data Pre-manipulation Suite', function() {

		it('should at least be defined', function() {
			expect(ctrl).toBeDefined();
		});

		it('should successfully manipulate data with mismatched columns', function() {
			var fixedData = $scope.list;
			var fixedColumns = $scope.columns;
			console.log(fixedData)
			console.log(fixedColumns)
			expect(ctrl).toBeDefined();
		});
	});
});

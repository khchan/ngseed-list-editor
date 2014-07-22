'use strict';

/* jasmine specs for directives go here */

describe('List Editor Directives', function() {
	beforeEach(module('ngTable', 'controllers', 'listDirective'));

	// load the templates
	beforeEach(module('partials/ListEditor.html'));

	var $scope, $compile, element;

	beforeEach(inject(function (_$rootScope_, _$compile_) {
		$scope = _$rootScope_;
		$compile = _$compile_;

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

		var html = angular.element('<list-editor can-edit="true" list="data" columns="columns"></list-editor>');
		element = $compile(html)($scope);
		$scope.$apply();
	}));

	describe('list-directive', function() {
		it('should compile the directive', function() {	
			console.log(element);
			return true;
		});
	});
});

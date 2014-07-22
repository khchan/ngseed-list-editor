'use strict';

describe('List Editor Controller Test Suite', function(){
	
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

	describe('Data manipulation test suite', function() {

		it('should at least be defined', function() {
			expect(ctrl).toBeDefined();
		});

		it('should manipulate data with mismatched columns', function() {	
			_.each($scope.list, function(row) {
				expect(_.keys(row).length).toEqual($scope.columns.length);
			});
		});

		it('should fill empty values with the empty string', function() {
			// expect new values to be populated 
			expect($scope.list[0].weight).toEqual('');
			expect($scope.list[0].complexion).toEqual('');
		});

		it('should set field types to numbers if they seem like numbers', function() {
			// expect weight to be a number input
			expect($scope.columns[2].type).toEqual('number');
			// expect complexion to be a text input
			expect($scope.columns[3].type).toEqual('text');
		});

		it('should set the field title to the uppercase of the new field', function() {
			// expect weight => Weight in field title
			expect($scope.columns[2].title).toEqual('Weight');
			expect($scope.columns[3].title).toEqual('Complexion');
		})
	});

	describe('Saving and cancelling of row/column actions', function() {

		var orig, tmp, newRow, newCol;
		beforeEach(function() {
			// original data
			orig = angular.copy($scope.list);

			newRow = angular.copy(orig);
			newRow.push({name: 'test', age:123, weight:123, complexion:'test'});

			newCol = angular.copy(orig);
			newCol[0].test = 'test0';
			newCol[1].test = '';
			newCol[2].test = 'test2';
			newCol[3].test = '';

			// expected data
			tmp = [
				{name: 'test', age:123, weight:123, complexion:'test'},
				{name: 'test', age:123, weight:123, complexion:'test'},
				{name: 'test', age:123, weight:123, complexion:'test'},
				{name: 'test', age:123, weight:123, complexion:'test'}
			]; 
		});
		
		// Cancelling data edits
		it('should edit row and cancel data', function() {
			_.each($scope.list, function(row) {
				$scope.selectRowEdit(row);
				$scope.$apply();
				_.each($scope.columns, function(col) {
					if (col.type == 'number') row[col.field] = 123;
					else row[col.field] = "test"; 
				});
				$scope.cancelRowEdit(row);
			});
			expect(_.difference(orig, $scope.list)).toEqual(orig);
		});

		it('should edit col and cancel data', function() {
			_.each($scope.columns, function(col) {
				$scope.selectColumnEdit(col);
				$scope.$apply();
				_.each($scope.list, function(row) {
					if (col.type == 'number') row[col.field] = 123;
					else row[col.field] = "test";
				});
				$scope.cancelColEdit(col);	
			});
			expect(_.difference(orig, $scope.list)).toEqual(orig);
		});

		it('should edit new row and cancel data', function() {
			$scope.editNewRow();
			$scope.$apply();
			_.each($scope.columns, function(col) {
				if (col.type == 'number') $scope.rowBuffer[col.field] = 123;
				else $scope.rowBuffer[col.field] = "test"; 
			});
			$scope.reset(true);
			expect(_.difference(orig, $scope.list)).toEqual(orig);
		});

		it('should edit new col and cancel data', function() {
			$scope.editNewColumn();
			$scope.$apply();
			$scope.columnBuffer.type = 'text';
			$scope.columnBuffer.title = 'Test';
			$scope.columnBuffer.field = 'test';
			$scope.reset(true);
			expect(_.difference(orig, $scope.list)).toEqual(orig);
		});

		// Saving data edits
		it('should edit row and save data', function() {
			_.each($scope.list, function(row) {
				$scope.selectRowEdit(row);
				$scope.$apply();
				_.each($scope.columns, function(col) {
					if (col.type == 'number') row[col.field] = 123;
					else row[col.field] = "test";
				});
			});
			expect(_.difference(tmp, $scope.list)).toNotEqual([true]);	
		});

		it('should edit col and save data', function() {
			_.each($scope.columns, function(col) {
				$scope.selectColumnEdit(col);
				$scope.$apply();
				_.each($scope.list, function(row) {
					if (col.type == 'number') row[col.field] = 123;
					else row[col.field] = "test";
				});				
			});
			expect($scope.list).toEqual(tmp);
		});

		it('should edit new row and save data', function() {
			$scope.editNewRow();
			$scope.$apply();
			_.each($scope.columns, function(col) {
				if (col.type == 'number') $scope.rowBuffer[col.field] = 123;
				else $scope.rowBuffer[col.field] = "test"; 
			});
			$scope.addRow();
			expect($scope.list).toEqual(newRow);
		});

		it('should edit new col and save data', function() {
			$scope.editNewColumn();
			$scope.$apply();
			$scope.columnBuffer.type = 'text';
			$scope.columnBuffer.title = 'Test';
			$scope.columnBuffer.field = 'test';
			$scope.columnBuffer.data['0'] = 'test0';
			$scope.columnBuffer.data['2'] = 'test2';
			$scope.addColumn();
			expect($scope.list).toEqual(newCol);
		});
	});

	describe('Deleting rows and columns', function() {
		var delRow, delCol;
		beforeEach(function() {
			delRow = angular.copy($scope.list);	
			delRow.splice(0, 1);

			delCol = [
				{age: 50, weight: '', complexion: ''}, 
				{age: 43, weight: 189, complexion: 'dark'}, 
				{age: 27, weight: '', complexion: ''}, 
				{age: 29, complexion: 'fair', weight: ''}
			];
		});

		it('should delete all data in the row', function() {
			$scope.removeRow(0);
			expect($scope.list).toEqual(delRow);
		});

		it('should delete all data in the col and associated rows', function() {
			$scope.removeColumn(0);
			expect($scope.list).toEqual(delCol);
		});
	});

	describe('Isolation button disablers for each action', function() {

		function ngDisabledEdit() {
			var disabledEditItem = $scope.editCol || $scope.editRow || $scope.canEditItem;
			var disabledAddCol = $scope.editRow || $scope.canEditItem;
			var disabledAddRow = $scope.editCol || $scope.canEditItem;
			return disabledEditItem && disabledAddCol && disabledAddRow;
		}

		it('should disable [adding new row/col, editing col] when editing row', function() {
			_.each($scope.list, function(row) {
				$scope.selectRowEdit(row);
				$scope.$apply();
				expect(ngDisabledEdit()).toBe(true);
			});
		});

		it('should disable [adding new row/col, editing col] when editing col', function() {
			_.each($scope.columns, function(col) {
				$scope.selectColumnEdit(col);
				$scope.$apply();
				expect(ngDisabledEdit()).toBe(true);
			})
		});

		it('should disable [adding new col, editing row/col] when adding new row', function() {
			$scope.editNewRow();
			$scope.$apply();
			var disabledEditItem = $scope.editCol || $scope.editRow || $scope.canEditItem;
			var disabledAddCol = $scope.editRow || $scope.canEditItem;
			expect(disabledEditItem && disabledAddCol).toBe(true);
		});

		it('should disable [adding new row, editing row/col] when adding new col', function() {
			$scope.editNewColumn();
			$scope.$apply();
			var disabledEditItem = $scope.editCol || $scope.editRow || $scope.canEditItem;
			var disabledAddRow = $scope.editCol || $scope.canEditItem;
			expect(disabledEditItem && disabledAddRow).toBe(true);
		});		
	});
});

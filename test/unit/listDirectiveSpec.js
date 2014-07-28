'use strict';

/* jasmine specs for directives go here */

describe('List Editor Directives', function() {
	beforeEach(module('nglist-editor'));

	// load the templates
	beforeEach(module('partials/ListEditor.html'));

	var $scope, $compile, element, isoScope;

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

		var html = angular.element('<list-editor title="Users" can-edit="true" list="list" columns="columns"></list-editor>');
		element = $compile(html)($scope);
		$scope.$apply();

		isoScope = element.isolateScope();
	}));

	describe('Data manipulation test suite', function() {

		it('should manipulate data with mismatched columns', function() {	
			_.each(angular.copy(isoScope.list), function(row) {
				expect(_.keys(row).length).toEqual(isoScope.columns.length);
			});
		});

		it('should fill empty values with the empty string', function() {
			// expect new values to be populated 
			expect(isoScope.list[0].weight).toEqual('');
			expect(isoScope.list[0].complexion).toEqual('');
		});

		it('should set field types to numbers if they seem like numbers', function() {
			// expect weight to be a number input
			expect(isoScope.columns[2].type).toEqual('number');
			// expect complexion to be a text input
			expect(isoScope.columns[3].type).toEqual('text');
		});

		it('should set the field title to the uppercase of the new field', function() {
			// expect weight => Weight in field title
			expect(isoScope.columns[2].title).toEqual('Weight');
			expect(isoScope.columns[3].title).toEqual('Complexion');
		});
	});

	describe('Saving and cancelling of row/column actions', function() {

		var orig, tmp, newRow, newCol;
		beforeEach(function() {
			// original data
			orig = angular.copy(isoScope.list);

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
			_.each(isoScope.list, function(row) {
				isoScope.selectRowEdit(row);
				isoScope.$apply();
				_.each(isoScope.columns, function(col) {
					if (col.type == 'number') row[col.field] = 123;
					else row[col.field] = "test"; 
				});
				isoScope.cancelRowEdit(row);
			});
			expect(_.difference(orig, isoScope.list)).toEqual(orig);
		});

		it('should edit col and cancel data', function() {
			_.each(isoScope.columns, function(col) {
				isoScope.selectColumnEdit(col);
				isoScope.$apply();
				_.each(isoScope.list, function(row) {
					if (col.type == 'number') row[col.field] = 123;
					else row[col.field] = "test";
				});
				isoScope.cancelColEdit(col);	
			});
			expect(_.difference(orig, isoScope.list)).toEqual(orig);
		});

		it('should edit new row and cancel data', function() {
			isoScope.editNewRow();
			isoScope.$apply();
			_.each(isoScope.columns, function(col) {
				if (col.type == 'number') isoScope.rowBuffer[col.field] = 123;
				else isoScope.rowBuffer[col.field] = "test"; 
			});
			isoScope.reset(true);
			expect(_.difference(orig, isoScope.list)).toEqual(orig);
		});

		it('should edit new col and cancel data', function() {
			isoScope.editNewColumn();
			isoScope.$apply();
			isoScope.columnBuffer.type = 'text';
			isoScope.columnBuffer.title = 'Test';
			isoScope.columnBuffer.field = 'test';
			isoScope.reset(true);
			expect(_.difference(orig, isoScope.list)).toEqual(orig);
		});

		// Saving data edits
		it('should edit row and save data', function() {
			_.each(isoScope.list, function(row) {
				isoScope.selectRowEdit(row);
				isoScope.$apply();
				_.each(isoScope.columns, function(col) {
					if (col.type == 'number') row[col.field] = 123;
					else row[col.field] = "test";
				});
			});
			expect(_.difference(tmp, isoScope.list)).toNotEqual([true]);	
		});

		it('should edit col and save data', function() {
			_.each(isoScope.columns, function(col) {
				isoScope.selectColumnEdit(col);
				isoScope.$apply();
				_.each(isoScope.list, function(row) {
					if (col.type == 'number') row[col.field] = 123;
					else row[col.field] = "test";
				});				
			});
			expect(angular.copy(isoScope.list)).toEqual(tmp);
		});

		it('should edit new row and save data', function() {
			isoScope.editNewRow();
			isoScope.$apply();
			_.each(isoScope.columns, function(col) {
				if (col.type == 'number') isoScope.rowBuffer[col.field] = 123;
				else isoScope.rowBuffer[col.field] = "test"; 
			});
			isoScope.addRow();
			expect(angular.copy(isoScope.list)).toEqual(newRow);
		});

		it('should edit new col and save data', function() {
			isoScope.editNewColumn();
			isoScope.$apply();
			isoScope.columnBuffer.type = 'text';
			isoScope.columnBuffer.title = 'Test';
			isoScope.columnBuffer.field = 'test';
			isoScope.columnBuffer.data['0'] = 'test0';
			isoScope.columnBuffer.data['2'] = 'test2';
			isoScope.addColumn();
			expect(angular.copy(isoScope.list)).toEqual(newCol);
		});
	});

	describe('Deleting rows and columns', function() {
		var delRow, delCol;
		beforeEach(function() {
			delRow = angular.copy(isoScope.list);	
			delRow.splice(0, 1);

			delCol = [
				{age: 50, weight: '', complexion: ''}, 
				{age: 43, weight: 189, complexion: 'dark'}, 
				{age: 27, weight: '', complexion: ''}, 
				{age: 29, complexion: 'fair', weight: ''}
			];
		});

		it('should delete all data in the row', function() {
			isoScope.removeRow(isoScope.list[0]);
			expect(angular.copy(isoScope.list)).toEqual(delRow);
		});

		it('should delete all data in the col and associated rows', function() {
			isoScope.removeColumn(0);
			expect(angular.copy(isoScope.list)).toEqual(delCol);
		});
	});

	describe('Isolation button disablers for each action', function() {

		function ngDisabledEdit() {
			var disabledEditItem = isoScope.editCol || isoScope.editRow || isoScope.canEditItem;
			var disabledAddCol = isoScope.editRow || isoScope.canEditItem;
			var disabledAddRow = isoScope.editCol || isoScope.canEditItem;
			return disabledEditItem && disabledAddCol && disabledAddRow;
		}

		it('should disable [adding new row/col, editing col] when editing row', function() {
			_.each(isoScope.list, function(row) {
				isoScope.selectRowEdit(row);
				isoScope.$apply();
				expect(ngDisabledEdit()).toBe(true);
			});
		});

		it('should disable [adding new row/col, editing col] when editing col', function() {
			_.each(isoScope.columns, function(col) {
				isoScope.selectColumnEdit(col);
				isoScope.$apply();
				expect(ngDisabledEdit()).toBe(true);
			})
		});

		it('should disable [adding new col, editing row/col] when adding new row', function() {
			isoScope.editNewRow();
			isoScope.$apply();
			var disabledEditItem = isoScope.editCol || isoScope.editRow || isoScope.canEditItem;
			var disabledAddCol = isoScope.editRow || isoScope.canEditItem;
			expect(disabledEditItem && disabledAddCol).toBe(true);
		});

		it('should disable [adding new row, editing row/col] when adding new col', function() {
			isoScope.editNewColumn();
			isoScope.$apply();
			var disabledEditItem = isoScope.editCol || isoScope.editRow || isoScope.canEditItem;
			var disabledAddRow = isoScope.editCol || isoScope.canEditItem;
			expect(disabledEditItem && disabledAddRow).toBe(true);
		});		
	});	
});
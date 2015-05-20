/**
 * element: list-editor
 * 
 * This is a generic editor for list data. Provided an array, the list-editor
 * will manage a list of objects. A template object can be provided to define
 * the structure of the objects store in the list. If no template is provided,
 * then an array of objects with a name, value pair will be stored.
 * 
 * A \"canEdit\" flag will allow the client to modify the object structure
 * by creating, renaming, and deleting object properties.
 * 
 * Dependencies:
 * ngTable, angular-bootstrap
 *
 * Usage:
	angular.module('main', ['nglist-editor'])
	.controller('MainCtrl', function($scope) {
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
	});

	<body ng-controller="MainCtrl">
		<list-editor can-edit="true" list="list" columns="columns"></list-editor>
	</body>
*/

(function() {
	'use strict';

	angular.module('nglist-editor', [
		'ui.bootstrap',
		/*<% nglist-templates %>*/
		'ngTable'
	])

	.directive('listEditor', function ($timeout) {
		return {
			restrict: 'E',
			replace: true,
			scope: {
				canEdit: '@',
				canAddNewcol: '@',
				canAddNewrow: '@',
				canEditHeader: '@',
				canDelRow: '@',
				canDelCol: '@',
				list: '=',
				columns: '='
			},
			templateUrl: 'partials/ListEditor.html',
			controller: 'ListController',
			link: {
				pre: function preLink(scope, element, attr) {
					var unregister = scope.$watch('list', function (newval, oldval) {
						if (!_.isUndefined(newVal) && newval.length > 0) {
							scope.affixMissingColumns(scope.list, scope.columns);
							unregister();
						};
					}, true);
				},
				post: function postLink(scope, element, attr) {
					/**
					 * Watchers for validating new col/row fields without forms
					 */
					scope.$watch('dataReady', function(newVal) {
						if (newVal && scope.list.length >= 0) {
							scope.generateTable(scope.list);
						}
					});

					// wait for table to be generated before adding watcher
					$timeout(function() {
						scope.$watchCollection('list', function(newVal) {
							if (scope.tableParams && scope.dataReady && newVal) {
								scope.tableParams.reload();
							}
						});
					}, 2000);                

					scope.$watchCollection('search', function(newVal) {                    
						if (scope.tableParams && scope.dataReady && newVal) {
							scope.tableParams.reload();
						}
					});

					scope.$watchCollection('itemBuffer', function(newVal) {
						scope.canEditItem = _.values(newVal).length !== 0;
					});

					scope.$watchCollection('rowBuffer', function(newVal) {
						if (!_.isUndefined(newVal)) {
							// allow row to be added if all fields are non-empty
							var valueCompact = _.compact(_.values(newVal));
							if (!_.isUndefined(valueCompact)) {
								scope.canAddRow = valueCompact.length == scope.columns.length;		
							}							
						}						
					});

					scope.$watchCollection('columnBuffer', function(newVal) {
						// allow column to be added if new column title, field,
						// type are non-empty and data object exists in columnBuffer
						var filledCols = _.compact(_.values(newVal)).length == 4;
						var isUniqueCol = _.indexOf(_.pluck(scope.columns, 'field'), newVal.field) < 0;
						scope.canAddCol = filledCols && isUniqueCol;
					});
				}
			}
		};
	})

	.controller('ListController', function ($scope, $filter, $timeout, ngTableParams) {

		// public variable for determining if table is editable
		$scope.canEdit = $scope.canEdit || false;
		$scope.canAddNewcol = $scope.canAddNewcol || false;
		$scope.canAddNewrow = $scope.canAddNewrow || false;
		$scope.canEditHeader = $scope.canEditHeader || false;
		$scope.canDelRow = $scope.canDelRow || false;
		$scope.canDelCol = $scope.canDelCol || false;

		// public booleans for locking other buttons when editing
		$scope.editRow = false;
		$scope.editCol = false;
		$scope.editItem = false;

		// ng-disablers for validation when adding new row/cols
		$scope.canAddRow = false;
		$scope.canAddCol = false;

		// buffers for storing tentative row/col data
		$scope.rowBuffer = {};    // for new rows
		$scope.columnBuffer = {}; // for new rows
		$scope.itemBuffer = {};   // for existing rows/cols

		$scope.dataReady = false;

		/** 
		 * Given possibly mismatched input lists with varying columns,
		 * flatten and union mismatched keys (duplicate columns are merged)
		 * and return proper evenly column-matched data
		 */
		$scope.affixMissingColumns = function(listInput, colInput) {
			var missingCols = [];
			// determine duplicate-free column names from list
			_.chain(_.union(_.flatten(_.map(listInput, _.keys))))
			// determine which columns are missing from columns definition
			.difference(_.pluck(colInput, 'field'))
			.map(function(m) {
				missingCols.push({
					field: m,
					type: _.every(_.compact(_.pluck(listInput, m)), _.isNumber) ? 'number' : 'text'
				});
			});

			// re-constituted columns array
			_.each(missingCols, function(item) {
				colInput.push({
					title: item.field.charAt(0).toUpperCase() + item.field.substring(1),
					field: item.field,
					type: item.type
				});
			});

			// re-constituted data array
			_.map(listInput, function(item) {
				_.each(missingCols, function(m) {
					if (!_.has(item, m.field)) item[m.field] = "";
				});
				return item;
			});

			$scope.dataReady = true;
		};

		/**
		 * Row Editing Functions
		 * For existing rows: [selectRowEdit, cancelRowEdit, removeRow] 
		 * For new rows: [editNewRow, addRow]
		 */
		$scope.selectRowEdit = function(item) {
			$scope.toggleEdit(item);
			$scope.editItem = true;
			angular.copy(item, $scope.itemBuffer);
		};

		$scope.cancelRowEdit = function(item) {
			var idx = $scope.list.indexOf(item);
			angular.copy($scope.itemBuffer, $scope.list[idx]);
			$scope.toggleEdit(item);
		};

		$scope.removeRow = function(item) {
			var idx = $scope.list.indexOf(item);
			$scope.list.splice(idx, 1);
			$scope.tableParams.reload();
		};

		$scope.editNewRow = function() {
			$scope.rowBuffer = {};
			$scope.editRow = true;
		};

		$scope.addRow = function() {
			$scope.list.push($scope.rowBuffer);
			$scope.tableParams.reload();
			$scope.rowBuffer = {};
			$scope.editRow = false;
		};

		/**
		 * Column Editing Functions
		 * For existing columns: [selectColumnEdit, cancelColEdit, removeColumn]
		 * For new columns: [editNewColumn, addColumn]
		 */
		$scope.selectColumnEdit = function(column) {
			var colData = _.pluck($scope.list, column.field);
			$scope.toggleEdit(column);
			$scope.itemBuffer.title = column.title;
			$scope.itemBuffer.data = colData;
		};

		$scope.cancelColEdit = function(column) {
			// Reset title
			var idx = $scope.columns.indexOf(column);
			$scope.columns[idx].title = $scope.itemBuffer.title;
			// Reset column data 
			_.map($scope.list, function(row, i) {
				row[column.field] = $scope.itemBuffer.data[i];
			});
			$scope.toggleEdit(column);
		};

		$scope.removeColumn = function(index) {
			if (confirm('Are you sure you want to delete column: ' + $scope.columns[index].field + '?')) {
				_.each($scope.list, function(row) {
					angular.copy(_.omit(row, $scope.columns[index].field), row);
				});
				$scope.columns.splice(index, 1);
				$scope.tableParams.reload();
			}        
		};

		$scope.editNewColumn = function() {
			$scope.editCol = true;
			$scope.canAddRow = false;
			$scope.columnBuffer.data = {};
			$scope.columnBuffer.type = 'text';
		};

		$scope.addColumn = function() {
			var newCol = {};
			// set column settings
			newCol.title = $scope.columnBuffer.title;
			newCol.field = $scope.columnBuffer.field;
			newCol.type = $scope.columnBuffer.type;
			$scope.columns.push(newCol);

			// add new column data to new column in list data
			_.each(_.keys($scope.columnBuffer.data), function(k) {
				$scope.list[k][newCol.field] = $scope.columnBuffer.data[k];
			});

			// fill non-provided data values with empty string
			_.each($scope.list, function(row) {
				if (row[newCol.field] === undefined) {
					row[newCol.field] = '';
				}
			});

			$scope.tableParams.reload();
			$scope.columnBuffer = {};
			$scope.editCol = false;
		};

		/**
		 * Function for toggling existing row or column edits
		 */
		$scope.toggleEdit = function(item) {
			$scope.itemBuffer = {};
			item.$edit = !item.$edit;
		};

		/**
		 * Function for clearing row and column buffers on cancel
		 */
		$scope.reset = function(close) {
			$scope.itemBuffer = {};
			$scope.rowBuffer = {};
			$scope.columnBuffer = {};
			if (close) {
				$scope.editCol = false;
				$scope.editRow = false;
				_.each($scope.columns, function(c) {
					c.$edit = false;
				});
			}
		};

		$scope.$on('ngtable.refresh', function(e) {
      $scope.tableParams.reload();
    });

		$scope.generateTable = function(list) {

			var getFOData = function(data, params) {
				var filteredData = $scope.search ?
					$filter('filter')(data, $scope.search) : data;
				
				var orderedData = filteredData;
				if (params.orderBy().length > 0) {
					orderedData = params.sorting() ?
						$filter('orderBy')(filteredData, params.orderBy()) : data;
				}
				return orderedData;
			}

			$scope.tableParams = new ngTableParams({
				page: 1,              // show first page
				count: 10             // count per page
			}, {
				counts: [],
				total: list.length,
				getData: function($defer, params) {
					var FOData = getFOData(list, params);
					params.total(FOData.length); // set total for recalc pagination
					$defer.resolve(FOData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
				},
				$scope: { $data: {} }
			});

			$scope.isSortBy = function(column, order) {
				return $scope.tableParams.isSortBy(column, order);
			};

			$scope.sortTable = function(column) {
				var sortParam = {};
				if (!column.$edit) {
					sortParam[column.field] = $scope.tableParams.isSortBy(column.field, 'asc') ? 'desc' : 'asc';
					$scope.tableParams.sorting(sortParam);          
				}
			};
		};
	});
})();


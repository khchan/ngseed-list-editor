'use strict';

/* Controllers */
angular.module('controllers', [])

.controller('ListController', function($scope, $filter, ngTableParams) {
	var data = angular.copy($scope.list);
	var columns = angular.copy($scope.columns);

	// public variable for determining if table is editable
	$scope.canEdit = $scope.canEdit || false;

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

	/** 
	 * Given possibly mismatched input lists with varying columns,
	 * flatten and union mismatched keys (duplicate columns are merged)
	 * and return proper evenly column-matched data
	 */
	var affixMissingColumns = function(listInput, colInput) {
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
	};

	// Fix possibly mismatched data
	affixMissingColumns(data, columns);
	angular.copy(data, $scope.list);
	angular.copy(columns, $scope.columns);

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

	$scope.removeRow = function(index) {
	    $scope.list.splice(index, 1);
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
	    _.each($scope.list, function(row) {
	        angular.copy(_.omit(row, $scope.columns[index].field), row);
	    });
	    $scope.columns.splice(index, 1);
	    $scope.tableParams.reload();
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
	    
	    $scope.tableParams.reload();
	    $scope.columnBuffer = {};
	    $scope.editCol = false;
	};

	/**
	 * Watchers for validating new col/row fields without forms
	 */
	$scope.$watchCollection('itemBuffer', function(newVal) {
	    $scope.canEditItem = _.values(newVal).length !== 0;
	});

	$scope.$watchCollection('rowBuffer', function(newVal) {
	    // allow row to be added if all fields are non-empty
	    $scope.canAddRow = _.compact(_.values(newVal)).length == $scope.columns.length;
	});

	$scope.$watchCollection('columnBuffer', function(newVal) {
	    // allow column to be added if new column title, field,
	    // type are non-empty and data object exists in columnBuffer
	    var filledCols = _.compact(_.values(newVal)).length == 4;
	    var isUniqueCol = _.indexOf(_.pluck($scope.columns, 'field'), newVal.field) < 0;
	    $scope.canAddCol = filledCols && isUniqueCol;
	});

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

	$scope.tableParams = new ngTableParams({
	    page: 1,              // show first page
	    count: 10,           // count per page
	}, {
	    total: $scope.list.length,
	    getData: function($defer, params) {
	        var orderedData = params.sorting() ?
	            $filter('orderBy')($scope.list, params.orderBy()) :
	            $scope.list;
	            
	        params.total($scope.list.length); // set total for recalc pagination
	        $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
	    },
	    $scope: { $data: {} }
	});

	$scope.sortTable = function(column) {
	    var sortParam = {};
	    sortParam[column] = $scope.tableParams.isSortBy(column, 'asc') ? 'desc' : 'asc';
	    $scope.tableParams.sorting(sortParam);
	};
});
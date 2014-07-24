angular.module('nglist-editor', ['partials/ListEditor.html']);

angular.module("partials/ListEditor.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("partials/ListEditor.html",
    "<div class=row><br><div class=\"form-inline pull-right\"><div class=form-group><label>Sorting: {{tableParams.sorting()|json}}</label></div><div class=form-group><input placeholder=Search class=form-control ng-model=search.$></div><div class=form-group><button ng-click=tableParams.sorting({}) class=\"btn btn-default\">Clear sorting</button></div></div><table ng-table=tableParams class=\"table ng-table-rowselected\"><thead><tr><th ng-repeat=\"column in columns\" class=\"sortable text-center\" ng-mouseenter=\"showEditCol = true\" ng-mouseleave=\"showEditCol = false\" ng-class=\"{active: column.$edit && canEditItem,\n" +
    "						'sort-asc': isSortBy(column.field, 'asc'),\n" +
    "						'sort-desc': isSortBy(column.field, 'desc')}\" ng-click=sortTable(column)><div ng-if=\"showEditCol && !column.$edit && canEdit\" ng-hide=\"editCol || editRow || canEditItem\" class=btn-group><button class=\"btn btn-default btn-xs\" ng-if=canEdit ng-click=selectColumnEdit(column)><span class=\"glyphicon glyphicon-pencil\"></span></button> <button class=\"btn btn-danger btn-xs\" ng-if=canEdit ng-click=removeColumn($index)><span class=\"glyphicon glyphicon-remove\"></span></button></div><br><span ng-if=!column.$edit>{{column.title}}</span><div ng-if=column.$edit><input class=form-control ng-model=column.title></div></th><th ng-if=\"!editCol && canEdit\" width=45><button class=\"btn btn-default btn-sm\" ng-if=!editCol ng-disabled=\"editRow || canEditItem\" ng-click=editNewColumn()><span class=\"glyphicon glyphicon-plus\"></span></button></th><th ng-if=\"editCol && canEdit\" width=200><input placeholder=\"New Column Title\" class=form-control ng-model=columnBuffer.title></th><th ng-if=canEdit>Actions</th></tr></thead><tbody><tr ng-repeat=\"item in $data | filter:search:strict\" ng-class=\"{active: item.$edit && canEditItem}\"><td class=text-center ng-repeat=\"column in columns\" ng-class=\"{active: column.$edit && canEditItem}\" filter=filterTable(column)><span ng-if=\"!item.$edit && !column.$edit\">{{item[column.field]}}</span><div ng-if=item.$edit><input class=form-control type={{column.type}} placeholder={{item[column.field]}} ng-model=item[column.field]></div><div ng-if=column.$edit data-ng-switch on=column.type><div data-ng-switch-when=text><input class=form-control ng-model=item[column.field]></div><div data-ng-switch-when=number><input type=number class=form-control ng-model=item[column.field]></div></div></td><td ng-if=\"!editCol && canEdit\" width=45 class=active></td><td ng-if=\"editCol && canEdit\" width=200 class=active><div data-ng-switch on=columnBuffer.type><div data-ng-switch-when=text><input class=form-control ng-model=columnBuffer.data[$index]></div><div data-ng-switch-when=number><input type=number class=form-control ng-model=columnBuffer.data[$index]></div></div></td><td width=90 ng-if=canEdit class=text-center><div class=btn-group ng-if=!item.$edit><button id=selectRowEditID_{{$index}} class=\"btn btn-default btn-sm\" ng-disabled=\"editCol || editRow || canEditItem\" ng-click=selectRowEdit(item)><span class=\"glyphicon glyphicon-pencil\"></span></button> <button id=removeRowID_{{$index}} class=\"btn btn-danger btn-sm\" ng-disabled=\"editCol || editRow || canEditItem\" ng-click=removeRow($index)><span class=\"glyphicon glyphicon-trash\"></span></button></div><div class=btn-group ng-if=item.$edit><button id=toggleEditID_{{$index}} class=\"btn btn-primary btn-sm\" ng-click=toggleEdit(item)><span class=\"glyphicon glyphicon-ok\"></span></button> <button id=cancelRowEditID_{{$index}} class=\"btn btn-warning btn-sm\" ng-click=cancelRowEdit(item)><span class=\"glyphicon glyphicon-remove\"></span></button></div></td></tr></tbody><tfoot ng-if=canEdit><tr><td data-title=column.title ng-repeat=\"column in columns\" ng-class=\"{active: column.$edit && canEditItem}\"><input ng-if=editRow class=form-control ng-disabled=\"editCol || canEditItem\" placeholder=\"New {{column.field}}\" type={{column.type}} ng-model=rowBuffer[column.field]><div ng-if=column.$edit><button class=\"btn btn-primary btn-sm\" ng-click=toggleEdit(column)><span class=\"glyphicon glyphicon-ok\"></span></button> <button class=\"btn btn-warning btn-sm\" ng-click=cancelColEdit(column)><span class=\"glyphicon glyphicon-remove\"></span></button></div></td><td class=\"active text-center\"><div ng-if=editCol><input class=form-control placeholder=\"New field key\" ng-model=columnBuffer.field><select class=form-control ng-model=columnBuffer.type ng-change=\"columnBuffer.data = {}\"><option value=text>Textfield</option><option value=number>Number</option></select><br><button class=\"btn btn-primary btn-sm\" ng-disabled=!canAddCol ng-click=addColumn()><span class=\"glyphicon glyphicon-ok\"></span></button> <button class=\"btn btn-warning btn-sm\" ng-click=reset(true)><span class=\"glyphicon glyphicon-remove\"></span></button></div></td><td width=90 class=text-center><div class=btn-group><button ng-if=!editRow class=\"btn btn-primary btn-sm\" ng-disabled=\"editCol || canEditItem\" ng-click=editNewRow()><span class=\"glyphicon glyphicon-plus\"></span></button> <button ng-if=editRow class=\"btn btn-primary btn-sm\" ng-disabled=\"editCol || !canAddRow\" ng-click=addRow()><span class=\"glyphicon glyphicon-ok\"></span></button> <button ng-if=editRow class=\"btn btn-warning btn-sm\" ng-disabled=editCol ng-click=reset(true)><span class=\"glyphicon glyphicon-remove\"></span></button></div></td></tr></tfoot></table></div>");
}]);
;'use strict';

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
    angular.module('nglist-editor', [])
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
 */

angular.module('nglist-editor', [
	'ui.bootstrap',
	'ngTable'
])

.directive('listEditor', function() {
    return {
        restrict: 'E',
        require: "^list",
        replace: true,
        scope: {
            canEdit: '@',
            list: '=',
            columns: '='
        },
        templateUrl: 'partials/ListEditor.html',
        controller: 'ListController'
    };
})

.controller('ListController', function ($scope, $filter, ngTableParams) {
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
});


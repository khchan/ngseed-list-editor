'use strict';

/* Directives */
/**
 * element: list-editor
 * 
 * This is a generic editor for list data. Provided an array, the list-editor
 * will manage a list of objects. A template object can be provided to define
 * the structure of the objects store in the list. If no template is provided,
 * then an array of objects with a name, value pair will be stored.
 * 
 * A "canEdit" flag will allow the client to modify the object structure
 * by creating, renaming, and deleting object properties.
 * 
 * Dependencies:
 * ngTable, angular-bootstrap
 */

angular.module('listDirective', [])
.directive('listEditor', function() {
    return {
        restrict: 'E',
        require: "^list",
        scope: {
            canEdit: '@',
            list: '=',
            columns: '='
        },
        templateUrl: 'partials/ListEditor.html',
        controller: 'ListController'
    };
});
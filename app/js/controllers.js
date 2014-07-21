'use strict';

/* Controllers */
angular.module('controllers', ['ui.bootstrap', 'ngTable', 'listDirective'])

.controller('MainCtrl', function($scope) {
    $scope.data = [
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
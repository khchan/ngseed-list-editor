nglist-editor
=============

AngularJS directive wrapper for dynamic row/column management for 
[ngTable] [ngTable]

See it in action [here][plunker]

Dependencies
------------
(Make sure you've included these scripts before including nglist-editor)
* [angular] - obviously
* [angular-bootstrap] - angularjs directives for bootstrap
* [bootstrap-css] - just the bootstrap css
* [lodash] - great library for functional programming
* [ng-table] [ngTable] - simple table with sorting and filtering on AngularJS

Bindings
--------
 - **canEdit**: (default false) indicates whether this table should be editable
 - **list**: an input array of json objects denoting each row of our table
 - **columns**: an input array of json objects that denote each column header of our table

Getting Started
---------------
In your js:
```
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
```
In your html:
```
<body ng-controller="MainCtrl">
    <div class="container">
        <list-editor can-edit="true" list="list" columns="columns"></list-editor>
    </div>
</body>
```
Testing
-------
To run unit tests: ```npm test```

Distribution
------------
To generate a production js and minified js, simply run ```grunt``` and these files will be created for you in the ```dist``` folder



License
-------
MIT

[plunker]:http://embed.plnkr.co/yIrAfMzQbPrKjwUu0P6q/preview
[angular]:https://angularjs.org
[angular-bootstrap]:http://angular-ui.github.io/bootstrap/
[bootstrap-css]:https://github.com/codemix/bootstrap-css
[lodash]:http://lodash.com
[ngTable]:https://github.com/esvit/ng-table


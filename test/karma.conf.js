module.exports = function(config){
  config.set({

    basePath : '../',

    files : [
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'node_modules/lodash/dist/lodash.js',
      'app/bower_components/ng-table/ng-table.js',
      'app/js/**/*.js',
      'test/unit/**/*.js',
      'app/partials/ListEditor.html'
    ],

    // generate js files from html templates
    preprocessors: {
      'app/partials/ListEditor.html': 'ng-html2js'
    },

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter',
            'karma-ng-html2js-preprocessor'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};

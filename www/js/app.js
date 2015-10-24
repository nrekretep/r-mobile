// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('r-mobile', ['ionic', 'r-mobile.controllers', 'ionic-material', 'ionMdInput', 'ngCordova']);

app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/app/login')

  $stateProvider.state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'RmobileController'
  });

  $stateProvider.state('app.login', {
    url: '/login',
    views: {
      'menuContent': {
        templateUrl: 'templates/login.html',
        controller: 'LoginController'
      },
      'fabContent': {
        template: ''
      }
    }
  });

  $stateProvider.state('app.documents', {
    url: '/documents',
    views: {
      'menuContent': {
        templateUrl: 'templates/documents.html',
        controller: 'DocumentsController'
      },
      'fabContent': {
        template: '<button id="fab-profile" ng-click="addDocument()" class="button button-fab button-fab-bottom-right button-energized-900"><i class="icon ion-plus"></i></button>',
        controller: 'DocumentsController'
      }
  }});
  $stateProvider.state('app.adddocument', {
    url: '/add-document',
    views: {
      'menuContent': {
        templateUrl: 'templates/add-document.html',
        controller: 'ImageController'
      }
    }
  });

});

app.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.withCredentials = true;
}]);

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

  });
});

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('r-mobile', ['ionic', 'r-mobile.controllers', 'r-mobile.services', 'ionic-material', 'ionMdInput', 'ngCordova'])
.run(function($ionicPlatform) {
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
})
.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    // Turn off view caching
    $ionicConfigProvider.views.maxCache(0);

    // configure default route
    $urlRouterProvider.otherwise('/app/login')

  $stateProvider.state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'RmobileController'
  })
    .state('app.login', {
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
  })
    .state('app.documents', {
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
  }})
    .state('app.adddocument', {
      url: '/add-document',
      views: {
      'menuContent': {
        templateUrl: 'templates/add-document.html',
        controller: 'ImageController'
      }
    }
  });

});


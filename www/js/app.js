// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('r-mobile', ['ionic']);

app.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/login')

  $stateProvider.state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginController'
  });
  $stateProvider.state('documents', {
    url: '/documents',
    templateUrl: 'templates/documents.html',
    controller: 'DocumentsController'
  });
});

app.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.withCredentials = true;
}]);

app.controller('RmobileController', function($scope, $ionicModal) {

  // Create and load the Modal
  $ionicModal.fromTemplateUrl('./login.html', function (modal) {
    $scope.loginModal = modal;
  }, {
    scope: $scope,
    animation: 'slide-in-up'
  });

  //// Open our new task modal
  //$scope.showLogin = function() {
  //  $scope.loginModal.show();
  //};
  //
  //// Close the new task modal
  //$scope.cancelLogin = function() {
  //  $scope.loginModal.hide();
  //}});
});

app.controller('DocumentsController', function($scope) {

});

app.controller('LoginController', function($scope, $http, $httpParamSerializer, $state, $ionicPopup){
  $scope.loginData = {};
  $scope.titleText = 'Rembli mobile';
  // Called when the form is submitted
  $scope.login = function() {

  var request = {
      url: 'http://rembli.com/documents/api/login',
        method: 'POST',
      headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
       'Accept': 'text/html'// Note the appropriate header
    },
    data: $httpParamSerializer($scope.loginData),
    withCredentials: true
  };

    $http(request).success(function(data, status, header) {

      $scope.loginData.key = data;

      var h = header('Cookie');
      //console.log(h);
      //console.log(JSON.stringify(header()));
      //console.log(data);

      $http.get('http://www.rembli.com/documents/api/userInfo', {withCredentials: true}).then(function(resp){
        $scope.loginData.username = resp.data.username;
        $scope.loginData.email = resp.data.email;

        $scope.title = ' (' + $scope.loginData.key + ')';

        $state.go('documents');


      }, function(err){
        $ionicPopup.alert({title: 'Error', template: 'Getting additional user info failed.'});
      });

    }).error(function(data, status) {

      $ionicPopup.alert({title: 'Error', template: 'Login failed.'});
    });

    $scope.loginData.password = "";
  };

});

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

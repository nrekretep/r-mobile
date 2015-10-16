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
});

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

app.controller('LoginController', function($scope, $http, $httpParamSerializer){
  $scope.loginData = {};

  // Called when the form is submitted
  $scope.login = function() {

  var request = {
      url: 'http://rembli.com/documents/api/login',
        method: 'POST',
      headers: {
      'Content-Type': 'application/x-www-form-urlencoded' // Note the appropriate header
    },
    //transformRequest: function(obj) {
    //  var str = [];
    //  for(var p in obj)
    //    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    //  return str.join("&");
    //},
    //data: {username: $scope.loginData.username, password: $scope.loginData.password}
    data: $httpParamSerializer($scope.loginData)
  };

    $http(request).then(function(resp) {
      console.log('Success', JSON.stringify(resp));
      $scope.loginData.username = resp.data;
      // For JSON responses, resp.data contains the result
    }, function(err) {

      console.error('ERR', JSON.stringify(err));
      // err.status will contain the status code
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

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

app.controller('DocumentsController', function($scope, DocumentsService) {

  if($scope.documents == undefined)
  {
    DocumentsService.getDocuments().then(function(){
      $scope.documents = DocumentsService.documents;
    }, function(){
      $ionicPopup.alert({title: 'Error', template: 'Loading documents failed.'});
    })
  }

});

app.controller('LoginController', function($rootScope, $scope, LoginService, $state, $ionicPopup){
  $scope.loginData = {};
  $rootScope.titleText = 'Rembli mobile';
  // Called when the form is submitted
  $scope.login = function() {

    LoginService.loginUser($scope.loginData).then(function(){

      LoginService.getUserInfo().then(function(){
        // success
        $rootScope.title = ' (' + LoginService.email + ')';

        $state.go('documents');

      }, function(err){
        $ionicPopup.alert({title: 'Error', template: 'Getting additional user info failed.'});
        console.log(JSON.stringify(err));
      });

    }, function(err){
      $ionicPopup.alert({title: 'Error', template: 'Login failed.'});
      console.log(JSON.stringify(err));
    });

    $scope.loginData.password = "";
  };

});

app.service('LoginService', function($http, $httpParamSerializer, $q) {
    return {
          bearerToken: '',
          email: '',
          username: '',
          loginUser: function(loginData) {

            var request = {
              url: 'http://rembli.com/documents/api/login',
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'text/html'
              },
              data: $httpParamSerializer(loginData)
            };

            var q = $q.defer();
            var self = this; // store current scope

            $http(request).then(function(res) {

              self.bearerToken = res.data;

              q.resolve();

          }, function(res) {
            q.reject(res);
          });

          return q.promise;

        },
        getUserInfo: function() {

          var self = this;
          var q = $q.defer();

          $http.get('http://www.rembli.com/documents/api/userInfo', {headers: {Authorization: 'Bearer ' + self.bearerToken}}).then(function(resp){
            self.username = resp.data.username;
            self.email = resp.data.email;

            q.resolve();

          }, function(err){
            q.reject(err);
          });

          return q.promise;

        }
  }
});

app.service('DocumentsService', function($http, LoginService, $q) {
    return {
     documents: {},
      getDocuments: function(){
        var self = this;
        var q = $q.defer();

        $http.get('http://www.rembli.com/documents/api/documents', {headers: {Authorization: 'Bearer ' + LoginService.bearerToken}}).then(function(resp){

          self.documents = resp.data;
          console.log(JSON.stringify(self));
          q.resolve();

        }, function(err){
          q.reject(err);
        });

        return q.promise;
      }
    }
  }
);

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

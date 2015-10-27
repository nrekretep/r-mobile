'use strict';

angular.module('r-mobile.controllers', ['r-mobile.services'])
  .controller('RmobileController', function($scope) {

    $scope.isExpanded = false;
    $scope.hasHeaderFabLeft = false;
    $scope.hasHeaderFabRight = false;

    var navIcons = document.getElementsByClassName('ion-navicon');
    for (var i = 0; i < navIcons.length; i++) {
      navIcons.addEventListener('click', function() {
        this.classList.toggle('active');
      });
    }

    ////////////////////////////////////////
    // Layout Methods
    ////////////////////////////////////////

    $scope.hideNavBar = function() {
      document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
    };

    $scope.showNavBar = function() {
      document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
    };

    $scope.noHeader = function() {
      var content = document.getElementsByTagName('ion-content');
      for (var i = 0; i < content.length; i++) {
        if (content[i].classList.contains('has-header')) {
          content[i].classList.toggle('has-header');
        }
      }
    };

    $scope.setExpanded = function(bool) {
      $scope.isExpanded = bool;
    };

    $scope.setHeaderFab = function(location) {
      var hasHeaderFabLeft = false;
      var hasHeaderFabRight = false;

      switch (location) {
        case 'left':
          hasHeaderFabLeft = true;
          break;
        case 'right':
          hasHeaderFabRight = true;
          break;
      };

      $scope.hasHeaderFabLeft = hasHeaderFabLeft;
      $scope.hasHeaderFabRight = hasHeaderFabRight;
    };

    $scope.hasHeader = function() {
      var content = document.getElementsByTagName('ion-content');
      for (var i = 0; i < content.length; i++) {
        if (!content[i].classList.contains('has-header')) {
          content[i].classList.toggle('has-header');
        }
      }

    };

    $scope.hideHeader = function() {
      $scope.hideNavBar();
      $scope.noHeader();
    };

    $scope.showHeader = function() {
      $scope.showNavBar();
      $scope.hasHeader();
    };

    $scope.clearFabs = function() {
      var fabs = document.getElementsByClassName('button-fab');
      if (fabs.length && fabs.length > 1) {
        fabs[0].remove();
      }
    };

})

  .controller('DocumentsController', function($scope, $state, $ionicLoading, DocumentsService, $stateParams, $timeout, ionicMaterialMotion, ionicMaterialInk,$ionicPopup) {

    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);

    // Set Ink
    if ($scope.documents == undefined) {
      DocumentsService.getDocuments().then(function (documents) {
        $scope.documents = documents;
        // Set Motion
        $timeout(function() {
          ionicMaterialMotion.slideUp({
            selector: '.slide-up'
          });
        }, 300);

        $timeout(function() {
          ionicMaterialMotion.fadeSlideInRight({
            startVelocity: 3000
          });
        }, 700);

        // set ink
        ionicMaterialInk.displayEffect();

      }, function () {
        $ionicPopup.alert({title: 'Error', template: 'Loading documents failed.'});
      })
    }

    $scope.doRefresh = function(){
      $ionicLoading.show({template: "Refreshing Documents..."});
      DocumentsService.getDocuments().then(function (documents) {
        $scope.$apply(function(){$scope.documents = documents;});
      }, function () {
        $ionicPopup.alert({title: 'Error', template: 'Loading documents failed.'});
      }).finally(function(){
        $scope.$broadcast('scroll.refreshComplete');
        $ionicLoading.hide();
      });
    };

    $scope.addDocument = function(){
      $state.go('app.adddocument');
    };

    $scope.deleteDocument = function(id){

      DocumentsService.deleteDocument(id).then(function(){
        $scope.doRefresh();
      },function(err){
        $scope.doRefresh();
        $ionicPopup.alert({title: 'Error', template: 'Deleting the document failed.'});
      });


    };

})

  .controller('LoginController', function($rootScope, $scope, LoginService, $state, $timeout, ionicMaterialInk, $ionicPopup, $ionicLoading){

  $scope.$parent.clearFabs();
  $timeout(function() {
    $scope.$parent.hideHeader();
  }, 0);
  ionicMaterialInk.displayEffect();

    $scope.loginData = {};
  $rootScope.titleText = 'Rembli mobile';
  // Called when the form is submitted
  $scope.login = function() {

    $ionicLoading.show({template: "Let's have a try..."});
    LoginService.loginUser($scope.loginData).then(function(){

      LoginService.getUserInfo().then(function(){
        // success
        $rootScope.subTitle = LoginService.email;
        $rootScope.title = LoginService.username;

        $state.go('app.documents');

      }, function(err){
        $ionicPopup.alert({title: 'Error', template: 'Getting additional user info failed.'});
        console.log(JSON.stringify(err));
      });

    }, function(err){
      $ionicPopup.alert({title: 'Error', template: 'Login failed.'});
      console.log(JSON.stringify(err));
    }).finally(function(){$ionicLoading.hide()});

    $scope.loginData.password = "";
  };

})

  .controller('ImageController', function($scope, $state, $cordovaDevice, $cordovaFile, $ionicPlatform, $cordovaEmailComposer, $ionicActionSheet, $ionicLoading, ImageService, FileService, DocumentsService,ionicMaterialInk) {

    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    ionicMaterialInk.displayEffect();

    $ionicPlatform.ready(function() {
      $scope.images = FileService.images();
      //$scope.$apply();
    });

    $scope.urlForImage = function(imageName) {
      var trueOrigin = cordova.file.dataDirectory + imageName;
      return trueOrigin;
    }

    $scope.addMedia = function() {
      $scope.hideSheet = $ionicActionSheet.show({
        buttons: [
          { text: 'Take photo' },
          { text: 'Photo from library' }
        ],
        titleText: 'Add filed to document',
        cancelText: 'Cancel',
        buttonClicked: function(index) {
          $scope.addImage(index);
        }
      });
    }

    $scope.addImage = function(type) {
      $scope.hideSheet();
      ImageService.handleMediaDialog(type).then(function() {
        $scope.images = FileService.images();
      });
    };

    $scope.uploadDocument = function() {

      //FileService.clearImages();
      //$scope.images = FileService.images();
      if ($scope.images != null && $scope.images.length > 0) {
        $ionicLoading.show({template: 'Uploading Document ...'});
        DocumentsService.createDocument($scope.urlForImage($scope.images[0]), $scope.documentNotes).then(function(){
          FileService.clearImages();
          $scope.documentNotes = '';
          $scope.images = FileService.images();
          $ionicLoading.hide();
          $state.go('app.documents');
        }, function(err){
          console.log(JSON.stringify(err));
          $ionicLoading.hide();
        });
      }

      // wenn bilder vorhanden sind, dann Document erzeugen und erstes Bild hochladen
      // document id speicher
      // zur document id Notiz hochladen
      // zur document id weitere bilder hochladen


    }

  });

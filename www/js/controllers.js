/**
 * Created by peter on 24.10.15.
 */
angular.module('r-mobile.controllers', [])
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

  .controller('DocumentsController', function($scope, $state, $ionicLoading, DocumentsService, $stateParams, $timeout, ionicMaterialMotion, ionicMaterialInk) {

    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);

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

    // Set Ink
    ionicMaterialInk.displayEffect();

    if ($scope.documents == undefined) {
      DocumentsService.getDocuments().then(function () {
        $scope.documents = DocumentsService.documents;
      }, function () {
        $ionicPopup.alert({title: 'Error', template: 'Loading documents failed.'});
      })
    }

    $scope.doRefresh = function(){
      $ionicLoading.show({template: "Refreshing Documents..."});
      DocumentsService.getDocuments().then(function () {
        $scope.documents = DocumentsService.documents;
      }, function () {
        $ionicPopup.alert({title: 'Error', template: 'Loading documents failed.'});
      }).finally(function(){
        $scope.$broadcast('scroll.refreshComplete');
        $ionicLoading.hide();
      });
    }

    $scope.addDocument = function(){
      $state.go('app.adddocument');
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
    }

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
          $state.go('documents');
        }, function(err){
          console.log(JSON.stringify(err));
          $ionicLoading.hide();
        });
      }

      // wenn bilder vorhanden sind, dann Document erzeugen und erstes Bild hochladen
      // document id speicher
      // zur document id Notiz hochladen
      // zur document id weitere bilder hochladen


      //if ($scope.images != null && $scope.images.length > 0) {
      //
      //  var mailImages = [];
      //  var savedImages = $scope.images;
      //  if ($cordovaDevice.getPlatform() == 'Android') {
      //    // Currently only working for one image..
      //    var imageUrl = $scope.urlForImage(savedImages[0]);
      //    var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
      //    var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
      //    $cordovaFile.copyFile(namePath, name, cordova.file.externalRootDirectory, name)
      //      .then(function(info) {
      //        mailImages.push('' + cordova.file.externalRootDirectory + name);
      //        $scope.openMailComposer(mailImages);
      //      }, function(e) {
      //        console.log(JSON.stringify(e));
      //      });
      //  } else {
      //    for (var i = 0; i < savedImages.length; i++) {
      //      mailImages.push('' + $scope.urlForImage(savedImages[i]));
      //    }
      //    $scope.openMailComposer(mailImages);
      //  }
      //}
    }

    $scope.openMailComposer = function(attachments) {
      var bodyText = '<html><h2>My Images</h2></html>';
      var email = {
        to: 'some@email.com',
        attachments: attachments,
        subject: 'Devdactic Images',
        body: bodyText,
        isHtml: true
      };

      $cordovaEmailComposer.open(email).then(null, function() {
        for (var i = 0; i < attachments.length; i++) {
          var name = attachments[i].substr(attachments[i].lastIndexOf('/') + 1);
          $cordovaFile.removeFile(cordova.file.externalRootDirectory, name);
        }
      });
    }
  });

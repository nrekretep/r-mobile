/**
 * Created by peter on 24.10.15.
 */
angular.module('r-mobile')
  .controller('RmobileController', function($scope) {

});

angular.module('r-mobile')
  .controller('DocumentsController', function($scope, $state, $ionicLoading, DocumentsService) {

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

    $scope.newTask = function(){
      $state.go('add-document');
    };

});

angular.module('r-mobile')
  .controller('LoginController', function($rootScope, $scope, LoginService, $state, $ionicPopup, $ionicLoading){
  $scope.loginData = {};
  $rootScope.titleText = 'Rembli mobile';
  // Called when the form is submitted
  $scope.login = function() {

    $ionicLoading.show({template: "Let's have a try..."});
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
    }).finally(function(){$ionicLoading.hide()});

    $scope.loginData.password = "";
  };

});

angular.module('r-mobile')

  .controller('ImageController', function($scope, $state, $cordovaDevice, $cordovaFile, $ionicPlatform, $cordovaEmailComposer, $ionicActionSheet, $ionicLoading, ImageService, FileService, DocumentsService) {

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

/**
 * Created by peter on 24.10.15.
 */
angular.module('r-mobile.services', [])
  .service('LoginService', function($http, $httpParamSerializer, $q) {
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
})
  .service('DocumentsService', function($http, LoginService, $q) {
    return {
      //documents: {},
      getDocuments: function(){
        var self = this;
        var q = $q.defer();

        $http.get('http://www.rembli.com/documents/api/documents', {headers: {Authorization: 'Bearer ' + LoginService.bearerToken}}).then(function(resp){

          self.documents = resp.data;
          console.log(JSON.stringify(self));
          q.resolve(self.documents);

        }, function(err){
          q.reject(err);
        });

        return q.promise;
      },
      deleteDocument: function(id){
        var self = this;
        var q = $q.defer();
        $http.delete('http://www.rembli.com/documents/api/documents/' + id , {headers: {Authorization: 'Bearer ' + LoginService.bearerToken}}).then(function(resp){

          q.resolve();

        }, function(err){
          q.reject(err);
        });

        return q.promise;
      },
      createDocument: function(imagepath, note){
        var self = this;
        var q = $q.defer();
        var fd = new FormData();

        var info = note;
        if(info == null || info == undefined || info == '') info = 'Upload from Rembli mobile';

        var cb = function(dataUrl){
          fd.append('RemoteFile', self.dataURItoBlob(dataUrl), info);

          $http.post('http://www.rembli.com/documents/api/documents', fd, {
            transformRequest: angular.identity,
            headers: {Authorization: 'Bearer ' + LoginService.bearerToken, 'Content-Type': undefined}})
            .then(function(resp){

              console.log(JSON.stringify(resp));
              q.resolve(resp.data);

            }, function(err){
              q.reject(err);
            });
        };
        self.fileUriToDataUrl(imagepath, cb, 'image/jpeg');
        return q.promise;
      },
      dataURItoBlob: function (dataURI) {
        var binary = atob(dataURI.split(',')[1]);
        var array = [];
        for (var i = 0; i < binary.length; i++) {
          array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
      },
      fileUriToDataUrl: function (url, callback, outputFormat) {
        var img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function () {
          var canvas = document.createElement('CANVAS'),
            ctx = canvas.getContext('2d'), dataURL;
          canvas.height = this.height;
          canvas.width = this.width;
          ctx.drawImage(this, 0, 0);
          dataURL = canvas.toDataURL(outputFormat);
          callback(dataURL);
          canvas = null;
        };
        img.src = url;
      }

    }
  }
)
  .factory('FileService', function ($q, $cordovaFile) {
    return {
      imageStore: [],
      IMAGE_STORAGE_KEY: 'images',

      images: function () {
        var self = this;
        var img = window.localStorage.getItem(self.IMAGE_STORAGE_KEY);
        if (img) {
          self.imageStore = JSON.parse(img);
        } else {
          self.imageStore = [];
        }
        return self.imageStore;
      },

      storeImage: function (img) {
        var self = this;
        self.imageStore.push(img);
        self.saveImages();
      },

      saveImages: function () {
        var self = this;
        window.localStorage.setItem(self.IMAGE_STORAGE_KEY, JSON.stringify(self.imageStore));
      },

      clearImages: function () {
        var q = $q.defer();
        var self = this;
        if (self.imageStore) {
          for (var i in self.imageStore) {
            $cordovaFile.removeFile(cordova.file.dataDirectory, self.imageStore[i]);
            console.log('Removed file ' + self.imageStore[i])
          }
          self.imageStore = [];
          self.saveImages();
        }
        q.resolve();
        return q.promise;
      }
    }
  })

  .factory('ImageService', function($cordovaCamera, FileService, $q, $cordovaFile) {

    function makeid() {
      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

      for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    };

    function optionsForType(type) {
      var source;
      switch (type) {
        case 0:
          source = Camera.PictureSourceType.CAMERA;
          break;
        case 1:
          source = Camera.PictureSourceType.PHOTOLIBRARY;
          break;
      }
      return {
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: source,
        allowEdit: false,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
      };
    }

    function saveMedia(type) {
      return $q(function(resolve, reject) {
        var options = optionsForType(type);

        $cordovaCamera.getPicture(options).then(function(imageUrl) {
          var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
          var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
          var newName = makeid() + name;
          $cordovaFile.copyFile(namePath, name, cordova.file.dataDirectory, newName)
            .then(function(info) {
              console.log('Path: ' + namePath + ' -- ' + name + '--' + cordova.file.dataDirectory + '--' + newName);
              FileService.storeImage(newName);
              resolve();
            }, function(e) {
              reject();
            });
        });
      })
    }
    return {
      handleMediaDialog: saveMedia
    }
  });

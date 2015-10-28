'use strict';
(function(PHOTOAPP){
  // Helper function to remove all child nodes of a DOM element
  PHOTOAPP.removeChildNodes = function(node) {
    if(node) {
      while(node.firstChild) {
        node.removeChild(node.firstChild);
      }
    }
    return node;
  }
  var stickers = {};
  var photos = {};
  PHOTOAPP.photoAdded = false;
  PHOTOAPP.currentDraggedImage = null;
  PHOTOAPP.isFileAnImage = function(fileObj) {
    var imageType = false,
        matchString = /^image\//;
    if(fileObj && matchString.test(fileObj.type)) {
      imageType = true; 
    }
    return imageType;
  }
  PHOTOAPP.filesToImgElem = function(fileObj, img) {
    var reader;
    if(fileObj) {
      reader = new FileReader();
      reader.readAsDataURL(fileObj);

      //img.src = window.URL.createObjectURL(fileObj);
      //img.onload = function() {
      //  window.URL.revokeObjectURL(this.src);
      //}
    }
    return reader;
  }
  PHOTOAPP.addSticker = function(id, srcString) {
    if(!stickers.id) {
      stickers.id = srcString;
    }
  }
  PHOTOAPP.deleteSticker = function(id) {
    if(stickers.id) {
      stickers.id = null;
    }
  }
  PHOTOAPP.updateSticker = function(id, srcString) {
    if(stickers.id && srcString) {
      stickers.id = srcString;
    }
  }
  PHOTOAPP.getSticker = function(id) {
    return stickers.id
  }
  PHOTOAPP.addPhoto = function(id, srcString) {
    if(!photos.id) {
      photos.id = srcString
    }
  }
  PHOTOAPP.deletePhoto = function(id) {
    if(photos.id) {
      photos.id = null;
    }
  }
  PHOTOAPP.updatePhoto = function(id, srcString) {
    if(photos.id && srcString) {
      photos.id = srcString;
    }
  }
  PHOTOAPP.getPhoto = function(id) {
    return photos.id;
  }
  PHOTOAPP.init = function() {
    var files;
    var stickerId = 0;
    var photoId = 0;
    var $photoUploadBtn = document.getElementById('photo-upload'),
    $canvasArea = document.getElementById('canvas-area'),
    $stickerArea = document.getElementById('sticker-area'),
    $addSticker = document.getElementById('add-sticker'),
    $stickerModal = document.getElementById('sticker-modal'),
    $stickerForm = document.getElementById('sticker-form'),
    $stickerInput = document.getElementById('sticker-input'),
    $stickerUploadBtn = document.getElementById('sticker-upload'),
    $stickerTemplate = document.getElementById('sticker-template');

    $stickerArea.addEventListener('click', function(e) {
      if(e.target.classList.contains('sticker-remove')) {
        var stickerImg = e.target.parentElement.getElementsByClassName('sticker-img')[0];
        PHOTOAPP.deleteSticker(stickerImg.dataset.stickerId);
        e.target.parentElement.parentElement.removeChild(e.target.parentElement);
      }
    });
    $photoUploadBtn.addEventListener('change', function() {
      var img = document.createElement('img'), reader;
      files = this.files;
      if(files.length === 1) {
        reader = PHOTOAPP.filesToImgElem(files[0]);
        reader.onload = function(e) {
          PHOTOAPP.addPhoto(photoId, e.target.result);
          img.dataset.photoId = photoId;
          photoId++;
          img.src = e.target.result;
          img.classList.add('main-image');
          PHOTOAPP.removeChildNodes($canvasArea);
          $canvasArea.appendChild(img);
          PHOTOAPP.photoAdded = true;
        }  
      }
    });

    $addSticker.addEventListener('click', function() {
      $stickerForm.reset(); 
      $stickerInput.value = '';
      $stickerModal.style.display = 'block';
    });

    $stickerModal.addEventListener('click', function(e) {
      if(e.target === this) {
        $stickerModal.style.display = 'none';
      }
    });
    document.addEventListener('dragstart', function(event) {
        var classList = event.target.classList;
        if(PHOTOAPP.photoAdded && (classList.contains('sticker-img') || classList.contains('dropped-sticker'))) {
          PHOTOAPP.currentDraggedImage = event.target;
        }
    });
    $canvasArea.addEventListener('drop', function(event) {
      var img, parent, classList;
      console.log(event);
      if(PHOTOAPP.photoAdded) {
        event.preventDefault();
        if(PHOTOAPP.currentDraggedImage) {
          classList = PHOTOAPP.currentDraggedImage.classList;
          if(classList.contains('sticker-img')) {
            img = document.createElement('img');
            img.src = PHOTOAPP.currentDraggedImage.src;
            img.classList.add('dropped-sticker');
            img.style.left = (event.offsetX - 75) + "px";
            img.style.top = (event.offsetY - 75) + "px";
            parent = this;
            img.onload = function() {
            parent.appendChild(img);
            };
          } else if (classList.contains('dropped-sticker')) {
            img = PHOTOAPP.currentDraggedImage;
            img.style.left = (event.offsetX - 75) + "px";
            img.style.top = (event.offsetY - 75) + "px";
          }
        }
        

        /*canvas = document.createElement("canvas");
        context = canvas.getContext("2d");
        canvas.style.width = "150px";
        canvas.style.height = "150px";
        context.drawImage(dragged, 0, 0);
        dataurl = canvas.toDataURL("image/png", 1);*/
        
        //var viewportOffset = event.toElement.getBoundingClientRect();
        // these are relative to the viewport
        //var top = viewportOffset.top;
        //var left = viewportOffset.left;

        
        PHOTOAPP.currentDraggedImage = null;
      }
    });
    
    $stickerForm.addEventListener('submit', function(e) {
      var reader, temp, title, $tempDiv = document.createElement('div'),
      stickerImg = document.createElement('img'),
      $stickTemp = document.createElement('div');
      e.preventDefault();
      files = $stickerUploadBtn.files;
      title = $stickerInput.value.trim();
      if(title && files && files.length === 1) {
        reader = PHOTOAPP.filesToImgElem(files[0], stickerImg);
        reader.onload = function(e) {
          PHOTOAPP.addSticker(stickerId, e.target.result);

          stickerImg.src = e.target.result;
          stickerImg.dataset.stickerId = stickerId;
          stickerId++;
          $tempDiv.appendChild(stickerImg);

          stickerImg.draggable = true;
          stickerImg.classList.add('sticker-img');

          temp = $stickerTemplate.innerHTML;
          temp = temp.replace('{{stickerImg}}', $tempDiv.innerHTML);
          temp = temp.replace('{{title}}', title);

          $stickTemp.innerHTML = temp;

          $stickerArea.insertBefore($stickTemp.getElementsByClassName('sticker')[0], $stickerArea.firstChild);

          $stickerModal.style.display = 'none';
        }
        

      }
    });
  }
  PHOTOAPP.init();

})(window.PHOTOAPP = window.PHOTOAPP || {});

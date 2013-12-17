(function(window) {
  'use strict';
  window.document.addEventListener("DOMContentLoaded", function(){
    var images = window.document.querySelectorAll('.browser-icons img');
    var i = images.length;
    while (i--) {
      images[i].addEventListener('error', function() {
        this.style.display = 'none';
      }, false);
    }
  }, false);
})(window);
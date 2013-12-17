(function(window) {
  'use strict';
  window.addEventListener('load', function() {
    var containers = window.document.querySelectorAll('.stars');
    for (var ci = 0, cl = containers.length; ci < cl; ci++) {
      containers[ci].addEventListener('click', function(e) {
        if (!e.target.classList.contains('stars-star')) {
          return;
        }
        var active = this.querySelector('.active');
        if (active) {
          active.classList.remove('active');
        }
        e.target.classList.add('active');
      }, false);
    }
  }, false);
})(window);

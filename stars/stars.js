(function(window) {
  'use strict';
  window.addEventListener('load', function() {
    // Обходим все блоки со звездами
    var containers = window.document.querySelectorAll('.stars');
    for (var ci = 0, cl = containers.length; ci < cl; ci++) {
      // Обходим все звезды в блоке
      var stars = containers[ci].querySelectorAll('.stars-star');
      for (var si = 0, sl = stars.length; si < sl; si++) {
        stars[si].addEventListener('click', (function(ci) {
          return function() {
            // При клике снимаем класс active в этом блоке
            var active = containers[ci].querySelector('.active');
            if (active) {
              active.classList.remove('active');
            }
            // И ставим active на звезду по которой кликнули
            this.classList.add('active');
          };
        })(ci), false);
      }
    }
  }, false);
})(window);

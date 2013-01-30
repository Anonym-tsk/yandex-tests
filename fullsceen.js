(function($) {
  /****************** FullScreen *****************/

  // Проверяет поддержку полноэкранного режима
  $.support.fullScreen = function() {
    return ('requestFullscreen' in document.documentElement) ||
      ('mozRequestFullScreen' in document.documentElement && document.mozFullScreenEnabled) ||
      ('webkitRequestFullScreen' in document.documentElement);
  }();

  // Возвращает статус полноэкранного режима
  $.fullScreenStatus = function() {
    return document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen;
  };

  // Выходит из полноэкранного режима
  $.fullScreenExit = function() {
    if (!$.support.fullScreen || !$.fullScreenStatus()) {
      return false;
    }

    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    }
    else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
    return true;
  };

  // Возвращает элемент, находящийся в полноэкранном режиме
  $.fullScreenElement = function() {
    if ('fullscreenElement' in document) {
      return document.fullscreenElement;
    }
    if ('mozFullScreenElement' in document) {
      return document.mozFullScreenElement;
    }
    if ('webkitCurrentFullScreenElement' in document) {
      return document.webkitCurrentFullScreenElement;
    }
    return false;
  };

  // Events
  if ($.support.fullScreen) {
    var fsElement = null;
    $(document).on('fullscreenchange mozfullscreenchange webkitfullscreenchange', function() {
      if ($.fullScreenStatus()) {
        fsElement = $.fullScreenElement();
        $(fsElement).trigger('fullScreenEnabled');
      }
      else {
        $(fsElement).trigger('fullScreenDisabled');
        fsElement = null;
      }
    });
  }

  // Возвращает статус элемента
  $.fn.fullScreenStatus = function() {
    if(!$.support.fullScreen || this.length !== 1) {
      return this;
    }

    return this.get(0) === $.fullScreenElement();
  };

  // Показывает элемент в полноэкранном режиме
  $.fn.fullScreen = function() {
    if(!$.support.fullScreen || this.length !== 1) {
      return this;
    }

    // Выходим из полноэкранного режима, если уже в нем
    if ($.fullScreenStatus()) {
      $.fullScreenExit();
      return this;
    }

    var element = this.get(0);
    if (element.requestFullscreen) {
      element.requestFullscreen();
    }
    else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    }
    else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    }

    var $self = this;
    $self.on('fullScreenEnabled', function() {
      $self.addClass('fullscreen');
    }).on('fullScreenDisabled', function() {
      $self.removeClass('fullscreen');
    });

    return $self;
  };

  /***********************************************/
})(jQuery);

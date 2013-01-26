(function($) {

  /**************** Трансформации ****************/

  // Проверка поддержки CSS трансформаций
  $.support.transform = function() {
    return ('transformProperty' in document.documentElement.style) ||
      ('WebkitTransform' in document.documentElement.style) ||
      ('MozTransform' in document.documentElement.style) ||
      ('OTransform' in document.documentElement.style) ||
      ('msTransform' in document.documentElement.style);
  }();

  // Масштабирует объект
  $.fn.transformScale = function(multiplier) {
    if ($.support.transform) {
      var prefix;
      if ($.browser.webkit) prefix = '-webkit-';
      else if ($.browser.opera) prefix = '-o-';
      else if ($.browser.mozilla) prefix = '-moz-';
      else if ($.browser.msie) prefix = '-ms-';

      return this.each(function() {
        var $this = $(this);
        $this.css(prefix +'transform', 'scale('+ multiplier +')');
        $this.css('transform', 'scale('+ multiplier +')');
        $this.css(prefix +'transform-origin', 'top left');
        $this.css('transform-origin', 'top left');
      });
    }
    else {
      return this.each(function() {
        this.style.filter = "progid:DXImageTransform.Microsoft.Matrix(M11='1.0', sizingmethod='auto expand')";
        this.filters.item(0).M11 *= multiplier;
        this.filters.item(0).M12 *= multiplier;
        this.filters.item(0).M21 *= multiplier;
        this.filters.item(0).M22 *= multiplier;
      });
    }
  };

  /***********************************************/


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
    var fullScreenChange = function() {
      if ($.fullScreenStatus()) {
        $self.addClass('fullscreen');
      }
      else {
        $self.unbind('fullscreenchange mozfullscreenchange webkitfullscreenchange', fullScreenChange).removeClass('fullscreen');
      }
    };
    $self.bind('fullscreenchange mozfullscreenchange webkitfullscreenchange', fullScreenChange);

    return $self;
  };

  /***********************************************/


  /****************** Слайдер ********************/

  $.fn.slider = function(options) {
    if (this.length !== 1) {
      return this;
    }

    var $self = this;

    // Настройки по-умолчанию
    this.options = $.extend({
      items: '.slide', // Селектор элементов-слайдов
      firstSlide: 0, // Индекс первого слайда
      width: '400px', // Ширина слайдера
      height: '300px', // Высота слайдера
      background: '#fff', // Фон слайдера
      hideControls: false, // Скрыть элементы управления
      ajax: [], // Ссылки на слайды, которые должны загружаться Ajax'ом
      ajaxCache: true, // Кэшировать ли Ajax ответы
      // Переход между слайдами
      effect: function(oldSlide, newSlide, index) {
        if (oldSlide) {
          oldSlide.fadeOut(200);
        }
        if (newSlide) {
          newSlide.fadeIn(200);
        }
      }
    }, options);

    // Настраиваем контейнер
    this.container = $(this).addClass('slider').css({
      width: $self.options.width,
      height: $self.options.height,
      background: $self.options.background
    });

    // Настраиваем слайды
    this.slides = $self.container.children($self.options.items).addClass('slider-item')

    // Количество слайдов уже в слайдере
    this.localCount = $self.slides.size();

    // Количество слайдов всего (+Ajax)
    this.slideCount = this.localCount + $self.options.ajax.length;

    // Для кэша слайдов
    this._cache = [];

    // Получает слайд по номеру и кэширует его
    this._getSlide = function(index) {
      if (typeof $self._cache[index] == 'undefined') {
        // Проверяем локальный это слайд или должен быть загружен Ajax'ом
        if (index < $self.localCount) {
          $self._cache[index] = $self.slides.eq(index);
        }
        else {
          // Прячем контролы на время выполнения запроса
          if (typeof $self.controls != 'undefined') {
            $self.controls.hide();
          }

          var ajaxIndex = index - $self.localCount;
          var slideContent;
          $.ajax({url: $self.options.ajax[ajaxIndex], async: false, cache: $self.options.ajaxCache})
            .done(function(data) {
              slideContent = data;
            })
            .fail(function() {
              slideContent = '<p>Error loading slide</p>';
            })
            .always(function() {
              // Добавляем новый слайд
              var $slide = $('<div/>', {
                'class': 'slider-item',
                'html': slideContent
              }).appendTo($self.container);
              $self._cache[index] = $slide;

              // Возвращаем контролы в любом случае
              if (typeof $self.controls != 'undefined') {
                $self.controls.show();
              }
            });
        }

        // Хак для картинок
        // TODO: учитывать padding у слайда
        var max = parseInt($self.container.css('max-width'));
        var setImageSize = function(image) {
          var width = image.naturalWidth ? image.naturalWidth : function() {
            var img = new Image();
            img.src = image.src;
            return img.width;
          }();
          $(image).addClass('loaded').width(parseInt(width / max * 100) + '%');
        };
        $self._cache[index].find('img:not(.loaded)').each(function() {
          if (this.complete) {
            setImageSize(this);
          }
        });
        $self._cache[index].find('img:not(.loaded)').bind('load', function() {
          setImageSize(this);
        });
      };

      return $self._cache[index];
    };

    // Показывает слайд по индексу
    this.goToSlide = function(index) {
      var oldSlide = typeof $self.currentIndex != 'undefined'
        ? $self._getSlide($self.currentIndex)
        : null;
      var newSlide = $self._getSlide(index);
      $self.options.effect(oldSlide, newSlide, index);

      // Изменяем значение в селекте, если контролы не скрыты
      if (typeof $self.slideSelector != 'undefined') {
        $self.slideSelector.val(index);
      }
      $self.currentIndex = parseInt(index);
      return $self.currentIndex;
    };

    // Показывает следующий слайд
    this.goNext = function() {
      var index = $self.currentIndex + 1;
      if (index < this.slideCount) {
        return $self.goToSlide(index);
      }
      return $self.currentIndex;
    };

    // Показывает предыдущий слайд
    this.goPrev = function() {
      var index = $self.currentIndex - 1;
      if (index >= 0) {
        return $self.goToSlide(index);
      }
      return $self.currentIndex;
    };

    // Создает стандартные контролы
    this._createControls = function() {
      $self.controls = $('<div/>', {
        'class': 'slider-controls'
      });

      $('<a/>', {
        'class': 'slider-prev',
        'href': '#prev',
        'title': 'Previous slide (←)',
        html: '&larr;',
        click: function(event) {
          $self.goPrev();
          event.preventDefault();
          event.stopPropagation();
        }
      }).appendTo($self.controls);

      $self.slideSelector = $('<select/>', {
        'class': 'slider-select',
        change: function() {
          var index = $(this).val();
          $self.goToSlide(index);
        }
      }).appendTo($self.controls);

      for (var i = 0; i < $self.slideCount; i++) {
        $('<option/>', {
          val: i,
          text: i + 1
        }).appendTo($self.slideSelector);
      }

      $('<a/>', {
        'class': 'slider-next',
        'href': '#next',
        'title': 'Next slide (→)',
        html: '&rarr;',
        click: function(event) {
          $self.goNext();
          event.preventDefault();
          event.stopPropagation();
        }
      }).appendTo($self.controls);

      if ($.support.fullScreen) {
        $('<a/>', {
          'class': 'slider-fullscreen',
          'href': '#fullscreen',
          'title': 'Fullscreen mode (F)',
          html: '#',
          click: function(event) {
            if (!$.fullScreenStatus()) {
              var keyMaps = function(event) {
                var RIGHT = 39,
                  LEFT = 37,
                  F = 70,
                  SPACE = 32;
                switch (event.which) {
                  case RIGHT:
                  case SPACE:
                    $self.goNext();
                    break;
                  case LEFT:
                    $self.goPrev();
                    break;
                  case F:
                    $self.container.fullScreen();
                    break;
                }
              };

              var disableKeyMaps = function() {
                if (!$.fullScreenStatus()) {
                  $(document).unbind('keyup', keyMaps);
                  $self.container.unbind('fullscreenchange mozfullscreenchange webkitfullscreenchange', disableKeyMaps);
                }
              };

              $(document).bind('keyup', keyMaps);
              $self.container.bind('fullscreenchange mozfullscreenchange webkitfullscreenchange', disableKeyMaps);
            }

            $self.container.fullScreen();
            event.preventDefault();
            event.stopPropagation();
          }
        }).appendTo($self.controls);
      }

      $self.controls.appendTo($self.container);
    };

    // Создаем контролы
    if (!this.options.hideControls) {
      this._createControls();
    }

    // Показываем первый слайд
    this.goToSlide(this.options.firstSlide);

    return this;
  };

  /***********************************************/

})(jQuery);

(function($) {
  /****************** Слайдер ********************/

  $.fn.slider = function(options) {
    if (this.length !== 1) {
      return this;
    }

    var $self = this;

    // Оборачиваем слайды в контейнер
    $self.wrapInner('<div class="slider-container"/>');
    this.container = $self.children('.slider-container');

    // Настройки по-умолчанию
    this.options = $.extend({
      items: '.slide', // Селектор элементов-слайдов
      firstSlide: 0, // Индекс первого слайда
      width: 400, // Ширина слайдера при отображении на странице (px)
      originalWidth: 1000, // Ширина слайда (px)
      proportions: {w: 4, h: 3}, // Пропорции слайдера
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

    this._scale = function(width) {
//      if (width / height > $self.options.proportions.w / $self.options.proportions.h) {
//        // Ширина достаточная, трансформируем вписывая по высоте
//      }
//      else {
//        // Ширины не хватает, трансвормируем вписывая по ширине с уменьшением высоты
//      }

      var multiplier = width / $self.options.originalWidth;
      $self.container.transformScale(multiplier);
      return multiplier;
    };

    // Настраиваем контейнер
    this.container.css({
      width: $self.options.originalWidth + 'px',
      height: ($self.options.originalWidth * $self.options.proportions.h / $self.options.proportions.w) + 'px'
    });

    // Настраиваем слайдер
    this.addClass('slider').css({
      width: $self.options.width + 'px',
      height: ($self.options.width * $self.options.proportions.h / $self.options.proportions.w) + 'px',
      background: $self.options.background
    })._scale($self.options.width);

    // Настраиваем слайды
    this.slides = $self.container.children($self.options.items).addClass('slider-item');

    // Количество слайдов уже в слайдере
    this.localCount = $self.slides.size();

    // Количество слайдов всего (+Ajax)
    this.slideCount = $self.localCount + $self.options.ajax.length;

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
                    $self.fullScreen();
                    break;
                }
              };

              var windowResize = function(event) {

              };

              var disableFullscreenEvents = function() {
                if (!$.fullScreenStatus()) {
                  $(document).unbind('keyup', keyMaps);
                  $(window).unbind('resize', windowResize);
                  $self.unbind('fullscreenchange mozfullscreenchange webkitfullscreenchange', disableFullscreenEvents);
                }
              };

              $(document).bind('keyup', keyMaps);
              $(window).bind('resize', windowResize);
              $self.bind('fullscreenchange mozfullscreenchange webkitfullscreenchange', disableFullscreenEvents);
            }

            $self.fullScreen();
            event.preventDefault();
            event.stopPropagation();
          }
        }).appendTo($self.controls);
      }

      $self.controls.appendTo($self);
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

(function($) {
  $.support.fullScreen = $.support.fullScreen || false;

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
      var prefix = '';
      if ($.browser.webkit) prefix = '-webkit-';
      else if ($.browser.mozilla) prefix = '-moz-';
      else if ($.browser.msie) prefix = '-ms-';
      else if ($.browser.opera) prefix = '-o-';

      return this.each(function() {
        var $this = $(this);
        $this.css(prefix +'transform', 'scale('+ multiplier +')');
        $this.css('transform', 'scale('+ multiplier +')');
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
      width: 400, // Ширина слайдера при отображении на странице (px)
      originalWidth: 1000, // Ширина слайда (px)
      proportions: 4/3, // Пропорции слайдера
      backgroundFullScreen: '#222', // Фон полноэкранного слайдера
      background: '#fff', // Фон слайда
      hideControls: false, // Скрыть элементы управления
      ajax: [], // Ссылки на слайды, которые должны загружаться Ajax'ом
      ajaxCache: true, // Кэшировать ли Ajax ответы
      // Переход между слайдами
      effect: function(oldSlide, newSlide) {
        if (oldSlide) {
          oldSlide.fadeOut(200);
        }
        if (newSlide) {
          newSlide.fadeIn(200);
        }
      }
    }, options);

    // Оборачиваем слайды в контейнер
    $self.wrapInner('<div class="slider-container"/>');
    this.container = $self.children('.slider-container');

    // Настраиваем слайды
    this.slides = $self.container.children($self.options.items).addClass('slider-item');

    // Количество слайдов уже в слайдере
    this.localCount = $self.slides.size();

    // Количество слайдов всего (+Ajax)
    this.slideCount = $self.localCount + $self.options.ajax.length;

    // Для кэша слайдов
    this._cache = [];

    // Получает слайд Ajax'ом
    this._getAgaxSlide = function(ajaxIndex) {
      $self.trigger('beforeAjaxSlide');

      var slideContent = '<p>Error loading slide</p>';
      $.ajax({
        url: $self.options.ajax[ajaxIndex],
        async: false,
        cache: $self.options.ajaxCache
      }).done(function(data) {
        slideContent = data;
      });

      // Добавляем новый слайд
      var result = $('<div/>', {
        'class': 'slider-item',
        'html': slideContent
      }).appendTo($self.container);

      $self.trigger('afterAjaxSlide');
      return result;
    };

    // Получает слайд по номеру и кэширует его
    this._getSlide = function(index) {
      if (typeof $self._cache[index] == 'undefined') {
        // Проверяем локальный это слайд или должен быть загружен Ajax'ом
        if (index < $self.localCount) {
          $self._cache[index] = $self.slides.eq(index);
        }
        else if (index < $self.slideCount) {
          $self._cache[index] = $self._getAgaxSlide(index - $self.localCount);
        }
        else {
          return null;
        }
      }

      return $self._cache[index];
    };

    // Показывает слайд по индексу
    this.goToSlide = function(index) {
      var oldSlide = typeof $self.currentIndex != 'undefined'
        ? $self._getSlide($self.currentIndex)
        : null;
      var newSlide = $self._getSlide(index);
      $self.options.effect(oldSlide, newSlide, index);

      $self.currentIndex = parseInt(index);
      $self.trigger('afterShowSlide');
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

    // Масштабирует слайдер
    this._scale = function(width) {
      var multiplier = width / $self.options.originalWidth;
      $self.container.transformScale(multiplier);
      return $self;
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
        html: '←',
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
        html: '→',
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
            $self.fullScreen();
            event.preventDefault();
            event.stopPropagation();
          }
        }).appendTo($self.controls);
      }

      $self.controls.appendTo($self);
    };

    // Настраиваем контейнер
    this.container.css({
      width: $self.options.originalWidth + 'px',
      height: ($self.options.originalWidth / $self.options.proportions) + 'px',
      marginTop: -parseInt($self.options.originalWidth / (2 * $self.options.proportions)) + 'px',
      marginLeft: -parseInt($self.options.originalWidth / 2) + 'px',
      background: $self.options.background
    });

    // Настраиваем слайдер
    this.addClass('slider').css({
      width: $self.options.width + 'px',
      height: ($self.options.width / $self.options.proportions) + 'px',
      background: $self.options.backgroundFullScreen
    })._scale($self.options.width);

    // Элементы управления и обработчики событий
    if (!this.options.hideControls) {
      this._createControls();

      // Обновляем значение в селекте после смены слайда
      this.bind('afterShowSlide', function() {
        $self.slideSelector.val($self.currentIndex);
      });

      if (this.options.ajax.length > 0) {
        // Прячем контролы на время выполнения запроса
        this.bind('beforeAjaxSlide', function() {
          $self.controls.hide();
        });
        this.bind('afterAjaxSlide', function() {
          $self.controls.show();
        });
      }
    }

    if ($.support.fullScreen) {
      var keyMaps = function(event) {
        var RIGHT = 39, LEFT = 37, F = 70, SPACE = 32;
        switch (event.which) {
          case RIGHT:
          case SPACE:
            $self.goNext();
            event.preventDefault();
            break;
          case LEFT:
            $self.goPrev();
            event.preventDefault();
            break;
          case F:
            $self.fullScreen();
            event.preventDefault();
            break;
        }
      };

      var windowResize = function() {
        var width = $self.width();
        var height = $self.height();

        if (width / height > $self.options.proportions) {
          $self._scale(height * $self.options.proportions);
        }
        else {
          $self._scale(width);
        }
      };

      $self.bind('fullScreenEnabled', function() {
        $(document).bind('keyup', keyMaps);
        $(window).bind('resize', windowResize);

        var width = $(window).width();
        var height = $(window).height();

        if (width / height > $self.options.proportions) {
          $self._scale(height * $self.options.proportions);
        }
        else {
          $self._scale(width);
        }
      }).bind('fullScreenDisabled', function() {
        $(document).unbind('keyup', keyMaps);
        $(window).unbind('resize', windowResize);
        $self._scale($self.options.width);
      });
    }

    // Показываем первый слайд
    this.goToSlide(this.options.firstSlide);

    return this;
  };

  /***********************************************/
})(jQuery);

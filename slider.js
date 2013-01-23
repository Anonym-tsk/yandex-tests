(function($) {
  $.fn.slider = function(options) {
    return this.each(function() {
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
        ajaxCache: true // Кэшировать ли Ajax ответы
      }, options);

      // Настраиваем контейнер
      this.container = $(this).addClass('slider').css({
        width: $self.options.width,
        height: $self.options.height,
        background: $self.options.background
      });

      // Настраиваем слайды
      this.slides = $self.container.children($self.options.items)
        .addClass('slider-item')
        .innerWidth($self.options.width)
        .innerHeight($self.options.height);

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
                var $slide = $('<div/>', {html: slideContent})
                  .addClass('slider-item')
                  .appendTo($self.container)
                  .innerWidth($self.options.width)
                  .innerHeight($self.options.height);
                $self._cache[index] = $slide;

                // Возвращаем контролы в любом случае
                if (typeof $self.controls != 'undefined') {
                  $self.controls.show();
                }
              });
          }
        }
        return $self._cache[index];
      };

      // Показывает слайд по индексу
      this.goToSlide = function(index) {
        // Если это не первый показ слайда - прячем текущий слайд
        if (typeof $self.currentIndex != 'undefined') {
          var oldSlide = $self._getSlide($self.currentIndex);
          if (oldSlide) {
            oldSlide.fadeOut(200);
          }
        }
        // Показываем новый слайд
        var slide = $self._getSlide(index);
        if (slide) {
          slide.fadeIn(200);
        }
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
        $self.controls = $('<div/>', {class: 'slider-controls'});

        $('<a/>', {class: 'slider-prev', html: '&larr;', href: '#prev'})
          .click(function(event) {
            $self.goPrev();
            event.preventDefault();
          })
          .appendTo($self.controls);

        $self.slideSelector = $('<select/>', {class: 'slider-select'})
          .change(function() {
            var index = $(this).val();
            $self.goToSlide(index);
          })
          .appendTo($self.controls);

        for (var i = 0; i < $self.slideCount; i++) {
          $('<option/>', {value: i, text: i + 1}).appendTo($self.slideSelector);
        }

        $('<a/>', {class: 'slider-next', html: '&rarr;', href: '#next'})
          .click(function(event) {
            $self.goNext();
            event.preventDefault();
          })
          .appendTo($self.controls);

        $self.controls.appendTo($self.container);
      };

      // Создаем контролы
      if (!this.options.hideControls) {
        this._createControls();
      }

      // Показываем первый слайд
      this.goToSlide(this.options.firstSlide);
    });
  };
})(jQuery);

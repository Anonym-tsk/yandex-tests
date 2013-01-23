(function($) {
  $.fn.slider = function(options) {
    return this.each(function() {
      var $self = this;

      this.options = $.extend({
        items: '.slide',
        firstSlide: 0,
        width: '400px',
        height: '300px',
        background: '#fff',
        hideControls: false,
        ajax: []
      }, options);

      this.container = $(this).addClass('slider').css({
        width: $self.options.width,
        height: $self.options.height,
        background: $self.options.background
      });

      this.slides = $self.container.children($self.options.items)
        .addClass('slider-item')
        .innerWidth($self.options.width)
        .innerHeight($self.options.height);

      this.localCount = $self.slides.size();

      this.slideCount = this.localCount + $self.options.ajax.length;

      this._cache = [];

      this._getSlide = function(index) {
        if (typeof $self._cache[index] == 'undefined') {
          if (index < $self.localCount) {
            $self._cache[index] = $self.slides.eq(index);
          }
          else {
            if (typeof $self.controls != 'undefined') {
              $self.controls.hide();
            }

            var ajaxIndex = index - $self.localCount;
            var slideContent;
            $.ajax({url: $self.options.ajax[ajaxIndex], async: false})
              .done(function(data) {
                slideContent = data;
              })
              .fail(function() {
                slideContent = '<p>Error loading slide</p>';
              })
              .always(function() {
                var $slide = $('<div/>', {html: slideContent})
                  .addClass('slider-item')
                  .appendTo($self.container)
                  .innerWidth($self.options.width)
                  .innerHeight($self.options.height);
                $self._cache[index] = $slide;

                if (typeof $self.controls != 'undefined') {
                  $self.controls.show();
                }
              });
          }
        }
        return $self._cache[index];
      };

      this.goToSlide = function(index) {
        if (typeof $self.currentIndex != 'undefined') {
          var oldSlide = $self._getSlide($self.currentIndex);
          if (oldSlide) {
            oldSlide.fadeOut(200);
          }
        }
        var slide = $self._getSlide(index);
        if (slide) {
          slide.fadeIn(200);
        }
        if (typeof $self.slideSelector != 'undefined') {
          $self.slideSelector.val(index);
        }
        $self.currentIndex = parseInt(index);
        return $self.currentIndex;
      };

      this.goNext = function() {
        var index = $self.currentIndex + 1;
        if (index < this.slideCount) {
          return $self.goToSlide(index);
        }
        return $self.currentIndex;
      };

      this.goPrev = function() {
        var index = $self.currentIndex - 1;
        if (index >= 0) {
          return $self.goToSlide(index);
        }
        return $self.currentIndex;
      };

      this.createControls = function() {
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

      if (!this.options.hideControls) {
        this.createControls();
      }

      this.goToSlide(this.options.firstSlide);
    });
  };
})(jQuery);

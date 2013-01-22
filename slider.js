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
        hideControls: false
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
      this.currentIndex = $self.options.firstSlide;

      this.goToSlide = function(index) {
        if (typeof index == 'undefined') {
          index = $self.options.firstSlide;
        }
        $self.currentIndex = parseInt(index);
        $self.slides.fadeOut(200);
        $self.slides.eq(index).fadeIn(200);
        $self.slideSelector.val(index);
        return $self;
      };

      this.goNext = function() {
        var index = $self.currentIndex + 1;
        if (index < $self.slides.size()) {
          $self.goToSlide(index);
        }
      };

      this.goPrev = function() {
        var index = $self.currentIndex - 1;
        if (index >= 0) {
          $self.goToSlide(index);
        }
      };

      this.createControls = function() {
        var $controls = $('<div/>', {class: 'slider-controls'});

        $self.nextButton = $('<a/>', {class: 'slider-next', html: '&rarr;', href: '#next'})
          .click(function(event) {
            $self.goNext();
            event.preventDefault();
          });

        $self.prevButton = $('<a/>', {class: 'slider-prev', html: '&larr;', href: '#prev'})
          .click(function(event) {
            $self.goPrev();
            event.preventDefault();
          });

        $self.slideSelector = $('<select/>', {class: 'slider-select'})
          .change(function() {
            var index = $(this).val();
            $self.goToSlide(index);
          });
        $self.slides.each(function() {
          var index = $self.slides.index(this);
          $('<option/>', {value: index, text: index + 1}).appendTo($self.slideSelector);
        });

        if (!this.options.hideControls) {
          $self.prevButton.appendTo($controls);
          $self.slideSelector.appendTo($controls);
          $self.nextButton.appendTo($controls);
        }

        $controls.appendTo($self.container);
        return $self;
      };

      this.createControls().goToSlide();
    });
  };
})(jQuery);

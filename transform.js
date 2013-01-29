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
})(jQuery);

(function(window) {
  'use strict';

  /**
   * Progressbar.
   * @param {HTMLElement} element
   * @constructor
   */
  var Progressbar = function(element) {
    /**
     * Max value.
     * @type {number}
     * @private
     */
    this._max = +element.dataset.max || 100;
    /**
     * Current value.
     * @type {number}
     * @private
     */
    this._value = +element.dataset.value || 0;
    /**
     * Progressbar element.
     * @type {HTMLElement}
     * @private
     */
    this._element = element;
    /**
     * Bar.
     * @type {HTMLElement}
     * @private
     */
    this._bar = document.createElement('div');
    this._bar.classList.add('progress-bar');
    this._element.appendChild(this._bar);

    // Set current value on start.
    this.set(this._value);
  };

  /**
   * Set progressbar value.
   * @param value
   * @public
   */
  Progressbar.prototype.set = function(value) {
    if (value > this._max || value < 0) {
      throw new RangeError('Значение должно быть от 0 до ' + this._max);
    }
    this._value = +value;
    this._element.dataset.value = +value;
    this._bar.style.left = Math.floor(this._value / this._max * 100) + '%';
  };

  /**
   * @export
   * @type {Function}
   */
  window.Progressbar = Progressbar;
})(window);


// Run it
(function(window) {
  'use strict';
  window.addEventListener('load', function() {
    var containers = window.document.querySelectorAll('.progress');
    for (var ci = 0, cl = containers.length; ci < cl; ci++) {
      var bar = new window.Progressbar(containers[ci]);

      // Test it (first - error, second - works)
      setTimeout(bar.set.bind(bar, 800), 4000);
    }
  }, false);
})(window);
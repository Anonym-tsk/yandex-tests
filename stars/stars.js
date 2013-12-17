(function(window) {
  'use strict';

  /**
   * Stars.
   * @param {HTMLElement} element
   * @constructor
   */
  var Stars = function(element) {
    /**
     * Stars count.
     * @type {number}
     * @private
     */
    this._count = +element.dataset['count'] || 5;
    /**
     * Current rate.
     * @type {number}
     * @private
     */
    this._value = +element.dataset['value'] || 0;
    /**
     * Stars list.
     * @type {Array}
     * @private
     */
    this._starsList = [];

    // Create wrapper for stars
    var wrapper = document.createElement('div');
    wrapper.classList.add('wrapper');
    element.appendChild(wrapper);

    // Create stars
    var i = this._count + 1;
    while (--i) {
      var star = document.createElement('div');
      star.classList.add('stars-star');
      star.title = i.toString();
      wrapper.appendChild(star);
      this._starsList[i] = star;

      // Init events
      star.addEventListener('click', (function(Container, index) {
        return Container.set.bind(Container, index);
      })(this, i), false);
    }

    // Set current value on start
    this.set(this._value);
  };

  /**
   * Set stars value.
   * @param {number} value
   * @public
   */
  Stars.prototype.set = function(value) {
    if (value > this._count || value < 0) {
      throw new Error('Значение должно быть в интервале от 0 до ' + this._count);
    }
    if (this._value) {
      this._starsList[this._value].classList.remove('active');
    }
    this._value = +value;
    if (this._value) {
      this._starsList[this._value].classList.add('active');
    }
  };

  /**
   * @export
   * @type {Function}
   */
  window.Stars = Stars;


  // Run it
  window.addEventListener('load', function() {
    var containers = window.document.querySelectorAll('.stars');
    for (var ci = 0, cl = containers.length; ci < cl; ci++) {
      new Stars(containers[ci]);
    }
  }, false);
})(window);
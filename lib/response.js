'use strict';

module.exports = {
  set body(data) {
    this._body = data;
  },

  get body() {
    return this._body
  }
};

'use strict';

module.exports = {
  get body() {
    return this.req.data;
  },

  get socket() {
    return this.req.socket;
  }
};

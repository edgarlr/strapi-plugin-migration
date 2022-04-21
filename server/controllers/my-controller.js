'use strict';

module.exports = {
  index(ctx) {
    ctx.body = strapi
      .plugin('migration')
      .service('myService')
      .getWelcomeMessage();
  },
};

const chalk = require("chalk");
const { logError } = require("../helpers");
const { validate } = require("./validations");
const { getContentTypeProps } = require("./content-type/helpers");
const {
  getContentTypeIntentActions,
} = require("./content-type/actions-intent");

module.exports = {
  bootstrapAPIRoute: ({ name }) => {
    console.info(
      chalk.bold("Create API Route: "),
      chalk.bold.yellowBright(name)
    );
  },
  createContentType: async (collectionName, contentType) => {
    const { apiRoute, ...contentTypeData } = getContentTypeProps(
      collectionName,
      contentType
    );

    try {
      await validate.apiRoute(apiRoute, contentTypeData);

      if (apiRoute.action === "create") {
        module.exports.bootstrapAPIRoute(apiRoute);
      }

      await validate.createContentType(contentTypeData);

      console.info(
        chalk.bold("Create Content Type: "),
        chalk.bold.yellowBright(contentTypeData.collectionName)
      );

      Object.entries(contentTypeData).map(([key, value]) =>
        console.info(`  - ${chalk.italic(key)}: ${JSON.stringify(value)}`)
      );

      return getContentTypeIntentActions(contentTypeData);
    } catch (error) {
      logError(error);
      process.exit(1);
    }
  },

  editContentType: (contentType, contentTypeId) =>
    console.log("editContentType called with: ", contentType, contentTypeId),
};

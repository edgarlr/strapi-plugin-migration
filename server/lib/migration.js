const { logError } = require("../helpers");
const { generateTemplate } = require("./generate-template");
const chalk = require("chalk");
const { getContentTypeActions } = require("./content-type/actions");
const {
  getContentTypeProps,
  getContentTypePath,
} = require("./content-type/helpers");
const { sleep } = require("../utils");

const { join } = require("path");

module.exports = {
  bootstrapAPIRoute: async ({ name }, contentType) => {
    const apiRoutePath = join("src/api", name);

    const data = {
      uid: `api::${name}.${contentType.singularName}`,
      id: name,
    };

    try {
      await generateTemplate([
        {
          type: "create",
          path: `${apiRoutePath}/controllers/${name}.js`,
          templateFile: "core-controller",
          data,
        },
        {
          type: "create",
          path: `${apiRoutePath}/services/${name}.js`,
          templateFile: "core-service",
          data,
        },
        {
          type: "create",
          path: `${apiRoutePath}/routes/${name}.js`,
          templateFile: `core-router`,
          data,
        },
      ]);

      console.info(
        chalk.green("✓"),
        chalk.bold(`Bootstrap API Route: ${name}`)
      );

      await sleep(500);
    } catch (error) {
      logError(error);
      process.exit(1);
    }
  },
  createContentType: async (collectionName, contentType) => {
    const { draftAndPublish, apiRoute, ...contentTypeData } =
      getContentTypeProps(collectionName, contentType);

    try {
      if (apiRoute.action === "create") {
        await module.exports.bootstrapAPIRoute(apiRoute, contentTypeData);
      }

      const contentTypePath = getContentTypePath(contentTypeData, apiRoute);

      await generateTemplate({
        type: "create",
        path: contentTypePath,
        templateFile: "content-type",
        data: Object.assign({}, contentTypeData, {
          useDraftAndPublish: draftAndPublish,
        }),
      });

      console.info(
        chalk.green("✓"),
        chalk.bold(`Create Content Type: ${contentTypeData.collectionName}`)
      );

      await sleep(500);

      return getContentTypeActions(contentTypeData);
    } catch (error) {
      logError(error);
      process.exit(1);
    }
  },

  editContentType: (contentType, contentTypeId) =>
    console.log("editContentType called with: ", contentType, contentTypeId),
};

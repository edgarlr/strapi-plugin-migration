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
const { createEntryWithLocalizations } = require("./create-entry");

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

      return getContentTypeActions(contentTypeData, apiRoute);
    } catch (error) {
      logError(error);
      process.exit(1);
    }
  },

  importContent: async (collectionName, { entries }) => {
    try {
      const responses = await Promise.allSettled(
        entries.map(async (entry) => {
          await createEntryWithLocalizations(collectionName, entry);
        })
      );

      responses.forEach((res) => console.info(res));

      if (responses.some((res) => res.status === "rejected")) {
        return console.info(chalk.red("Some errores ocurred"));
      }

      return console.info(
        chalk.green(`Succesfully imported ${entries.length} entries.`)
      );
    } catch (error) {
      logError(error);
      process.exit(1);
    }
  },

  setPublicPermissions: async (newPermissions) => {
    try {
      // Find the ID of the public role
      const publicRole = await strapi
        .query("plugin::users-permissions.role")
        .findOne({
          where: {
            type: "public",
          },
        });

      // Create the new permissions and link them to the public role
      const allPermissionsToCreate = [];
      Object.keys(newPermissions).map((controller) => {
        const actions = newPermissions[controller];
        const permissionsToCreate = actions.map((action) => {
          return strapi.query("plugin::users-permissions.permission").create({
            data: {
              action: `api::${controller}.${controller}.${action}`,
              role: publicRole.id,
            },
          });
        });
        allPermissionsToCreate.push(...permissionsToCreate);
      });

      await Promise.all(allPermissionsToCreate);
    } catch (error) {
      logError(error);
      process.exit(1);
    }
  },

  editContentType: (contentType, contentTypeId) =>
    console.log("editContentType called with: ", contentType, contentTypeId),
};

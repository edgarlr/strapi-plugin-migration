const chalk = require("chalk");
const { logError } = require("../../helpers");
const { sleep } = require("../../utils");
const { generateTemplate } = require("../generate-template");
const { getContentTypePath, getComponentPath } = require("./helpers");
const { snakeCase, paramCase } = require("change-case");

module.exports.getContentTypeActions = (contentType, apiRoute) => {
  const contentTypePath = getContentTypePath(contentType);

  return {
    createAttribute: async (name, attribute) => {
      try {
        await generateTemplate({
          type: "modify",
          path: contentTypePath,
          transform(contentType) {
            contentType.attributes = Object.assign({}, contentType.attributes, {
              [name]: attribute,
            });

            return contentType;
          },
        });

        console.info(chalk.green("✓"), chalk.bold(`Create Field: ${name}`));
        await sleep(500);
      } catch (error) {
        logError(error);
        process.exit(1);
      }
    },

    editAttribute: (name, config) => {
      validate
        .editField(contentTypeData, { name: name, ...config })
        .then(() => {
          generateTemplate([
            {
              type: "modify",
              path: contentTypePath,
              transform(contentType) {
                contentType.attributes[name] = config;
                return contentType;
              },
            },
          ]);

          console.info(chalk.green("✓"), chalk.bold(`Edit Field: ${name}`));
          process.exit(0);
        })
        .catch((error) => {
          logError(error);
          process.exit(1);
        });
    },

    deleteAttribute: (name) => {
      validate
        .deleteField(contentTypeData, { name })
        .then(() => {
          generateTemplate([
            {
              type: "modify",
              path: contentTypePath,
              transform(contentType) {
                delete contentType.attributes[name];
                return contentType;
              },
            },
          ]);

          console.info(chalk.green("✓"), chalk.bold(`Delete Field: ${name}`));
          process.exit(0);
        })
        .catch((error) => {
          logError(error);
          process.exit(1);
        });
    },

    createRelationComponent: async () => {
      try {
        const componentPath = getComponentPath(
          "relation",
          paramCase(contentType.collectionName)
        );

        await generateTemplate({
          type: "create",
          path: componentPath,
          templateFile: "relation-component",
          data: {
            ...contentType,
            displayName: paramCase(contentType.collectionName),
            fieldName: snakeCase(contentType.collectionName),
            apiRoute: apiRoute.name,
          },
        });

        console.info(
          chalk.green("✓"),
          chalk.bold(
            `Create Component for releations: ${contentType.collectionName}`
          )
        );

        await sleep(500);
      } catch (error) {
        logError(error);
        process.exit(1);
      }
    },
  };
};

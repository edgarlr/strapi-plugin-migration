const chalk = require("chalk");
const { logError } = require("../../helpers");
const { sleep } = require("../../utils");
const { generateTemplate } = require("../generate-template");
const { getContentTypePath } = require("./helpers");

module.exports.getContentTypeActions = (contentType) => {
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
  };
};

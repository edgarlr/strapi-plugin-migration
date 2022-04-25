const chalk = require("chalk");
const { logError } = require("../../helpers");
const { validate } = require("../validations");

module.exports.getContentTypeIntentActions = (contentType) => {
  const plannedCreateAttributes = [];
  return {
    createAttribute: async (name, attribute) => {
      try {
        await validate.createAttribute(name, {
          attribute,
          contentType,
          plannedCreateAttributes,
        });

        console.info("\n");
        console.info(
          chalk.bold("  Create Attriibute: "),
          chalk.bold.yellowBright(name)
        );

        Object.entries(attribute).map(([key, value]) =>
          console.info(`    - ${chalk.italic(key)}: ${JSON.stringify(value)}`)
        );

        plannedCreateAttributes.push(name);
      } catch (error) {
        logError(error);
        process.exit(1);
      }
    },

    editAttribute: () => {},

    deleteAttribute: () => {},
  };
};

const chalk = require("chalk");
const { requireOptional } = require("./utils.js");
const pluralize = require("pluralize");
const prettier = require("prettier");

const colors = {
  red: [216, 16, 16],
  green: [142, 215, 0],
  blue: [0, 186, 255],
  gold: [255, 204, 0],
  mediumGray: [128, 128, 128],
  darkGray: [90, 90, 90],
};

module.exports.getConfig = () => {
  const currentPath = process.cwd();

  const defaultConfig = {
    migrationsDir: "migrations",
    prettierConfig: {
      singleQuote: true,
      semi: false,
    },
  };

  const localOverrides = requireOptional(
    `/${currentPath}/.strapi-migration.json`
  );

  return Object.assign({}, localOverrides, defaultConfig);
};

module.exports.logError = (error) => {
  console.info("\n");
  console.info(chalk.bold.rgb(...colors.red)("Error running migration."));
  console.info(chalk.rgb(...colors.red)(error));
};

module.exports.getCollectionNameFromId = (id) =>
  pluralize.isSingular(id) ? id : pluralize.singular(id);

module.exports.buildPretiffier = (prettierConfig) => {
  let config = prettierConfig;

  if (!config) {
    const currentPath = process.cwd();

    try {
      config = fs.readFileSync(path.join(currentPath, "/.prettierrc"), {
        encoding: "utf8",
        flag: "r",
      });
    } catch (err) {
      console.log("Using default prettier config");
    }

    if (config) {
      try {
        config = JSON.parse(config);
      } catch (err) {
        console.error(
          "Count not parse .prettierrc, does not appear to be JSON"
        );
      }
    }
  }

  return (text) => prettier.format(text, { ...config, parser: "babel" });
};

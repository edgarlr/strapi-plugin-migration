const chalk = require("chalk");
const { requireOptional } = require("./utils.js");
const prettier = require("prettier");
const resolveCwd = require("resolve-cwd");

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
  console.info(chalk.redBright(error));
};

module.exports.logValidationErrors = (error) => {
  module.exports.logError(`ValidationErrors: ${error.details.errors.length}`);

  if (error.details.errors) {
    error.details.errors.map((error) => {
      console.info("\n");
      console.info(chalk.bold("Path: ") + error.path.join(" / "));
      console.info(chalk.redBright(error.message));
    });
  }
};

module.exports.createValidationError = (
  { path, message } = {
    path: "Path not specified",
    message: "Message not specified",
  }
) => {
  return { details: { errors: [{ path, message }] } };
};

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

module.exports.getLocalFile = (path) => {
  const cmdPath = resolveCwd.silent(path);
  if (!cmdPath) {
    console.log(
      `Error loading ${yellow(
        path
      )} file. Strapi might not be installed in your "node_modules". You may need to run "yarn install".`
    );
    process.exit(1);
  }

  try {
    return require(cmdPath);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

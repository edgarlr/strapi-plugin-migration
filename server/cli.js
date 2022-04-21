const chalk = require("chalk");
const { getConfig, logError } = require("./helpers");
const program = require("commander");
const { version } = require("../package.json");
const { join } = require("path");
const migration = require("./lib/migration");

const config = getConfig();

program
  .version(version)
  .arguments("<migrationPath>")
  .option(
    "-d, --dir <pathToDirectory>",
    'Path to the "migrations" directory (default: "migrations")',
    config.migrationsDir
  );

program.parse();

const getMigrationFunctionFromFile = (filePath) => {
  try {
    const fullFilePath = join(process.cwd(), filePath);
    return require(fullFilePath);
  } catch (e) {
    const message = chalk`{red.bold The ${filePath} script could not be parsed, as it seems to contain syntax errors.}\n`;
    logError(message);
    logError(e);
    process.exit(1);
  }
};

const [migrationPath] = program.args;

const migrationFunction = getMigrationFunctionFromFile(migrationPath);

migrationFunction(migration);

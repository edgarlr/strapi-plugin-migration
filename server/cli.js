const chalk = require("chalk");
const { getConfig, logError } = require("./helpers");
const program = require("commander");
const { version } = require("../package.json");
const { join } = require("path");
const migration = require("./lib/migration");
const migrationIntent = require("./lib/migration-intent");
const inquirer = require("inquirer");
const config = getConfig();

const app = require("@strapi/strapi");

program.version(version, "-v", "Output the version number");

program
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

const runCLI = async () => {
  const strapi = await app().load();

  console.info(chalk.bold.green("The following migration has been planned"));
  try {
    const [migrationPath] = program.args;
    const migrationFunction = getMigrationFunctionFromFile(migrationPath);

    // Validate Migration Function
    await migrationFunction(migrationIntent);

    const { applyMigration } = await inquirer.prompt([
      {
        type: "confirm",
        message: "Do you want to apply the migration",
        name: "applyMigration",
      },
    ]);

    if (!applyMigration) {
      console.warn(chalk.yellow("⚠️ Migration aborted"));
      process.exit(0);
    }

    // Run Migration Function
    await migrationFunction(migration);

    console.info(chalk.bold.green("🚀 Migration successful"));
    process.exit(0);
  } catch (error) {
    logError(error);
    process.exit(1);
  }
};

runCLI();

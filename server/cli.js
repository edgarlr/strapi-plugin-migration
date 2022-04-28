const chalk = require("chalk");
const { getConfig, logError, getFileContent } = require("./helpers");
const program = require("commander");
const { version } = require("../package.json");
const migration = require("./lib/migration");
const migrationIntent = require("./lib/migration-intent");
const inquirer = require("inquirer");
const config = getConfig();

const app = require("@strapi/strapi");
const { importData } = require("./lib/import");

program.version(version, "-v", "Output the version number");

// `$ strapi-migrations .migrations/001-create-content-type.js`
program
  .arguments("<migrationPath>")
  .option(
    "-d, --dir <pathToDirectory>",
    'Path to the "migrations" directory (default: "migrations")',
    config.migrationsDir
  )
  .action(async (s) => {
    const strapi = await app().load();

    console.info(chalk.bold.green("The following migration has been planned"));
    try {
      const [migrationPath] = program.args;
      const migrationFunction = getFileContent(migrationPath);

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
  });

// `$ strapi-migrations import .migrations/data/content-types.json`

program
  .command("import")
  .arguments("<dataPath>")
  .option(
    "--content-types-only",
    'Path to the "migrations" directory (default: "migrations")',
    config.migrationsDir
  )
  .option(
    "--content-only",
    'Path to the "migrations" directory (default: "migrations")',
    config.migrationsDir
  )
  .option(
    "--export-path",
    'Path to the "migrations" directory (default: "migrations")',
    config.migrationsDir
  )
  .description("Import confiiguration and generate migration file")
  .action(async (args) => {
    const { cms } = await inquirer.prompt([
      {
        type: "list",
        choices: ["contentful"],
        message: "Importing from which CMS?",
        name: "cms",
      },
    ]);

    try {
      const [, dataPath] = program.args;
      const data = getFileContent(dataPath);

      console.info(chalk.bold.green("The following import has been planned"));

      const { generateMigrationFile } = await inquirer.prompt([
        {
          type: "confirm",
          message: "Do you want to generate the migration?",
          name: "generateMigrationFile",
        },
      ]);

      if (!generateMigrationFile) {
        console.warn(chalk.yellow("⚠️ Import aborted"));
        process.exit(0);
      }

      await importData(data, { cms });

      console.info(chalk.bold.green("🚀 Import successful"));
      process.exit(0);
    } catch (error) {
      logError(error);
      process.exit(1);
    }
  });

program.parse();

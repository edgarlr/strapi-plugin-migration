const fs = require("fs");
const { logError } = require("../helpers");
const { join } = require("path");
const resolveCwd = require("resolve-cwd");
const {
  mkdirPromise,
  readFilePromise,
  writeFilePromise,
  compile,
} = require("../utils");
const chalk = require("chalk");

const getTemplate = async (name) => {
  const templateFileNames = {
    "content-type":
      "@strapi/generators/lib/templates/content-type.schema.json.hbs",
    "core-controller":
      "@strapi/generators/lib/templates/core-controller.js.hbs",
    "core-router": "@strapi/generators/lib/templates/core-router.js.hbs",
    "core-service": "@strapi/generators/lib/templates/core-service.js.hbs",
    // TODO: Add remaining @strapi/generators templates
    // Other templates
    "migration-function":
      "./src/plugins/migration/server/lib/templates/migration-function.js.hbs",
    "relation-component":
      "./src/plugins/migration/server/lib/templates/relation-component.json.hbs",
  };

  if (!templateFileNames[name]) {
    logError(`Template: ${name} doesn't exisist.`);
    process.exit(1);
  }

  const templatePath = resolveCwd.silent(templateFileNames[name]);

  if (!templatePath) {
    console.log(
      `Error loading the local ${chalk.yellow(
        name
      )} command. Strapi might not be installed in your "node_modules". You may need to run "yarn install".`
    );
    process.exit(1);
  }

  return await readFilePromise(templatePath);
};

const create = async ({ path, templateFile, data }) => {
  if (fs.existsSync(path)) {
    logError(
      `File: \`${path}\` already exists. Try a different name or edit the existing file.`
    );
    process.exit(1);
  }

  try {
    const dir = path.substring(0, path.lastIndexOf("/"));
    await mkdirPromise(dir);
    const template = await getTemplate(templateFile);
    const fileContent = compile(template)(data);
    await writeFilePromise(path, fileContent);
  } catch (error) {
    logError(error);
    process.exit(1);
  }
};

const modify = async ({ path, transform }) => {
  const fullPath = join(process.cwd(), path);

  if (!fs.existsSync(fullPath)) {
    logError(
      `File: \`${fullPath}\` doesn't exists. Try a different name or create a new file.`
    );
    process.exit(1);
  }

  try {
    const template = await readFilePromise(fullPath);
    const fileContent = transform(JSON.parse(template));
    await writeFilePromise(path, JSON.stringify(fileContent, null, 2));
  } catch (error) {
    logError(error);
    process.exit(1);
  }
};

const generateTemplate = async (templates) => {
  if (Array.isArray(templates)) {
    return await Promise.all(
      templates.map(async (template) => await generateTemplate(template))
    );
  }

  const { type, ...opts } = templates;

  switch (type) {
    case "create":
      return await create(opts);
    case "modify":
      return await modify(opts);
    default:
      return `Type: ${type} is not sopported`;
  }
};

module.exports = {
  generateTemplate,
};

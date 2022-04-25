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

const getTemplate = async (name) => {
  const templateFileNames = {
    "content-type": "content-type.schema.json.hbs",
    "core-controller": "core-controller.js.hbs",
    "core-router": "core-router.js.hbs",
    "core-service": "core-service.js.hbs",
    // TODO: Add remaining templates
  };

  if (!templateFileNames[name]) {
    logError(`Template: ${name} doesn't exisist.`);
    process.exit(1);
  }

  const templatePath = resolveCwd.silent(
    `@strapi/generators/lib/templates/${templateFileNames[name]}`
  );

  if (!templatePath) {
    console.log(
      `Error loading the local ${yellow(
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
    await Promise.all(
      templates.map(async (template) => {
        return await await generateTemplate(template);
      })
    );

    // for (const template in templates) {
    //   await generateTemplate(template);
    // }
    return;
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

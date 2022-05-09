const chalk = require("chalk");
const { logError, buildPretiffier } = require("../../helpers");
const { sleep } = require("../../utils");
const { generateTemplate } = require("../generate-template");
const {
  getCreateContentTypeTemplate,
  getCreateAttributeTemplate,
  getCreateRelationComponentTemplate,
} = require("./helpers");
const {
  contentfulTransformer,
  transformContentfulEntries,
} = require("./transformers/contentful");

// Convenience wrapper around Prettier, so that config doesn't have to be
// passed every time.
const prettify = buildPretiffier();

const getTransformedData = (data, { cms }) => {
  switch (cms) {
    case "contentful":
      return contentfulTransformer(data);
    default: {
      logError(`CMS: ${cms} is not supported yet.`);
      process.exit(1);
    }
  }
};

const generateContentTypeMigrations = (contentTypes) => {
  try {
    return contentTypes
      .map(
        ({ attributes, ...contentType }) => `
      ${getCreateContentTypeTemplate(contentType)}
      
      ${Object.entries(attributes)
        .map(([name, attribute]) =>
          getCreateAttributeTemplate(name, attribute, contentType)
        )
        .join("\n")}

      ${getCreateRelationComponentTemplate(contentType)}
    `
      )
      .join("\n");
  } catch (error) {
    logError(error);
    process.exit(1);
  }
};

module.exports.importData = async (data, opts) => {
  const { contentTypes } = getTransformedData(data, opts);

  const migrations = `${generateContentTypeMigrations(contentTypes)}`;

  try {
    await generateTemplate({
      type: "create",
      path: `migrations/import-contentful-data-${Math.floor(
        Math.random() * 8999 + 1000
      )}.js`,
      templateFile: "migration-function",
      data: { migrations: prettify(migrations) },
    });
  } catch (error) {
    logError(error);
    process.exit(1);
  }
};

const getTransformedEntries = (data, { cms }) => {
  switch (cms) {
    case "contentful":
      return transformContentfulEntries(data);
    default: {
      logError(`CMS: ${cms} is not supported yet.`);
      process.exit(1);
    }
  }
};

module.exports.importEntries = async (entries, opts) => {
  try {
    const transformedEntries = getTransformedEntries(entries, opts);

    await generateTemplate({
      type: "create",
      path: `migrations/transformed-data/transformed-entries-${new Date(
        Date.now()
      ).toISOString()}.json`,
      templateFile: "empty-file",
      data: JSON.stringify(transformedEntries, null, 2),
    });

    console.info(
      chalk.green("✓"),
      chalk.bold(`Transform: ${entries.length} entries`)
    );

    await sleep(250);
  } catch (error) {
    logError(error);
    process.exit(1);
  }
};

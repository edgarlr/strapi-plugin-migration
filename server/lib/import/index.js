const { logError, buildPretiffier } = require("../../helpers");
const { generateTemplate } = require("../generate-template");
const {
  getCreateContentTypeTemplate,
  getCreateAttributeTemplate,
} = require("./helpers");
const { contentfulTransformer } = require("./transformers/contentful");

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
      path: `migrations/import-contentful-data-${Math.random()}.js`,
      templateFile: "migration-function",
      data: { migrations: prettify(migrations) },
    });
  } catch (error) {
    logError(error);
    process.exit(1);
  }
};

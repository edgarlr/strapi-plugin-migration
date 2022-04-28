const pluralize = require("pluralize");
const { join } = require("path");
const { paramCase } = require("change-case");

module.exports.getContentTypeProps = (collectionName, contentType) => {
  const collectionNamePlural = pluralize.plural(collectionName);
  const collectionNameSingular = pluralize.singular(collectionName);

  const defaultProps = {
    kind: "collectionType",
    collectionName: collectionName,
    singularName: paramCase(collectionNameSingular),
    pluralName: paramCase(collectionNamePlural),
    displayName: collectionNameSingular,
    draftAndPublish: false,
    attributes: {},
    apiRoute: {
      action: "create",
      name: paramCase(collectionName),
    },
  };

  return Object.assign({}, defaultProps, contentType);
};

module.exports.getContentTypePath = (contentType, apiRoute = {}) => {
  return join(
    "src/api",
    apiRoute.name ?? contentType.singularName,
    "content-types",
    contentType.singularName,
    "schema.json"
  );
};

module.exports.getComponentPath = (category, name) => {
  return join("src/components", category, `${name}.json`);
};

const pluralize = require("pluralize");
const { join } = require("path");

module.exports.getContentTypeProps = (collectionName, contentType) => {
  const collectionNamePlural = pluralize.plural(collectionName);
  const collectionNameSingular = pluralize.singular(collectionName);

  const defaultProps = {
    kind: "collectionType",
    collectionName: collectionName,
    singularName: collectionNameSingular,
    pluralName: collectionNamePlural,
    displayName: collectionNameSingular,
    draftAndPublish: false,
    attributes: {},
    apiRoute: {
      action: "create",
      name: collectionName,
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

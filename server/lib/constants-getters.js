const { logError, getLocalFile } = require("../helpers");

module.exports.getReservedNames = () => {
  const { FORBIDDEN_ATTRIBUTE_NAMES } = getLocalFile(
    "@strapi/plugin-content-type-builder/server/services/constants.js"
  );

  return [
    ...FORBIDDEN_ATTRIBUTE_NAMES,
    ...strapi
      .plugin("content-type-builder")
      .service("builder")
      .getReservedNames().attributes,
  ];
};

module.exports.getValidRelations = () => {
  try {
    const { typeKinds } = getLocalFile(
      "@strapi/plugin-content-type-builder/server/services/constants.js"
    );

    return {
      [typeKinds.SINGLE_TYPE]: [
        "oneToOne",
        "oneToMany",
        "morphOne",
        "morphMany",
        "morphToOne",
        "morphToMany",
      ],
      [typeKinds.COLLECTION_TYPE]: [
        "oneToOne",
        "oneToMany",
        "manyToOne",
        "manyToMany",
        "morphOne",
        "morphMany",
        "morphToOne",
        "morphToMany",
      ],
    };
  } catch (error) {
    logError(error);
  }
};

module.exports.getValidTypes = () => {
  try {
    const { DEFAULT_TYPES } = getLocalFile(
      "@strapi/plugin-content-type-builder/server/services/constants.js"
    );
    return [...DEFAULT_TYPES, "uid", "component", "dynamiczone"];
  } catch (error) {
    logError(error);
  }
};

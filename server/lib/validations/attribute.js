const yup = require("yup");
const { getLocalFile, logError } = require("../../helpers");
const {
  getValidTypes,
  getValidRelations,
  getReservedNames,
} = require("../constants-getters");

module.exports.createAttributeValidator = async (key, attribute, { kind }) => {
  try {
    const reservedNames = await getReservedNames();

    if (reservedNames.includes(key)) {
      return yup.mixed().test({
        name: "forbiddenKeys",
        message: `Attribute keys cannot be one of ${reservedNames.join(", ")}`,
        test: () => false,
      });
    }

    const { isValidKey } = getLocalFile(
      `@strapi/plugin-content-type-builder/server/controllers/validation/common.js`
    );

    if (attribute.type === "relation") {
      const getRelationValidator = getLocalFile(
        `@strapi/plugin-content-type-builder/server/controllers/validation/relations.js`
      );

      const VALID_RELATIONS = getValidRelations();

      return getRelationValidator(attribute, VALID_RELATIONS[kind]).test(
        isValidKey(key)
      );
    }

    if (hasOwnProperty.call(attribute, "type")) {
      const getTypeValidator = getLocalFile(
        `@strapi/plugin-content-type-builder/server/controllers/validation/types.js`
      );

      const VALID_TYPES = getValidTypes();

      return getTypeValidator(attribute, {
        types: VALID_TYPES,
        modelType: kind,
        attributes: { [key]: attribute },
      }).test(isValidKey(key));
    }

    return yup.object().test({
      name: "mustHaveTypeOrTarget",
      message: "Attribute must have either a type or a target",
      test: () => false,
    });
  } catch (error) {
    console.log(error);
    logError(error);
  }
};

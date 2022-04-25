const {
  logValidationErrors,
  getLocalFile,
  createValidationError,
} = require("../helpers");
const { createAttributeValidator } = require("./validations/attribute");
const fs = require("fs");

module.exports.validate = {
  apiRoute: ({ action, name }, contentType) => {
    switch (action) {
      case "create":
        return module.exports.validate.bootstrapAPIRoute(name);
      case "existing":
        return module.exports.validate.addToAPIRoute(name, contentType);
      default: {
        logValidationErrors(
          createValidationError({
            path: ["api", name, "action"],
            message: `API Route Action: \`${action}\` not allowed.`,
          })
        );
        process.exit(1);
      }
    }
  },
  bootstrapAPIRoute: (name) => {
    const { isKebabCase } = getLocalFile("@strapi/utils/lib/index.js");

    let errors = [];

    if (!isKebabCase(name)) {
      errors.push({
        path: ["api", name, "name"],
        message: `Value must be in kebab-case`,
      });
    }

    if (fs.existsSync(`src/api/${name}`)) {
      errors.push({
        path: ["api", name, "name"],
        message: `API Route: \`${name}\` already exists. Try a different name or edit the existing route.`,
      });
    }

    if (errors.length !== 0) {
      logValidationErrors({ details: { errors } });
      process.exit(1);
    }
  },
  addToAPIRoute: (name, contentType) => {
    let errors = [];

    if (!fs.existsSync(`src/api/${name}`)) {
      errors.push({
        path: ["api", name, "name"],
        message: `API Route: \`${name}\` doesn't exists. Try a different name or create a new API route.`,
      });
    }

    if (
      fs.existsSync(
        `src/api/${name}/content-types/${contentType.singularName}/schema.json`
      )
    ) {
      errors.push({
        path: ["api", name, "content-type"],
        message: `API Route: \`${name}\` already has a content type defined. Try a different api route or delete the existing schema and try again.`,
      });
    }

    if (errors.length !== 0) {
      logValidationErrors({ details: { errors } });
      process.exit(1);
    }
  },
  createContentType: async (data) => {
    try {
      // TODO: OPEN ISSUE IN STRAPI REGARDING WRONG VALIDATON IN: alreadyUsedContentTypeName()
      // PATH TO FILE:  node_modules/@strapi/plugin-content-type-builder/server/controllers/validation/content-type.js
      // DESCRIPTON: Add `info` key to access properly to singular Name
      // POSIBLE FIX: LN 129: const usedNames = _.flatMap(strapi.contentTypes, ct => [ct.info.singularName, ct.info.pluralName]);

      const usedNames = Object.values(strapi.contentTypes).flatMap((ct) => [
        ct.info.singularName,
        ct.info.pluralName,
      ]);

      if (usedNames.includes(data.collectionName)) {
        logValidationErrors(
          createValidationError({
            path: ["contentType", data.collectionName, "collectionName"],
            message: `Content Type name ${data.collectionName} is already being used.`,
          })
        );
        process.exit(1);
      }

      const { validateContentTypeInput } = getLocalFile(
        "@strapi/plugin-content-type-builder/server/controllers/validation/content-type.js"
      );

      await validateContentTypeInput({
        contentType: data,
      });
    } catch (error) {
      return logValidationErrors(error);
    }
  },

  createAttribute: async (
    name,
    { attribute, contentType, plannedCreateAttributes }
  ) => {
    if (contentType.attributes[name]) {
      logValidationErrors(
        createValidationError({
          path: ["attribute", name, "name"],
          message: `Attribute: ${name} already exitsts. Try a different name or edit the existing attribute`,
        })
      );
      process.exit(1);
    }

    if (plannedCreateAttributes.includes(name)) {
      logValidationErrors(
        createValidationError({
          path: ["attribute", name, "name"],
          message: `Attribute: ${name} can't be created twice. Try a different name or edit the planned attribute`,
        })
      );
      process.exit(1);
    }

    try {
      const validator = await createAttributeValidator(
        name,
        attribute,
        contentType
      );

      const { validateYupSchema } = getLocalFile(
        "@strapi/utils/lib/validators.js"
      );

      return await validateYupSchema(validator)(attribute);
    } catch (error) {
      return logValidationErrors(error);
    }
  },

  editField: (attribute, name, contentType) => {
    if (!contentType.attributes[name]) {
      logValidationErrors({
        details: {
          errors: [
            {
              path: ["contentType", "attribute", "name"],
              message: `Field: ${name} doesn't exitsts. Try a different name or create a new attribute`,
            },
          ],
        },
      });
      process.exit(1);
    }

    return createAttributeValidator(attribute, name, contentType).isValidSync(
      attribute
    );
  },
  deleteField: () => {},
};

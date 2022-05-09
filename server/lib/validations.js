const {
  logValidationErrors,
  getLocalFile,
  createValidationError,
  logError,
} = require("../helpers");
const { createAttributeValidator } = require("./validations/attribute");
const fs = require("fs");
const { paramCase } = require("change-case");

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

  // Used for emulate the "Entry" field from Contentful
  createRelationComponent: ({ collectionName }) => {
    let errors = [];

    if (fs.existsSync(`src/components/relation/${collectionName}`)) {
      errors.push({
        path: ["components", collectionName, "name"],
        message: `Component: \`${collectionName}\` already exists. Try a different name or edit the existing component.`,
      });
    }

    if (errors.length !== 0) {
      logValidationErrors({ details: { errors } });
      process.exit(1);
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

  importContent: async (collectionName) => {
    try {
      let errors = [];

      const usedNames = Object.values(strapi.contentTypes).flatMap((ct) => [
        ct.info.singularName,
        ct.info.pluralName,
      ]);

      if (!usedNames.includes(paramCase(collectionName))) {
        errors.push({
          path: ["importContent", "collectionName", collectionName],
          message: `Content Type name ${collectionName} doesn't exist.`,
        });
      }

      if (errors.length !== 0) {
        logValidationErrors({ details: { errors } });
        process.exit(1);
      }
    } catch (error) {
      logError(error);
    }
  },

  transformEntriesData: ({ cms, entries }) => {
    const SUPPORTED_CMS = ["contentful"];

    let errors = [];

    if (!SUPPORTED_CMS.includes(cms)) {
      errors.push({
        path: ["transformEntriesData", cms, "cms"],
        message: `Transform Entries CMS: \`${cms}\` is not currently supported.`,
      });
    }

    if (errors.length !== 0) {
      logValidationErrors({ details: { errors } });
      process.exit(1);
    }
  },

  setPublicPermissions: (permission) => {
    const SUPPORTED_CMS = ["find", "findOne"];

    let errors = [];

    const usedNames = Object.values(strapi.contentTypes).flatMap((ct) => [
      ct.info.singularName,
      ct.info.pluralName,
    ]);

    Object.entries(permission).map(([key, value]) =>
      value.some((permission) => {
        if (!SUPPORTED_CMS.includes(permission)) {
          errors.push({
            path: ["setPublicPermissions", key, "permission", permission],
            message: `setPublicPermissions: ${permission} is not a valid permission.`,
          });
        }
      })
    );

    Object.keys(permission).map((contentType) => {
      if (!usedNames.includes(contentType)) {
        errors.push({
          path: [
            "setPublicPermissions",
            contentType,
            "contentType",
            contentType,
          ],
          message: `ContentType ${contentType} couldn't be found.`,
        });
      }
    });

    if (errors.length !== 0) {
      logValidationErrors({ details: { errors } });
      process.exit(1);
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

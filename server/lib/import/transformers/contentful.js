const { getContentTypeProps } = require("../../content-type/helpers");
const { paramCase } = require("change-case");

const transformPlugins = ({ localized }) => {
  if (!localized) return {};
  return {
    pluginOptions: {
      ...(localized && {
        i18n: {
          localized: localized,
        },
      }),
    },
  };
};

module.exports.contentfulTransformer = (data) => {
  const allContentTypeNames = data.contentTypes.map((ct) => ct.sys.id);
  return {
    ...(data.contentTypes && {
      contentTypes: data.contentTypes.map((contentType) =>
        transformContentType(contentType, allContentTypeNames)
      ),
    }),
  };
};

const transformContentType = (
  { sys, name, description, fields },
  allContentTypeNames
) => {
  return getContentTypeProps(sys.id, {
    kind: "collectionType",
    displayName: name,
    draftAndPublish: true,
    // description: description,
    // By default Contentful localize all ContentTypes
    ...transformPlugins({ localized: true }),
    attributes: Object.fromEntries(
      fields.map((field) => [
        field.id,
        transformAttribute(field, allContentTypeNames),
      ])
    ),
  });
};

const transformEntryLinkValidations = (validations, allContentTypeNames) => {
  if (validations.length === 0) {
    return Object.fromEntries([
      [
        "components",
        allContentTypeNames.map((link) => `relation.${paramCase(link)}`),
      ],
    ]);
  }
  return Object.fromEntries(
    validations.map(({ linkContentType, size }) => ({
      ...(size?.min !== undefined ? ["min", size.min] : []),
      ...(size?.max !== undefined ? ["max", size.max] : []),
      ...(linkContentType
        ? [
            "components",
            linkContentType.map((link) => `relation.${paramCase(link)}`),
          ]
        : []),
    }))
  );
};

const transformMediaAllowedTypes = (linkMimetypeGroup) => {
  const fileTypes = ["attachment", "plaintext", "richtext", "pdfdocument"];
  return [
    ...(linkMimetypeGroup.includes("image") ? ["images"] : []),
    ...(linkMimetypeGroup.includes("audio") ? ["audios"] : []),
    ...(linkMimetypeGroup.includes("video") ? ["videos"] : []),
    ...(fileTypes.some((condition) => linkMimetypeGroup.includes(condition))
      ? ["files"]
      : []),
  ];
};

const transformValidations = (validations = []) => {
  return Object.fromEntries(
    validations.map(({ unique, regexp, size, range, linkMimetypeGroup }) => ({
      ...(unique ? ["unique", unique] : []),
      ...(regexp ? ["regex", regexp.pattern] : []),
      ...(size?.min !== undefined ? ["minLength", size.min] : []),
      ...(size?.max !== undefined ? ["maxLength", size.max] : []),
      ...(range?.min !== undefined ? ["min", range?.min] : []),
      ...(range?.max !== undefined ? ["max", range?.max] : []),
      ...(linkMimetypeGroup
        ? ["allowedTypes", transformMediaAllowedTypes(linkMimetypeGroup)]
        : []),
    }))
  );
};

const transformAttribute = (
  {
    type,
    required,
    validations,
    omitted,
    localized,
    linkType,
    items,
    id,

    // No equivalance in Strapi
    name,
    disabled,
  },
  allContentTypeNames
) => {
  switch (type) {
    case "Symbol": {
      return {
        type: "string",
        required: required,
        private: omitted,
        ...transformValidations(validations),
        ...transformPlugins({ localized }),
        // default: yup.string(),
      };
    }
    case "Text": {
      return {
        type: "text",
        required: required,
        private: omitted,
        ...transformValidations(validations),
        ...transformPlugins({ localized }),
        // default: yup.string(),
      };
    }
    case "Boolean": {
      return {
        type: "boolean",
        required: required,
        private: omitted,
        ...transformPlugins({ localized }),
        // default: yup.boolean(),
      };
    }
    case "Number": {
      return {
        type: "decimal",
        required: required,
        private: omitted,
        ...transformValidations(validations),
        ...transformPlugins({ localized }),
        // default: yup.number(),
      };
    }
    case "Integer": {
      return {
        type: "integer",
        required: required,
        private: omitted,
        ...transformValidations(validations),
        ...transformPlugins({ localized }),
        // default: yup.number().integer(),
      };
    }
    case "Date": {
      return {
        type: "datetime",
        required: required,
        private: omitted,
        ...transformValidations(validations),
        ...transformPlugins({ localized }),
        // default: yup.string(),
      };
    }

    case "Object": {
      return {
        type: "json",
        required: required,
        private: omitted,
        ...transformPlugins({ localized }),
        // default: yup.mixed().test(isValidDefaultJSON),
      };
    }
    // TODO: Needs to be validated
    case "RichText": {
      return {
        type: "richtext",
        required: required,
        private: omitted,
        ...transformValidations(validations),
        ...transformPlugins({ localized }),
        // default: yup.string(),
      };
    }
    case "Link": {
      switch (linkType) {
        case "Asset": {
          return {
            type: "media",
            multiple: false,
            required: required,
            ...transformValidations(validations),
            ...transformPlugins({ localized }),
          };
        }
        case "Entry": {
          return {
            type: "dynamiczone",
            required: required,
            ...transformEntryLinkValidations(validations, allContentTypeNames),
          };
        }
      }
    }
    case "Array": {
      // {type: "Array", items: {type: "Symbol"}}
      // {type: "Array", items: {type: "Link", linkType: "Entry"}}
      // {type: "Array", items: {type: "Link", linkType: "Asset"}}
      // TODO: Needs to be validated
      if (items.type === "Symbol") {
        return {
          type: "enumeration",
          required: required,
          // enum: ["list", "of", "options"]
          ...transformPlugins({ localized }),
          // default: yup.string(),
        };
      }
      switch (items.linkType) {
        case "Asset": {
          return {
            type: "media",
            multiple: true,
            required: required,
            ...transformValidations(validations),
            ...transformPlugins({ localized }),
          };
        }
        case "Entry": {
          return {
            type: "dynamiczone",
            required: required,
            ...transformEntryLinkValidations(validations, allContentTypeNames),
          };
        }
      }
    }
  }
};

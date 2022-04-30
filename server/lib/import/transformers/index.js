const { transformContentfulEntries } = require("./contentful");

module.exports.getTransformedData = ({ cms, entries }) => {
  switch (cms) {
    case "contentful":
      return transformContentfulEntries(entries);

    default: {
      logError(`CMS: ${cms} is currently not supported.`);
    }
  }
};

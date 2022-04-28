module.exports.getCreateContentTypeTemplate = ({
  collectionName,
  ...contentType
}) => {
  return `
  // Create ${collectionName} Content Type
  const ${collectionName} = await migration.createContentType("${collectionName}", ${JSON.stringify(
    contentType
  )});
  `;
};

module.exports.getCreateAttributeTemplate = (
  name,
  attribute,
  { collectionName }
) => {
  return `await ${collectionName}.createAttribute("${name}", ${JSON.stringify(
    attribute
  )});`;
};

const { MARKS, BLOCKS } = require("@contentful/rich-text-types");
const { documentToMarkdown } = require("contentful-rich-text-to-markdown");
const { join } = require("path");
const fs = require("fs");

const getAssetName = (id) => {
  const basePath = join(
    process.cwd(),
    "migrations/data",
    ".migration-assets",
    "images.ctfassets.net/gtn1we5b6x0j"
  );

  const assetId = fs
    .readdirSync(join(basePath, id))
    .find((dirName) => dirName !== ".DS_Store");

  const [assetName] = fs.readdirSync(join(basePath, id, assetId));

  return assetName;
};

module.exports.contentfulDocumentToMarkdown = (document) => {
  try {
    return documentToMarkdown(document, {
      renderNode: {
        [BLOCKS.EMBEDDED_ASSET]: (node) => {
          const assetName = getAssetName(node.data.target.sys.id);
          return `\n\n![${assetName}](image-link)\n\n`;
        },
      },
    });
  } catch (error) {
    console.error(error);
  }
};

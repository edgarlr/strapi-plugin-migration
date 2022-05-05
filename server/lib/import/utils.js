const { MARKS, BLOCKS } = require("@contentful/rich-text-types");
const { documentToHtmlString } = require("@contentful/rich-text-html-renderer");

module.exports.transformFieldContent = (entries) => {
  if (typeof content !== "object") return content;

  if (content?.nodeType === "document") {
    // trasnform reichText
  }

  if (content?.sys?.type === "Link") {
    if (content?.sys?.linkType === "Asset") {
      // Replace with ASset
    }

    if (content?.sys?.linkType === "Entry") {
      return {
        id: entries.filer(
          (entry) => entry.meta.contentfulId === content.sys.id
        ),
      };

      // replace wth Dynamec Content Content Type
    }
  }
  return field;
};

module.exports.contentfulDocumentToMarkdown = (document) => {
  return documentToHtmlString(document, {
    renderMark: {
      [MARKS.BOLD]: (text) => `**${text}**`,
      [MARKS.ITALIC]: (text) => `_${text}_`,
      [MARKS.CODE]: (text) => `<code>${text}</code>`,
      [MARKS.UNDERLINE]: (text) => `<u>${text}</u>`,
    },
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node, next) => `${next(node.content)}`,
      [BLOCKS.HEADING_1]: (node, next) => `# ${next(node.content)}`,
      [BLOCKS.HEADING_2]: (node, next) => `## ${next(node.content)}`,
      [BLOCKS.HEADING_3]: (node, next) => `### ${next(node.content)}`,
      [BLOCKS.HEADING_4]: (node, next) => `#### ${next(node.content)}`,
      [BLOCKS.HEADING_5]: (node, next) => `##### ${next(node.content)}`,
      [BLOCKS.HEADING_6]: (node, next) => `###### ${next(node.content)}`,
      [BLOCKS.QUOTE]: (node, next) => `> ${next(node.content)}`,
      [BLOCKS.HR]: () => "---",
      //   [BLOCKS.OL_LIST]: (node, text) => `# ${text}`,
      //   [BLOCKS.UL_LIST]: (node, text) => `# ${text}`,
      //   [BLOCKS.EMBEDDED_ENTRY]: (node, text) => `# ${text}`,
      //   [BLOCKS.EMBEDDED_ASSET]: (node, text) => `# ${text}`,
    },
  });
};

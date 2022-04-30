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

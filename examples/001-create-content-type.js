module.exports = async (migration) => {
  // Create blogPost Content Type
  const blogPost = await migration.createContentType("blogPost", {
    kind: "collectionType",
    singularName: "blog-post",
    pluralName: "blog-posts",
    displayName: "Blog Post",
    draftAndPublish: true,
    apiRoute: { action: "create", name: "blog-post" },
    pluginOptions: { i18n: { localized: true } },
  });

  await blogPost.createAttribute("title", {
    type: "string",
    required: true,
    private: false,
    pluginOptions: { i18n: { localized: true } },
  });

  await blogPost.createAttribute("slug", {
    type: "string",
    private: false,
    unique: true,
    regex: "^[a-z0-9-]+$",
  });
  await blogPost.createAttribute("author", {
    type: "dynamiczone",
    required: true,
    components: ["relation.author"],
  });
  await blogPost.createAttribute("body", {
    type: "richtext",
    required: true,
    private: false,
    pluginOptions: { i18n: { localized: true } },
  });
  await blogPost.createAttribute("featureImage", {
    type: "media",
    multiple: false,
    required: true,
  });

  await blogPost.createRelationComponent();
};

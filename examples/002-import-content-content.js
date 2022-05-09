const { blogPosts } = require("./transformed-data/entries.json");

module.exports = async (migration) => {
  await migration.importContent("blog-posts", {
    entries: blogPosts,
  });
};

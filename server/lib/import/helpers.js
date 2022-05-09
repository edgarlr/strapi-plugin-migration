const fs = require("fs");
const { join } = require("path");
const mime = require("mime-types");

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

module.exports.getCreateRelationComponentTemplate = ({ collectionName }) => {
  return `await ${collectionName}.createRelationComponent();`;
};

module.exports.isMigrationFirstRun = async ({ migrationId }) => {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: "type",
    name: "setup",
  });

  const runnedMigrations = await pluginStore.get({ key: "runnedMigrations" });
  await pluginStore.set({ key: "migrationHasRun", value: true });
  return !runnedMigrations;
};

module.exports.getFileSizeInBytes = (filePath) => {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats["size"];
  return fileSizeInBytes;
};

module.exports.getFileData = (fileName, path) => {
  const filePath = join(path, fileName);

  // Parse the file metadata
  const size = getFileSizeInBytes(filePath);
  const ext = fileName.split(".").pop();
  const mimeType = mime.lookup(ext);

  return {
    path: filePath,
    name: fileName,
    size,
    type: mimeType,
  };
};

// Create an entry and attach files if there are any
module.exports.createEntry = async ({ model, entry, files }) => {
  try {
    const createdEntry = await strapi.query(model).create(entry);
    if (files) {
      await strapi.entityService.uploadFiles(createdEntry, files, {
        model,
      });
    }
  } catch (e) {
    console.log("model", entry, e);
  }
};

module.exports.uploadFile = async (file, name) => {
  return strapi
    .plugin("upload")
    .service("upload")
    .upload({
      files: file,
      data: {
        fileInfo: {
          alternativeText: `An image uploaded to Strapi called ${name}`,
          caption: name,
          name,
        },
      },
    });
};

module.exports.checkFileExistsBeforeUpload = async (files) => {
  const existingFiles = [];
  const uploadedFiles = [];
  const filesCopy = [...files];

  for (const fileName of filesCopy) {
    // Check if the file already exists in Strapi
    const fileWhereName = await strapi.query("plugin::upload.file").findOne({
      where: {
        name: fileName,
      },
    });

    if (fileWhereName) {
      // File exists, don't upload it
      existingFiles.push(fileWhereName);
    } else {
      // File doesn't exist, upload it
      const fileData = getFileData(fileName);
      const fileNameNoExtension = fileName.split(".").shift();
      const [file] = await uploadFile(fileData, fileNameNoExtension);
      uploadedFiles.push(file);
    }
  }
  const allFiles = [...existingFiles, ...uploadedFiles];
  // If only one file then return only that file
  return allFiles.length === 1 ? allFiles[0] : allFiles;
};

module.exports.updateBlocks = async (blocks) => {
  const updatedBlocks = [];
  for (const block of blocks) {
    if (block.__component === "shared.media") {
      const uploadedFiles = await checkFileExistsBeforeUpload([block.file]);
      // Copy the block to not mutate directly
      const blockCopy = { ...block };
      // Replace the file name on the block with the actual file
      blockCopy.file = uploadedFiles;
      updatedBlocks.push(blockCopy);
    } else if (block.__component === "shared.slider") {
      // Get files already uploaded to Strapi or upload new files
      const existingAndUploadedFiles = await checkFileExistsBeforeUpload(
        block.files
      );
      // Copy the block to not mutate directly
      const blockCopy = { ...block };
      // Replace the file names on the block with the actual files
      blockCopy.files = existingAndUploadedFiles;
      // Push the updated block
      updatedBlocks.push(blockCopy);
    } else {
      // Just push the block as is
      updatedBlocks.push(block);
    }
  }

  return updatedBlocks;
};

// Create an entry and attach files if there are any
module.exports.createEntry = async ({ model, entry }) => {
  try {
    // Actually create the entry in Strapi
    await strapi.entityService.create(`api::${model}.${model}`, {
      data: entry,
    });
  } catch (error) {
    console.error({ model, entry, error });
  }
};

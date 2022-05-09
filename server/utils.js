const fs = require("fs");
const path = require("path");

module.exports.requireOptional = (filePath) => {
  try {
    return require(filePath);
  } catch (e) {
    // We want to ignore 'ERR_INVALID_FILE_URL_HOST' errors, since all that means is that
    // the user has not set up a global overrides file.
    // All other errors should be thrown as expected.
    const ignoredErrors = ["ERR_INVALID_FILE_URL_HOST", "MODULE_NOT_FOUND"];
    if (!ignoredErrors.includes(e.code)) {
      throw e;
    }
  }
};

module.exports.mkdirPromise = (dirPath) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(dirPath, { recursive: true }, (err) => {
      err ? reject(err) : resolve();
    });
  });
};

module.exports.readFilePromise = (fileLocation) => {
  return new Promise((resolve, reject) => {
    fs.readFile(fileLocation, "utf-8", (err, text) => {
      err ? reject(err) : resolve(text);
    });
  });
};

module.exports.readFileRelativePromise = (fileLocation) => {
  return module.exports.readFilePromise(path.join(__dirname, fileLocation));
};

module.exports.writeFilePromise = (fileLocation, fileContent) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(fileLocation, fileContent, "utf-8", (err) => {
      err ? reject(err) : resolve();
    });
  });
};

module.exports.compile = (
  text,
  { start, end } = { start: "{{", end: "}}" }
) => {
  return (obj) =>
    text.replace(
      new RegExp(`${start} *(.+?) *${end}`, "g"),
      (_, offset) => obj[offset]
    );
};

module.exports.sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

module.exports.splitAt = (string, index) => [
  string.substring(0, index),
  string.substring(index + 1),
];

module.exports.resolveObjectValue = (obj, keys) => {
  return keys.split(".").reduce((cur, key) => cur[key], obj);
};

module.exports.groupArraysBy = (array, condition) => {
  return array.reduce((groups, current) => {
    const currentGroupKey = module.exports.resolveObjectValue(
      current,
      condition
    );
    if (!groups[currentGroupKey]) {
      groups[currentGroupKey] = [];
    }
    groups[currentGroupKey].push(current);
    return groups;
  }, {});
};

module.exports.removeNullish = (obj) => {
  Object.keys(obj).forEach(
    (k) =>
      (obj[k] &&
        typeof obj[k] === "object" &&
        module.exports.removeNullish(obj[k])) ||
      (!obj[k] && obj[k] !== undefined && delete obj[k])
  );
  return obj;
};

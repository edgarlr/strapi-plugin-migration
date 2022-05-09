const fetch = require("node-fetch");
const { logError } = require("../helpers");

const createEntry = async (model, entry) => {
  try {
    const res = await fetch(`${process.env.STRAPI_API_URL}/api/${model}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: entry }),
    });

    return await res.json();
  } catch (error) {
    logError(error);
  }
};

const createLocalizedEntry = async (model, { id }, localizedEntry) => {
  try {
    const res = await fetch(
      `${process.env.STRAPI_API_URL}/api/${model}/${id}/localizations`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(localizedEntry),
      }
    );

    return await res.json();
  } catch (error) {
    logError(error);
  }
};

const createEntryWithLocalizations = async (
  model,
  { localizations, ...entry }
) => {
  const res = await createEntry(model, entry);

  if (!localizations) return;

  return await Promise.all(
    localizations.map(async (localizedEntry) => {
      await createLocalizedEntry(model, res.data, localizedEntry);
    })
  );
};

module.exports = {
  createEntry,
  createLocalizedEntry,
  createEntryWithLocalizations,
};

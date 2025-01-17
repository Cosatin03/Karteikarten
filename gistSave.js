// functions/gistSave.js
// Schreibt die Datei "flashcards.json" ins Gist.

const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  try {
    const gistId = process.env.GIST_ID;
    const token = process.env.GITHUB_TOKEN;
    const fileName = "flashcards.json";

    if (!gistId || !token) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "GIST_ID oder GITHUB_TOKEN nicht gesetzt!" })
      };
    }

    // Body (Datenobjekt)
    const data = JSON.parse(event.body);

    // Patch-Objekt
    const patchData = {
      files: {}
    };
    patchData.files[fileName] = {
      content: JSON.stringify(data, null, 2)
    };

    // PATCH Request
    const resp = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(patchData)
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Fehler beim Speichern ins Gist (${resp.status}): ${txt}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

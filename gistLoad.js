// functions/gistLoad.js
// Lädt die Datei "flashcards.json" aus dem Gist (via GIST_ID und GITHUB_TOKEN).

const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  try {
    const gistId = process.env.GIST_ID;
    const token = process.env.GITHUB_TOKEN;
    const fileName = "flashcards.json";

    if (!gistId || !token) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "GIST_ID oder GITHUB_TOKEN nicht konfiguriert!" })
      };
    }

    // Request an GitHub
    const resp = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        "Authorization": `token ${token}`
      }
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Fehler beim Laden des Gists (${resp.status}): ${txt}`);
    }

    const gistData = await resp.json();

    // Falls die Datei nicht existiert, geben wir ein leeres Objekt zurück
    if (!gistData.files[fileName]) {
      return {
        statusCode: 200,
        body: JSON.stringify({ decks: {} })
      };
    }

    // Falls leer:
    const content = gistData.files[fileName].content;
    if (!content.trim()) {
      return {
        statusCode: 200,
        body: JSON.stringify({ decks: {} })
      };
    }

    // Andernfalls: kompletten Inhalt zurückgeben
    return {
      statusCode: 200,
      body: content
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

/**************************************************
 * script.js – Komplettes Frontend (ohne Server!)
 * - Nutzt GitHub Gist zum globalen Speichern.
 * - Der Token steht offen im Code (unsicher!).
 **************************************************/

/**********************************************
 * 1) GIST-KONFIGURATION (HIER IST DER TOKEN!)
 **********************************************/
const GITHUB_TOKEN = "HIER_DEIN_TOKEN_MIT_GIST_RECHTEN";
const GIST_ID = "HIER_DEINE_GIST_ID";
const FILE_NAME = "flashcards.json";

/**********************************************
 * 2) Unser globales Objekt
 * z.B.:
 * {
 *   decks: {
 *     "Mathe": [{ q: "...", a: "..." }, ... ],
 *     "Geschichte": [ ... ]
 *   }
 * }
 **********************************************/
let globalData = { decks: {} };

/**********************************************
 * 3) Gist-Funktionen: loadFromGist, saveToGist
 **********************************************/

/** loadFromGist():
 *  Liest FILE_NAME aus dem Gist GIST_ID.
 */
async function loadFromGist() {
  try {
    console.log("Lade Daten aus Gist:", GIST_ID);
    const resp = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        "Authorization": `token ${GITHUB_TOKEN}`
      }
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Fehler beim Laden: ${resp.status} - ${txt}`);
    }
    const gistData = await resp.json();
    const files = gistData.files || {};

    // Falls die Datei noch nicht existiert => wir legen sie leer an
    if (!files[FILE_NAME]) {
      console.log("Datei nicht vorhanden, lege neu an (leer).");
      globalData = { decks: {} };
      await saveToGist();
    } else {
      // Inhalt parsen
      const content = files[FILE_NAME].content;
      if (!content.trim()) {
        // Leere Datei => leeres Objekt
        globalData = { decks: {} };
      } else {
        globalData = JSON.parse(content);
      }
    }
    console.log("Aktuelle Daten:", globalData);
  } catch (err) {
    console.error("loadFromGist() fehlgeschlagen:", err);
    alert("Fehler beim Laden aus Gist: " + err.message);
    // fallback
    globalData = { decks: {} };
  }
}

/** saveToGist():
 *  Schreibt den aktuellen 'globalData'-Stand in FILE_NAME.
 */
async function saveToGist() {
  try {
    console.log("Speichere Daten in Gist:", GIST_ID);
    const body = {
      files: {}
    };
    body.files[FILE_NAME] = {
      content: JSON.stringify(globalData, null, 2)
    };

    const resp = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: "PATCH",
      headers: {
        "Authorization": `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Fehler beim Speichern: ${resp.status} - ${txt}`);
    }
    console.log("Speichern erfolgreich!");
  } catch (err) {
    console.error("saveToGist() fehlgeschlagen:", err);
    alert("Fehler beim Speichern ins Gist: " + err.message);
  }
}

/**********************************************
 * 4) Deck- und Kartenfunktionen
 **********************************************/

function createDeck(deckName) {
  if (!globalData.decks) {
    globalData.decks = {};
  }
  if (!globalData.decks[deckName]) {
    globalData.decks[deckName] = [];
  }
}

function addCard(deckName, question, answer) {
  if (!globalData.decks[deckName]) {
    globalData.decks[deckName] = [];
  }
  globalData.decks[deckName].push({ q: question, a: answer });
}

/**********************************************
 * 5) UI aktualisieren
 **********************************************/
function refreshUI() {
  // 1) Deck-Auswahl
  const deckSelect = document.getElementById("deckSelect");
  deckSelect.innerHTML = '<option value="">-- bitte wählen --</option>';
  const decks = globalData.decks || {};
  for (const dName in decks) {
    const opt = document.createElement("option");
    opt.value = dName;
    opt.textContent = dName;
    deckSelect.appendChild(opt);
  }

  // 2) Deck-Liste
  const deckList = document.getElementById("deckList");
  deckList.innerHTML = "";
  for (const dName in decks) {
    const deckBlock = document.createElement("div");
    deckBlock.classList.add("deck-block");

    const h3 = document.createElement("h3");
    h3.textContent = dName + " (" + decks[dName].length + " Karten)";
    deckBlock.appendChild(h3);

    const ul = document.createElement("ul");
    decks[dName].forEach(card => {
      const li = document.createElement("li");
      li.textContent = card.q + " => " + card.a;
      ul.appendChild(li);
    });
    deckBlock.appendChild(ul);

    deckList.appendChild(deckBlock);
  }
}

/**********************************************
 * 6) Event-Listener
 **********************************************/
document.addEventListener("DOMContentLoaded", () => {
  console.log("Seite geladen.");

  const btnLoad = document.getElementById("btnLoad");
  const btnSave = document.getElementById("btnSave");
  const btnAddDeck = document.getElementById("btnAddDeck");
  const btnAddCard = document.getElementById("btnAddCard");

  const deckNameInput = document.getElementById("deckNameInput");
  const deckSelect = document.getElementById("deckSelect");
  const questionInput = document.getElementById("questionInput");
  const answerInput = document.getElementById("answerInput");

  // Daten laden
  btnLoad.addEventListener("click", async () => {
    await loadFromGist();
    refreshUI();
  });

  // Daten speichern
  btnSave.addEventListener("click", async () => {
    await saveToGist();
    alert("Daten gespeichert (Gist aktualisiert).");
  });

  // Neues Deck
  btnAddDeck.addEventListener("click", () => {
    const dName = deckNameInput.value.trim();
    if (!dName) {
      alert("Bitte einen Deck-Namen eingeben!");
      return;
    }
    createDeck(dName);
    deckNameInput.value = "";
    refreshUI();
  });

  // Neue Karte
  btnAddCard.addEventListener("click", () => {
    const dName = deckSelect.value;
    if (!dName) {
      alert("Bitte ein Deck auswählen!");
      return;
    }
    const q = questionInput.value.trim();
    const a = answerInput.value.trim();
    if (!q || !a) {
      alert("Frage und Antwort dürfen nicht leer sein!");
      return;
    }
    addCard(dName, q, a);
    questionInput.value = "";
    answerInput.value = "";
    refreshUI();
  });
});

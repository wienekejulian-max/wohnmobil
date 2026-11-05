// Füllt die Regeltabelle einer Länderseite und die Seite "Quellen und Stand" aus den Mautdaten.
(function () {
  const { L, TABELLEN, datum, quelleHtml } = window.MAUT;

  function tabelle(land) {
    return `<div class="tbl"><table>
      <thead><tr><th>Fall</th><th>Was gilt</th><th>Preis</th><th>Herkunft</th></tr></thead>
      <tbody>${TABELLEN[land]().map(([fall, regel, wert, text]) =>
        `<tr><td>${fall}</td><td>${regel}</td><td class="num">${text}</td><td class="src">${quelleHtml(land, wert)}</td></tr>`).join("")}</tbody>
    </table></div>`;
  }

  function quellenListe(land) {
    return `<ul class="quellen">${Object.values(L[land].quellen)
      .map((q) => `<li><a href="${q.url}" target="_blank" rel="noopener">${q.titel}</a></li>`).join("")}</ul>`;
  }

  // Länderseite: <div data-regeln="at"> und <span data-stand="at">
  document.querySelectorAll("[data-regeln]").forEach((el) => { el.innerHTML = tabelle(el.dataset.regeln); });
  document.querySelectorAll("[data-stand]").forEach((el) => { el.textContent = datum(L[el.dataset.stand].geprueft); });
  document.querySelectorAll("[data-quellen]").forEach((el) => { el.innerHTML = quellenListe(el.dataset.quellen) + window.MAUT.fehlerHinweis(); });

  // Preise im Fließtext: <span data-wert="at:streckenmaut.brenner"></span>
  // Mehrere Werte werden addiert, "*2" verdoppelt: data-wert="at:vignette.tag10+streckenmaut.brenner*2"
  document.querySelectorAll("[data-wert]").forEach((el) => {
    const [land, formel] = el.dataset.wert.split(":");
    const summe = formel.split("+").reduce((s, teil) => {
      const [pfad, faktor] = teil.split("*");
      return s + pfad.split(".").reduce((o, k) => o[k], L[land]).w * (Number(faktor) || 1);
    }, 0);
    el.textContent = window.MAUT.eur(summe);
  });

  // Seite "Quellen und Stand": alle Länder untereinander
  const alle = document.getElementById("alle-quellen");
  if (alle) {
    alle.innerHTML = Object.keys(L).map((k) => `
      <section id="${k}">
        <h2><span class="code">${L[k].code}</span>${L[k].name}</h2>
        <p>Zuletzt geprüft: <b>${datum(L[k].geprueft)}</b>. Nächste Prüfung: ${L[k].naechstePruefung}</p>
        ${tabelle(k)}
        <h3>Quellen</h3>${quellenListe(k)}
      </section>`).join("") + window.MAUT.fehlerHinweis();
  }
})();

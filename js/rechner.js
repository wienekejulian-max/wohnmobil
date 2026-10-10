// Maut-Rechner: liest die Formularwerte, rechnet mit den Regeln aus maut-regeln.js und zeigt das Ergebnis.
(function () {
  const { L, REGELN, eur, datum, ART } = window.MAUT;
  const $ = (id) => document.getElementById(id);
  const LAENDER = Object.keys(REGELN);

  // Beispielroute München → Riva del Garda über den Brenner
  const START = { at: { an: true, km: 110 }, ch: { an: false, km: 200 }, fr: { an: false, km: 600 }, it: { an: true, km: 150 } };

  // Länderzeilen im Formular; ?land=at wählt nur dieses Land vor
  const nurLand = new URLSearchParams(location.search).get("land");
  $("ctys").innerHTML = LAENDER.map((k) => {
    const an = LAENDER.includes(nurLand) ? k === nurLand : START[k].an;
    return `<div class="cty"><input type="checkbox" id="an-${k}" ${an ? "checked" : ""}>
      <label for="an-${k}"><span class="code">${L[k].code}</span>${L[k].name}</label>
      <input type="number" id="km-${k}" min="0" max="3000" value="${START[k].km}" aria-label="Autobahn-Kilometer in ${L[k].name}"></div>`;
  }).join("");

  // F.1 folgt F.2, solange niemand F.1 selbst geändert hat
  let f1Selbst = false;
  $("f1").addEventListener("input", () => { f1Selbst = true; });
  $("f2").addEventListener("input", () => { if (!f1Selbst) $("f1").value = $("f2").value; });

  function fahrzeug(abweichung) {
    return Object.assign({
      f2: +$("f2").value || 0,
      f1: +$("f1").value || 0,
      hoehe: +$("hoe").value || 0,
      achsen: +document.querySelector("[name=achsen]:checked").value,
      ezAlt: $("ezalt").checked
    }, abweichung || {});
  }

  function summe(v, tage) {
    return LAENDER.filter((k) => $("an-" + k).checked)
      .reduce((s, k) => s + REGELN[k](v, +$("km-" + k).value || 0, tage).preis, 0);
  }

  // unsicherste Art der verwendeten Werte
  const RANG = ["amtlich", "sekundaer", "schaetzung"];
  const unsicherste = (werte) => werte.reduce((a, w) => (RANG.indexOf(w.art) > RANG.indexOf(a) ? w.art : a), "amtlich");

  function zeigen() {
    const v = fahrzeug();
    const tage = Math.max(1, +$("tage").value || 1);
    let html = "", n = 0;
    for (const k of LAENDER) {
      const an = $("an-" + k).checked;
      $("km-" + k).disabled = !an;
      if (!an) continue;
      n++;
      const r = REGELN[k](v, +$("km-" + k).value || 0, tage);
      const art = unsicherste(r.werte);
      html += `<div class="card"><div class="card-h"><h3><span class="code">${L[k].code}</span>${L[k].name}</h3><span class="price">${eur(r.preis)}</span></div>
        <div class="chips">${r.chips.map(([c, t]) => `<span class="chip ${c}">${t}</span>`).join("")}</div>
        <p>${r.text}</p>${r.hinweis ? `<p class="note">${r.hinweis}</p>` : ""}
        <p class="stand"><span class="art art-${art}">${ART[art]}</span> Stand ${datum(L[k].geprueft)} · <a href="/quellen/#${k}">Quellen</a></p></div>`;
    }
    $("res").innerHTML = html ? html + window.MAUT.fehlerHinweis() : "<p>Wähle mindestens ein Land aus.</p>";
    const s = summe(v, tage);
    $("sum").textContent = eur(s);
    $("sumNote").textContent = n ? `${n} ${n > 1 ? "Länder" : "Land"}, ${tage} Tage` : "";

    // Vergleich über/unter 3,5 t
    if (!n) { $("cmp").innerHTML = ""; return; }
    const leicht = v.f2 <= 3.5 && v.f1 <= 3.5;
    const alt = summe(fahrzeug(leicht ? { f1: 4.1, f2: 4.1 } : { f1: 3.5, f2: 3.5 }), tage);
    const diff = alt - s;
    $("cmp").innerHTML = leicht
      ? `<b>Zum Vergleich:</b> Mit einem Wohnmobil über 3,5 t wären es auf dieser Route ${eur(alt)} (${diff >= 0 ? "+" : ""}${eur(diff)}).`
      : `<b>Zum Vergleich:</b> Mit einem Wohnmobil bis 3,5 t wären es auf dieser Route ${eur(alt)} (${eur(diff)}).`;
  }

  $("rechner").addEventListener("input", zeigen);
  zeigen();
})();

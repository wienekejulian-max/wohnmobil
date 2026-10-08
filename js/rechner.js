// Maut-Rechner: liest die Formularwerte, rechnet mit window.MAUT_DATEN und zeigt das Ergebnis.
(function () {
  const D = window.MAUT_DATEN;
  const $ = (id) => document.getElementById(id);
  const komma = (n) => n.toFixed(2).replace(".", ",");
  const eur = (n) => n.toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: n < 100 ? 2 : 0 });

  // Beispielroute München → Riva del Garda über den Brenner
  const START = { at: { an: true, km: 110 }, ch: { an: false, km: 200 }, fr: { an: false, km: 600 }, it: { an: true, km: 150 } };

  // Regeln je Land: liefert Preis, Merkmale (chips), Erklärung und Hinweis
  const REGELN = {
    at(v, km, tage) {
      const d = D.at;
      if (v.gew <= 3.5) {
        const [name, preis] =
          tage <= 1 ? ["1-Tages-Vignette", d.vignette.tag1] :
          tage <= 10 ? ["10-Tages-Vignette", d.vignette.tag10] :
          tage <= 60 ? ["2-Monats-Vignette", d.vignette.monat2] :
          ["Jahresvignette", d.vignette.jahr];
        return { preis, chips: [["vig", name]], text: "Pauschal, egal wie viele Kilometer.", hinweis: d.hinweisSondermaut };
      }
      const r = v.achsen >= 3 ? d.goMaut.achsen3 : d.goMaut.achsen2;
      return {
        preis: km * r + d.goBoxGebuehr,
        chips: [["km", "GO-Maut"], ["", "GO-Box nötig"]],
        text: `${km} km × ca. ${komma(r)} €/km (${v.achsen >= 3 ? "Kategorie 4+" : "Kategorie 3"}, Euro 6) plus ${komma(d.goBoxGebuehr)} € Box-Gebühr.`,
        hinweis: "Ohne GO-Box drohen hohe Ersatzmaut-Strafen."
      };
    },
    ch(v, km, tage) {
      const d = D.ch;
      if (v.gew <= 3.5) {
        return { preis: d.vignetteChf * D.chfInEuro, chips: [["vig", `Jahresvignette ${d.vignetteChf} CHF`]], text: "Gilt bis Ende Januar des Folgejahres.", hinweis: "" };
      }
      const chf = Math.max(tage * d.psva.proTagChf, d.psva.mindestChf);
      return {
        preis: chf * D.chfInEuro,
        chips: [["", "PSVA"], ["", "beim Zoll anmelden"]],
        text: `${tage} Tage × ${komma(d.psva.proTagChf)} CHF, mindestens ${komma(d.psva.mindestChf)} CHF.`,
        hinweis: "Keine Vignette nötig, die PSVA ersetzt sie."
      };
    },
    fr(v, km) {
      const k = (v.gew > 3.5 || v.hoehe > 3) ? (v.achsen >= 3 ? 4 : 3) : (v.hoehe < 2 ? 1 : 2);
      const r = D.fr.klassen[k];
      return {
        preis: km * r,
        chips: [["km", "Klasse " + k], ["", "Mautbox optional"]],
        text: `${km} km × ca. ${komma(r)} €/km.`,
        hinweis: k >= 3 ? "Höhe über 3 m oder Gewicht über 3,5 t: Klasse 3 kostet fast das Doppelte von Klasse 2." : ""
      };
    },
    it(v, km) {
      const k = v.achsen >= 3 ? "3" : "B";
      const r = D.it.klassen[k];
      return {
        preis: km * r,
        chips: [["km", "Klasse " + k], ["", "Mautbox optional"]],
        text: `${km} km × ca. ${komma(r)} €/km.`,
        hinweis: k === "B" ? "Wohnmobile sind fast immer Klasse B (über 1,30 m an der Vorderachse)." : ""
      };
    }
  };
  const LAENDER = Object.keys(REGELN);

  // Länderzeilen im Formular; ?land=at wählt nur dieses Land vor
  const nurLand = new URLSearchParams(location.search).get("land");
  $("ctys").innerHTML = LAENDER.map((k) => {
    const an = nurLand && LAENDER.includes(nurLand) ? k === nurLand : START[k].an;
    return `<div class="cty"><input type="checkbox" id="an-${k}" ${an ? "checked" : ""}>
      <label for="an-${k}"><span class="code">${D[k].code}</span>${D[k].name}</label>
      <input type="number" id="km-${k}" min="0" max="3000" value="${START[k].km}" aria-label="Autobahn-Kilometer in ${D[k].name}"></div>`;
  }).join("");

  function fahrzeug(abweichung) {
    return Object.assign({
      gew: +$("gew").value || 0,
      hoehe: +$("hoe").value || 0,
      achsen: +document.querySelector("[name=achsen]:checked").value
    }, abweichung || {});
  }

  function summe(v, tage) {
    return LAENDER.filter((k) => $("an-" + k).checked)
      .reduce((s, k) => s + REGELN[k](v, +$("km-" + k).value || 0, tage).preis, 0);
  }

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
      html += `<div class="card"><div class="card-h"><h3><span class="code">${D[k].code}</span>${D[k].name}</h3><span class="price">${eur(r.preis)}</span></div>
        <div class="chips">${r.chips.map(([c, t]) => `<span class="chip ${c}">${t}</span>`).join("")}</div>
        <p>${r.text}</p>${r.hinweis ? `<p class="note">${r.hinweis}</p>` : ""}</div>`;
    }
    $("res").innerHTML = html || "<p>Wähle mindestens ein Land aus.</p>";
    const s = summe(v, tage);
    $("sum").textContent = eur(s);
    $("sumNote").textContent = n ? `${n} ${n > 1 ? "Länder" : "Land"}, ${tage} Tage` : "";

    // Vergleich über/unter 3,5 t
    if (!n) { $("cmp").innerHTML = ""; return; }
    const leicht = v.gew <= 3.5;
    const alt = summe(fahrzeug({ gew: leicht ? 4.1 : 3.5 }), tage);
    const diff = alt - s;
    $("cmp").innerHTML = leicht
      ? `<b>Zum Vergleich:</b> Mit einem Wohnmobil über 3,5 t wären es auf dieser Route ${eur(alt)} (${diff >= 0 ? "+" : ""}${eur(diff)}).`
      : `<b>Zum Vergleich:</b> Bis 3,5 t wären es auf dieser Route ${eur(alt)} (${eur(diff)}).`;
  }

  $("rechner").addEventListener("input", zeigen);
  zeigen();
})();

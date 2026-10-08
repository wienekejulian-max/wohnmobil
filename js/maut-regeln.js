// Mautregeln je Land: rechnet mit window.MAUT_DATEN.
// Wird vom Rechner (rechner.js) und von den Länderseiten (laenderseite.js) genutzt.
(function () {
  const D = window.MAUT_DATEN;
  const L = D.laender;

  const komma = (n, stellen = 2) => n.toFixed(stellen).replace(".", ",");
  const eur = (n) => n.toLocaleString("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const chf = (n) => komma(n, n % 1 ? 2 : 0) + " CHF";
  const datum = (iso) => iso.split("-").reverse().join(".");

  // Fahrzeug v: { f1: techn. zul. Gesamtmasse, f2: zul. Gesamtgewicht, hoehe, achsen, ezAlt: Erstzulassung vor Stichtag }
  // Ergebnis: { preis, chips, text, hinweis, werte: [verwendete Werte für Quelle und Stand] }
  const REGELN = {
    at(v, km, tage) {
      const d = L.at, r = d.regelTzgm;
      const imUebergang = v.f2 <= r.grenze.w && v.ezAlt && new Date() <= new Date(r.uebergangBis.w);
      if (v.f1 <= r.grenze.w || imUebergang) {
        const [name, wert] =
          tage <= 1 ? ["1-Tages-Vignette", d.vignette.tag1] :
          tage <= 10 ? ["10-Tages-Vignette", d.vignette.tag10] :
          tage <= 60 ? ["2-Monats-Vignette", d.vignette.monat2] :
          ["Jahresvignette", d.vignette.jahr];
        return {
          preis: wert.w, chips: [["vig", name]], werte: [wert, d.streckenmaut.brenner],
          text: "Pauschal, egal wie viele Kilometer.",
          hinweis: (imUebergang
            ? `Übergangsregel: Dein Wohnmobil ist technisch über 3,5 t, aber vor dem ${datum(r.stichtagErstzulassung.w)} zugelassen und auf 3,5 t abgelastet. Bis ${datum(r.uebergangBis.w)} reicht die Vignette, danach brauchst du eine GO-Box. `
            : "") +
            (tage > 1 && 2 * d.vignette.tag1.w < wert.w
              ? `Fährst du nur an zwei Tagen hin und zurück durch, reichen zwei 1-Tages-Vignetten für ${eur(2 * d.vignette.tag1.w)}. `
              : "") +
            `Sondermaut extra: Brenner ${eur(d.streckenmaut.brenner.w)}, Tauern ${eur(d.streckenmaut.tauern.w)} pro Fahrt.`
        };
      }
      const satz = v.achsen >= 4 ? d.goMaut.achsen4 : v.achsen === 3 ? d.goMaut.achsen3 : d.goMaut.achsen2;
      return {
        preis: km * satz.w + d.goBoxGebuehr.w, werte: [satz, d.goBoxGebuehr, r.grenze],
        chips: [["km", "GO-Maut"], ["", "GO-Box nötig"]],
        text: `${km} km × ${komma(satz.w, 3)} €/km (${v.achsen} Achsen, Euro 6) plus ${eur(d.goBoxGebuehr.w)} Bearbeitungsgebühr für die GO-Box.`,
        hinweis: v.f2 <= r.grenze.w
          ? "Entscheidend ist in Österreich die technisch zulässige Gesamtmasse (F.1). Auch abgelastete Wohnmobile zahlen deshalb GO-Maut."
          : "Auf Sonderstrecken wie Brenner und Tauern gelten höhere km-Sätze."
      };
    },

    ch(v, km, tage) {
      const d = L.ch, p = d.psva;
      if (v.f2 <= 3.5) {
        return {
          preis: d.vignetteChf.w * D.chfInEuro.w, werte: [d.vignetteChf, D.chfInEuro],
          chips: [["vig", `Jahresvignette ${chf(d.vignetteChf.w)}`]],
          text: "Gilt bis Ende Januar des Folgejahres.", hinweis: ""
        };
      }
      let betrag, wie;
      if (tage <= 30) {
        betrag = Math.min(Math.max(tage * p.tagChf.w, p.minChf.w), p.maxBis30TageChf.w);
        wie = `${tage} Tage × ${chf(p.tagChf.w)}, mindestens ${chf(p.minChf.w)}, höchstens ${chf(p.maxBis30TageChf.w)}.`;
      } else {
        const monate = Math.ceil(tage / 30);
        betrag = Math.min(monate * p.monatChf.w, p.jahrChf.w);
        wie = betrag === p.jahrChf.w ? `Jahrespauschale ${chf(p.jahrChf.w)}.` : `${monate} Monate × ${chf(p.monatChf.w)}.`;
      }
      return {
        preis: betrag * D.chfInEuro.w, werte: [p.tagChf, p.minChf, D.chfInEuro],
        chips: [["", "PSVA"], ["", "über die Via-App"]],
        text: `${wie} Gerechnet mit ${tage} Tagen; bezahlt wird für jeden Tag in der Schweiz.`,
        hinweis: "Keine Vignette nötig, die PSVA ersetzt sie."
      };
    },

    fr(v, km) {
      const k = klasseFr(v), satz = L.fr.klassen[k];
      return {
        preis: km * satz.w, werte: [satz],
        chips: [["km", "Klasse " + k], ["", "Mautbox optional"]],
        text: `${km} km × ca. ${komma(satz.w)} €/km.`,
        hinweis: k >= 3 ? "Ab 3 m Höhe oder über 3,5 t gilt Klasse 3. Sie kostet rund anderthalbmal so viel wie Klasse 2." : ""
      };
    },

    it(v, km) {
      const k = v.achsen >= 3 ? "3" : "B", satz = L.it.klassen[k];
      return {
        preis: km * satz.w, werte: [satz],
        chips: [["km", "Klasse " + k], ["", "Mautbox optional"]],
        text: `${km} km × ca. ${komma(satz.w, 3)} €/km.`,
        hinweis: k === "B" ? "Wohnmobile und Campervans sind fast immer Klasse B (über 1,30 m an der Vorderachse)." : ""
      };
    }
  };

  function klasseFr(v) {
    if (v.f2 > 3.5 || v.hoehe >= 3) return v.achsen >= 3 ? 4 : 3;
    return v.hoehe <= 2 ? 1 : 2;
  }

  // Tabellen für die Länderseiten: [Fall, Was gilt, Wert]
  const TABELLEN = {
    at: () => {
      const d = L.at;
      return [
        ["F.1 bis 3,5 t", "Digitale Vignette, 1 Tag", d.vignette.tag1, eur(d.vignette.tag1.w)],
        ["F.1 bis 3,5 t", "Digitale Vignette, 10 Tage", d.vignette.tag10, eur(d.vignette.tag10.w)],
        ["F.1 bis 3,5 t", "Digitale Vignette, 2 Monate", d.vignette.monat2, eur(d.vignette.monat2.w)],
        ["F.1 bis 3,5 t", "Jahresvignette 2026 (1.12.2025 bis 31.1.2027)", d.vignette.jahr, eur(d.vignette.jahr.w)],
        ["F.1 über 3,5 t", "GO-Maut, 2 Achsen, Euro 6", d.goMaut.achsen2, komma(d.goMaut.achsen2.w, 3) + " €/km"],
        ["F.1 über 3,5 t", "GO-Maut, 3 Achsen, Euro 6", d.goMaut.achsen3, komma(d.goMaut.achsen3.w, 3) + " €/km"],
        ["F.1 über 3,5 t", "Bearbeitungsgebühr GO-Box", d.goBoxGebuehr, eur(d.goBoxGebuehr.w)],
        ["Abgelastet, vor dem " + datum(d.regelTzgm.stichtagErstzulassung.w) + " zugelassen", "Noch Vignette, Übergang bis", d.regelTzgm.uebergangBis, datum(d.regelTzgm.uebergangBis.w)],
        ["Sondermaut bis 3,5 t", "A13 Brenner, Einzelfahrt", d.streckenmaut.brenner, eur(d.streckenmaut.brenner.w)],
        ["Sondermaut bis 3,5 t", "A10 Tauern, Einzelfahrt", d.streckenmaut.tauern, eur(d.streckenmaut.tauern.w)]
      ];
    },
    ch: () => {
      const d = L.ch, p = d.psva;
      return [
        ["Bis 3,5 t", "E-Vignette, 1 Jahr", d.vignetteChf, chf(d.vignetteChf.w)],
        ["Über 3,5 t", "PSVA pro Tag (1 bis 30 Tage)", p.tagChf, chf(p.tagChf.w)],
        ["Über 3,5 t", "PSVA Mindestbetrag", p.minChf, chf(p.minChf.w)],
        ["Über 3,5 t", "PSVA Höchstbetrag für 1 bis 30 Tage", p.maxBis30TageChf, chf(p.maxBis30TageChf.w)],
        ["Über 3,5 t", "PSVA pro Monat (1 bis 11 Monate)", p.monatChf, chf(p.monatChf.w)],
        ["Über 3,5 t", "PSVA pro Jahr", p.jahrChf, chf(p.jahrChf.w)]
      ];
    },
    fr: () => {
      const k = L.fr.klassen;
      return [
        ["Klasse 1", "Bis 2 m hoch und bis 3,5 t", k[1], "ca. " + komma(k[1].w) + " €/km"],
        ["Klasse 2", "2 bis 3 m hoch und bis 3,5 t (typisches Wohnmobil)", k[2], "ca. " + komma(k[2].w) + " €/km"],
        ["Klasse 3", "Ab 3 m hoch oder über 3,5 t, 2 Achsen", k[3], "ca. " + komma(k[3].w) + " €/km"],
        ["Klasse 4", "Ab 3 m hoch oder über 3,5 t, 3 oder mehr Achsen", k[4], "ca. " + komma(k[4].w) + " €/km"]
      ];
    },
    it: () => {
      const k = L.it.klassen;
      return [
        ["Klasse A", "2 Achsen, bis 1,30 m an der Vorderachse", k.A, "ca. " + komma(k.A.w, 3) + " €/km"],
        ["Klasse B", "2 Achsen, über 1,30 m an der Vorderachse (Wohnmobile)", k.B, "ca. " + komma(k.B.w, 3) + " €/km"],
        ["Klasse 3", "3 Achsen", k[3], "ca. " + komma(k[3].w, 3) + " €/km"]
      ];
    }
  };

  const ART = { amtlich: "amtlich", sekundaer: "Sekundärquelle", schaetzung: "Schätzwert" };

  // Kleine Kennzeichnung eines Werts: Art und Link zur Quelle
  function quelleHtml(land, wert) {
    const q = wert.q && L[land].quellen[wert.q];
    const art = `<span class="art art-${wert.art}">${ART[wert.art]}</span>`;
    return q ? `${art} <a href="${q.url}" target="_blank" rel="noopener">Quelle</a>` : art;
  }

  window.MAUT = { D, L, REGELN, TABELLEN, eur, komma, datum, quelleHtml, ART };
})();

// 1 · Temahantering (Mörkt / Ljust läge)
const temaknapp = document.querySelector("#tema");
if (temaknapp) {
  temaknapp.hidden = false;

  function bytTema() {
    document.body.classList.toggle("morkt");
    if (document.body.classList.contains("morkt")) {
      temaknapp.textContent = "Byt till ljust läge";
    } else {
      temaknapp.textContent = "Byt till mörkt läge";
    }
  }

  temaknapp.addEventListener("click", bytTema);
}

// 2 · Mobilmeny-funktionalitet
const menyKnapp = document.querySelector("#meny-knapp");
const huvudmeny = document.querySelector("#huvudmeny");

if (menyKnapp && huvudmeny) {
  function vaxlaMeny() {
    const oppen = huvudmeny.classList.toggle("oppen");
    menyKnapp.classList.toggle("aktiv", oppen);
    menyKnapp.setAttribute("aria-expanded", oppen ? "true" : "false");
    menyKnapp.setAttribute("aria-label", oppen ? "Stäng navigationsmeny" : "Öppna navigationsmeny");
  }

  menyKnapp.addEventListener("click", vaxlaMeny);

  // Stäng automatiskt när en länk i menyn klickas
  huvudmeny.querySelectorAll("a").forEach((lank) => {
    lank.addEventListener("click", () => {
      if (huvudmeny.classList.contains("oppen")) {
        vaxlaMeny();
      }
    });
  });

  // Stäng om man trycker Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && huvudmeny.classList.contains("oppen")) {
      vaxlaMeny();
      menyKnapp.focus();
    }
  });

  // Stäng vid klick utanför menyn
  document.addEventListener("click", (e) => {
    if (
      huvudmeny.classList.contains("oppen") &&
      !huvudmeny.contains(e.target) &&
      !menyKnapp.contains(e.target)
    ) {
      vaxlaMeny();
    }
  });
}

// 3 · Kontaktformulär-hantering
const kontaktForm = document.querySelector("#kontakt-formular");
const formBekraftelse = document.querySelector("#form-bekraftelse");

if (kontaktForm && formBekraftelse) {
  kontaktForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Hämta värden för att verifiera
    const namn = kontaktForm.querySelector("#form-namn")?.value || "";
    const epost = kontaktForm.querySelector("#form-epost")?.value || "";

    if (namn && epost) {
      // Visa bekräftelse
      formBekraftelse.hidden = false;
      formBekraftelse.scrollIntoView({ behavior: "smooth", block: "nearest" });

      // Återställ formulärfälten
      kontaktForm.reset();

      // Dölj bekräftelsen automatiskt efter 10 sekunder
      setTimeout(() => {
        formBekraftelse.hidden = true;
      }, 10000);
    }
  });
}
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

// 3 · Kontaktformulär → HubSpot Forms API (ingen inbäddning)
const kontaktForm = document.querySelector("#kontakt-formular");
const formBekraftelse = document.querySelector("#form-bekraftelse");
const formFel = document.querySelector("#form-fel");

const HUBSPOT_FORM_ENDPOINT =
  "https://api-eu1.hsforms.com/submissions/v3/integration/submit/149586469/2fce3279-8603-468b-a3de-3fe8b4604362";

function hamtaCookie(namn) {
  const prefix = `${namn}=`;
  return document.cookie
    .split(";")
    .map((del) => del.trim())
    .find((del) => del.startsWith(prefix))
    ?.slice(prefix.length);
}

if (kontaktForm && formBekraftelse && formFel) {
  kontaktForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!kontaktForm.reportValidity()) return;

    const webbplats = kontaktForm.querySelector("#form-webbplats")?.value.trim();
    if (webbplats) return; // Honeypot: skicka aldrig automatiserade inskick vidare.

    const knapp = kontaktForm.querySelector('button[type="submit"]');
    const knappText = knapp?.querySelector("span");
    const ursprungligKnapptext = knappText?.textContent;
    const data = new FormData(kontaktForm);
    const namn = String(data.get("namn") || "").trim();
    const namnDelar = namn.split(/\s+/);
    const fornamn = namnDelar.shift() || "";
    const efternamn = namnDelar.join(" ");
    const tjansteVal = kontaktForm.querySelector("#form-tjanst");
    const tjanst = tjansteVal?.selectedOptions[0]?.textContent?.trim() || "";
    const meddelande = String(data.get("meddelande") || "").trim();

    // HubSpot-formuläret använder standardfält. Tjänstevalet sparas tillsammans med meddelandet
    // så att varje uppgift från det befintliga formuläret följer med i samma HubSpot-inskick.
    const fullstandigtMeddelande = [
      `Önskad hjälp: ${tjanst}`,
      "",
      meddelande,
    ].join("\n");

    const fields = [
      { name: "email", value: String(data.get("epost") || "").trim() },
      { name: "firstname", value: fornamn },
      { name: "lastname", value: efternamn },
      { name: "company", value: String(data.get("foretag") || "").trim() },
      { name: "phone", value: String(data.get("telefon") || "").trim() },
      { name: "message", value: fullstandigtMeddelande },
    ].filter((falt) => falt.value);

    formBekraftelse.hidden = true;
    formFel.hidden = true;
    if (knapp) knapp.disabled = true;
    if (knappText) knappText.textContent = "Skickar…";

    try {
      const respons = await fetch(HUBSPOT_FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields,
          context: {
            pageUri: window.location.href,
            pageName: document.title,
            hutk: hamtaCookie("hubspotutk"),
          },
        }),
      });

      if (!respons.ok) throw new Error("HubSpot kunde inte ta emot meddelandet.");

      kontaktForm.reset();
      formBekraftelse.hidden = false;
      formBekraftelse.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (fel) {
      formFel.textContent = "Något gick fel när meddelandet skulle skickas. Försök igen eller mejla mig direkt.";
      formFel.hidden = false;
      formFel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } finally {
      if (knapp) knapp.disabled = false;
      if (knappText && ursprungligKnapptext) knappText.textContent = ursprungligKnapptext;
    }
  });
}

// 4 · Cookie-samtycke: Google Tag Manager laddas först efter ett aktivt godkännande.
const COOKIE_SAMTYCKE_NYCKEL = "madeleine_cookie_samtycke";
const cookieRuta = document.querySelector("#cookie-ruta");
const godkannCookies = document.querySelector("#godkann-cookies");
const avvisaCookies = document.querySelector("#avvisa-cookies");
const oppnaCookieInstallningar = document.querySelector("#oppna-cookie-installningar");

function hamtaCookieVarde(namn) {
  const prefix = `${namn}=`;
  return document.cookie
    .split(";")
    .map((del) => del.trim())
    .find((del) => del.startsWith(prefix))
    ?.slice(prefix.length);
}

function hamtaCookieSamtycke() {
  try {
    // Använd en förstapartscookie så att valet fungerar likadant på mobil och dator.
    return hamtaCookieVarde(COOKIE_SAMTYCKE_NYCKEL) || localStorage.getItem(COOKIE_SAMTYCKE_NYCKEL);
  } catch {
    return null;
  }
}

function sparaCookieSamtycke(val) {
  try {
    document.cookie = `${COOKIE_SAMTYCKE_NYCKEL}=${val}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`;
    localStorage.setItem(COOKIE_SAMTYCKE_NYCKEL, val);
  } catch {
    // Sidan fungerar fortfarande om besökarens webbläsare blockerar lokal lagring.
  }
}

function laddaGoogleTagManager() {
  if (document.querySelector('script[data-gtm="GTM-5LG9DC3Z"]')) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });

  const gtmScript = document.createElement("script");
  gtmScript.async = true;
  gtmScript.src = "https://www.googletagmanager.com/gtm.js?id=GTM-5LG9DC3Z";
  gtmScript.dataset.gtm = "GTM-5LG9DC3Z";
  document.head.appendChild(gtmScript);
}

function visaCookieRuta() {
  if (!cookieRuta) return;
  cookieRuta.hidden = false;
  godkannCookies?.focus();
}

function doljCookieRuta() {
  if (cookieRuta) cookieRuta.hidden = true;
}

const sparatCookieSamtycke = hamtaCookieSamtycke();
if (sparatCookieSamtycke === "godkand") {
  laddaGoogleTagManager();
} else if (!sparatCookieSamtycke) {
  visaCookieRuta();
}

godkannCookies?.addEventListener("click", () => {
  sparaCookieSamtycke("godkand");
  laddaGoogleTagManager();
  doljCookieRuta();
});

avvisaCookies?.addEventListener("click", () => {
  sparaCookieSamtycke("avvisad");
  doljCookieRuta();
});

oppnaCookieInstallningar?.addEventListener("click", visaCookieRuta);

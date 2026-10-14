const temaknapp = document.querySelector("#tema");
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
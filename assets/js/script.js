// API https://catfact.ninja
// Docs https://catfact.ninja/docs

const API_RAZAS = "https://catfact.ninja/breeds?limit=100";
const API_DATO  = "https://catfact.ninja/fact";

// cantidad razas / va en orden por la api
const MAX_RAZAS = 30;

// clave api / carpeta img
const IMG = {
  "Abyssinian": "assets/img/abyssinian-cat.jpg",
  "Aegean": "assets/img/aegean-cat.jpg",
  "American Bobtail": "assets/img/american-bobtail-cat.jpg",
  "American Curl": "assets/img/american-curl-cat.jpg",
  "American Shorthair": "assets/img/american-shorthair-cat.jpg",
  "American Wirehair": "assets/img/american-wirehair-cat.jpg",
  "Arabian Mau": "assets/img/arabian-mau-cat.jpg",
  "Asian": "assets/img/asian-cat.jpg",
  "Asian Semi-longhair": "assets/img/asian-semi-longhair-cat.jpg",
  "Australian Mist": "assets/img/australian-mist-cat.jpg",
  "Balinese": "assets/img/balinese-cat.jpg",
  "Bambino": "assets/img/bambino-cat.jpg",
  "Bengal": "assets/img/bengal-cat.jpg",
  "Birman": "assets/img/birman-cat.jpg",
  "Bombay": "assets/img/bombay-cat.jpg",
  "Brazilian Shorthair": "assets/img/brazilian-shorthair-cat.jpg",
  "British Longhair": "assets/img/british-longhair-cat.jpg",
  "British Semi-longhair": "assets/img/british-semi-longhair-cat.jpg",
  "British Shorthair": "assets/img/british-shorthair-cat.jpg",
  "Burmese": "assets/img/burmese-cat.jpg",
  "Burmilla": "assets/img/burmilla-cat.jpg",
  "California Spangled": "assets/img/california-spangled-cat.jpg",
  "Chantilly-Tiffany": "assets/img/chantilly-tiffany-cat.jpg",
  "Chartreux": "assets/img/chartreux-cat.jpg",
  "Chausie": "assets/img/chausie-cat.jpg",
  "Cheetoh": "assets/img/cheetoh-cat.jpg",
  "Colorpoint Shorthair": "assets/img/colorpoint-shorthair-cat.jpg",
  "Cornish Rex": "assets/img/cornish-rex-cat.jpg",
  "Cymric or Manx Longhair": "assets/img/cymric-cat.jpg",
  "Cyprus": "assets/img/cyprus-cat.jpg"
};

// filtro razas
let todasLasRazas = [];

// DOM
const listaRazas    = document.getElementById("listaRazas");
const contador      = document.getElementById("contador");
const filtroNombre  = document.getElementById("filtroNombre");
const filtroPais    = document.getElementById("filtroPais");
const filtroPelaje  = document.getElementById("filtroPelaje");
const datoTexto     = document.getElementById("datoTexto");
const btnDato       = document.getElementById("btnDato");

// API
async function obtenerRazas() {
  try {
    contador.textContent = "Cargando razas…";
    const respuesta = await fetch(API_RAZAS);

    // server responde con error
    if (!respuesta.ok) throw new Error("Error HTTP " + respuesta.status);

    const json = await respuesta.json();
    // API entrega las razas en "data" / se queda solo con las primeras MAX_RAZAS
    todasLasRazas = json.data.slice(0, MAX_RAZAS);

    llenarSelector(filtroPais, "country");
    llenarSelector(filtroPelaje, "coat");
    aplicarFiltros();
  } catch (error) {
    console.error(error);
    contador.textContent = "No se pudieron cargar las razas. Revisa tu conexión e intenta de nuevo.";
  }
}


function llenarSelector(select, campo) {
  const valores = [...new Set(todasLasRazas.map(r => r[campo]).filter(Boolean))].sort();
  valores.forEach(valor => {
    const opcion = document.createElement("option");
    opcion.value = valor;
    opcion.textContent = valor;
    select.appendChild(opcion);
  });
}


function obtenerImagen(raza) {
  const buscado = normalizarNombre(raza.breed);
  const clave = Object.keys(IMG)
    .find(nombre => normalizarNombre(nombre) === buscado);
  return clave ? IMG[clave] : "";
}


function normalizarNombre(nombre) {
  return nombre
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function aplicarFiltros() {
  const texto  = filtroNombre.value.trim().toLowerCase();
  const pais   = filtroPais.value;
  const pelaje = filtroPelaje.value;

  const filtradas = todasLasRazas.filter(raza =>
    raza.breed.toLowerCase().includes(texto) &&
    (pais === ""   || raza.country === pais) &&
    (pelaje === "" || raza.coat === pelaje)
  );

  renderizarRazas(filtradas);
}

function crearFoto(raza) {
  const urlImagen = obtenerImagen(raza);

  // Recuadro que se usa cuando no hay foto
  const recuadro = document.createElement("div");
  recuadro.className = "raza-sin-foto";
  recuadro.textContent = "Sin foto";

  if (!urlImagen) return recuadro;

  const imagen = document.createElement("img");
  imagen.src = urlImagen;
  imagen.alt = "Foto de un gato de raza " + raza.breed;
  imagen.loading = "lazy";
  // archivo no existe, reemplaza la imagen por el recuadro
  imagen.addEventListener("error", () => imagen.replaceWith(recuadro));
  return imagen;
}

function renderizarRazas(razas) {
  listaRazas.innerHTML = "";   // limpiar
  contador.textContent = razas.length + " de " + todasLasRazas.length + " razas";

  if (razas.length === 0) {
    listaRazas.innerHTML =
      '<p class="text-center py-5">Ninguna raza coincide. Prueba con otro nombre o quita un filtro.</p>';
    return;
  }

  razas.forEach(raza => {
    const columna = document.createElement("div");
    columna.className = "col-sm-6 col-lg-4";

    columna.innerHTML = `
      <article class="raza-card">
        <div class="contenedor-foto"></div>
        <div class="p-3">
          <h3 class="h5"></h3>
          <dl class="mb-0">
            <dt>País</dt>      <dd></dd>
            <dt>Origen</dt>    <dd></dd>
            <dt>Pelaje</dt>    <dd></dd>
            <dt>Patrón</dt>    <dd></dd>
          </dl>
        </div>
      </article>`;

    // Rellenar textos con textContent
    columna.querySelector("h3").textContent = raza.breed;
    const datos = columna.querySelectorAll("dd");
    datos[0].textContent = raza.country || "Sin dato";
    datos[1].textContent = raza.origin  || "Sin dato";
    datos[2].textContent = raza.coat    || "Sin dato";
    datos[3].textContent = raza.pattern || "Sin dato";

    // img si existe, si no recuadro "Sin foto"
    columna.querySelector(".contenedor-foto").appendChild(crearFoto(raza));
    listaRazas.appendChild(columna);
  });
}

// dato curioso API
async function cargarDato() {
  try {
    datoTexto.textContent = "Cargando dato…";
    const respuesta = await fetch(API_DATO);
    if (!respuesta.ok) throw new Error("Error HTTP " + respuesta.status);
    const json = await respuesta.json();
    datoTexto.textContent = json.fact;   // dato API
  } catch (error) {
    console.error(error);
    datoTexto.textContent = "No se pudo cargar el dato. Pulsa «Otro dato» para reintentar.";
  }
}

// eventos
filtroNombre.addEventListener("input", aplicarFiltros);
filtroPais.addEventListener("change", aplicarFiltros);
filtroPelaje.addEventListener("change", aplicarFiltros);
btnDato.addEventListener("click", cargarDato);

obtenerRazas();
cargarDato();

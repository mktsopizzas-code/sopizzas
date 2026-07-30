/* ==========================================================
   SÓ PIZZAS — lista de lojas
   Para adicionar uma loja nova, copie um bloco abaixo e
   edite nome, endereco, lat, lng e link.
   Dica: para pegar lat/lng, abra o Google Maps, clique com o
   botão direito no ponto da loja e copie os dois números.
   ========================================================== */

const LOJAS = [
  {
    nome: "Só Pizzas – Zona Sul",
    endereco: "R. Av. Jatuarana, 3981 - Nova Floresta - Porto Velho/RO",
    lat: -8.7619,
    lng: -63.8735,
    link: "https://sopizzasjatu.pedir.site/mobile"
  },
  {
    nome: "Só Pizzas – Embratel",
    endereco: "R. Av. Jorge Teixeira, 2722 - Embratel - Porto Velho/RO",
    lat: -8.7480,
    lng: -63.8590,
    link: "https://sopizzasjtx.pedir.site/mobile"
  }
];

/* ========================================================== */

const btnLocal = document.getElementById("btn-local");
const statusLocal = document.getElementById("status-local");
const secaoProxima = document.getElementById("secao-proxima");
const listaProxima = document.getElementById("lista-proxima");
const tituloOutras = document.getElementById("titulo-outras");
const listaOutras = document.getElementById("lista-outras");

/* Distância em metros entre dois pontos (fórmula de Haversine) */
function distanciaEmMetros(lat1, lng1, lat2, lng2) {
  const R = 6371000; // raio da Terra em metros
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* "837 m" ou "156.16 km" */
function formatarDistancia(metros) {
  if (metros < 1000) {
    return Math.round(metros) + " m";
  }
  return (metros / 1000).toFixed(2) + " km";
}

function criarCard(loja, opcoes) {
  const destaque = opcoes && opcoes.destaque;

  const card = document.createElement("article");
  card.className = destaque ? "card destaque" : "card";

  if (destaque) {
    const selo = document.createElement("span");
    selo.className = "selo";
    selo.textContent = "Loja mais próxima";
    card.appendChild(selo);
  }

  const nome = document.createElement("h3");
  nome.textContent = loja.nome;
  card.appendChild(nome);

  const endereco = document.createElement("p");
  endereco.className = "endereco";
  endereco.textContent = loja.endereco;
  card.appendChild(endereco);

  if (typeof loja.distancia === "number") {
    const dist = document.createElement("p");
    dist.className = "distancia";
    dist.textContent = "📍 " + formatarDistancia(loja.distancia) + " de você";
    card.appendChild(dist);
  }

  const botao = document.createElement("a");
  botao.className = "btn-pedir";
  botao.href = loja.link;
  botao.target = "_blank";
  botao.rel = "noopener";
  botao.textContent = "Pedir agora";
  card.appendChild(botao);

  return card;
}

/* Renderiza as lojas. Se comDistancia for true, a primeira vai
   destacada em "Loja mais próxima" e as demais em "Outras lojas". */
function renderizar(lojas, comDistancia) {
  listaProxima.innerHTML = "";
  listaOutras.innerHTML = "";

  if (comDistancia && lojas.length > 0) {
    secaoProxima.hidden = false;
    listaProxima.appendChild(criarCard(lojas[0], { destaque: true }));

    const restantes = lojas.slice(1);
    tituloOutras.textContent = "Outras lojas";
    secaoOutrasVisivel(restantes.length > 0);
    restantes.forEach(function (loja) {
      listaOutras.appendChild(criarCard(loja));
    });
  } else {
    secaoProxima.hidden = true;
    tituloOutras.textContent = "Nossas lojas";
    secaoOutrasVisivel(true);
    lojas.forEach(function (loja) {
      listaOutras.appendChild(criarCard(loja));
    });
  }
}

function secaoOutrasVisivel(visivel) {
  document.getElementById("secao-outras").hidden = !visivel;
}

function ordenarPorDistancia(lat, lng) {
  return LOJAS
    .map(function (loja) {
      return Object.assign({}, loja, {
        distancia: distanciaEmMetros(lat, lng, loja.lat, loja.lng)
      });
    })
    .sort(function (a, b) {
      return a.distancia - b.distancia;
    });
}

function pedirLocalizacao() {
  if (!navigator.geolocation) {
    statusLocal.textContent = "Seu navegador não permite detectar a localização.";
    return;
  }

  btnLocal.disabled = true;
  btnLocal.textContent = "Procurando lojas perto de você...";
  statusLocal.textContent = "";

  navigator.geolocation.getCurrentPosition(
    function (pos) {
      const lojas = ordenarPorDistancia(pos.coords.latitude, pos.coords.longitude);
      renderizar(lojas, true);
      btnLocal.hidden = true;
      statusLocal.textContent = "Lojas ordenadas da mais perto para a mais longe.";
    },
    function () {
      // Permissão negada ou erro: mostra tudo na ordem padrão.
      renderizar(LOJAS, false);
      btnLocal.disabled = false;
      btnLocal.textContent = "📍 Tentar novamente";
      statusLocal.textContent = "Não conseguimos ver sua localização. Escolha a loja que preferir.";
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
  );
}

btnLocal.addEventListener("click", pedirLocalizacao);

// Estado inicial: todas as lojas na ordem padrão, sem distância.
renderizar(LOJAS, false);

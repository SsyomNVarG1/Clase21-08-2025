const canvas = document.getElementById("cueva");
const ctx = canvas.getContext("2d");

const filas = 48;
const columnas = 48;
const tamaño = Math.floor(canvas.width / columnas);

let mapa = [];
let jugador = { fila: 1, col: 1 };
let meta = { fila: filas - 2, col: columnas - 2 };

// ---------- Generación base ----------
function generarMapa() {
  mapa = Array.from({ length: filas }, (_, f) =>
    Array.from({ length: columnas }, (_, c) => {
      if (f === 0 || c === 0 || f === filas - 1 || c === columnas - 1) return 1; // bordes pared
      return Math.random() < 0.47 ? 1 : 0; // 1 pared, 0 suelo
    })
  );
}

function contarVecinosPared(f, c) {
  let paredes = 0;
  for (let y = -1; y <= 1; y++) {
    for (let x = -1; x <= 1; x++) {
      if (y === 0 && x === 0) continue;
      const nf = f + y, nc = c + x;
      if (nf < 0 || nc < 0 || nf >= filas || nc >= columnas) {
        paredes++;
      } else if (mapa[nf][nc] === 1) {
        paredes++;
      }
    }
  }
  return paredes;
}

function suavizarMapa(iteraciones = 5) {
  for (let i = 0; i < iteraciones; i++) {
    const nuevo = mapa.map(fila => fila.slice());
    for (let f = 0; f < filas; f++) {
      for (let c = 0; c < columnas; c++) {
        const v = contarVecinosPared(f, c);
        if (v > 4) nuevo[f][c] = 1;
        else if (v < 4) nuevo[f][c] = 0;
      }
    }
    mapa = nuevo;
  }
}

// ---------- Conectividad (flood fill + mayor componente) ----------
function etiquetarComponentes() {
  const etiquetas = Array.from({ length: filas }, () => Array(columnas).fill(-1));
  let id = 0;
  const tamaños = [];

  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (mapa[f][c] === 0 && etiquetas[f][c] === -1) {
        // BFS
        const cola = [[f, c]];
        etiquetas[f][c] = id;
        let size = 0;

        while (cola.length) {
          const [y, x] = cola.shift();
          size++;
          for (const [dy, dx] of dirs) {
            const ny = y + dy, nx = x + dx;
            if (ny >= 0 && nx >= 0 && ny < filas && nx < columnas) {
              if (mapa[ny][nx] === 0 && etiquetas[ny][nx] === -1) {
                etiquetas[ny][nx] = id;
                cola.push([ny, nx]);
              }
            }
          }
        }

        tamaños[id] = size;
        id++;
      }
    }
  }

  // Si no hay suelos, devolvemos sin cambios
  if (id === 0) return { etiquetas, mayor: -1 };

  // Quedarnos con el componente más grande
  let mayor = 0, tamMayor = tamaños[0];
  for (let i = 1; i < tamaños.length; i++) {
    if (tamaños[i] > tamMayor) { tamMayor = tamaños[i]; mayor = i; }
  }

  // Convertir todo lo que no sea el mayor en paredes
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (mapa[f][c] === 0 && etiquetas[f][c] !== mayor) {
        mapa[f][c] = 1;
      }
    }
  }

  return { etiquetas, mayor };
}

// ---------- Elegir puntos lejanos dentro del mayor componente ----------
function bfsDist(origen) {
  const dist = Array.from({ length: filas }, () => Array(columnas).fill(Infinity));
  const cola = [];
  dist[origen.fila][origen.col] = 0;
  cola.push([origen.fila, origen.col]);

  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  while (cola.length) {
    const [y, x] = cola.shift();
    for (const [dy, dx] of dirs) {
      const ny = y + dy, nx = x + dx;
      if (ny >= 0 && nx >= 0 && ny < filas && nx < columnas) {
        if (mapa[ny][nx] === 0 && dist[ny][nx] === Infinity) {
          dist[ny][nx] = dist[y][x] + 1;
          cola.push([ny, nx]);
        }
      }
    }
  }
  return dist;
}

function celdaLibreCualquiera() {
  for (let intentos = 0; intentos < 5000; intentos++) {
    const f = (Math.random() * filas) | 0;
    const c = (Math.random() * columnas) | 0;
    if (mapa[f][c] === 0) return { fila: f, col: c };
  }
  // fallback
  for (let f = 0; f < filas; f++) for (let c = 0; c < columnas; c++) if (mapa[f][c] === 0) return { fila: f, col: c };
  return { fila: 1, col: 1 };
}

function elegirPuntosMaxDist() {
  // 1) Tomamos cualquier celda libre
  const a = celdaLibreCualquiera();
  // 2) BFS desde A para encontrar el punto más lejano B
  const distA = bfsDist(a);
  let B = a, dMax = 0;
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (mapa[f][c] === 0 && distA[f][c] !== Infinity && distA[f][c] > dMax) {
        dMax = distA[f][c]; B = { fila: f, col: c };
      }
    }
  }
  // 3) BFS desde B para encontrar C, el más lejano de B (aprox al diámetro)
  const distB = bfsDist(B);
  let C = B; dMax = 0;
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      if (mapa[f][c] === 0 && distB[f][c] !== Infinity && distB[f][c] > dMax) {
        dMax = distB[f][c]; C = { fila: f, col: c };
      }
    }
  }
  // jugador y meta en extremos
  jugador = B;
  meta = C;
}

// ---------- Entrada ----------
document.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k === "r") { regenerar(); return; }

  let nf = jugador.fila, nc = jugador.col;
  if (k === "w" || k === "arrowup") nf--;
  if (k === "s" || k === "arrowdown") nf++;
  if (k === "a" || k === "arrowleft") nc--;
  if (k === "d" || k === "arrowright") nc++;

  if (nf >= 0 && nc >= 0 && nf < filas && nc < columnas && mapa[nf][nc] === 0) {
    jugador.fila = nf; jugador.col = nc;
  }

  if (jugador.fila === meta.fila && jugador.col === meta.col) {
    setTimeout(() => alert("¡Ganaste! Presioná R para otra cueva."), 60);
  }
});

// ---------- Render ----------
function dibujar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // mapa
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
      ctx.fillStyle = (mapa[f][c] === 1) ? "#3f3f3f" : "#0a0a0a";
      ctx.fillRect(c * tamaño, f * tamaño, tamaño, tamaño);
    }
  }

  // meta
  ctx.fillStyle = "red";
  ctx.fillRect(meta.col * tamaño + 4, meta.fila * tamaño + 4, tamaño - 8, tamaño - 8);

  // jugador
  ctx.fillStyle = "cyan";
  ctx.fillRect(jugador.col * tamaño + 2, jugador.fila * tamaño + 2, tamaño - 4, tamaño - 4);

  requestAnimationFrame(dibujar);
}

// ---------- Pipeline completo ----------
function regenerar() {
  generarMapa();
  suavizarMapa(5);
  etiquetarComponentes();  // deja solo el mayor componente
  elegirPuntosMaxDist();   // elige jugador/meta muy separados dentro del mismo componente
}

regenerar();
dibujar();
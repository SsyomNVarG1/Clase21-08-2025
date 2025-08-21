const filas = 10;
const columnas = 10;
let mapa = [];
let jugadorX = 0;
let jugadorY = 0;

function generarMapa() {
  const mapaDiv = document.getElementById("mapa");
  mapaDiv.innerHTML = ""; // Limpia el mapa anterior
  mapa = [];

  for (let y = 0; y < filas; y++) {
    mapa[y] = [];
    for (let x = 0; x < columnas; x++) {
      // 70% suelo, 30% pared
      const celda = Math.random() < 0.3 ? 'pared' : 'suelo';
      mapa[y][x] = celda;
    }
  }

  // Colocar jugador en esquina superior izquierda
  jugadorX = 0;
  jugadorY = 0;
  mapa[jugadorY][jugadorX] = 'jugador';

  // Colocar salida en esquina inferior derecha
  mapa[filas - 1][columnas - 1] = 'salida';

  dibujarMapa();
}

// Función para dibujar el mapa en pantalla
function dibujarMapa() {
  const mapaDiv = document.getElementById("mapa");
  mapaDiv.innerHTML = "";
  mapaDiv.style.gridTemplateColumns = `repeat(${columnas}, 40px)`;
  mapaDiv.style.gridTemplateRows = `repeat(${filas}, 40px)`;

  for (let y = 0; y < filas; y++) {
    for (let x = 0; x < columnas; x++) {
      const div = document.createElement('div');
      div.classList.add('celda', mapa[y][x]);
      div.textContent = mapa[y][x] === 'suelo' ? '' : mapa[y][x][0].toUpperCase();
      mapaDiv.appendChild(div);
    }
  }
}
document.addEventListener('keydown', (e) =>{
  const k = e.key.toLowerCase();
  if (k === "r") { generarMapa(); return; }
})
// Manejo de movimiento con flechas
document.addEventListener('keydown', (e) => {
  let nuevoX = jugadorX;
  let nuevoY = jugadorY;

  if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') nuevoY--;
  else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') nuevoY++;
  else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') nuevoX--;
  else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') nuevoX++;

  // Chequear límites del mapa y colisiones
  if (nuevoX >= 0 && nuevoX < columnas && nuevoY >= 0 && nuevoY < filas) {
    if (mapa[nuevoY][nuevoX] !== 'pared') {
      // Mover jugador
      mapa[jugadorY][jugadorX] = 'suelo'; // limpiar posición anterior
      jugadorX = nuevoX;
      jugadorY = nuevoY;
      mapa[jugadorY][jugadorX] = 'jugador';
      dibujarMapa();

      // Chequear si llegó a la salida
      if (jugadorX === columnas - 1 && jugadorY === filas - 1) {
        alert("¡Llegaste a la salida!");
      }
    }
  }
});

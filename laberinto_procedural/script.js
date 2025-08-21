const canvas = document.getElementById("laberinto");
const ctx = canvas.getContext("2d");

const filas = 20;
const columnas = 20;
const tamaño = canvas.width / columnas;

// Clase para cada celda
class Celda {
    constructor(fila, col) {
        this.fila = fila;
        this.col = col;
        this.paredes = { arriba: true, derecha: true, abajo: true, izquierda: true };
        this.visitada = false;
    }

    dibujar() {
        const x = this.col * tamaño;
        const y = this.fila * tamaño;
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;

        if (this.paredes.arriba) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + tamaño, y);
            ctx.stroke();
        }
        if (this.paredes.derecha) {
            ctx.beginPath();
            ctx.moveTo(x + tamaño, y);
            ctx.lineTo(x + tamaño, y + tamaño);
            ctx.stroke();
        }
        if (this.paredes.abajo) {
            ctx.beginPath();
            ctx.moveTo(x + tamaño, y + tamaño);
            ctx.lineTo(x, y + tamaño);
            ctx.stroke();
        }
        if (this.paredes.izquierda) {
            ctx.beginPath();
            ctx.moveTo(x, y + tamaño);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }
}

// Crear la grilla
let celdas = [];
for (let f = 0; f < filas; f++) {
    for (let c = 0; c < columnas; c++) {
        celdas.push(new Celda(f, c));
    }
}

function index(f, c) {
    if (f < 0 || c < 0 || f >= filas || c >= columnas) return -1;
    return f * columnas + c;
}

// Algoritmo DFS
let pila = [];
let celdaActual = celdas[0];
celdaActual.visitada = true;

function generarLaberinto() {
    let vecinos = [];

    let top = celdas[index(celdaActual.fila - 1, celdaActual.col)];
    let right = celdas[index(celdaActual.fila, celdaActual.col + 1)];
    let bottom = celdas[index(celdaActual.fila + 1, celdaActual.col)];
    let left = celdas[index(celdaActual.fila, celdaActual.col - 1)];

    if (top && !top.visitada) vecinos.push(top);
    if (right && !right.visitada) vecinos.push(right);
    if (bottom && !bottom.visitada) vecinos.push(bottom);
    if (left && !left.visitada) vecinos.push(left);

    if (vecinos.length > 0) {
        let siguiente = vecinos[Math.floor(Math.random() * vecinos.length)];
        pila.push(celdaActual);

        if (siguiente.fila < celdaActual.fila) {
            celdaActual.paredes.arriba = false;
            siguiente.paredes.abajo = false;
        } else if (siguiente.fila > celdaActual.fila) {
            celdaActual.paredes.abajo = false;
            siguiente.paredes.arriba = false;
        }
        if (siguiente.col < celdaActual.col) {
            celdaActual.paredes.izquierda = false;
            siguiente.paredes.derecha = false;
        } else if (siguiente.col > celdaActual.col) {
            celdaActual.paredes.derecha = false;
            siguiente.paredes.izquierda = false;
        }

        celdaActual = siguiente;
        celdaActual.visitada = true;
    } else if (pila.length > 0) {
        celdaActual = pila.pop();
    }
}

// Posición del jugador
let jugador = { fila: 0, col: 0 };
let meta = { fila: filas - 1, col: columnas - 1 };

// Movimiento del jugador
document.addEventListener("keydown", (e) => {
    const tecla = e.key.toLowerCase();

    let celda = celdas[index(jugador.fila, jugador.col)];

    if ((tecla === "arrowup" || tecla === "w") && !celda.paredes.arriba) {
        jugador.fila--;
    }
    if ((tecla === "arrowdown" || tecla === "s") && !celda.paredes.abajo) {
        jugador.fila++;
    }
    if ((tecla === "arrowleft" || tecla === "a") && !celda.paredes.izquierda) {
        jugador.col--;
    }
    if ((tecla === "arrowright" || tecla === "d") && !celda.paredes.derecha) {
        jugador.col++;
    }

    // Si llega a la meta
    if (jugador.fila === meta.fila && jugador.col === meta.col) {
        setTimeout(() => alert("¡Ganaste!"), 50);
    }
});

// Dibujo
function dibujar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    celdas.forEach(c => c.dibujar());

    generarLaberinto();

    // Dibujar jugador
    ctx.fillStyle = "cyan";
    ctx.fillRect(jugador.col * tamaño + 4, jugador.fila * tamaño + 4, tamaño - 8, tamaño - 8);

    // Dibujar meta
    ctx.fillStyle = "red";
    ctx.fillRect(meta.col * tamaño + 8, meta.fila * tamaño + 8, tamaño - 16, tamaño - 16);

    if (pila.length > 0) {
        requestAnimationFrame(dibujar);
    } else {
        // Laberinto terminado: dibujar constantemente para mostrar movimiento
        requestAnimationFrame(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            celdas.forEach(c => c.dibujar());
            ctx.fillStyle = "cyan";
            ctx.fillRect(jugador.col * tamaño + 4, jugador.fila * tamaño + 4, tamaño - 8, tamaño - 8);
            ctx.fillStyle = "red";
            ctx.fillRect(meta.col * tamaño + 8, meta.fila * tamaño + 8, tamaño - 16, tamaño - 16);
            requestAnimationFrame(arguments.callee);
        });
    }
}

dibujar();
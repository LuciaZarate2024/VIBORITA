const tablero = document.getElementById("tablero");
const contexto = tablero.getContext("2d");
const marcador = document.getElementById("puntaje");
const mensaje = document.getElementById("mensaje");
const botonIniciar = document.getElementById("iniciar");

// El tablero tiene 20 filas y 20 columnas.
const tamañoCelda = 20;
const cantidadCeldas = tablero.width / tamañoCelda;

let viborita;
let direccion;
let siguienteDireccion;
let comida;
let puntos;
let intervalo = null;
let jugando = false;
let giroPendiente = false;

// Coloca la comida en una celda libre.
function crearComida() {
  const libres = [];

  for (let y = 0; y < cantidadCeldas; y++) {
    for (let x = 0; x < cantidadCeldas; x++) {
      const ocupada = viborita.some((parte) => parte.x === x && parte.y === y);

      if (!ocupada) {
        libres.push({ x, y });
      }
    }
  }

  // Si no quedan celdas libres, el jugador llenó el tablero.
  if (libres.length === 0) {
    return null;
  }

  const indice = Math.floor(Math.random() * libres.length);
  return libres[indice];
}

function prepararJuego() {
  viborita = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ];

  direccion = { x: 1, y: 0 };
  siguienteDireccion = { x: 1, y: 0 };
  giroPendiente = false;
  puntos = 0;
  marcador.textContent = puntos;
  comida = crearComida();

  dibujar();
}

function iniciarJuego() {
  // Evita tener varios temporizadores al reiniciar.
  clearInterval(intervalo);
  preparandoInicio();

  intervalo = setInterval(moverViborita, 200);
}

function preparandoInicio() {
  prepararJuego();
  jugando = true;
  mensaje.textContent = "¡Busca la fruta roja!";
  botonIniciar.textContent = "Reiniciar juego";
}

function dibujar() {
  contexto.fillStyle = "#0b170e";
  contexto.fillRect(0, 0, tablero.width, tablero.height);

  // Dibujamos una cuadrícula.
  contexto.strokeStyle = "#183320";
  contexto.lineWidth = 1;

  for (let i = 0; i <= cantidadCeldas; i++) {
    const posicion = i * tamañoCelda;

    contexto.beginPath();
    contexto.moveTo(posicion, 0);
    contexto.lineTo(posicion, tablero.height);
    contexto.stroke();

    contexto.beginPath();
    contexto.moveTo(0, posicion);
    contexto.lineTo(tablero.width, posicion);
    contexto.stroke();
  }

  // Dibujamos la comida como un círculo rojo.
  if (comida !== null) {
    contexto.fillStyle = "#ff6262";
    contexto.beginPath();
    contexto.arc(
      comida.x * tamañoCelda + tamañoCelda / 2,
      comida.y * tamañoCelda + tamañoCelda / 2,
      tamañoCelda / 2 - 3,
      0,
      Math.PI * 2,
    );
    contexto.fill();
  }

  // La primera parte del arreglo es la cabeza.
  viborita.forEach((parte, indice) => {
    contexto.fillStyle = indice === 0 ? "#d3ff8a" : "#69cf65";

    contexto.fillRect(
      parte.x * tamañoCelda + 1,
      parte.y * tamañoCelda + 1,
      tamañoCelda - 2,
      tamañoCelda - 2,
    );
  });
}

function moverViborita() {
  direccion = { ...siguienteDireccion };
  giroPendiente = false;

  const cabeza = {
    x: viborita[0].x + direccion.x,
    y: viborita[0].y + direccion.y,
  };

  const chocaPared =
    cabeza.x < 0 ||
    cabeza.y < 0 ||
    cabeza.x >= cantidadCeldas ||
    cabeza.y >= cantidadCeldas;

  const come =
    comida !== null && cabeza.x === comida.x && cabeza.y === comida.y;

  // Cuando no come, la cola se mueve y deja su celda libre.
  const cuerpoAComprobar = come ? viborita : viborita.slice(0, -1);

  const chocaCuerpo = cuerpoAComprobar.some(
    (parte) => parte.x === cabeza.x && parte.y === cabeza.y,
  );

  if (chocaPared || chocaCuerpo) {
    terminarJuego("¡Perdiste! Puntaje final: " + puntos);
    return;
  }

  // Agrega la nueva cabeza al inicio.
  viborita.unshift(cabeza);

  if (come) {
    puntos += 10;
    marcador.textContent = puntos;
    comida = crearComida();

    if (comida === null) {
      dibujar();
      terminarJuego("¡Ganaste! Llenaste el tablero. Puntaje: " + puntos);
      return;
    }
  } else {
    // Quita la cola para conservar el tamaño.
    viborita.pop();
  }

  dibujar();
}

function cambiarDireccion(nombre) {
  // Solo permite un giro por movimiento.
  if (!jugando || giroPendiente) {
    return;
  }

  const direcciones = {
    arriba: { x: 0, y: -1 },
    abajo: { x: 0, y: 1 },
    izquierda: { x: -1, y: 0 },
    derecha: { x: 1, y: 0 },
  };

  const nueva = direcciones[nombre];

  if (!nueva) {
    return;
  }

  // Impide dar la vuelta directamente hacia el cuerpo.
  const esOpuesta = nueva.x === -direccion.x && nueva.y === -direccion.y;

  const esIgual = nueva.x === direccion.x && nueva.y === direccion.y;

  if (esOpuesta || esIgual) {
    return;
  }

  siguienteDireccion = nueva;
  giroPendiente = true;
}

function terminarJuego(texto) {
  clearInterval(intervalo);
  intervalo = null;
  jugando = false;
  mensaje.textContent = texto;
  botonIniciar.textContent = "Volver a jugar";
}

// Controles del teclado.
document.addEventListener("keydown", (evento) => {
  const teclas = {
    ArrowUp: "arriba",
    ArrowDown: "abajo",
    ArrowLeft: "izquierda",
    ArrowRight: "derecha",
  };

  const nombre = teclas[evento.key];

  if (nombre && jugando) {
    // Evita que las flechas desplacen la página al jugar.
    evento.preventDefault();
    cambiarDireccion(nombre);
  }
});

// Controles de los botones.
document.querySelectorAll("[data-direccion]").forEach((boton) => {
  boton.addEventListener("click", () => {
    cambiarDireccion(boton.dataset.direccion);
  });
});

botonIniciar.addEventListener("click", iniciarJuego);

// Mostramos el tablero antes de empezar.
prepararJuego();

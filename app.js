const apiURL = 'https://api3.bolillerobingoonlinegratis.com/api/companies';
const CACHE_KEY = 'loterias-cache';
const CACHE_TIMESTAMP_KEY = 'loterias-timestamp';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Obtener la fecha actual en formato YYYY-MM-DD
function obtenerFechaLocal() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

// Función para normalizar la fecha (sin hora)
function limpiarFecha(fechaString) {
  const fecha = new Date(fechaString);
  fecha.setHours(0, 0, 0, 0); // Limpiar horas, minutos, segundos y milisegundos
  return fecha.toISOString().split('T')[0]; // Retorna la fecha en formato YYYY-MM-DD
}

// Función para comparar las fechas (sin hora)
function compararFechas(fecha1, fecha2) {
  const f1 = new Date(fecha1);
  const f2 = new Date(fecha2);
  f1.setHours(0, 0, 0, 0); // Eliminar las horas de ambas fechas
  f2.setHours(0, 0, 0, 0); // Eliminar las horas de ambas fechas
  return f1.getTime() === f2.getTime(); // Comparar en milisegundos
}

// Crear una carta para cada lotería
function crearCartaLoteria(loteria, esHoy, delay) {
  const card = document.createElement('div');
  card.className = 'card';

  const numeros = loteria.ultimo_sorteo.premios
    .split('-')
    .map(num => num.trim().padStart(2, '0'));

  const colorClase = esHoy ? 'verde' : 'gris';
  const esSuperKino = loteria.image.includes('spk.png'); // <- comprobamos si es Super Kino TV

  const bolasHTML = numeros.map((num, i) => {
    let claseExtra = colorClase;

    // Solo si es hoy y no es Super Kino
    if (esHoy && !esSuperKino) {
      if (i === 6) claseExtra += ' loto1';
      if (i === 7) claseExtra += ' loto2';
    }

    return `<div class="bola ${claseExtra}">${num}</div>`;
  }).join('');

  card.innerHTML = `
    <img src="${loteria.image}" alt="${loteria.titulo}">
    <div class="titulo">${loteria.titulo}</div>
    <div class="fecha">Fecha del sorteo: ${loteria.ultimo_sorteo.fecha_sorteo}</div>
    <div class="premios">${bolasHTML}</div>
    <div class="acciones">
      <button class="btn-calendario" data-id="${loteria.id}" data-nombre="${loteria.titulo}">📅 Ver otra fecha</button>
    </div>
    <div class="calendario-popup" id="calendario-${loteria.id}" style="display:none;"></div>
  `;

  setTimeout(() => {
    card.classList.add('visible');
  }, delay);

  return card;
}

// Agregar los listeners de calendario
function agregarCalendarioListeners() {
  document.querySelectorAll('.btn-calendario').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const nombre = btn.dataset.nombre;
      const fechaHoy = obtenerFechaLocal();

      const popup = document.getElementById(`calendario-${id}`);
      if (popup.innerHTML === '') {
        const input = document.createElement('input');
        input.type = 'date';
        input.min = '2020-01-01'; 
        input.max = fechaHoy;
        input.addEventListener('change', () => {
          const fechaSeleccionada = input.value;
          window.location.href = `loteria.html?id=${id}&fecha=${fechaSeleccionada}&nombre=${encodeURIComponent(nombre)}`;
        });
        popup.appendChild(input);
      }

      popup.style.display = (popup.style.display === 'none') ? 'block' : 'none';
    });
  });
}

// Función para cargar las loterías desde localStorage o la API
function cargarLoterias() {
  const cache = localStorage.getItem(CACHE_KEY);
  const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  const ahora = Date.now();

  // Verificar si tenemos caché válido
  if (cache && timestamp && ahora - parseInt(timestamp) < CACHE_TTL) {
    const loterias = JSON.parse(cache);
    mostrarLoterias(loterias);
  } else {
    fetch(apiURL)
      .then(res => res.json())
      .then(data => {
        const loterias = data.map(company => company.loteria).flat();
        // Guardar los datos en localStorage
        localStorage.setItem(CACHE_KEY, JSON.stringify(loterias));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
        mostrarLoterias(loterias);
      })
      .catch(err => console.error('Error al obtener los datos:', err));
  }
}

// Función para mostrar las loterías
function mostrarLoterias(loterias) {
  const container = document.getElementById('loterias');
  const fechaHoy = obtenerFechaLocal();

  loterias.forEach((loteria, index) => {
    const fechaSorteo = loteria.ultimo_sorteo.fecha_sorteo;
    const esHoy = compararFechas(fechaSorteo, fechaHoy);
    const delay = 100 * index;

    // Verificar si existen los números loto1 y loto2 en cualquier lotería
    const numerosAdicionales = [];
    if (loteria.ultimo_sorteo.loto1 !== null && loteria.ultimo_sorteo.loto1 !== undefined) {
      numerosAdicionales.push(String(loteria.ultimo_sorteo.loto1).padStart(2, '0'));
    }
    if (loteria.ultimo_sorteo.loto2 !== null && loteria.ultimo_sorteo.loto2 !== undefined) {
      numerosAdicionales.push(String(loteria.ultimo_sorteo.loto2).padStart(2, '0'));
    }

    const numerosOriginales = loteria.ultimo_sorteo.premios
      .split('-')
      .map(num => num.trim().padStart(2, '0'));

    const todosLosNumeros = numerosOriginales.concat(numerosAdicionales);

    // Actualizar los premios con todos los números juntos
    loteria.ultimo_sorteo.premios = todosLosNumeros.join('-');

    // Crear la carta
    const card = crearCartaLoteria(loteria, esHoy, delay);
    container.appendChild(card);
  });

  agregarCalendarioListeners();
}

// Llamamos a la función para cargar las loterías
cargarLoterias();

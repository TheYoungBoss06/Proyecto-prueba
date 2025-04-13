const apiURL = 'https://api3.bolillerobingoonlinegratis.com';

function obtenerFechaLocal() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function crearCartaLoteria(loteria, esHoy, delay) {
  const card = document.createElement('div');
  card.className = 'card';

  const colorClase = esHoy ? 'naranja' : 'gris';
  const numeros = loteria.ultimo_sorteo.premios.split('-');

  const bolasHTML = numeros.map(num => 
    `<div class="bola ${colorClase}">${num}</div>`
  ).join('');

  card.innerHTML = `
    <img src="${loteria.image}" alt="${loteria.titulo}">
    <div class="titulo">${loteria.titulo}</div>
    <div class="fecha">Fecha del sorteo: ${loteria.ultimo_sorteo.fecha_sorteo}</div>
    <div class="premios">${bolasHTML}</div>
    <div class="acciones">
      <button class="btn-calendario" data-id="${loteria.id}" data-nombre="${loteria.titulo}">
        📅 Ver numeros calientes
      </button>
    </div>
    <div class="calendario-popup" id="calendario-${loteria.id}" style="display:none;"></div>
  `;

  setTimeout(() => {
    card.classList.add('visible');
  }, delay);

  return card;
}

function agregarCalendarioListeners() {
  document.querySelectorAll('.btn-calendario').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const popup = document.getElementById(`calendario-${id}`);

      if (popup.innerHTML === '') {
        const input = document.createElement('input');
        input.type = 'date';
        input.addEventListener('change', () => {
          const fecha = input.value;
          const nombre = btn.dataset.nombre;

          window.location.href = `loteria.html?id=${id}&fecha=${fecha}&nombre=${encodeURIComponent(nombre)}`;
        });
        popup.appendChild(input);
      }

      popup.style.display = (popup.style.display === 'none') ? 'block' : 'none';
    });
  });
}

fetch(apiURL + '/api/companies/loterias')
  .then(res => res.json())
  .then(data => {
    const loterias = data.loteria;
    const container = document.getElementById('loterias');
    const fechaHoy = obtenerFechaLocal();

    loterias.forEach((loteria, index) => {
      const fecha = loteria.ultimo_sorteo.fecha_sorteo;
      const esHoy = fecha === fechaHoy;
      const delay = 100 * index;

      const card = crearCartaLoteria(loteria, esHoy, delay);
      container.appendChild(card);
    });

    // ✅ Aquí llamamos la función después de agregar todas las tarjetas
    agregarCalendarioListeners();
  })
  .catch(err => console.error('Error al obtener los datos:', err));




  
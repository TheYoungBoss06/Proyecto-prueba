document.addEventListener('DOMContentLoaded', function() {
  let paginaActual = 1;
  const noticiasPorPagina = 20;
  const CACHE_KEY = 'noticias-cache';
  const CACHE_TIMESTAMP_KEY = 'noticias-timestamp';
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  // Función para cargar las noticias
  function cargarNoticias(pagina = 1) {
    paginaActual = pagina;

    // Intentamos cargar desde el cache primero
    const cache = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const ahora = Date.now();

    if (cache && timestamp && ahora - parseInt(timestamp) < CACHE_TTL) {
      // Si hay caché y es reciente, lo usamos
      const datos = JSON.parse(cache);
      if (datos[pagina]) {
        renderNoticias(datos[pagina]);
        crearPaginacionCompacta(pagina, datos.totalPaginas);
      }
      // Actualizar en segundo plano
      setTimeout(() => actualizarNoticiasDesdeAPI(pagina), 100);
    } else {
      // Si no hay caché o está expirado, cargamos desde la API
      actualizarNoticiasDesdeAPI(pagina);
    }
  }

  // Función para actualizar las noticias desde la API
  function actualizarNoticiasDesdeAPI(pagina) {
    fetch(`https://deultimominuto.net/wp-json/wp/v2/posts?per_page=${noticiasPorPagina}&page=${pagina}`)
      .then(res => {
        if (!res.ok) throw new Error('No se pudieron obtener las noticias.');
        const totalPaginas = parseInt(res.headers.get('X-WP-TotalPages'));
        return res.json().then(data => {
          // Almacenamos las noticias en el cache
          let datosCache = JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
          datosCache[pagina] = data;
          datosCache.totalPaginas = totalPaginas;

          // Guardamos los datos en el localStorage
          localStorage.setItem(CACHE_KEY, JSON.stringify(datosCache));
          localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

          // Renderizamos las noticias
          renderNoticias(data);
          crearPaginacionCompacta(pagina, totalPaginas);
        });
      })
      .catch(err => {
        console.error('Error al cargar las noticias:', err);
        document.getElementById('noticias').innerHTML = '<p>No se pudieron cargar las noticias.</p>';
      });
  }

  // Función para renderizar las noticias
  function renderNoticias(data) {
    const container = document.getElementById('noticias');
    if (!container) return; // Comprobamos si el contenedor existe
    container.innerHTML = '';

    data.forEach(noticia => {
      const card = document.createElement('div');
      card.className = 'noticia-card';

      const titulo = noticia.title.rendered;
      const imagen = noticia.jetpack_featured_media_url;
      const id = noticia.id;

      card.innerHTML = `
        <img src="${imagen}" alt="Imagen de la noticia">
        <h3>${titulo}</h3>
        <a href="noticia.html?id=${id}">
          <button class="btn-leer">Leer más</button>
        </a>
      `;

      container.appendChild(card);
    });
  }

  // Función para crear la paginación compacta
  function crearPaginacionCompacta(actual, total) {
    const paginacion = document.getElementById('paginacion');
    paginacion.innerHTML = '';

    function crearBoton(texto, pagina, desactivado = false, activo = false) {
      const btn = document.createElement('button');
      btn.textContent = texto;
      btn.style.margin = '0 3px';
      btn.style.padding = '5px 10px';
      btn.style.cursor = 'pointer';

      if (activo) {
        btn.style.backgroundColor = '#007bff';
        btn.style.color = '#fff';
        btn.disabled = true;
      }

      if (desactivado) {
        btn.disabled = true;
        btn.style.cursor = 'default';
      }

      btn.onclick = () => {
        if (!btn.disabled) {
          paginaActual = pagina;
          cargarNoticias(pagina);
        }
      };

      paginacion.appendChild(btn);
    }

    if (actual > 1) crearBoton('<', actual - 1);

    if (actual > 3) {
      crearBoton('1', 1);
      if (actual > 4) {
        const puntos = document.createElement('span');
        puntos.textContent = '...';
        paginacion.appendChild(puntos);
      }
    }

    const rangoInicio = Math.max(1, actual - 1);
    const rangoFin = Math.min(total, actual + 1);

    for (let i = rangoInicio; i <= rangoFin; i++) {
      crearBoton(i, i, false, i === actual);
    }

    if (actual < total - 2) {
      if (actual < total - 3) {
        const puntos = document.createElement('span');
        puntos.textContent = '...';
        paginacion.appendChild(puntos);
      }
      crearBoton(total, total);
    }

    if (actual < total) crearBoton('>', actual + 1);
  }

  // Llamada inicial para cargar las noticias
  cargarNoticias();
});

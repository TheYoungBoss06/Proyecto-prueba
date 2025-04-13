let paginaActual = 1;
const noticiasPorPagina = 5;

function cargarNoticias(pagina = 1) {
  fetch(`https://deultimominuto.net/wp-json/wp/v2/posts?per_page=${noticiasPorPagina}&page=${pagina}`)
    .then(res => {
      if (!res.ok) throw new Error('No se pudieron obtener las noticias.');
      // Guardamos los headers para saber el total de páginas
      const totalPaginas = res.headers.get('X-WP-TotalPages');
      crearBotonesPaginacion(pagina, totalPaginas);
      return res.json();
    })
    .then(data => {
      const container = document.getElementById('noticias');
      container.innerHTML = ''; // Limpiar noticias anteriores

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
    })
    .catch(err => {
      console.error('Error al cargar las noticias:', err);
      document.getElementById('noticias').innerHTML = '<p>No se pudieron cargar las noticias.</p>';
    });
}

function crearBotonesPaginacion(actual, total) {
  const paginacion = document.getElementById('paginacion');
  paginacion.innerHTML = '';

  if (actual > 1) {
    const btnAnterior = document.createElement('button');
    btnAnterior.textContent = 'Anterior';
    btnAnterior.onclick = () => {
      paginaActual--;
      cargarNoticias(paginaActual);
    };
    paginacion.appendChild(btnAnterior);
  }

  if (actual < total) {
    const btnSiguiente = document.createElement('button');
    btnSiguiente.textContent = 'Siguiente';
    btnSiguiente.onclick = () => {
      paginaActual++;
      cargarNoticias(paginaActual);
    };
    paginacion.appendChild(btnSiguiente);
  }
}

cargarNoticias(); // Cargar la primera página


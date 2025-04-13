let paginaActual = 1;
  const noticiasPorPagina = 20;

  function cargarNoticias(pagina = 1) {
    fetch(`https://deultimominuto.net/wp-json/wp/v2/posts?per_page=${noticiasPorPagina}&page=${pagina}`)
      .then(res => {
        if (!res.ok) throw new Error('No se pudieron obtener las noticias.');
        const totalPaginas = parseInt(res.headers.get('X-WP-TotalPages'));
        crearPaginacionCompacta(pagina, totalPaginas);
        return res.json();
      })
      .then(data => {
        const container = document.getElementById('noticias');
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
      })
      .catch(err => {
        console.error('Error al cargar las noticias:', err);
        document.getElementById('noticias').innerHTML = '<p>No se pudieron cargar las noticias.</p>';
      });
  }

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

  cargarNoticias();


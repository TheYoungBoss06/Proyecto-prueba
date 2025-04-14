document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    const resultadosBusqueda = document.getElementById('resultadosBusqueda');
    const verMasBtn = document.getElementById('verMasBtn');
    
    let todasLasNoticias = [];
    let noticiasMostradas = 0;
    const resultadosPorPagina = 5;
  
    // Obtener las noticias desde la API
    const obtenerNoticias = async () => {
      try {
        const response = await fetch('https://deultimominuto.net/wp-json/wp/v2/posts?per_page=100&page=1');
        const data = await response.json();
        todasLasNoticias = data;
        buscarNoticias('');
      } catch (error) {
        console.error("Error al obtener noticias:", error);
      }
    };
  
    // Filtrar las noticias por el texto ingresado
    const buscarNoticias = (query) => {
      if (!query) {
        resultadosBusqueda.innerHTML = '';
        noticiasMostradas = 0;
      }
  
      const resultadosFiltrados = todasLasNoticias.filter(noticia =>
        noticia.title.rendered.toLowerCase().includes(query.toLowerCase())
      );
  
      mostrarResultados(resultadosFiltrados);
    };
  
    // Función para mostrar los resultados de búsqueda
    const mostrarResultados = (resultados) => {
      if (resultados.length === 0) {
        resultadosBusqueda.innerHTML = '<p>No se encontraron resultados.</p>';
        return;
      }
  
      let resultadosAmostrar = resultados.slice(noticiasMostradas, noticiasMostradas + resultadosPorPagina);
      resultadosAmostrar.forEach(noticia => {
        const resultado = document.createElement('div');
        resultado.className = 'resultado-busqueda';
        
        const imagen = noticia.jetpack_featured_media_url;
        const enlace = `noticia.html?id=${noticia.id}`;
        const titulo = noticia.title.rendered;
        
        resultado.innerHTML = `
          <a href="${enlace}">
            <img src="${imagen}" alt="Imagen de la noticia">
            <div class="contenido">
              <h3>${titulo}</h3>
            </div>
          </a>
        `;
        
        resultadosBusqueda.appendChild(resultado);
      });
  
      noticiasMostradas += resultadosAmostrar.length;
  
      if (noticiasMostradas < resultados.length) {
        verMasBtn.style.display = 'block';
        verMasBtn.onclick = function() {
          // Redirigir a la página de resultados con la búsqueda
          const query = searchInput.value.trim();
          window.location.href = `resultadosBusqueda.html?q=${encodeURIComponent(query)}`;
        };
      } else {
        verMasBtn.style.display = 'none';
      }
    };
  
    // Evento de búsqueda
    searchInput.addEventListener('input', function () {
      buscarNoticias(searchInput.value.trim());
    });
  
    // Cargar noticias al inicio
    obtenerNoticias();
  });
  
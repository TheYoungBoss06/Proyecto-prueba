fetch('https://deultimominuto.net/wp-json/wp/v2/posts')
.then(res => res.json())
.then(data => {
  const container = document.getElementById('noticias');

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
.catch(err => console.error('Error al cargar las noticias:', err));
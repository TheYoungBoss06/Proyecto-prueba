const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const obtenerNoticias = async () => {
    try {
        const response = await fetch('https://deultimominuto.net/wp-json/wp/v2/posts');
        return await response.json();
    } catch (error) {
        console.error("Error al obtener noticias:", error);
        return [];
    }
};

const cargarNoticia = async (id) => {
    // Revisamos si los detalles de la noticia ya están guardados en localStorage
    const noticiaGuardada = localStorage.getItem(`noticia_${id}`);
    
    if (noticiaGuardada) {
        // Si la noticia está en localStorage, la mostramos directamente
        const noticia = JSON.parse(noticiaGuardada);
        mostrarNoticia(noticia);
    } else {
        // Si no está en localStorage, la obtenemos de la API
        const noticias = await obtenerNoticias();
        
        // Verificamos que haya al menos una noticia para recomendar
        const recomendacion = noticias.length > 0 ? noticias[Math.floor(Math.random() * noticias.length)] : null;

        try {
            const response = await fetch(`https://deultimominuto.net/wp-json/wp/v2/posts/${id}`);
            const data = await response.json();

            // Guardamos los detalles de la noticia en localStorage
            localStorage.setItem(`noticia_${id}`, JSON.stringify(data));

            mostrarNoticia(data, recomendacion);

        } catch (error) {
            document.getElementById("detalle").innerHTML = "<p>Error al cargar la noticia.</p>";
            console.error(error);
        }
    }
};

// Función para mostrar la noticia
const mostrarNoticia = (data, recomendacion) => {
    const contenedor = document.getElementById("detalle");
    const titulo = data.title.rendered;
    const fecha = new Date(data.date).toLocaleDateString("es-DO", {
        year: "numeric", month: "long", day: "numeric"
    });
    const imagen = data.jetpack_featured_media_url;
    let contenido = data.content.rendered;

    // Si existe recomendación, reemplazamos el bloque "Te puede interesar"
    if (recomendacion) {
        const bloqueTePuedeInteresar = /<p[^>]*?>.*?Te puede interesa(?:r|<\/strong>r).*?<\/a>\s*<\/p>/gi;
        const nuevoBloque = `<p class="recomendacion"><strong>Te puede interesar:</strong> <a href="noticia.html?id=${recomendacion.id}">${recomendacion.title.rendered}</a></p>`;
        contenido = contenido.replace(bloqueTePuedeInteresar, nuevoBloque);
    }

    // Elimina los links de deultimominuto.net dejando solo el texto
    contenido = contenido.replace(/<a[^>]+href="https:\/\/deultimominuto\.net[^"]*"[^>]*>(.*?)<\/a>/gi, '$1');

    // Eliminar "Leer más:"
    const bloqueLeerMas = /<h3[^>]*?>\s*<strong>\s*Leer más:\s*<a[^>]*?>.*?<\/a>\s*<\/strong>\s*<\/h3>/gi;
    contenido = contenido.replace(bloqueLeerMas, '');
    
    contenedor.innerHTML = `
                <h1>${titulo}</h1>
                <p class="fecha">📅 ${fecha}</p>
                <img src="${imagen}" alt="Imagen de la noticia" class="noticia-img" />
                <div class="contenido-noticia">${contenido}</div>
                <a href="index.html" class="btn-volver">← Volver a noticias</a>
            `;
};

if (id) {
    cargarNoticia(id);
} else {
    document.getElementById("detalle").innerHTML = "<p>No se especificó una noticia.</p>";
}

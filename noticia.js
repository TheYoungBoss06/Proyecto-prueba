const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const obtenerNoticias = async () => {
    try {
        const response = await fetch('https://deultimominuto.net/wp-json/wp/v2/posts?per_page=100');
        return await response.json();
    } catch (error) {
        console.error("Error al obtener noticias:", error);
        return [];
    }
};

const cargarNoticia = async (id) => {
    const noticias = await obtenerNoticias();
    const recomendacion = noticias[Math.floor(Math.random() * noticias.length)];

    try {
        const response = await fetch(`https://deultimominuto.net/wp-json/wp/v2/posts/${id}`);
        const data = await response.json();

        const contenedor = document.getElementById("detalle");
        const titulo = data.title.rendered;
        const fecha = new Date(data.date).toLocaleDateString("es-DO", {
            year: "numeric", month: "long", day: "numeric"
        });
        const imagen = data.jetpack_featured_media_url;
        let contenido = data.content.rendered;

        // Reemplazar el bloque original por una nueva recomendación
        const bloqueTePuedeInteresar = /<p[^>]*?>.*?Te puede interesa(?:r|<\/strong>r).*?<\/a>\s*<\/p>/gi;
        const nuevoBloque = `<p class="recomendacion"><strong>Te puede interesar:</strong> <a href="noticia.html?id=${recomendacion.id}">${recomendacion.title.rendered}</a></p>`;
        contenido = contenido.replace(bloqueTePuedeInteresar, nuevoBloque);

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

    } catch (error) {
        document.getElementById("detalle").innerHTML = "<p>Error al cargar la noticia.</p>";
        console.error(error);
    }
};

if (id) {
    cargarNoticia(id);
} else {
    document.getElementById("detalle").innerHTML = "<p>No se especificó una noticia.</p>";
}
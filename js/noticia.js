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
    const noticiaGuardada = localStorage.getItem(`noticia_${id}`);
    
    if (noticiaGuardada) {
        const noticia = JSON.parse(noticiaGuardada);
        mostrarNoticia(noticia);
    } else {
        const noticias = await obtenerNoticias();
        const recomendacion = noticias.length > 0 ? noticias[Math.floor(Math.random() * noticias.length)] : null;

        try {
            const response = await fetch(`https://deultimominuto.net/wp-json/wp/v2/posts/${id}`);
            const data = await response.json();

            localStorage.setItem(`noticia_${id}`, JSON.stringify(data));
            mostrarNoticia(data, recomendacion);
        } catch (error) {
            document.getElementById("detalle").innerHTML = "<p>Error al cargar la noticia.</p>";
            console.error(error);
        }
    }
};

const mostrarNoticia = (data, recomendacion) => {
    const contenedor = document.getElementById("detalle");
    const titulo = data.title.rendered;
    const fecha = new Date(data.date).toLocaleDateString("es-DO", {
        year: "numeric", month: "long", day: "numeric"
    });
    const imagen = data.jetpack_featured_media_url;
    let contenido = data.content.rendered;

    if (recomendacion) {
        const bloqueTePuedeInteresar = /<p[^>]*?>.*?Te puede interesa(?:r|<\/strong>r).*?<\/a>\s*<\/p>/gi;
        const nuevoBloque = `<p class="recomendacion"><strong>Te puede interesar:</strong> <a href="noticia.html?id=${recomendacion.id}">${recomendacion.title.rendered}</a></p>`;
        contenido = contenido.replace(bloqueTePuedeInteresar, nuevoBloque);
    }

    contenido = contenido.replace(/<a[^>]+href="https:\/\/deultimominuto\.net[^"]*"[^>]*>(.*?)<\/a>/gi, '$1');

    const bloqueLeerMas = /<h3[^>]*?>\s*<strong>\s*Leer más:\s*<a[^>]*?>.*?<\/a>\s*<\/strong>\s*<\/h3>/gi;
    contenido = contenido.replace(bloqueLeerMas, '');

    contenedor.innerHTML = `
        <h1>${titulo}</h1>
        <p class="fecha">📅 ${fecha}</p>
        <img src="${imagen}" alt="Imagen de la noticia" class="noticia-img" />
        <div class="contenido-noticia">${contenido}</div>
        <a href="../index.html" class="btn-volver">← Volver a noticias</a>
    `;

    actualizarMetasSociales({
        titulo,
        descripcion: contenido.replace(/<[^>]+>/g, '').substring(0, 150) + "...",
        imagen,
        url: window.location.href
    });
};

// Agrega las etiquetas meta dinámicamente
function actualizarMetasSociales({ titulo, descripcion, imagen, url }) {
    const metas = [
        { property: "og:title", content: titulo },
        { property: "og:description", content: descripcion },
        { property: "og:image", content: imagen },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: titulo },
        { name: "twitter:description", content: descripcion },
        { name: "twitter:image", content: imagen }
    ];

    metas.forEach(({ property, name, content }) => {
        const meta = document.createElement("meta");
        if (property) meta.setAttribute("property", property);
        if (name) meta.setAttribute("name", name);
        meta.setAttribute("content", content);
        document.head.appendChild(meta);
    });

    document.title = titulo;
}

if (id) {
    cargarNoticia(id);
} else {
    document.getElementById("detalle").innerHTML = "<p>No se especificó una noticia.</p>";
}

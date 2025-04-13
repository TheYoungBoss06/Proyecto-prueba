document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const nombre = decodeURIComponent(params.get("nombre"));
    const fechaParam = params.get("fecha");
  
    const fechaSpan = document.getElementById("fecha");
    const resultadoDiv = document.getElementById("resultado");
    const fechaInput = document.getElementById("fechaInput");
  
    document.getElementById("titulo").textContent = `${nombre}`;
    fechaInput.value = fechaParam;
    fechaSpan.textContent = `📅 Fecha: ${fechaParam}`;
  
    function cargarNumerosCalientes(fecha) {
      const apiURL = `https://api3.bolillerobingoonlinegratis.com/api/predicciones?loteria_id=${id}&fecha=${fecha}`;
      fetch(apiURL)
        .then(res => res.json())
        .then(data => {
          const predicciones = data.prediccion;
          const prediccionSeleccionada = predicciones.find(p => p.loteria_id == id);
  
          if (prediccionSeleccionada) {
            const numeros = prediccionSeleccionada.numeros.split('-');
            let html = `<h2>Números Calientes</h2><div class='premios'>`;
            numeros.forEach(num => {
              html += `<div class="bola">${num}</div>`;
            });
            html += `</div>`;
            resultadoDiv.innerHTML = html;
            fechaSpan.textContent = `📅 Fecha: ${fecha}`;
          } else {
            resultadoDiv.innerHTML = `<p style="color:red;">No se encontraron predicciones para esta fecha.</p>`;
            fechaSpan.textContent = `📅 Fecha: ${fecha}`;
          }
        })
        .catch(err => {
          console.error('Error al obtener los datos:', err);
          resultadoDiv.textContent = "Error al cargar los resultados.";
        });
    }
  
    cargarNumerosCalientes(fechaParam);
  
    fechaInput.addEventListener('change', () => {
      const nuevaFecha = fechaInput.value;
      if (nuevaFecha) {
        cargarNumerosCalientes(nuevaFecha);
      }
    });
  });

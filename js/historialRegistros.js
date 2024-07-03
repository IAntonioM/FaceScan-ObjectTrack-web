document.addEventListener('DOMContentLoaded', function() {
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  const spinnerObjeto = document.querySelector('.spinner-box');
  const registrosContainer = document.querySelector('.row');
  let searchText = '';

  init();

  function init() {
    searchBtn.addEventListener('click', buscarRegistros);
  }

  function buscarRegistros() {
    searchText = searchInput.value;
    consultarRegistrosPertenencias(searchText);
  }

  consultarRegistrosPertenencias(searchText);

  function consultarRegistrosPertenencias(searchText) {
    mostrarSpinner(true);
    const formData = crearDataFormulario({ datosEstudiante: searchText });
    console.log("peticion data");
    fetch(API_URL + '/pertenencia/consultar-pertenencias-estudiante-busqueda', {
      method: 'POST',
      headers: createHeaders(),
      body: formData
    })
    .then(data => handleResponse(data))
    .then(data => {     
      mostrarDatosDeRegistro(data);
      mostrarSpinner(false);
    })
    .catch(error => {
      console.error('Error al enviar los datos:', error);
      mostrarSpinner(false);
    });
  }

  function crearDataFormulario(data) {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    return formData;
  }

  function createHeaders() {
    return {
      'Authorization': 'Bearer ' + getCookie('jwt')
    };
  }

  function handleResponse(response) {
    handleUnauthorized(response);
    if (response.status === 404) {
      return response.json().then(data => {
        mostrarConsultaVacia(data);
        throw new Error(data.error || 'No hay pertenencias registradas');
      });
    }
    if (!response.ok) {
      throw new Error('Error en la solicitud');
    }
    return response.json();
  }

  function mostrarConsultaVacia(data){
    const mensaje = data.error;
    registrosContainer.innerHTML = ''; // Limpia el contenido anterior
    const noResultsMessage = document.createElement('div');
    noResultsMessage.textContent = mensaje;
    noResultsMessage.classList.add('text-center', 'text-muted', 'my-5');
    registrosContainer.appendChild(noResultsMessage);
  }

  function mostrarDatosDeRegistro(data) {
    const pertenencias = data.pertenencias || [];
    registrosContainer.innerHTML = '';
    if (pertenencias.length === 0) {
      mostrarConsultaVacia({ error: 'No se encontraron resultados' });
    } else {
      pertenencias.forEach(registro => {
        registrosContainer.innerHTML += `
      <div class="col mb-4">
        <div class="card h-100 registro-item">
          <img src="${registro.imagen_pertenencia}" alt="${registro.nombre_objeto}" class="card-img-top" loading="lazy">
          <div class="card-body">
            <h5 class="card-title">Estudiante: ${registro.nombres_estudiante}</h5>
            <p class="card-text">
              Código Pertenencia: ${registro.codigo_pertenencia}<br>
              Objeto: <span class="objeto">${registro.nombre_objeto}</span><br>
              Carrera Estudiante: ${registro.carrera_estudiante}<br>
              Plan Estudiante: ${registro.plan_estudiante}
            </p>
          </div>
          <div class="card-footer">
            <small class="text-muted">Datos de la Ultima Actividad</small><br>
            ${crearFooterSpan('Estado', registro.nombre_estado)}
            <br>
            ${crearFooterSpan('Fecha', convertirFechaTexto(registro.hora_ultima_actividad,
                { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))}
            <br>
            ${crearFooterSpan('Hora', convertirFechaTexto(registro.hora_ultima_actividad,
                { hour: 'numeric', minute: 'numeric', second: 'numeric' }))}
          </div>
        </div>
      </div>`
      });
    }
  }

  function crearFooterSpan(label, value) {
    let estadoClass = '';
    switch(value) {
      case 'Salida':
        estadoClass = 'estado-salida';
        break;
      case 'Extraviada':
        estadoClass = 'estado-extraviada';
        break;
      case 'Ingresada':
        estadoClass = 'estado-ingresada';
        break;
    }

    return `<small class="text-muted">${label}: <span class="${label.toLowerCase()} ${estadoClass}">${value}</span></small>`;
  }

  function convertirFechaTexto(fecha, opciones) {
    const fechaHora = convertirFecha(fecha);
    return fechaHora.toLocaleString('es-ES', opciones);
  }

  function convertirFecha(fecha) {
    const [datePart, timePart] = fecha.split('_');
    const [year, month, day] = datePart.split('-');
    const [hour, minute, second] = timePart.split('-');
    return new Date(year, month - 1, day, hour, minute, second);
  }

  function mostrarSpinner(show) {
    spinnerObjeto.style.display = show ? 'flex' : 'none';
  }
});


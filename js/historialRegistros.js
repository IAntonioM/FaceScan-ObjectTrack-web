document.addEventListener('DOMContentLoaded', function() {
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  const spinnerObjeto = document.querySelector('.spinner-box');
  const registrosContainer = document.querySelector('.row');
  let searchText = '';

  init();

  function init() {
    consultarRegistrosPertenencias(searchText);
    searchBtn.addEventListener('click', buscarRegistros);
  }

  function buscarRegistros() {
    searchText = searchInput.value;
    consultarRegistrosPertenencias(searchText);
  }

  function consultarRegistrosPertenencias(searchText) {
    mostrarSpinner(true);
    const formData = crearDataFormulario({ datosEstudiante: searchText });
    console.log("peticion data");
    fetch(API_URL + '/pertenencia/consultar-pertenencias-estudiante-busqueda', {
      method: 'POST',
      headers: createHeaders(),
      body: formData
    })
    .then(data => {
      return handleResponse(data);
    })
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
    console.log(data.pertenencias);
    const pertenencias = data.pertenencias || [];
    registrosContainer.innerHTML = ''; // Limpiar contenido anterior

    if (pertenencias.length === 0) {
      mostrarConsultaVacia({ error: 'No se encontraron resultados' });
    } else {
      pertenencias.forEach(registro => {
        const card = createRegistroCard(registro);
        registrosContainer.appendChild(card);
      });
    }
  }

  function createRegistroCard(registro) {
    const col = document.createElement('div');
    col.classList.add('col', 'mb-4');

    const card = document.createElement('div');
    card.classList.add('card', 'h-100', 'registro-item');

    const img = document.createElement('img');
    img.src = registro.imagen_pertenencia;
    img.alt = registro.nombre_objeto;
    img.classList.add('card-img-top');
    img.loading = 'lazy'; 

    const cardBody = createCardBody(registro);
    const cardFooter = createCardFooter(registro);

    card.appendChild(img);
    card.appendChild(cardBody);
    card.appendChild(cardFooter);

    col.appendChild(card);
    return col;
  }

  function createCardBody(registro) {
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    const cardTitle = document.createElement('h5');
    cardTitle.classList.add('card-title');
    cardTitle.textContent = `Estudiante: ${registro.nombres_estudiante}`;

    const cardText = document.createElement('p');
    cardText.classList.add('card-text');
    cardText.innerHTML = `
      Código Pertenencia: ${registro.codigo_pertenencia}<br>
      Objeto: <span class="objeto">${registro.nombre_objeto}</span><br>
      Carrera Estudiante: ${registro.carrera_estudiante}<br>
      Plan Estudiante: ${registro.plan_estudiante}
    `;

    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);

    return cardBody;
  }

  function createCardFooter(registro) {
    const cardFooter = document.createElement('div');
    cardFooter.classList.add('card-footer');
    const UltimaActividad = createFooterSpan('Datos', " De la Ultima Actividad");
    const estadoSpan = createFooterSpan('Estado', registro.nombre_estado);
    const fechaSpan = createFooterSpan('Fecha', convertirFechaTexto(registro.hora_ultima_actividad, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    const horaSpan = createFooterSpan('Hora', convertirFechaTexto(registro.hora_ultima_actividad, { hour: 'numeric', minute: 'numeric', second: 'numeric' }));
    cardFooter.appendChild(UltimaActividad)
    cardFooter.appendChild(document.createElement('br'));
    cardFooter.appendChild(estadoSpan);
    cardFooter.appendChild(document.createElement('br'));
    cardFooter.appendChild(fechaSpan);
    cardFooter.appendChild(document.createElement('br'));
    cardFooter.appendChild(horaSpan);

    return cardFooter;
  }

  function createFooterSpan(label, value) {
    const span = document.createElement('small');
    span.classList.add('text-muted');

    // Asigna una clase basada en el estado
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

    span.innerHTML = `${label}: <span class="${label.toLowerCase()} ${estadoClass}">${value}</span>`;
    return span;
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


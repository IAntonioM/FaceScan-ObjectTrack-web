document.addEventListener('DOMContentLoaded', function() {
  const consultaInfo = document.querySelector('.consulta-info');
  const registroResult = document.querySelector('.registro-result');
  const registrarSalidaBtn = document.getElementById('registrarSalidaBtn');
  const resultDiv = document.getElementById('result');
  const containerResult = document.getElementById('container-result');
  const spinnerObjeto = document.querySelector('.spinner-box');
  let dataPertenencia = { estudiante: null, objetos: [] };

  init();

  function init() {
      validTokenSession();
      if (!dataPertenencia.estudiante) {
          window.open('identificar-estudiante.html', '_blank');
      }
      registrarSalidaBtn.addEventListener('click', registrarSalida);
      window.addEventListener('message', handleMessage);
  }

  function handleMessage(event) {
      if (event.data.type === 'EstudianteData') {
          dataPertenencia.estudiante = event.data.payload;
          consultarPertenencias(dataPertenencia);
      }
  }

  function consultarPertenencias(dataPertenencia) {
      mostrarSpinner(true);
      const formData = new FormData();
      formData.append('idEstudiante', dataPertenencia.estudiante.id);
      formData.append('idEstado', '1');

      fetchPertenencias(formData)
          .then(data => {
              containerResult.style.display = 'block';
              mostrarInfoEstudiante(data);
              actualizarVistaPertenencias(data);
          })
          .catch(error => {
            mostrarInfoEstudiante(dataPertenencia); 
            mostrarIconoResultado(false, error.message)
          });
  }

  function fetchPertenencias(formData) {
      return fetch(API_URL + '/pertenencia/consultar-pertenencia', {
          method: 'POST',
          headers: {
              'Authorization': 'Bearer ' + getCookie('jwt'),
          },
          body: formData
      })
          .then(handleResponse)
          .then(response => response.json());
  }

  function registrarSalida() {
      containerResult.style.display = 'none';
      const idRegistros = dataPertenencia.objetos.map(objeto => objeto.idPertenencia);

      fetch(API_URL + '/pertenencia/registrar-salida-pertenencia', {
          method: 'POST',
          headers: {
              'Authorization': 'Bearer ' + getCookie('jwt'),
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(idRegistros)
      })
          .then(handleResponse)
          .then(data => mostrarIconoResultado(true, 'Registrado correctamente, salida de pertenencias '))
          .catch(error => mostrarIconoResultado(false, 'Error al registrar la salida de pertenencias'));
  }

  function handleResponse(response) {
      mostrarSpinner(false);
      if (response.status === 401) {
          handleUnauthorized(response);
      }
      if (response.status === 404) {
          return response.json().then(data => {
            mostrarIconoResultado(false, 'No hay pertenencias registradas del estudiante');
              throw new Error('No hay pertenencias registradas del estudiante');
          });
      }
      if (!response.ok) {
          throw new Error('Error en la solicitud');
      }
      return response;
  }

  function actualizarVistaPertenencias(data) {
      const pertenenciasContainer = document.getElementById('pertenencias-container');
      pertenenciasContainer.innerHTML = '';

      data.pertenencias.forEach(pertenencia => {
          const pertenenciaDiv = crearPertenenciaDiv(pertenencia);
          pertenenciasContainer.appendChild(pertenenciaDiv);
      });
  }
  function mostrarInfoEstudiante(data) {
    dataPertenencia.objetos = data.pertenencias;
    consultaInfo.innerHTML = `
        <div class="info-row">
            <div class="info-label">Código Estudiante: </div>
            <div class="info-value">${dataPertenencia.estudiante.codigo}</div>
        </div>
        <div class="info-row">
            <div class="info-label">Estudiante: </div>
            <div class="info-value">${dataPertenencia.estudiante.nombre}</div>
        </div>`;

}
  function crearPertenenciaDiv(pertenencia) {
      const pertenenciaDiv = document.createElement('div');
      pertenenciaDiv.classList.add('pertenencia');

      const imgElement = document.createElement('img');
      imgElement.src = pertenencia.ImagenPertenencia;
      imgElement.alt = 'Imagen de la Pertenencia';
      imgElement.classList.add('pertenencia-img');

      const pertenenciaInfo = document.createElement('div');
      pertenenciaInfo.classList.add('pertenencia-info');

      const nombreObjeto = document.createElement('h4');
      nombreObjeto.textContent = pertenencia.nombreObjeto;

      const fechaElement = document.createElement('p');
      const horaElement = document.createElement('p');

      const fechaHora = convertirFecha(pertenencia.Fecha);
      fechaElement.textContent = `Fecha: ${fechaHora.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
      horaElement.textContent = `Hora: ${fechaHora.toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', second: 'numeric' })}`;

      pertenenciaInfo.appendChild(nombreObjeto);
      pertenenciaInfo.appendChild(fechaElement);
      pertenenciaInfo.appendChild(horaElement);

      pertenenciaDiv.appendChild(imgElement);
      pertenenciaDiv.appendChild(pertenenciaInfo);

      return pertenenciaDiv;
  }

  function mostrarIconoResultado(exito, mensaje) {
      registroResult.style.display = 'block';
      const responseMessage = registroResult.querySelector('.response-message');
      const successIcon = registroResult.querySelector('.success-icon');
      const errorIcon = registroResult.querySelector('.error-icon');
      responseMessage.textContent = mensaje;

      if (exito) {
          successIcon.style.display = 'block';
          errorIcon.style.display = 'none';
      } else {
          successIcon.style.display = 'none';
          errorIcon.style.display = 'block';
      }
  }

  function mostrarSpinner(mostrar) {
      spinnerObjeto.style.display = mostrar ? 'flex' : 'none';
  }
});

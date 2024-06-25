
document.addEventListener('DOMContentLoaded', function() {
  validTokenSession();

  const elements = {
    videoElement: document.getElementById('videoElement'),
    searchEstudianteBtn: document.getElementById('searchEstudianteBtn'),
    retryBtn: document.getElementById('retryBtn'),
    canvas: document.getElementById('canvas'),
    resultadoEstudiante: document.getElementById('resultadoEstudiante'),
    nextBtn: document.getElementById('nextBtn'),
    spinnerObjeto: document.getElementsByClassName('spinner-box')[0],
    toggleCameraButton: document.getElementById('toggleCameraButton'),
    barraProgreso: document.getElementById('barra-progreso'),
    porcentajeProgreso: document.getElementById('porcentaje-progreso'),
    mensajeProgreso: document.getElementById('mensaje-progreso'),
  };

  let isFrontCamera = true, datosEstudiante = null, stream;
  const umbralSimilitud = 20, maxIntentos = 40, minCoincidencias = 4;

  initCameraAccess(elements.videoElement, isFrontCamera);

  elements.searchEstudianteBtn.addEventListener('click', iniciarReconocimientoFacial);
  elements.retryBtn.addEventListener('click', reiniciarBusqueda);
  elements.nextBtn.addEventListener('click', enviarDatosYCerrar);
  elements.toggleCameraButton.addEventListener('click', alternarCamara);

  function initCameraAccess(videoElement, isFrontCamera) {
    const facingMode = isFrontCamera ? 'user' : 'environment';
    navigator.mediaDevices.getUserMedia({ video: { facingMode } })
      .then(cameraStream => {
        stream = cameraStream;
        videoElement.srcObject = cameraStream;
      })
      .catch(handleError);
  }

  function alternarCamara() {
    if (stream) stream.getTracks().forEach(track => track.stop());
    isFrontCamera = !isFrontCamera;
    initCameraAccess(elements.videoElement, isFrontCamera);
  }

  function capturarImagen(videoElement, canvas) {
    const context = canvas.getContext('2d');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    canvas.style.display = 'none';
    return canvas.toDataURL("image/jpeg");
  }

  function iniciarReconocimientoFacial() {
    elements.videoElement.style.display = 'block';
    elements.canvas.style.display = 'none';
    elements.searchEstudianteBtn.style.display = 'none';
    realizarReconocimientoFacial();
  }

  function realizarReconocimientoFacial() {
    let intentos = 0, coincidencias = [];

    function enviarFoto() {
      if (intentos < maxIntentos) {
        const imagenURI = capturarImagen(elements.videoElement, elements.canvas);
        const file = dataURItoFile(imagenURI, 'photo.jpg');
        const formData = new FormData();
        formData.append('file', file);
        mostrarSpinner(true);

        fetch(API_URL + '/estudiante/reconocimiento-facial', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + getCookie('jwt') },
          body: formData
        })
        .then(response => response.ok ? response.json() : Promise.reject('Error en la solicitud'))
        .then(data => {
          if (data && data.Similitud >= umbralSimilitud) {
            const coincidencia = coincidencias.find(obj => obj.idEstudiante === data.idEstudiante);
            if (coincidencia) {
              coincidencia.numCoincidencia++;
            } else {
              data.numCoincidencia = 1;
              coincidencias.push(data);
            }
            actualizarBarraProgreso(coincidencias, minCoincidencias);
            if (coincidencias.some(obj => obj.numCoincidencia >= minCoincidencias)) {
              mostrarResultadoEstudiante(coincidencias);
              return;
            }
          }
          intentos++;
          enviarFoto();
        })
        .catch(handleError)
        .finally(() => mostrarSpinner(false));
      } else {
        mostrarMensajeEstudianteNoEncontrado();
      }
    }

    enviarFoto();
  }

  function actualizarBarraProgreso(coincidencias, minCoincidencias) {
    const maxCoincidencias = Math.max(...coincidencias.map(obj => obj.numCoincidencia));
    const porcentajeActual = (maxCoincidencias / minCoincidencias) * 100;
    elements.barraProgreso.style.width = `${porcentajeActual}%`;
    elements.porcentajeProgreso.textContent = `${Math.round(porcentajeActual)}%`;
    elements.mensajeProgreso.textContent = maxCoincidencias < minCoincidencias / 2 
      ? 'Intento de reconocimiento en curso...' 
      : 'Ya casi hemos terminado';
  }

  function mostrarResultadoEstudiante(coincidencias) {
    const estudiante = coincidencias.find(obj => obj.numCoincidencia >= minCoincidencias);
    elements.mensajeProgreso.textContent = 'Identificación completada';
    elements.resultadoEstudiante.innerHTML = `
      Nombres: ${estudiante.Nombres || 'No disponible'}<br>
      Código: ${estudiante.codigoEstudiante || 'No disponible'}<br>
      Carrera: ${estudiante.Carrera || 'No disponible'}<br>
      Plan Estudiante: ${estudiante.PlanEstudiante || 'No disponible'}
    `;
    elements.resultadoEstudiante.style.display = 'block';
    elements.nextBtn.style.display = 'inline-block';
    elements.retryBtn.style.display = 'inline-block';
    datosEstudiante = {
      type: 'EstudianteData',
      payload: {
        id: estudiante.idEstudiante || 'No disponible',
        nombre: estudiante.Nombres || 'No disponible',
        codigo: estudiante.codigoEstudiante || 'No disponible',
        carrera: estudiante.Carrera || 'No disponible',
        planEstudiante: estudiante.PlanEstudiante || 'No disponible',
        similitud: estudiante.Similitud || 'No disponible',
      }
    };
  }

  function mostrarMensajeEstudianteNoEncontrado() {
    elements.spinnerObjeto.style.display = 'none';
    elements.retryBtn.style.display = 'inline-block';
    elements.mensajeProgreso.textContent = 'No se pudo Identificar al Estudiante';
    elements.resultadoEstudiante.textContent = 'Estudiante no encontrado';
  }

  function reiniciarBusqueda() {
    elements.mensajeProgreso.textContent = 'Sin Resultados ...';
    elements.nextBtn.style.display = 'none';
    elements.videoElement.style.display = 'block';
    elements.canvas.style.display = 'none';
    elements.searchEstudianteBtn.style.display = 'inline-block';
    elements.retryBtn.style.display = 'none';
    elements.resultadoEstudiante.textContent = 'Esperando Busqueda ....';
    datosEstudiante = null;
    elements.barraProgreso.style.width = '0%';
    elements.porcentajeProgreso.textContent = '0%';
  }

  function mostrarSpinner(show) {
    elements.spinnerObjeto.style.display = show ? 'flex' : 'none';
  }

  function enviarDatosYCerrar() {
    if (datosEstudiante) {
      window.opener.postMessage(datosEstudiante, '*');
      window.close();
    }
  }

  function handleError(error) {
    console.error(error);
  }
});
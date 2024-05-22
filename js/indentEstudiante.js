document.addEventListener('DOMContentLoaded', function() {
  validTokenSession();
  // Código para identificar al estudiante
  const videoElement = document.getElementById('videoElement');
  const searchEstudianteBtn = document.getElementById('searchEstudianteBtn');
  const retryBtn = document.getElementById('retryBtn');
  const canvas = document.getElementById('canvas');
  const resultadoEstudiante = document.getElementById('resultadoEstudiante');
  const nextBtn = document.getElementById('nextBtn');
  const spinnerObjeto = document.getElementsByClassName('spinner-box')[0];
  const toggleCameraButton = document.getElementById('toggleCameraButton');
  const barraProgreso = document.getElementById('barra-progreso');
  const porcentajeProgreso = document.getElementById('porcentaje-progreso');
  const mensajeProgreso = document.getElementById('mensaje-progreso');
  const anchoBarraMax = barraProgreso.parentNode.offsetWidth;
  
  let datosEstudiante = null;
  let stream; // Variable para almacenar el stream de la cámara
  let isFrontCamera = true; // Variable para controlar la cámara frontal/posterior

  // Inicializar el acceso a las cámaras
  getCameraAccess(videoElement, isFrontCamera);

  function getCameraAccess(videoElement, facingMode = 'environment') {
    navigator.mediaDevices.getUserMedia({ video: { facingMode } })
      .then(cameraStream => {
        stream = cameraStream; // Almacenar el stream de la cámara
        videoElement.srcObject = cameraStream;
      })
      .catch(error => {
        console.error('Error al acceder a la cámara web:', error);
      });
  }

  // Función para alternar entre la cámara frontal y posterior
  function toggleCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop()); // Detener la transmisión actual
    }
    isFrontCamera = !isFrontCamera; // Cambiar el valor de isFrontCamera
    getCameraAccess(videoElement, isFrontCamera ? 'user' : 'environment'); // Obtener acceso a la nueva cámara
  }

  // Función para manejar el reconocimiento facial del estudiante
// Función para manejar el reconocimiento facial del estudiante
function reconocimientoFacialEstudiante() {
  const umbraldeSimilitud = 20; // 70% de similitud
  const maxIntentos = 40; // Límite de intentos
  const minCoincidencias = 4; // Número mínimo de coincidencias
  let intentos = 0;
  let estudianteEncontrado = false;
  let coincidencias = []; // Array para almacenar las coincidencias

  const enviarFoto = () => {
    const context = canvas.getContext('2d');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    canvas.style.display = 'block';

    if (intentos < maxIntentos) {
      const imagenURI = canvas.toDataURL("image/jpeg");
      const file = dataURItoFile(imagenURI, 'photo.jpg');
      const formData = new FormData();
      formData.append('file', file);
      fetch(API_URL + '/estudiante/reconocimiento-facial', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + getCookie('jwt'),
        },
        body: formData
      })
      .then(response => {
        spinnerObjeto.style.display = 'flex';
        handleUnauthorized(response);
        if (response.status === 404) {
          intentos++;
          enviarFoto();
        } else if (response.ok) {
          spinnerObjeto.style.display = 'none';
          return response.json();
        }
      })
      .then(data => {
        if (data) {
          const similitud = data.Similitud || 0;
          if (similitud >= umbraldeSimilitud) {
            coincidencias=agregarCoincidencia(coincidencias, data);

            // Buscar la coincidencia con el mayor número de coincidencias
            const coincidenciaMaxima = coincidencias.reduce((max, obj) => {
              return obj.numCoincidencia > (max.numCoincidencia || 0) ? obj : max;
            }, {});
        
            const maxCoincidencias = coincidenciaMaxima.numCoincidencia || 0;
            const porcentajeActual = (maxCoincidencias / minCoincidencias) * 100;
            barraProgreso.style.width = `${(porcentajeActual / 100) * anchoBarraMax}px`;
            porcentajeProgreso.textContent = `${Math.round(porcentajeActual)}%`;
        
            if (maxCoincidencias < minCoincidencias / 2) {
              mensajeProgreso.textContent = 'Intento de reconocimiento en curso...';
            } else if (maxCoincidencias >= minCoincidencias / 2 && maxCoincidencias < minCoincidencias) {
              mensajeProgreso.textContent = 'Ya casi hemos terminado';
            }
          } else {
            console.log(data, 'no supera el umbral del 50%');
          }

          if (buscarCoincidenciaCantidad(coincidencias,minCoincidencias)) {
            estudianteEncontrado = true;
            barraProgreso.style.width = `${anchoBarraMax}px`;
            porcentajeProgreso.textContent = '100%';
            mensajeProgreso.textContent = 'Identificación completada';
            const ultimaCoincidencia = buscarCoincidenciaCantidad(coincidencias,minCoincidencias);
            const id = ultimaCoincidencia.idEstudiante || 'No disponible';
            const nombres = ultimaCoincidencia.Nombres || 'No disponible';
            const codigoEstudiante = ultimaCoincidencia.codigoEstudiante || 'No disponible';
            const similitud = ultimaCoincidencia.Similitud || 'No disponible';
            const mensaje = `Nombres: ${nombres}<br>Código: ${codigoEstudiante}`;
            resultadoEstudiante.innerHTML = mensaje;
            resultadoEstudiante.display = 'block';
            nextBtn.style.display = 'inline-block';
            retryBtn.style.display = 'inline-block';
            // Enviar datos y redirigir al usuario
            datosEstudiante = {
              type: 'EstudianteData',
              payload: {
                id: id,
                nombre: nombres,
                codigo: codigoEstudiante,
                similitud: similitud,
              }
            };
            console.log(datosEstudiante);
          } else {
            intentos++;
            enviarFoto();
          }
        } else {
          resultadoEstudiante.innerHTML = 'Estudiante no encontrado';
        }
      })
      .catch(error => {
        console.error('Error al enviar los datos:', error);
      });
    } else {
      colocarEstudianteNoEncontrado(resultadoEstudiante);
      spinnerObjeto.style.display = 'none';
      retryBtn.style.display = 'inline-block';
      mensajeProgreso.textContent = 'No se puedo Identificar al Estudiante';
      console.log('Solicitud no conseguida');
    }
  };

  // Iniciar el envío de la primera foto
  enviarFoto();
}
function agregarCoincidencia(coincidencias, data) {
  let encontrado = false;

  for (let obj of coincidencias) {
    if (obj.idEstudiante === data.idEstudiante) {
      obj.numCoincidencia = (obj.numCoincidencia || 1) + 1;
      encontrado = true;
      break;
    }
  }

  if (!encontrado) {
    data.numCoincidencia = 1;
    coincidencias.push(data);
  }

  return coincidencias;
}
  // Función para mostrar el mensaje de estudiante no encontrado
  function colocarEstudianteNoEncontrado(resultadoEstudiante) {
    const mensaje = `Estudiante no encontrado`;
    resultadoEstudiante.innerHTML = mensaje;
  }
  // Eventos de botones
  searchEstudianteBtn.addEventListener('click', () => {
    videoElement.style.display = 'none';
    searchEstudianteBtn.style.display = 'none';
    reconocimientoFacialEstudiante();
  });

  retryBtn.addEventListener('click', () => {
    nextBtn.style.display = 'none';
    videoElement.style.display = 'block';
    canvas.style.display = 'none';
    searchEstudianteBtn.style.display = 'inline-block';
    retryBtn.style.display = 'none';
    resultadoEstudiante.innerHTML = 'Esperando Busqueda ....';
    datosEstudiante=null;
    barraProgreso.style.width = `0px`;
    porcentajeProgreso.textContent = '0%';
  });
  nextBtn.addEventListener('click',()=>{
    if (datosEstudiante) {
      window.opener.postMessage(datosEstudiante, '*');
      window.close(); // Opcionalmente, puedes cerrar la ventana después de enviar los datos
    }
  })
  toggleCameraButton.addEventListener('click', toggleCamera);
  
  function buscarCoincidenciaCantidad(coincidencias, numCoincidencia) {
    for (let obj of coincidencias) {
      if (obj.numCoincidencia === numCoincidencia) {
        return obj;
      }
    }
    return null;
  }
  

});
  
  
  
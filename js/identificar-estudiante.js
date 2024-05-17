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
  let datosEstudiante =null;
  let currentFacingMode = 'user'; // Inicializar currentFacingMode con 'user'
  let stream;

  // Inicializar el acceso a las cámaras
  function getCameraAccess(videoElement, facingMode = 'environment') {
    navigator.mediaDevices.getUserMedia({ video: { facingMode } })
      .then(mediaStream => {
        stream = mediaStream;
        videoElement.srcObject = mediaStream;
      })
      .catch(error => {
        console.error('Error al acceder a la cámara web:', error);
      });
  }

  // Evento para el botón de voltear la cámara
  document.getElementById('toggleCameraButton').addEventListener('click', function() {
    // Detener el flujo de video actual
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
    }

    // Cerrar la transmisión de la cámara actual
    if (videoElement.srcObject) {
      const tracks = videoElement.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoElement.srcObject = null;
    }

    // Cambiar la dirección de la cámara
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

    // Volver a obtener acceso a la cámara con la nueva dirección
    getCameraAccess(videoElement, currentFacingMode);
  });

  // Iniciar la cámara
  getCameraAccess(videoElement, currentFacingMode);

  // Función para manejar el reconocimiento facial del estudiante
  // ... (el resto del código sigue igual)

  // Evento para el botón de voltear la cámara
  document.getElementById('toggleCameraButton').addEventListener('click', function() {
    // Detener el flujo de video actual
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
    }

    // Cambiar la dirección de la cámara
    currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

    // Volver a obtener acceso a la cámara con la nueva dirección
    getCameraAccess(videoElement, currentFacingMode);
  });

  // Iniciar la cámara
  getCameraAccess(videoElement, currentFacingMode);

  // Función para manejar el reconocimiento facial del estudiante
  function reconocimientoFacialEstudiante() {
    const maxIntentos = 20;
    let intentos = 0;
    let estudianteEncontrado = false;

    const enviarFoto = () => {
      const context = canvas.getContext('2d');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      canvas.style.display = 'block';

      if (intentos < maxIntentos && !estudianteEncontrado) {
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
              spinnerObjeto.style.display='none';
              estudianteEncontrado = true;
              return response.json();
            }
          })
          .then(data => {
            if (data) {
              if(estudianteEncontrado){
                retryBtn.style.display='inline-block';
              }
              const id = data.idEstudiante || 'No disponible';
              const nombres = data.Nombres || 'No disponible';
              const codigoEstudiante = data.codigoEstudiante || 'No disponible';
              const mensaje = `Nombres: ${nombres}<br>Código: ${codigoEstudiante}`;
              resultadoEstudiante.innerHTML = mensaje;
              nextBtn.style.display = 'inline-block';
              // Enviar datos y redirigir al usuario
              datosEstudiante = {
                type: 'EstudianteData',
                payload: {
                  id: id,
                  nombre: nombres,
                  codigo: codigoEstudiante,
                }
              };
            } else {
              resultadoEstudiante.innerHTML = 'Estudiante no encontrado';
            }
          })
          .catch(error => {
            console.error('Error al enviar los datos:', error);
          });
      } else if (!estudianteEncontrado) {
        colocarEstudianteNoEncontrado(resultadoEstudiante);
        spinnerObjeto.style.display='none';
        retryBtn.style.display='inline-block';
      }
    };

    // Iniciar el envío de la primera foto
    enviarFoto();
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
  });
  nextBtn.addEventListener('click',()=>{
    if (datosEstudiante) {
      window.opener.postMessage(datosEstudiante, '*');
      window.close(); // Opcionalmente, puedes cerrar la ventana después de enviar los datos
    }
  })
});




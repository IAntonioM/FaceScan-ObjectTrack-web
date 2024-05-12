document.addEventListener('DOMContentLoaded', function() {
  validTokenSession();
  // Código para identificar al estudiante
  const videoElement = document.getElementById('videoElement');
  const searchEstudianteBtn = document.getElementById('searchEstudianteBtn');
  const retryBtn = document.getElementById('retryBtn');
  const canvas = document.getElementById('canvas');
  const resultadoEstudiante = document.getElementById('resultadoEstudiante');
  const nextBtn = document.getElementById('nextBtn');
  let datosEstudiante =null;
  // Inicializar el acceso a las cámaras
  getCameraAccess(videoElement);
  function getCameraAccess(videoElement, facingMode = 'user') {
    navigator.mediaDevices.getUserMedia({ video: { facingMode } })
      .then(stream => {
        videoElement.srcObject = stream;
      })
      .catch(error => {
        console.error('Error al acceder a la cámara web:', error);
      });
  }

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
        const imagenUrl = canvas.toDataURL("image/jpeg");
        const file = dataURItoFile(imagenUrl, 'photo.jpg');
        const formData = new FormData();
        formData.append('file', file);

        fetch(BASE_URL + '/estudiante/reconocimiento-facial', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + getCookie('jwt'),
          },
          body: formData
        })
          .then(response => {
            handleUnauthorized(response);
            if (response.status === 404) {
              intentos++;
              enviarFoto();
            } else if (response.ok) {
              nextBtn.style.display = 'inline-block';
              estudianteEncontrado = true;
              return response.json();
            }
          })
          .then(data => {
            if (data) {
              const nombres = data.Nombres || 'No disponible';
              const codigoEstudiante = data.codigoEstudiante || 'No disponible';
              const mensaje = `Nombres: ${nombres}<br>Código: ${codigoEstudiante}`;
              resultadoEstudiante.innerHTML = mensaje;

              // Enviar datos y redirigir al usuario
              datosEstudiante = {
                type: 'EstudianteData',
                payload: {
                  nombre: nombres,
                  codigo: codigoEstudiante
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
    retryBtn.style.display = 'inline-block';
    reconocimientoFacialEstudiante();
  });

  retryBtn.addEventListener('click', () => {
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




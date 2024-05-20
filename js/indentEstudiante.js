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
    function reconocimientoFacialEstudiante() {
      const umbraldeSimilitud = 0.7; // 70% de similitud
      const maxIntentos = 20; // Límite de intentos
      const minCoincidencias = 4; // Número mínimo de coincidencias
      let intentos = 0;
      let estudianteEncontrado = false;
      const coincidencias = []; // Array para almacenar las coincidencias
  
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
                const similitud = data.Similitud || 'No disponible';
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
                    similitud: similitud,
                  }
                };
                console.log(datosEstudiante)
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
    toggleCameraButton.addEventListener('click', toggleCamera);
  });
  
  
  
  
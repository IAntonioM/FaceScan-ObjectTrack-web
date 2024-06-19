document.addEventListener('DOMContentLoaded', function() {
  validTokenSession();
    const videoElementObjeto = document.getElementById('videoObjeto');
    const captureBtnObjeto = document.getElementById('captureBtnObjeto');
    const retryBtnObjeto = document.getElementById('retryBtnObjeto');
    const canvasObjeto = document.getElementById('canvasObjeto');
    const nextBtn = document.getElementById('nextBtn');
    const spinnerObjeto = document.getElementsByClassName('spinner-box')[0];
    let datosObjeto =null;
    // Obtener acceso a la cámara
  getCameraAccess(videoElementObjeto);

  function getCameraAccess(videoElement, facingMode = 'environment') {
    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode
      }
    })
    .then(stream => {
      videoElement.srcObject = stream;
    })
    .catch(error => {
      console.error('Error al acceder a la cámara web:', error);
    });
  }
    
    function reconocimientoDeObjetos() {
      spinnerObjeto.style.display = 'flex';
        const maxIntentos = 20;
        let intentos = 0;
        let objetoEncontrado = false;
      
        // Función para enviar la foto al servidor
        const enviarFoto = () => {
          const context = canvasObjeto.getContext('2d');
          canvasObjeto.width = videoElementObjeto.videoWidth;
          canvasObjeto.height = videoElementObjeto.videoHeight;
          context.drawImage(videoElementObjeto, 0, 0, canvasObjeto.width, canvasObjeto.height);
          canvasObjeto.style.display = 'none';
      
          const resultadoObjeto = document.getElementById('resultadoObjeto');
      
          if (intentos < maxIntentos && !objetoEncontrado) {
            const imagenUri = canvasObjeto.toDataURL("image/jpeg");
            const file = dataURItoFile(imagenUri, 'photo.jpg');
            const formData = new FormData();
            formData.append('file', file);
      
            fetch(API_URL+'/objeto/reconocimiento-objeto', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + getCookie('jwt'),
              },
              body: formData
            })
              .then(response => {
                handleUnauthorized(response)
                if (response.status === 401 || response.status === 422) {
                  logout(); // Cerrar sesión si la solicitud no está autorizada
                } else if (response.status === 404) {
                  intentos++;
                  enviarFoto(); // Volver a enviar la foto si el objeto no fue encontrado
                } else if (response.ok) {
                  spinnerObjeto.style.display='none';
                  nextBtn.style.display = 'inline-block';
                  objetoEncontrado = true;
                  return response.json();
                }
              })
              .then(data => {
                if (data) {
                  if(objetoEncontrado){
                    retryBtnObjeto.style.display='inline-block';
                    canvasObjeto.style.display='block';
                    videoElementObjeto.style.display='none';
                  }
                  const id = data.id || 'No disponible';
                  const objeto = data.objeto || 'No disponible';
                  const mensaje = `Objeto: ${objeto}<br>`;
                  resultadoObjeto.innerHTML = mensaje;
                // Enviar datos y redirigir al usuario
                  datosObjeto = {
                    type: 'ObjetoData',
                    payload: {
                      id: id,
                      objeto: objeto,
                      imgUri:imagenUri
                    }
                  };
                  console.log(datosObjeto)
                  console.log("Obejto recnocido")
                } else {
                  console.log("Obejto no recnocido")
                  resultadoObjeto.innerHTML = 'Objeto no Identificado';
                }
              })
              .catch(error => {
                console.error('Error al enviar los datos:', error);
              });
          } else if(!objetoEncontrado) {
            retryBtnObjeto.style.display='inline-block';
            spinnerObjeto.style.display='none';
            resultadoObjeto.innerHTML = 'Intentos máximos alcanzados o objeto ya encontrado';
          }
        };
      
        // Iniciar el envío de la primera foto
        enviarFoto();
      }

    // Agregar evento al botón para capturar objeto
    captureBtnObjeto.addEventListener('click', () => {
        // Ocultar el elemento de video y el botón de captura
        videoElementObjeto.style.display = 'block';
        captureBtnObjeto.style.display = 'none';
      
        // Iniciar el reconocimiento de objetos
        reconocimientoDeObjetos();
    });
    
    // Agregar evento al botón de reintentar
    retryBtnObjeto.addEventListener('click', () => {
        nextBtn.style.display = 'none';
        // Mostrar el elemento de video y ocultar el lienzo
        videoElementObjeto.style.display = 'block';
        canvasObjeto.style.display = 'none';
      
        // Mostrar el botón de captura y ocultar el botón de reintentar y el siguiente botón
        captureBtnObjeto.style.display = 'inline-block';
        retryBtnObjeto.style.display = 'none';
    });
    nextBtn.addEventListener('click',()=>{
      if (datosObjeto) {
        window.opener.postMessage(datosObjeto, '*');
        window.close(); // Opcionalmente, puedes cerrar la ventana después de enviar los datos
      }
    })
});

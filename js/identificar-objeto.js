document.addEventListener('DOMContentLoaded', function() {
  function obtenerIdEstudianteDeURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('idEstudiante');
  }

  validTokenSession();

  const videoElementObjeto = document.getElementById('videoObjeto');
  const captureBtnObjeto = document.getElementById('captureBtnObjeto');
  const retryBtnObjeto = document.getElementById('retryBtnObjeto');
  const canvasObjeto = document.getElementById('canvasObjeto');
  const nextBtn = document.getElementById('nextBtn');
  const listaConcidencia = document.getElementById('listaCoincidencia');
  const spinnerObjeto = document.getElementsByClassName('spinner-box')[0];
  let datosObjeto = null;

  // Obtener acceso a la cámara
  getCameraAccess(videoElementObjeto);

  function getCameraAccess(videoElement, facingMode = 'environment') {
    navigator.mediaDevices.getUserMedia({
      video: { facingMode }
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
        formData.append('idEstudiante', obtenerIdEstudianteDeURL());

        fetch(API_URL + '/objeto/consultar-objeto-pertenencia', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + getCookie('jwt'),
          },
          body: formData
        })
        .then(response => {
          handleUnauthorized(response);
          if (response.status === 401 || response.status === 422) {
            logout();
          } else if (response.status === 404) {
            intentos++;
            enviarFoto();
          } else if (response.ok) {
            spinnerObjeto.style.display = 'none';
            nextBtn.style.display = 'inline-block';
            objetoEncontrado = true;
            return response.json();
          }
        })
        .then(data => {
          if (data) {
            console.log(data);
            if (objetoEncontrado) {
              retryBtnObjeto.style.display = 'inline-block';
              canvasObjeto.style.display = 'block';
              videoElementObjeto.style.display = 'none';
              listaConcidencia.innerHTML = '';
            }
            const objeto = data.nombreObjeto || 'No disponible';
              
            resultadoObjeto.innerHTML = 'Objeto : '+objeto;
            const idObjeto = data.idObjeto || 'No disponible';
            const estado = data.estado || 'No disponible';
            const recorteImage = data.imagenRecortada || '';

            if (estado === "coincidencias") {
              listaConcidencia.innerHTML = '<hr> Pertenencias del Estudiante segun coincidencia: ';
              mostrarPertenencia(data.pertenencias_coincidencia[0], idObjeto, objeto, recorteImage);

              if (data.pertenencias_coincidencia.length > 1) {
                const verMasBtn = document.createElement('button');
                verMasBtn.id = 'verMasBtn';
                verMasBtn.innerText = 'Ver más';
                verMasBtn.addEventListener('click', () => {
                  for (let i = 1; i < data.pertenencias_coincidencia.length; i++) {
                    mostrarPertenencia(data.pertenencias_coincidencia[i], idObjeto, objeto, recorteImage);
                  }
                  verMasBtn.style.display = 'none';
                });
                listaConcidencia.appendChild(verMasBtn);
              }
            } else if (estado === "sin_registros") {
              listaConcidencia.innerHTML = '<hr><p>No se encontraron coincidencias de registro de esta pertenencia</p>';
              const pertenenciaContainer = document.createElement('div');
              listaConcidencia.appendChild(pertenenciaContainer);
            }

            nextBtn.addEventListener('click', () => {
              const confirmationMessage = 'Vas a registrar este objeto como una nueva pertenencia. ¿Deseas continuar?';
              if (confirm(confirmationMessage)) {
                const datosObjeto = {
                  type: 'ObjetoData',
                  payload: {
                    idObjeto: idObjeto,
                    objeto: objeto,
                    imgUri: recorteImage,
                    tipoRegistro: estado // assuming 'estado' is defined in the scope
                  }
                };
                console.log(datosObjeto);
                if (datosObjeto) {
                  window.opener.postMessage(datosObjeto, '*');
                  window.close();
                }
              }
            });
          } else {
            console.log("Objeto no reconocido");
            resultadoObjeto.innerHTML = 'Objeto no identificado';
          }
        })
        .catch(error => {
          console.error('Error al enviar los datos:', error);
        });
      } else if (!objetoEncontrado) {
        retryBtnObjeto.style.display = 'inline-block';
        spinnerObjeto.style.display = 'none';
        resultadoObjeto.innerHTML = 'Intentos máximos alcanzados o objeto ya encontrado';
      }
    };

    enviarFoto();
  }

  function mostrarPertenencia(pertenencia, idObjeto, objeto, recorteImage) {
    const codigoPertenencia = pertenencia.codigo_pertenencia || 'No disponible';
    const fechaUltimaActividad = pertenencia.fecha_ultima_actividad || 'No disponible';
    const ultimoEstado = pertenencia.ultimo_estado || 'No disponible';
    const imagenPertenencia = pertenencia.imagen_pertenencia || '';

    // Dibujar la imagen recortada en el canvas
    const context = canvasObjeto.getContext('2d');
    const img = new Image();

    img.onload = function() {
      canvasObjeto.width = img.width;
      canvasObjeto.height = img.height;
      context.drawImage(img, 0, 0, canvasObjeto.width, canvasObjeto.height);
    };

    img.src = recorteImage;
    resultadoObjeto.innerHTML = `Objeto: ${objeto}<br>`;

    const imgElement = document.createElement('img');
    imgElement.src = imagenPertenencia;
    imgElement.alt = `Imagen Pertenencia ${codigoPertenencia}`;
    imgElement.style.width = '200px';

    // Determine the class for the ultimoEstado
    let estadoClass = '';
    if (ultimoEstado === 'Ingresada') {
      estadoClass = 'estado-ingresada';
    } else if (ultimoEstado === 'Salida') {
      estadoClass = 'estado-salida';
    } else if (ultimoEstado === 'Extraviada') {
      estadoClass = 'estado-extraviada';
    }

    const infoElement = document.createElement('div');
    infoElement.id = 'infoElement'; // Agregar el id 'infoElement'
    
    infoElement.innerHTML = `
      Código Pertenencia: ${codigoPertenencia}<br>
      Última Actividad: <br>${fechaUltimaActividad}<br>
      Último Estado: <span class="${estadoClass}">${ultimoEstado}</span><br>
    `;

    const selectBtn = document.createElement('button');
    selectBtn.innerText = 'Seleccionar';
    selectBtn.addEventListener('click', () => {
      const estado = pertenencia.ultimo_estado || 'No disponible';
      let confirmationMessage = '';
      if (estado === 'Ingresada' || estado === 'Extraviada') {
        confirmationMessage = `Esta pertenencia está marcada como ${estado.toLowerCase()}. ¿Deseas continuar?`;
        if (!confirm(confirmationMessage)) {
          return;
        }
      }

      const datosObjeto = {
        type: 'ObjetoData',
        payload: {
          codigoPertenencia: codigoPertenencia,
          idObjeto: idObjeto,
          objeto: objeto,
          fechaUltimaActividad: fechaUltimaActividad,
          ultimoEstado: ultimoEstado,
          imgUri: recorteImage,
          tipoRegistro: 'coincidencias'
        }
      };
      console.log(datosObjeto);
      if (datosObjeto) {
        window.opener.postMessage(datosObjeto, '*');
        window.close();
      }
    });

    const pertenenciaContainer = document.createElement('div');
    pertenenciaContainer.classList.add('pertenencia-container');
    pertenenciaContainer.appendChild(imgElement);
    pertenenciaContainer.appendChild(infoElement);
    pertenenciaContainer.appendChild(selectBtn);
    listaConcidencia.appendChild(pertenenciaContainer);
  }

  captureBtnObjeto.addEventListener('click', () => {
    videoElementObjeto.style.display = 'block';
    captureBtnObjeto.style.display = 'none';
    reconocimientoDeObjetos();
  });

  retryBtnObjeto.addEventListener('click', () => {
    nextBtn.style.display = 'none';
    videoElementObjeto.style.display = 'block';
    canvasObjeto.style.display = 'none';
    captureBtnObjeto.style.display = 'inline-block';
    retryBtnObjeto.style.display = 'none';
    listaConcidencia.innerHTML = '';
  });

  
});

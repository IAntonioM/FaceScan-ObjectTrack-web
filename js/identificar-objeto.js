document.addEventListener('DOMContentLoaded', function() {
  function obtenerIdEstudianteDeURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('idEstudiante');
  }

  validTokenSession();
  const captureBtnObjeto = document.getElementById('captureBtnObjeto');
  const retryBtnObjeto = document.getElementById('retryBtnObjeto');
  const canvasObjeto = document.getElementById('canvasObjeto');
  const nuevaPerteencia = document.getElementById('nextBtn');
  const spinnerObjeto = document.getElementsByClassName('spinner-box')[0];
  const listaConcidencia = document.getElementById('listaCoincidencia');
  let datosObjeto = null;

  // Obtener acceso a la cámara

  const videoElementObjeto = document.getElementById('videoObjeto');
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
            nuevaPerteencia.style.display = 'inline-block';
            objetoEncontrado = true;
            return response.json();
          }
        })
        .then(data => {
          if (data) {
            
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
                verMasBtn.innerText = 'Ver más ...';
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
            nuevaPerteencia.addEventListener('click', () => {
              const confirmationMessage = 'Vas a registrar este objeto como una nueva pertenencia. ¿Deseas continuar?';
              if (confirm(confirmationMessage)) {
                const datosObjeto = {
                  type: 'ObjetoData',
                  payload: {
                    idObjeto: idObjeto,
                    objeto: objeto,
                    imgUri: recorteImage,
                    tipoRegistro: "sin_registro" // assuming 'estado' is defined in the scope
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

  const mostrarPertenencia = (pertenencia, idObjeto, objeto, recorteImage) => {
    const { codigo_pertenencia = 'No disponible', fecha_ultima_actividad = 'No disponible', ultimo_estado = 'No disponible', imagen_pertenencia = '' } = pertenencia;

    const context = canvasObjeto.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvasObjeto.width = img.width;
      canvasObjeto.height = img.height;
      context.drawImage(img, 0, 0, canvasObjeto.width, canvasObjeto.height);
    };
    img.src = recorteImage;

    const estadoClass = {
      'Ingresada': 'estado-ingresada',
      'Salida': 'estado-salida',
      'Extraviada': 'estado-extraviada'
    }[ultimo_estado] || '';

    const pertenenciaHTML = `
      <div class="pertenencia-container">
        <img src="${imagen_pertenencia}" alt="Imagen Pertenencia ${codigo_pertenencia}" style="width: 200px;">
        <div id="infoElement">
          Código Pertenencia: ${codigo_pertenencia}<br>
          Último Estado: <span class="${estadoClass}">${ultimo_estado}</span><br>
          Última Actividad: <br>
          Fecha: ${convertirFechaTexto(fecha_ultima_actividad, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
          Hora: ${convertirFechaTexto(fecha_ultima_actividad, { hour: 'numeric', minute: 'numeric', second: 'numeric' })}<br>
        </div>
        <button class="selectBtn">Seleccionar</button>
      </div>
    `;
    listaConcidencia.insertAdjacentHTML('beforeend', pertenenciaHTML);

    const selectBtn = listaConcidencia.querySelector('.pertenencia-container:last-child .selectBtn');
    selectBtn.addEventListener('click', () => {
      if (['Ingresada', 'Extraviada'].includes(ultimo_estado) && !confirm(`Esta pertenencia está marcada como 
        ${ultimo_estado.toLowerCase()}. ¿Deseas continuar?`)) return;

      const datosObjeto = {
        type: 'ObjetoData',
        payload: {  codigoPertenencia: codigo_pertenencia, idObjeto, objeto,
                    fechaUltimaActividad: fecha_ultima_actividad,
                    ultimoEstado: ultimo_estado,
                    imgUri: recorteImage, tipoRegistro: 'coincidencias' }
      };
      console.log(datosObjeto);
      if (datosObjeto) {
        window.opener.postMessage(datosObjeto, '*');
        window.close();
      }
    });
    resultadoObjeto.innerHTML = `Objeto: ${objeto}<br>`;
  };

  captureBtnObjeto.addEventListener('click', () => {
    videoElementObjeto.style.display = 'block';
    captureBtnObjeto.style.display = 'none';
    reconocimientoDeObjetos();
  });

  retryBtnObjeto.addEventListener('click', () => {
    nuevaPerteencia.style.display = 'none';
    videoElementObjeto.style.display = 'block';
    canvasObjeto.style.display = 'none';
    captureBtnObjeto.style.display = 'inline-block';
    retryBtnObjeto.style.display = 'none';
    listaConcidencia.innerHTML = '';
  });

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
  
});

document.addEventListener('DOMContentLoaded', function() {
  const consultaInfo = document.getElementsByClassName('consulta-info')[0];
  const registroResult = document.getElementsByClassName('registro-result')[0];
  validTokenSession();
  const registrarSalidaBtn = document.getElementById('registrarSalidaBtn');
  const resultDiv = document.getElementById('result');
  const containerResult=document.getElementById('container-result');
  const spinnerObjeto = document.getElementsByClassName('spinner-box')[0];
  let dataPertenencia = { estudiante: null, objetos: [] };

  if (dataPertenencia.estudiante == null) {
    window.open('identificar-estudiante.html', '_blank');
  }

  function consultarPertenencias(dataPertenencia) {
    spinnerObjeto.style.display = 'flex';
    const formData = new FormData();
    formData.append('idEstudiante', dataPertenencia.estudiante.id);
    formData.append('estado', 'Registrada');
    fetch(API_URL + '/pertenencia/consultar-pertenencia', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + getCookie('jwt'),
      },
      body: formData
    })
      .then(response => {
        spinnerObjeto.style.display='none'
        handleUnauthorized(response);
        if(response.status==404){
          return response.json().then(data => {
            // Mostrar el mensaje de error específico
            mostrarResultado(false, data.msg || 'No hay pertenencias registradas del estudiante');
            throw new Error(data.msg || 'No hay pertenencias registradas del estudiante');
        });
        }
        if (!response.ok) {
          throw new Error('Error en la solicitud', response);
        }
        return response.json();
      })
      .then(data => {
        console.log('Respuesta del servidor:', data);
        containerResult.style.display='block'
        showResult(data);
      })
      .catch(error => {
        console.error('Error al enviar los datos:', error);
      });
  }

  registrarSalidaBtn.addEventListener('click', () => {
    containerResult.style.display='none'
    const idRegistros = dataPertenencia.objetos.map(objeto => objeto.idPertenencia);

    fetch(API_URL + '/pertenencia/registrar-salida-pertenencia', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + getCookie('jwt'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(idRegistros)
    })
      .then(response => {
        handleUnauthorized(response);
        if (!response.ok) {
          throw new Error('Error en la solicitud', response);
        }
        return response.json();
      })
      .then(data => {
        console.log('Respuesta del servidor:', data);
        mostrarResultado(true, data.message);
      })
      .catch(error => {
        mostrarResultado(true, data.message);
        console.error('Error al enviar los datos:', error);
        mostrarResultado(false, 'Error al registrar la salida de pertenencias');
      });
  });

  function showResult(data) {
    const pertenencias = data.pertenencias;
    dataPertenencia.objetos = pertenencias;
    console.log(dataPertenencia);
    let content = '';
    content += `
      <div class="info-row">
        <div class="info-label">Código Estudiante: </div>
        <div class="info-value">${dataPertenencia.estudiante.codigo}</div>
      </div>
      <div class="info-row">
        <div class="info-label">Estudiante: </div>
        <div class="info-value">${dataPertenencia.estudiante.nombre}</div>
      </div>`;
    consultaInfo.innerHTML = content;
    const pertenenciasContainer = document.getElementById('pertenencias-container');

    if (dataPertenencia.objetos) {
      pertenencias.forEach(pertenencia => {
        const pertenenciaDiv = document.createElement('div');
        pertenenciaDiv.classList.add('pertenencia');
    
        const imgElement = document.createElement('img');
        imgElement.src = `${pertenencia.ImagenPertenencia}`;
        imgElement.alt = 'Imagen de la Pertenencia';
        imgElement.classList.add('pertenencia-img');
    
        const pertenenciaInfo = document.createElement('div');
        pertenenciaInfo.classList.add('pertenencia-info');
    
        const nombreObjeto = document.createElement('h4');
        nombreObjeto.textContent = pertenencia.nombreObjeto;
    
        const fechaElement = document.createElement('p');
        const horaElement = document.createElement('p');
    
        const fechaHora = convertirFecha(pertenencia.Fecha);
        const opciones = {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        };
        const opcionesHora = {
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric'
        };
    
        fechaElement.textContent = `Fecha: ${fechaHora.toLocaleString('es-ES', opciones)}`;
        horaElement.textContent = `Hora: ${fechaHora.toLocaleString('es-ES', opcionesHora)}`;
    
        pertenenciaInfo.appendChild(nombreObjeto);
        pertenenciaInfo.appendChild(fechaElement);
        pertenenciaInfo.appendChild(horaElement);
    
        pertenenciaDiv.appendChild(imgElement);
        pertenenciaDiv.appendChild(pertenenciaInfo);
    
        pertenenciasContainer.appendChild(pertenenciaDiv);
      });
    }
  }
  function convertirFecha(fechaString) {
    const [fecha, hora] = fechaString.split('_');
    const [año, mes, dia] = fecha.split('-');
    const [horas, minutos, segundos] = hora.split('-');
    return new Date(`${año}-${mes}-${dia}T${horas}:${minutos}:${segundos}`);
  }
  function mostrarResultado(exito, mensaje) {
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

  window.addEventListener('message', (event) => {
    console.log(dataPertenencia);
    if (event.data.type === 'EstudianteData') {
      dataPertenencia.estudiante = event.data.payload;
      consultarPertenencias(dataPertenencia);
    }
  });
});
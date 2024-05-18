document.addEventListener('DOMContentLoaded', function() {
  validTokenSession();
  const identificarObjetoBtn = document.getElementById('identificarObjetoBtn');
  const registroInfo = document.getElementsByClassName('registro-info')[0];
  const registroResult = document.getElementsByClassName('registro-result')[0];
  const responseMessage = registroResult.querySelector('.response-message');
  const successIcon = registroResult.querySelector('.success-icon');
  const errorIcon = registroResult.querySelector('.error-icon');
  let data = { estudiante: null, objeto: null };

  identificarObjetoBtn.addEventListener('click', () => {
      window.open('identificar-objeto.html', '_blank');
  });

  function registrarPertenencia() {
      const file = dataURItoFile(data.objeto.imgUri, 'photo.jpg');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('idEstudiante', data.estudiante.id);
      formData.append('idObjeto', data.objeto.id);

      fetch(API_URL + '/pertenencia/registrar-pertenencia', {
          method: 'POST',
          headers: {
              'Authorization': 'Bearer ' + getCookie('jwt'),
          },
          body: formData
      })
      .then(response => {
          if (!response.ok) {
              throw response;
          }
          return response.json();
      })
      .then(data => {
          mostrarResultado(true, data.message);
      })
      .catch(error => {
          error.json().then(err => {
              mostrarResultado(false, err.message || 'Error al Registrar Pertenencia');
          });
      });
  }

  function mostrarResultado(exito, mensaje) {
      registroResult.style.display = 'block';
      responseMessage.textContent = mensaje;

      if (exito) {
          successIcon.style.display = 'block';
          errorIcon.style.display = 'none';
      } else {
          successIcon.style.display = 'none';
          errorIcon.style.display = 'block';
      }
  }

  function showResult(data) {
      let content = `<h2>Información del Registro</h2><br>`;

      if (data.estudiante) {
          content += `
              <div class="info-row">
                  <div class="info-label">Código Estudiante: </div>
                  <div class="info-value">${data.estudiante.codigo}</div>
              </div>
              <div class="info-row">
                  <div class="info-label">Estudiante: </div>
                  <div class="info-value">${data.estudiante.nombre}</div>
              </div>`;
      }

      if (data.objeto) {
          content += `
              <div class="info-row">
                  <div class="info-label">Objeto:</div>
                  <div class="info-value">${data.objeto.objeto}</div>
              </div>
              <div class="info-row">
                  <div class="info-label">Imagen:</div>
                  <div class="info-value"><img src="${data.objeto.imgUri}" alt="${data.objeto.objeto}" class="objeto-img"></div>
              </div>`;
      }

      registroInfo.innerHTML = content;
  }

  if (data.estudiante == null && data.objeto == null) {
      window.open('identificar-estudiante.html', '_blank');
  }

  window.addEventListener('message', (event) => {
      if (event.data.type === 'EstudianteData') {
          data.estudiante = event.data.payload;
          showResult(data);
          window.open('identificar-objeto.html', '_blank');
      } else if (event.data.type === 'ObjetoData') {
          data.objeto = event.data.payload;
          showResult(data);
          registrarPertenencia();
      }
  });
});

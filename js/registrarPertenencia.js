document.addEventListener('DOMContentLoaded', function() {
  validTokenSession();
  const identificarEstudianteBtn = document.getElementById('identificarEstudianteBtn');
  const identificarObjetoBtn = document.getElementById('identificarObjetoBtn');
  const registrarPertenenciaBtn = document.getElementById('registrarPertenenciaBtn');
  const resultDiv = document.getElementById('result');
  let data = { estudiante: null, objeto: null,};

  // identificarEstudianteBtn.addEventListener('click', () => {
  //   window.open('identificar-estudiante.html', '_blank');
  // });

  // identificarObjetoBtn.addEventListener('click', () => {
  //   window.open('identificar-objeto.html', '_blank');
  // });

  registrarPertenenciaBtn.addEventListener('click', () => {
    console.log(data.estudiante.id)
    console.log(data.objeto.id)
    const file = dataURItoFile(data.objeto.imgUri, 'photo.jpg');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('idEstudiante', data.estudiante.id);
    formData.append('idObjeto', data.objeto.id);
    fetch(API_URL+'/pertenencia/registrar-pertenencia', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + getCookie('jwt'), // Reemplaza 'tuTokenJWT' con tu token JWT
      },
      body: formData
    })
      .then(response => {
        handleUnauthorized(response);
        if (!response.ok) {
          throw new Error('Error en la solicitud', response);
        }
      })
      .then(data => {
        console.log('Respuesta del servidor:', data);
      })
      .catch(error => {
        console.error('Error al enviar los datos:', error);
      });
  });

  function showResult(title, data) {
    resultDiv.innerHTML = `<h4>${title}</h4><pre>${JSON.stringify(data, null, 2)}</pre>`;
  }

  if(data.estudiante==null && data.objeto==null){
    window.open('identificar-estudiante.html', '_blank');
  }
  window.addEventListener('message', (event) => {
    console.log(data);
    if (event.data.type === 'EstudianteData') {
      data.estudiante = event.data.payload;
      showResult('Datos del estudiante:', event.data.payload);
      window.open('identificar-objeto.html', '_blank');
    } else if (event.data.type === 'ObjetoData') {
      data.objeto = event.data.payload;
      showResult('Objeto Identificado:', event.data.payload);
    }
  });
});
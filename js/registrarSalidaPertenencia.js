document.addEventListener('DOMContentLoaded', function() {
    validTokenSession();
    const identificarEstudianteBtn = document.getElementById('identificarEstudianteBtn');
    const consultarPertenenciaBtn = document.getElementById('consultarPertenenciaBtn');
    const registrarSalidaBtn = document.getElementById('registrarSalidaBtn');
    const resultDiv = document.getElementById('result');
    let dataPertenencia = { estudiante: null, objeto: null,};
  
    
  
    identificarEstudianteBtn.addEventListener('click', () => {
      window.open('identificar-estudiante.html', '_blank');
    });

    consultarPertenenciaBtn.addEventListener('click', () => {
      const formData = new FormData();
      formData.append('idEstudiante', dataPertenencia.estudiante.id);
      fetch(API_URL + '/pertenencia/consultar-pertenencia', {
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
              return response.json(); // Parsear la respuesta JSON
          })
          .then(data => {
              console.log('Respuesta del servidor:', data);
              showResult(data)
          })
          .catch(error => {
              console.error('Error al enviar los datos:', error);
          });
    });
  
    registrarSalidaBtn.addEventListener('click', () => {
      const formData = new FormData();
      formData.append('idRegistro', dataPertenencia.objeto.idPertenencia);
      fetch(API_URL+'/pertenencia/registrar-salida-pertenencia', {
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
  
    function showResult(data) {
      const pertenencias = data.pertenencias; // Obtener la lista de pertenencias
  
      // Limpiar el contenido previo del resultDiv
      resultDiv.innerHTML = '';
  
      // Recorrer cada pertenencia y mostrarla en el resultDiv
      pertenencias.forEach(pertenencia => {
          dataPertenencia.objeto=pertenencia
          const imgElement = document.createElement('img');
          imgElement.src = `${API_URL}/pertenencia/imagen/${pertenencia.ImagenPertenencia}`;
          imgElement.alt = 'Imagen de la Pertenencia';
          imgElement.style.width='100%'
          imgElement.style.height='auto'
          const pertenenciaInfo = document.createElement('div');
          pertenenciaInfo.innerHTML = `<h4>Pertenencia ${pertenencia.idPertenencia}</h4>`;
          pertenenciaInfo.appendChild(imgElement);
  
          resultDiv.appendChild(pertenenciaInfo);
      });
  }
  
    window.addEventListener('message', (event) => {
      console.log(dataPertenencia);
      if (event.data.type === 'EstudianteData') {
        dataPertenencia.estudiante = event.data.payload;
      }
    });
  });
document.addEventListener('DOMContentLoaded', function() {

    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const spinnerObjeto = document.getElementsByClassName('spinner-box')[0];
    let searchText='';
    consultarPertenencias(searchText);

    searchBtn.addEventListener('click', () => {
        consultarPertenencias(searchInput.value);
    })
    
    function consultarPertenencias(searchText) {
        spinnerObjeto.style.display = 'flex';
        const formData = new FormData();
        formData.append('busqueda', searchText);
        fetch(API_URL + '/pertenencia/consultar-pertenencia-busqueda', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + getCookie('jwt'),
          },
          body: formData
        })
          .then(response => {
            handleUnauthorized(response);
            if(response.status==404){
              return response.json().then(data => {
                console.log(data)
                mostrarConsultaVacia(data)
                spinnerObjeto.style.display = 'none';
            });
            }
            if (!response.ok) {
              throw new Error('Error en la solicitud', response);
            }
            return response.json();
          })
          .then(data => {
            console.log('Respuesta del servidor:', data);
            showResult(data);
            spinnerObjeto.style.display = 'none';
          })
          .catch(error => {
            console.error('Error al enviar los datos:', error);
          });
      }
      function mostrarConsultaVacia(data){
        const mensaje = data.error;
        const registrosContainer = document.querySelector('.row');
        registrosContainer.innerHTML = ''; // Limpia el contenido anterior
        const noResultsMessage = document.createElement('div');
        noResultsMessage.textContent = mensaje;
        noResultsMessage.classList.add('text-center', 'text-muted', 'my-5');
        registrosContainer.appendChild(noResultsMessage);

      }
      function showResult(data) {
        const pertenencias = data.pertenencias;
        
        const registrosContainer = document.querySelector('.row');
        registrosContainer.innerHTML = ''; // Limpia el contenido anterior
        
        if (pertenencias.length != 0){
            pertenencias.forEach(registro => {
                
                const col = document.createElement('div');
                col.classList.add('col', 'mb-4');
    
                const card = document.createElement('div');
                card.classList.add('card', 'h-100', 'registro-item');
    
                const img = document.createElement('img');
                img.src = `${registro.ImagenPertenencia}`;
                img.alt = `${registro.nombreObjeto}`;
                img.classList.add('card-img-top');
    
                const cardBody = document.createElement('div');
                cardBody.classList.add('card-body');
    
                const cardTitle = document.createElement('h5');
                cardTitle.classList.add('card-title');
                cardTitle.textContent = `Estudiante: ${registro.nombresEstudiante}`;
    
                const cardText = document.createElement('p');
                cardText.classList.add('card-text');
                cardText.innerHTML = `Objeto: <span class="objeto">${registro.nombreObjeto}</span>`;
    
                cardBody.appendChild(cardTitle);
                cardBody.appendChild(cardText);
    
                const cardFooter = document.createElement('div');
                cardFooter.classList.add('card-footer');
    
                const estadoSpan = document.createElement('small');
                estadoSpan.classList.add('text-muted');
                estadoSpan.innerHTML = `Estado: <span class="estado">${registro.Estado}</span>`;
                const fechaHora = convertirFecha(registro.Fecha);
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
                const fechaSpan = document.createElement('small');
                fechaSpan.classList.add('text-muted');
                fechaSpan.innerHTML = `Fecha: <span class="fecha">${fechaHora.toLocaleString('es-ES', opciones)}</span>`;
                
                const horaSpan = document.createElement('small');
                horaSpan.classList.add('text-muted');
                horaSpan.innerHTML = `Hora: <span class="hora">${fechaHora.toLocaleString('es-ES', opcionesHora)}</span>`;

                cardFooter.appendChild(estadoSpan);
                cardFooter.appendChild(document.createElement('br'));
                cardFooter.appendChild(fechaSpan);
                cardFooter.appendChild(document.createElement('br'));
                cardFooter.appendChild(horaSpan);

                card.appendChild(img);
                card.appendChild(cardBody);
                card.appendChild(cardFooter);
    
                col.appendChild(card);
                registrosContainer.appendChild(col);
            });
        }
    }
})
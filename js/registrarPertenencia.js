document.addEventListener('DOMContentLoaded', function() {
    validTokenSession();
    const identificarObjetoBtn = document.getElementById('identificarObjetoBtn');
    const registroInfo = document.querySelector('.registro-info');
    const registroResult = document.querySelector('.registro-result');
    const responseMessage = registroResult.querySelector('.response-message');
    const successIcon = registroResult.querySelector('.success-icon');
    const errorIcon = registroResult.querySelector('.error-icon');
    let data = { estudiante: null, objeto: null };

    init();

    function init() {
        identificarObjetoBtn.addEventListener('click', abrirVentanaIdentificarObjeto);
        validarDatos();
        window.addEventListener('message', manejoDeVentanas);
    }

    function abrirVentanaIdentificarObjeto() {
        window.open('identificar-objeto.html', '_blank');
    }

    function validarDatos() {
        if (!data.estudiante && !data.objeto) {
            window.open('identificar-estudiante.html', '_blank');
        }
    }

    function manejoDeVentanas(event) {
        const { type, payload } = event.data;
        if (type === 'EstudianteData') {
            data.estudiante = payload;
            mostrarDatos(data);
            abrirVentanaIdentificarObjeto();
        } else if (type === 'ObjetoData') {
            data.objeto = payload;
            mostrarDatos(data);
            registrarPertenencia();
        }
    }

    function registrarPertenencia() {
        const file = dataURItoFile(data.objeto.imgUri, 'photo.jpg');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('idEstudiante', data.estudiante.id);
        formData.append('idObjeto', data.objeto.id);

        fetchPertenencia(formData)
            .then(data => mostrarIconoResultado(true, data.message))
            .catch(error => handleErrorResponse(error));
    }

    function fetchPertenencia(formData) {
        return fetch(API_URL + '/pertenencia/registrar-pertenencia', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + getCookie('jwt'),
            },
            body: formData
        })
        .then(handleResponse)
        .then(response => response.json());
    }

    function handleResponse(response) {
        if (!response.ok) {
            throw response;
        }
        return response;
    }

    function handleErrorResponse(error) {
        error.json().then(err => {
            mostrarIconoResultado(false, err.message || 'Error al Registrar Pertenencia');
        });
    }

    function mostrarIconoResultado(exito, mensaje) {
        registroResult.style.display = 'block';
        responseMessage.textContent = mensaje;
        successIcon.style.display = exito ? 'block' : 'none';
        errorIcon.style.display = exito ? 'none' : 'block';
    }

    function mostrarDatos(data) {
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
});

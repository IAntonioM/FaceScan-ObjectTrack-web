document.addEventListener('DOMContentLoaded', function() {
    const consultaInfo = document.querySelector('.consulta-info');
    const registroResult = document.querySelector('.registro-result');
    const registrarSalidaBtn = document.getElementById('registrarSalidaBtn');
    const resultDiv = document.getElementById('result');
    const containerResult = document.getElementById('container-result');
    const spinnerObjeto = document.querySelector('.spinner-box');
    let dataPertenencia = { estudiante: null, objetos: [] };

    init();

    function init() {
        validTokenSession();
        if (!dataPertenencia.estudiante) {
            window.open('identificar-estudiante.html', '_blank');
        }
        registrarSalidaBtn.addEventListener('click', registrarSalida);
        window.addEventListener('message', handleMessage);
    }

    function handleMessage(event) {
        if (event.data.type === 'EstudianteData') {
            dataPertenencia.estudiante = event.data.payload;
            consultarPertenencias(dataPertenencia);
        }
    }

    function consultarPertenencias(dataPertenencia) {
        mostrarSpinner(true);
        console.log(dataPertenencia);
        const formData = new FormData();
        formData.append('idEstudiante', dataPertenencia.estudiante.id);
        formData.append('idEstado', '1');

        fetchConsultarRegistros(formData)
            .then(data => {
                containerResult.style.display = 'block';
                mostrarInfoEstudiante(dataPertenencia);
                actualizarVistaPertenencias(data);
                inicializarCheckboxes();
            })
            .catch(error => {
                mostrarInfoEstudiante(dataPertenencia);
                mostrarIconoResultado(false, error.message);
            });
    }

    function fetchConsultarRegistros(formData) {
        return fetch(API_URL + '/pertenencia/consultar-pertenencia-estado-estudiante', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + getCookie('jwt'),
            },
            body: formData
        })
        .then(handleResponse)
        .then(response => response.json());
    }

    function registrarSalida() {
        containerResult.style.display = 'none';
        const idRegistros = [];
        const checkboxes = document.querySelectorAll('.select-pertenencia');
        checkboxes.forEach((checkbox, index) => {
            const estado = checkbox.checked ? 2 : 3;
            idRegistros.push({
                codPertenecia: dataPertenencia.objetos[index].codigo_pertenencia,
                estado: estado
            });
        });
        console.log(idRegistros);

        const requestData = { codPertenciaIdEstado: idRegistros };

        fetch(API_URL + '/pertenencia/registrar-salida-pertenencia', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + getCookie('jwt'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        })
        .then(handleResponse)
        .then(() => mostrarIconoResultado(true, 'Registrado correctamente, salida de pertenencias'))
        .catch(error => mostrarIconoResultado(false, 'Error al registrar la salida de pertenencias'));
    }

    function handleResponse(response) {
        mostrarSpinner(false);
        handleUnauthorized(response);
        if (response.status === 404) {
            return response.json().then(data => {
                mostrarIconoResultado(false, 'No hay pertenencias registradas del estudiante');
                throw new Error('No hay pertenencias registradas del estudiante');
            });
        }
        if (!response.ok) {
            throw new Error('Error en la solicitud');
        }
        return response;
    }

    function actualizarVistaPertenencias(data) {
        const pertenenciasContainer = document.getElementById('pertenencias-container');
        pertenenciasContainer.innerHTML = '';
        console.log(data.pertenencias);
        dataPertenencia.objetos = data.pertenencias; // Asegúrate de actualizar correctamente el dataPertenencia.objetos
        console.log(dataPertenencia.objetos);
        data.pertenencias.forEach(pertenencia => {
            const pertenenciaDiv = crearPertenenciaDiv(pertenencia);
            pertenenciasContainer.appendChild(pertenenciaDiv);
        });
    }

    function mostrarInfoEstudiante(data) {
        dataPertenencia.objetos = data.pertenencias;
        consultaInfo.innerHTML = `
            <div class="info-row">
                <div class="info-label">Código Estudiante: </div>
                <div class="info-value">${data.estudiante.codigo}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Estudiante: </div>
                <div class="info-value">${data.estudiante.nombre}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Carrera: </div>
                <div class="info-value">${data.estudiante.carrera}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Plan: </div>
                <div class="info-value">${data.estudiante.planEstudiante}</div>
            </div>
            <hr>
            <div class="checkbox-title">
                <div class="checkbox-title">** Las Pertenencias que no tengan un Check serán marcadas como Extraviadas **</div>
            </div>
            <div class="info-checkbox">
                <input type="checkbox" id="select-all" class="check-label" checked> Todas Las Pertenencias
            </div>
        `;
        document.getElementById('select-all').addEventListener('change', toggleSelectAll);
    }

    function inicializarCheckboxes() {
        const checkboxes = document.querySelectorAll('.select-pertenencia');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            checkbox.addEventListener('change', function() {
                if (!this.checked) {
                    document.getElementById('select-all').checked = false;
                }
            });
        });
    }

    function toggleSelectAll(event) {
        const isChecked = event.target.checked;
        const checkboxes = document.querySelectorAll('.select-pertenencia');
        checkboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
    }

    function crearPertenenciaDiv(pertenencia) {
        console.log(pertenencia.nombre_objeto);
        const pertenenciaDiv = document.createElement('div');
        pertenenciaDiv.classList.add('pertenencia');

        const checkboxContainer = document.createElement('div');
        checkboxContainer.classList.add('checkbox-container');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('select-pertenencia');
        checkbox.checked = true;

        const codigoPerte = document.createElement('h4');
        codigoPerte.textContent = "C. Pertenencia : " + pertenencia.codigo_pertenencia;

        const imgElement = document.createElement('img');
        imgElement.src = pertenencia.imagen_pertenencia;
        imgElement.alt = 'Imagen de la Pertenencia';
        imgElement.classList.add('pertenencia-img');

        const pertenenciaInfo = document.createElement('div');
        pertenenciaInfo.classList.add('pertenencia-info');

        const nombreObjeto = document.createElement('h4');
        nombreObjeto.textContent = pertenencia.nombre_objeto;

        const estadoAct = document.createElement('h4');
        estadoAct.textContent = "Estado Actual: " + pertenencia.nombre_estado;

        const fechaElement = document.createElement('p');
        const horaElement = document.createElement('p');

        const fechaHora = convertirFecha(pertenencia.hora_entrada);
        fechaElement.textContent = `Fecha: ${fechaHora.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
        horaElement.textContent = `Hora: ${fechaHora.toLocaleTimeString('es-ES', { hour: 'numeric', minute: 'numeric', second: 'numeric' })}`;

        pertenenciaInfo.appendChild(codigoPerte);
        pertenenciaInfo.appendChild(nombreObjeto);
        pertenenciaInfo.appendChild(fechaElement);
        pertenenciaInfo.appendChild(horaElement);
        pertenenciaInfo.appendChild(estadoAct);
        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(imgElement);

        pertenenciaDiv.appendChild(checkboxContainer);
        pertenenciaDiv.appendChild(pertenenciaInfo);

        return pertenenciaDiv;
    }

    function mostrarIconoResultado(exito, mensaje) {
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

    function mostrarSpinner(mostrar) {
        spinnerObjeto.style.display = mostrar ? 'flex' : 'none';
    }
});



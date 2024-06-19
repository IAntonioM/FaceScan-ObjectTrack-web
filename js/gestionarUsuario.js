document.addEventListener('DOMContentLoaded', function() {
    cargarUsuarios();
});

function getJwtToken() {
    return getCookie('jwt');
}

function handleUnauthorized(response) {
    if (response.status === 401) {
        logout();
    }
}

function cargarUsuarios() {
    const jwtToken = getJwtToken();
    const apiUrl = API_URL + '/usuarios';

    if (!jwtToken) {
        logout();
        return;
    }

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + jwtToken,
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        console.log("Hola " + response.status);
        handleUnauthorized(response);
        if (!response.ok) {
            throw new Error('Error en la solicitud: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log('Respuesta del servidor:', data);
        mostrarUsuarios(data.usuarios || []);
    })
    .catch(error => {
        console.error('Error al cargar los usuarios:', error);
    });
}

function eliminarUsuario(idUsuario) {
    const jwtToken = getJwtToken();
    const apiUrl = API_URL + '/usuarios/' + idUsuario;

    if (!jwtToken) {
        console.error('No se encontró el token JWT.');
        logout();
        return;
    }

    fetch(apiUrl, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + jwtToken,
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        handleUnauthorized(response);
        if (!response.ok) {
            throw new Error('Error en la solicitud: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log('Respuesta del servidor:', data);
        cargarUsuarios();  // Recargar la lista de usuarios
    })
    .catch(error => {
        console.error('Error al eliminar el usuario:', error);
    });
}

function mostrarUsuarios(usuarios) {
    const tbody = document.getElementById('tbody-usuarios');
    tbody.innerHTML = '';

    usuarios.forEach(usuario => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.nombre}</td>
            <td>${usuario.rol}</td>
            <td>
                <a class="btn btn-primary btn-editar" href="editarUsuario.html?id=${usuario.id}&nombre=${usuario.nombre}&rol=${usuario.rol}"><i class="fa-solid fa-pen-to-square"></i> </a>
                <button id="btnEliminar" class="btn btn-danger btn-eliminar" data-id="${usuario.id}"> <i class="fa-solid fa-trash"></i> </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Añadir evento a los botones de eliminar
    document.querySelectorAll('.btn-eliminar').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
                eliminarUsuario(userId);
            }
        });
    });
}

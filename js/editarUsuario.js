document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const nombre = urlParams.get('nombre');
    const rol = urlParams.get('rol');

    document.getElementById('username').value = nombre; 
    const selectRol = document.getElementById('rol');

    // Seleccionar la opción correspondiente al rol recibido de la URL
    if (rol) {
        selectRol.value = rol === "Administrador" ? "2" : "1";
    }

    const form = document.getElementById('registerForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        editarUsuario();
    });
});

function editarUsuario() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rol = document.getElementById('rol').value;
    const jwtToken = getCookie('jwt');
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id'); // Obtener el ID del usuario de los parámetros de la URL
    const apiUrl = API_URL + '/usuarios/' + id;
    console.log(rol,password)
    if (!jwtToken) {
        console.error('No se encontró el token JWT.');
        logout();
        return;
    }

    const usuarioData = {
        usuario: username,
        contraseña: password,
        idRol: rol
    };

    fetch(apiUrl, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + jwtToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuarioData)
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
        document.getElementById('message').innerHTML = '<div class="alert alert-success">Usuario editado exitosamente</div>';
        document.getElementById('registerForm').reset();
    })
    .catch(error => {
        console.error('Error al editar el usuario:', error);
        document.getElementById('message').innerHTML = '<div class="alert alert-danger">Error al editar el usuario</div>';
    });
}

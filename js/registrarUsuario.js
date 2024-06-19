document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        registrarUsuario();
    });
});

function registrarUsuario() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rol = document.getElementById('rol').value;
    const jwtToken = getCookie('jwt');
    const apiUrl = API_URL + '/registro';

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
        method: 'POST',
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
        document.getElementById('message').innerHTML = '<div class="alert alert-success">Usuario registrado exitosamente</div>';
        document.getElementById('registerForm').reset();
    })
    .catch(error => {
        console.error('Error al registrar el usuario:', error);
        document.getElementById('message').innerHTML = '<div class="alert alert-danger">Error al registrar el usuario</div>';
    });
}

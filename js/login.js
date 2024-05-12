document.addEventListener('DOMContentLoaded', function() {
    validTokenSession();
})
function login() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    // Crear objeto de solicitud
    fetch(BASE_URL+'/login', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usuario: username, contraseña: password })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Error al iniciar sesión. Por favor, verifica tus credenciales.');
        }
    })
    .then(data => {
      // Guardar el token JWT y el nombre de usuario en las cookies
        saveAuth(data.access_token,username)
      // Redirigir a la página de menú
        window.location.href = 'pages/menu.html';
    })
    .catch(error => {
        document.getElementById('error-message').style.display = 'block';
    });
}

function login() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    fetch(API_URL+'/login/personal', {
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
        saveAuth(data.access_token,username)
        window.location.href = 'pages/menu.html';
    })
    .catch(error => {
        document.getElementById('error-message').style.display = 'block';
    });
}


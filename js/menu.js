document.addEventListener("DOMContentLoaded", function() {
    validTokenSession();
    // Obtener el nombre de usuario de las cookies
    username=getCookie('username')
    // Actualizar el contenido del elemento <span> con el nombre de usuario
    document.querySelector('.username').textContent = "Usuario: "+username;
});

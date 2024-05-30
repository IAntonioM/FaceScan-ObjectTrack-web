document.addEventListener("DOMContentLoaded", function() {
    validTokenSession();

    token=getCookie('jwt');
    decodedToken=parseJwt(token);
    username=decodedToken.sub;
    rol=decodedToken.rol;
    // Actualizar el contenido del elemento <span> con el nombre de usuario
    document.querySelector('.username').textContent = "Usuario: "+username;
    document.querySelector('.rol').textContent = "Rol: "+rol;

    // Obtener los contenedores de las tarjetas según el rol del usuario
    const contenedorPersonal = document.querySelector('.content-Personal');
    const contenedorAdministrador = document.querySelector('.content-Administrador');

    // Función para mostrar u ocultar los contenedores según el rol del usuario
    function mostrarContenedorSegunRol() {
        if (rol === 'Personal') {
            contenedorPersonal.style.display = 'block';
            contenedorAdministrador.style.display = 'none';
        } else if (rol === 'Administrador') {
            contenedorPersonal.style.display = 'none';
            contenedorAdministrador.style.display = 'block';
        }
    }

    // Llamar a la función para mostrar u ocultar los contenedores al cargar la página
    mostrarContenedorSegunRol();
});

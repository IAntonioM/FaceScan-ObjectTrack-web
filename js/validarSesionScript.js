
document.addEventListener("DOMContentLoaded", function() {
    // Verificar si las cookies jwt y username están presentes
    var jwtCookie = getCookie('jwt');
    var usernameCookie = getCookie('username');

    // Si alguna de las cookies está ausente, redirigir al usuario a la página de inicio de sesión
    if (!jwtCookie || !usernameCookie) {
      window.location.href = '../index.html'; // Cambiar 'index.html' por la ruta de tu página de inicio de sesión
    }
});

  // Función para obtener el valor de una cookie por su nombre
function getCookie(name) {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
        return cookie.substring(name.length + 1, cookie.length); // +1 para excluir el signo '='
    }
    }
    return null;
}

function logout() {
  // Borrar las cookies estableciendo su valor a una cadena vacía y una fecha de expiración en el pasado
  document.cookie = 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  document.cookie = 'username=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  // Redirigir a la página de inicio
  window.location.href = '../index.html';
}

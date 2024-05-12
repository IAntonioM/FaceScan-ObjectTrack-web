// codigo para verificar si existe una sesion activa al cargar el Dom html
document.addEventListener("DOMContentLoaded", function() {
    // Obtener la ruta de la página actual
    var currentPage = window.location.pathname;
  
    // Verificar si estamos en la página de inicio de sesión o en la página base
    if (currentPage !== '/index.html' && currentPage !== '/') {
      // Verificar si las cookies jwt y username están presentes
      var jwtCookie = getCookie('jwt');
      var usernameCookie = getCookie('username');
      // Si alguna de las cookies está ausente, redirigir al usuario a la página de inicio de sesión
      if (!jwtCookie || !usernameCookie) {
          logout();
      }
    }
  });
  
  // Función para validar que el envio del token no este expirado o sea manipulado
  function handleUnauthorized(response) {
    if (response.status === 401 || response.status === 422) {
        logout();
    }
  }
  // Función para guardar el token JWT y el nombre de usuario en las cookies
  function saveAuth(token, username) {
    document.cookie = `jwt=${token}; path=/; Secure; SameSite=Strict`; // Asegura la cookie y limita su alcance
    document.cookie = `username=${username}; path=/; Secure; SameSite=Strict`; // Asegura la cookie y limita su alcance
  }
  
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
  
  // Función para cerrar sesión
  function logout() {
    // Borrar las cookies estableciendo su valor a una cadena vacía y una fecha de expiración en el pasado
    document.cookie = 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC; Secure; SameSite=Strict';
    document.cookie = 'username=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC; Secure; SameSite=Strict';
    // Redirigir a la página de inicio
    window.location.href = '../index.html';
  }

  function menu() {
    // Redirigir al menu
    window.location.href = '../pages/menu.html';
  }
  
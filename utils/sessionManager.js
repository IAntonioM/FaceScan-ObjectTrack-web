
  function validTokenSession(){
    var currentPage = window.location.pathname;
    if (currentPage !== '/index.html' && currentPage !== '/') {
        var jwtCookie = getCookie('jwt');
        var usernameCookie = getCookie('username');
        if (!jwtCookie || !usernameCookie) {
          logout()
        }
    }
  }
  function handleUnauthorized(response) {
    if (response.status === 401 || response.status === 422) {
        logout();
    }
  }
  function logout() {
    document.cookie = 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC; Secure; SameSite=Strict';
    document.cookie = 'username=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC; Secure; SameSite=Strict';
    window.location.href = '../index.html';
  }
  function saveAuth(token, username) {
    document.cookie = `jwt=${token}; path=/; Secure; SameSite=Strict`;
    document.cookie = `username=${username}; path=/; Secure; SameSite=Strict`; 
  }
  function getCookie(name) {
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1, cookie.length); 
        }
    }
    return null;
  }

  function menu() {
    window.location.href = '../pages/menu.html';
  }
 
  
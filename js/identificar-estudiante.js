document.addEventListener('DOMContentLoaded', function() {
  validTokenSession();
  // Código para identificar al estudiante
  const videoElement = document.getElementById('videoElement');
  const searchEstudianteBtn = document.getElementById('searchEstudianteBtn');
  const retryBtn = document.getElementById('retryBtn');
  const canvas = document.getElementById('canvas');
  const resultadoEstudiante = document.getElementById('resultadoEstudiante');
  const nextBtn = document.getElementById('nextBtn');
  const spinnerObjeto = document.getElementsByClassName('spinner-box')[0];
  let datosEstudiante =null;
  let currentFacingMode = 'user'; // Inicializar currentFacingMode con 'user'
  let stream;

  // Inicializar el acceso a las cámaras
  function getCameraAccess(videoElement, facingMode = 'environment') {
    navigator.mediaDevices.getUserMedia({ video: { facingMode } })
      .then(mediaStream => {
        stream = mediaStream;
        videoElement.srcObject = mediaStream;
      })
      .catch(error => {
        console.error('Error al acceder a la cámara web:', error);
      });
  }


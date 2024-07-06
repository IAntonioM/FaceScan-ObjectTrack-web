// Declaración de elementos del DOM
const videoObjeto = document.getElementById('videoObjeto');
const startRecordingBtn = document.getElementById('startRecordingBtn');
const stopRecordingBtn = document.getElementById('stopRecordingBtn');
const captureBtn = document.getElementById('captureBtn');
const codigoEstudianteInput = document.getElementById('codigoEstudiante');
const nombreCompletoInput = document.getElementById('NombreCompleto');

const carreraEstudiante = document.getElementById('Carrera');
const planEstudiante = document.getElementById('PlanEstudiante');

const recordingIndicator = document.getElementById('recordingIndicator');
const recordingTime = document.getElementById('recordingTime');
const loadingSpinner = document.getElementById('loading');
const successMessage = document.getElementById('successMessage');
const FormularioVideoDiv = document.getElementById('formularioEnvio');
const SpinnerDeCargaDiv = document.getElementById('spinnerEnvio');

let mediaRecorder;
let recordedChunks = [];
let startTime;
let isRecording = false;

// Event listeners
startRecordingBtn.addEventListener('click', startRecording);
stopRecordingBtn.addEventListener('click', stopRecording);
captureBtn.addEventListener('click', sendVideo);

// Función para iniciar la grabación
function startRecording() {
  // Reiniciar el tiempo de grabación
  startTime = Date.now();

  isRecording = true;

  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      videoObjeto.srcObject = stream;

      const options = { mimeType: 'video/webm;codecs=vp9' };
      mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.start();
      startRecordingBtn.style.display = 'none';
      stopRecordingBtn.style.display = 'inline-block';
      captureBtn.style.display = 'none';
      recordingIndicator.style.display = 'inline-block';

      // Actualizar el tiempo de grabación cada segundo
      setInterval(updateRecordingTime, 1000);
    })
    .catch(error => {
      console.error('Error al acceder a la cámara web:', error);
    });
}

// Función para detener la grabación
function stopRecording() {
  mediaRecorder.stop();
  startRecordingBtn.style.display = 'inline-block';
  stopRecordingBtn.style.display = 'none';
  captureBtn.style.display = 'inline-block';
  recordingIndicator.style.display = 'block';
  isRecording = false;
}

// Función para enviar el video grabado
function sendVideo() {
  FormularioVideoDiv.style.display = 'none';
  SpinnerDeCargaDiv.style.display = 'block'; // Mostrar spinner de carga

  const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
  const videoFile = new File([videoBlob], 'video.webm', { type: 'video/webm' });

  const formData = new FormData();
  formData.append('file', videoFile);
  formData.append('codigoEstudiante', codigoEstudianteInput.value);
  formData.append('NombreCompleto', nombreCompletoInput.value);
  formData.append('carrera', carreraEstudiante.value);
  formData.append('planEstudiante', planEstudiante.value);


  fetch(API_URL+'/estudiante/reconocimiento-facial/video', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + getCookie('jwt'), // Reemplaza 'tuTokenJWT' con tu token JWT
    },
    body: formData
  })
    .then(response => {
      loadingSpinner.style.display = 'none'; // Ocultar spinner de carga
      handleUnauthorized(response)
      if (!response.ok) {
        throw new Error('Error en la solicitud', response);
      }
    })
    .then(data => {
      console.log('Respuesta del servidor:', data);

      successMessage.style.display = 'block'; // Mostrar mensaje de éxito
      document.getElementById('step1').style.display = 'none';
      document.getElementById('step2').style.display = 'block';
    })
    .catch(error => {
      loadingSpinner.style.display = 'none'; // Ocultar spinner de carga
      document.getElementById('step1').style.display = 'none';
      document.getElementById('step2').style.display = 'block';
      console.error('Error al enviar los datos:', error);
    });

  recordedChunks = [];
}


function updateRecordingTime() {
  if (isRecording) {
    const elapsedTime = Math.round((Date.now() - startTime) / 1000);
    recordingTime.textContent = `${elapsedTime}s`;
  }
}

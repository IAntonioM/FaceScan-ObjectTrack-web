const videoObjeto = document.getElementById('videoObjeto');
const startRecordingBtn = document.getElementById('startRecordingBtn');
const stopRecordingBtn = document.getElementById('stopRecordingBtn');
const captureBtn = document.getElementById('captureBtn');
const codigoEstudianteInput = document.getElementById('codigoEstudiante');
const nombreCompletoInput = document.getElementById('NombreCompleto');

const recordingIndicator = document.getElementById('recordingIndicator');
const recordingCircle = document.getElementById('recordingCircle');
const recordingTime = document.getElementById('recordingTime');

let timerInterval;
let recordingSeconds = 0;


function updateRecordingTime() {
    recordingSeconds++;
    recordingTime.textContent = `Tiempo grabado: ${recordingSeconds} segundos`;
  }

let mediaRecorder;
let recordedChunks = [];

startRecordingBtn.addEventListener('click', startRecording);
stopRecordingBtn.addEventListener('click', stopRecording);
captureBtn.addEventListener('click', sendVideo);

function startRecording() {
    recordingSeconds = 0;
    // Start the timer
    timerInterval = setInterval(updateRecordingTime, 1000);
    
    // Show the recording indicator
    recordingIndicator.style.display = 'block';
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
    })
    .catch(error => {
      console.error('Error al acceder a la cámara web:', error);
    });
}

function stopRecording() {
    // Stop the timer
    clearInterval(timerInterval);
    
    // Hide the recording indicator
    recordingIndicator.style.display = 'block';
  mediaRecorder.stop();
  startRecordingBtn.style.display = 'inline-block';
  stopRecordingBtn.style.display = 'none';
  captureBtn.style.display = 'inline-block';
}

        data=`{
            "CodEstudiante": "2657",
            "Nombres": "Pato Prueba",
            "mensaje": "Registro de estudiantes completado"
        }`
        const mensaje = document.createElement('p');
        mensaje.textContent = data.mensaje;
        document.getElementById('step2').appendChild(mensaje);
function sendVideo() {
  const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
  const videoFile = new File([videoBlob], 'video.webm', { type: 'video/webm' });
  const formData = new FormData();
  formData.append('file', videoFile);
  formData.append('codigoEstudiante', codigoEstudianteInput.value);
  formData.append('NombreCompleto', nombreCompletoInput.value);
  fetch('http://127.0.0.1:5000/estudiante/reconocimiento-facial/video', {
    method: 'POST',
    body: formData
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error en la solicitud', response);
      }
      return response.json();
    })
    .then(data => {
        // Ocultar paso 1 y mostrar paso 2
        document.getElementById('step1').style.display = 'none';
        document.getElementById('step2').style.display = 'block';
        
        // Mostrar el mensaje del servidor
        console.log('Respuesta del servidor:', data);
        const mensaje = document.createElement('p');
        mensaje.textContent = data.mensaje;
        document.getElementById('step2').appendChild(mensaje);
    
        // Mostrar el código del estudiante
        const codigoEstudiante = document.createElement('p');
        codigoEstudiante.textContent = "Código del Estudiante: " + data.CodEstudiante;
        document.getElementById('step2').appendChild(codigoEstudiante);
    
        // Mostrar el nombre del estudiante
        const nombreEstudiante = document.createElement('p');
        nombreEstudiante.textContent = "Nombre del Estudiante: " + data.Nombres;
        document.getElementById('step2').appendChild(nombreEstudiante);
    })
    .catch(error => {
      console.error('Error al enviar los datos:', error);
    });
  recordedChunks = [];
}

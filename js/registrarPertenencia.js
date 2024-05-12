document.addEventListener('DOMContentLoaded', function() {
  validTokenSession();
  const identificarEstudianteBtn = document.getElementById('identificarEstudianteBtn');
  const identificarObjeto1Btn = document.getElementById('identificarObjeto1Btn');
  const identificarObjeto2Btn = document.getElementById('identificarObjeto2Btn');
  const registrarPertenenciaBtn = document.getElementById('registrarPertenenciaBtn');
  const resultDiv = document.getElementById('result');
  let data = { estudiante: null, objeto1: null, objeto2: null };

  console.log(data);

  identificarEstudianteBtn.addEventListener('click', () => {
    window.open('identificar-estudiante.html', '_blank');
  });

  identificarObjeto1Btn.addEventListener('click', () => {
    window.location.href = 'identificarObjeto1.html';
  });

  identificarObjeto2Btn.addEventListener('click', () => {
    window.location.href = 'identificarObjeto2.html';
  });

  registrarPertenenciaBtn.addEventListener('click', () => {
    // Aquí puedes realizar la lógica para registrar la pertenencia utilizando los datos almacenados en `data`
    console.log('Datos para registrar pertenencia:', data);
  });

  function showResult(title, data) {
    resultDiv.innerHTML = `<h4>${title}</h4><pre>${JSON.stringify(data, null, 2)}</pre>`;
  }

  window.addEventListener('message', (event) => {
    if (event.data.type === 'EstudianteData') {
      data.estudiante = event.data.payload;
      showResult('Datos del estudiante:', event.data.payload);
    } else if (event.data.type === 'identificarObjeto1Data') {
      data.objeto1 = event.data.payload;
      showResult('Datos del objeto 1:', event.data.payload);
    } else if (event.data.type === 'identificarObjeto2Data') {
      data.objeto2 = event.data.payload;
      showResult('Datos del objeto 2:', event.data.payload);
    }
  });
});
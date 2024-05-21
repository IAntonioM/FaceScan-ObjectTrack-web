// Función para convertir URI de datos a archivo
function dataURItoFile(dataURI, filename) {
    const binary = atob(dataURI.split(',')[1]);
    const array = Uint8Array.from(binary, byte => byte.charCodeAt(0));
    return new File([array], filename, { type: 'image/jpeg' });
}

function convertirFecha(fechaString) {
    const [fecha, hora] = fechaString.split('_');
    const [año, mes, dia] = fecha.split('-');
    const [horas, minutos, segundos] = hora.split('-');
    return new Date(`${año}-${mes}-${dia}T${horas}:${minutos}:${segundos}`);
  }
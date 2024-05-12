// Función para convertir URI de datos a archivo
function dataURItoFile(dataURI, filename) {
    const binary = atob(dataURI.split(',')[1]);
    const array = Uint8Array.from(binary, byte => byte.charCodeAt(0));
    return new File([array], filename, { type: 'image/jpeg' });
}
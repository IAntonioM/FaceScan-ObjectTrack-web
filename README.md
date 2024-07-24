# Configuración del Frontend

1. **Abrir el Frontend**:
   - Abre la carpeta del Frontend con [Visual Studio Code](https://code.visualstudio.com/).

2. **Configurar la URL del Backend**:
   - Dirígete al archivo `config.js` ubicado en `utils/config.js`.
   - Actualiza la variable `API_URL` con la URL del Backend copiada previamente:
     ```javascript
     const API_URL = 'http://localhost:5000';
     ```

3. **Configurar la Base de Datos**:
   - La base de datos `sqlite` ya está inicializada con el Backend, por lo que no se requiere ninguna configuración adicional.

4. **Ejecutar el Frontend**:
   - Instala la extensión "Live Server" en [Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=ritwickdey.liveserver).
   - Haz clic derecho en el archivo `identificar-estudiante.html` y selecciona "Open with Live Server".

5. **Verificar el Frontend**:
   - Se abrirá el navegador con la ventana “Identificación Ingresante”. Asegúrate de que todo esté funcionando correctamente.


document.addEventListener('DOMContentLoaded', function() {
    
    const apiUrl = API_URL+'/pertenencia';  // Ajusta la URL a tu endpoint de API

    async function fetchData(endpoint, method = 'POST', body = {}) {
        const token = getCookie('jwt');  // Asume que el token JWT se almacena en el localStorage
        try {
            const response = await fetch(`${apiUrl}/${endpoint}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            if (!response.ok) {
                throw new Error(`Error al obtener datos de ${endpoint}: ${response.statusText}`);
            }
            
            handleUnauthorized(response);
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    async function loadObjectTypeChart() {
        const data = await fetchData('consultar-pertenencia-busqueda', 'POST', { busqueda: '' });
        if (data && data.pertenencias) {
            const objectTypeData = data.pertenencias.reduce((acc, item) => {
                acc[item.nombreObjeto] = (acc[item.nombreObjeto] || 0) + 1;
                return acc;
            }, {});
            const labels = Object.keys(objectTypeData);
            const values = Object.values(objectTypeData);

            const ctx = document.getElementById('objectTypeChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Número de objetos registrados de este Tipo',
                        data: values,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

    async function loadStatusPieChart() {
        const data = await fetchData('consultar-pertenencia-busqueda', 'POST', { busqueda: '' });
        if (data && data.pertenencias) {
            const statusData = data.pertenencias.reduce((acc, item) => {
                acc[item.Estado] = (acc[item.Estado] || 0) + 1;
                return acc;
            }, {});
            const labels = Object.keys(statusData);
            const values = Object.values(statusData);
            const newLabels = labels.map((label, index) => `n:${values[index]}, Estado:${label}`);

            const ctx = document.getElementById('statusPieChart').getContext('2d');
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: newLabels,
                    datasets: [{
                        label: 'cantidad',
                        data: values,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                }
            });
        }
    }

    async function loadSummaryTable() {
        const data = await fetchData('consultar-pertenencia-busqueda', 'POST', { busqueda: '' });
        console.log(data.pertenencias);
        if (data && data.pertenencias) {
            const tbody = document.querySelector('table tbody');
            tbody.innerHTML = '';  // Clear existing rows
    
            // Step 1: Group data by date and status
            const groupedData = data.pertenencias.reduce((acc, item) => {
                // Extract date from the 'Fecha' string
                const date = item.Fecha.split('_')[0];
                if (!acc[date]) {
                    acc[date] = { entradas: 0, salidas: 0, extraviada: 0, total: 0 };
                }
                if (item.Estado === 'Ingresada') {
                    acc[date].entradas += 1;
                } else if (item.Estado === 'Salida') {
                    acc[date].salidas += 1;
                } else if (item.Estado === 'Extraviada') {
                    acc[date].extraviada += 1;
                }
                acc[date].total += 1;
                return acc;
            }, {});
    
            // Step 2: Create rows for the table
            Object.keys(groupedData).forEach(date => {
                const record = groupedData[date];
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${date}</td>
                    <td>${record.entradas}</td>
                    <td>${record.salidas}</td>
                    <td>${record.extraviada}</td>
                    <td>${record.total}</td>
                `;
                tbody.appendChild(row);
            });
        }
    }
    

    function convertirFechaTexto(fecha, opciones) {
        const fechaHora = convertirFecha(fecha);
        return fechaHora.toLocaleString('es-ES', opciones);
    }
    

    async function loadAllRecordsTable() {
        const data = await fetchData('consultar-pertenencia-busqueda', 'POST', { busqueda: '' });
        if (data && data.pertenencias) {
            const tbody = document.querySelector('#allRecordsTable tbody');
            tbody.innerHTML = '';  // Clear existing rows

            data.pertenencias.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.idPertenencia}</td>
                    <td>${item.idEstudiante}</td>
                    <td>${item.idObjeto}</td>
                    <td>${item.Estado}</td>
                    <td>${item.Fecha}</td>
                    <td>${item.nombreObjeto}</td>
                    <td>${item.nombresEstudiante}</td>
                    <td><img src="${item.ImagenPertenencia}" alt="Imagen Pertenencia" width="50"></td>
                `;
                tbody.appendChild(row);
            });
        }
    }



    async function downloadPagePdf() {
        var element = document.getElementById('main');
        const opt = {
            margin: 0.5,
            filename: 'reporte_pertenencias.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        // New Promise-based usage:
        html2pdf().set(opt).from(element).save();

        // Old monolithic-style usage:
        html2pdf(element, opt);
    }

    document.getElementById('downloadPagePdf').addEventListener('click', downloadPagePdf);


    // Load all charts and tables
    loadObjectTypeChart();
    loadStatusPieChart();
    loadSummaryTable();
    loadAllRecordsTable();
});

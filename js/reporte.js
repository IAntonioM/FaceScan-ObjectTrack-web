document.addEventListener('DOMContentLoaded', function() {
    async function loadChartsAndTables() {
        const data = await fetchData('consultar-pertenencia-busqueda', 'POST', { busqueda: '' });
        if (data && data.pertenencias) {
            loadObjectTypeChart(data.pertenencias);
            loadStatusPieChart(data.pertenencias);
            loadSummaryTable(data.pertenencias);
            loadAllRecordsTable(data.pertenencias);
        }
    }
    const apiUrl = API_URL + '/pertenencia'; 
    async function fetchData(endpoint, method = 'POST', body = {}) {
        const token = getCookie('jwt');  
            const response = await fetch(`${apiUrl}/${endpoint}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            
            handleUnauthorized(response);
            return await response.json();
    }

    function loadObjectTypeChart(pertenencias) {
        const objectTypeData = pertenencias.reduce((acc, item) => {
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
                        beginAtZero: true,
                    }
                }
            }
        });
    }

    function loadStatusPieChart(pertenencias) {
        let statusData = {
            Ingresado: 0,
            Salida: 0,
            Extraviado: 0
        };
        pertenencias.forEach(item => {
            if (item.idEstado === 1) {
                statusData.Ingresado += 1;
            } else if (item.idEstado === 2) {
                statusData.Ingresado += 1;
                statusData.Salida += 1;
            } else if (item.idEstado === 3) {
                statusData.Ingresado += 1;
                statusData.Extraviado += 1;
            }
        });
        const labels = Object.keys(statusData);
        const values = Object.values(statusData);
        console.log(labels)
        console.log(values)
        const newLabels = labels.map((label, index) => `[ Estado:${label},n:${values[index]} ]`);
        const ctx = document.getElementById('statusPieChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: newLabels,
                datasets: [{
                    label: 'Cantidad',
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
                scales: {
                    x: {
                        beginAtZero: true,
                    }
                }
            }
        });
    }

    function loadSummaryTable(pertenencias) {
        const tbody = document.querySelector('table tbody');
        tbody.innerHTML = ''; 
        const groupedData = pertenencias.reduce((acc, item) => {
            const date = item.Fecha.split('_')[0];
            if (!acc[date]) {
                acc[date] = { entradas: 0, salidas: 0, extraviada: 0, total: 0 };
            }
            if (item.Estado === 'Ingresada') {
                acc[date].entradas += 1;
            } else if (item.Estado === 'Salida') {
                acc[date].entradas += 1;
                acc[date].salidas += 1;
            } else if (item.Estado === 'Extraviada') {
                acc[date].entradas += 1;
                acc[date].extraviada += 1;
            }
            acc[date].total += 1;
            console.log(acc)
            return acc;
        }, {});

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

    function loadAllRecordsTable(pertenencias) {
        const tbody = document.querySelector('#allRecordsTable tbody');
        tbody.innerHTML = '';  // Clear existing rows

        pertenencias.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.idPertenencia}</td>
                <td>${item.idEstudiante}</td>
                <td>${item.idObjeto}</td>
                <td>${item.Estado}</td>
                <td>${item.Fecha}</td>
                <td>${item.nombreObjeto}</td>
                <td>${item.nombresEstudiante}</td>
                <td><img src="${item.ImagenPertenencia}" alt="Imagen Pertenencia" width="50" loading="lazy" ></td>
            `;
            tbody.appendChild(row);
        });
    }

    async function downloadPagePdf() {
        const element = document.getElementById('main');
        const opt = {
            margin: 0.5,
            filename: 'reporte_pertenencias.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    }
    document.getElementById('downloadPagePdf').addEventListener('click', downloadPagePdf);


    
    loadChartsAndTables();
});

async function fetchExcelFile() {
    const href = API_URL + "/pertenencia/generar-excel";
    window.open(href, "_blank");
}

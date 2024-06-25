document.addEventListener('DOMContentLoaded', function() {
    async function loadChartsAndTables() {
        const data = await fetchData('consulta-reporte', 'POST');
        console.log(data)
        if (data && data.pertenencias) {
            loadObjectTypeChart(data.pertenencias);
            loadStatusPieChart(data.pertenencias);
            loadSummaryTable(data.registros);
            loadAllRecordsTable(data.registros);
        }
    }
    function crearDataFormulario(data) {
        const formData = new FormData();
        for (const key in data) {
          formData.append(key, data[key]);
        }
        return formData;
      }
    const apiUrl = API_URL + '/pertenencia'; 
    async function fetchData(endpoint, method = 'POST') {
        searchText=""
        const formData = crearDataFormulario({ datosEstudiante: "Antonio" });
        console.log(formData.get('datosEstudiante'))
        const token = getCookie('jwt');  
            const response = await fetch(`${apiUrl}/${endpoint}`, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            handleUnauthorized(response);
            return await response.json();
    }

    function loadObjectTypeChart(pertenencias) {
        console.log(pertenencias)
        const objectTypeData = pertenencias.reduce((acc, item) => {
            acc[item.nombre_objeto] = (acc[item.nombre_objeto] || 0) + 1;
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
        console.log(pertenencias)
        let statusData = {
            Ingresado: 0,
            Salida: 0,
            Extraviado: 0
        };
        pertenencias.forEach(item => {
            if (item.id_estado === 1) {
                statusData.Ingresado += 1;
            } else if (item.id_estado === 2) {
                statusData.Ingresado += 1;
                statusData.Salida += 1;
            } else if (item.id_estado === 3) {
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

    function loadSummaryTable(registros) {
        const tbody = document.querySelector('table tbody');
        tbody.innerHTML = ''; 
        const groupedData = registros.reduce((acc, item) => {
            const date = item.hora_entrada.split('_')[0];
            if (!acc[date]) {
                acc[date] = { entradas: 0, salidas: 0, extraviada: 0, total: 0 };
            }
            if (item.estado === 'Ingresada') {
                acc[date].entradas += 1;
            } else if (item.estado === 'Salida') {
                acc[date].entradas += 1;
                acc[date].salidas += 1;
            } else if (item.estado === 'Extraviada') {
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

    function loadAllRecordsTable(registros) {
        const tbody = document.querySelector('#allRecordsTable tbody');
        tbody.innerHTML = '';  // Clear existing rows

        registros.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.id_registro}</td>
                <td>${item.id_estudiante}</td>
                <td>${item.id_objeto}</td>
                <td>${item.estado}</td>
                <td>${item.hora_entrada}</td>
                <td>${item.nombre_objeto}</td>
                <td>${item.nombres_estudiante}</td>
                <td><img src="${item.imagen_pertenencia}" alt="Imagen Pertenencia" width="50" loading="lazy" ></td>
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

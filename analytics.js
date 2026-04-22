lucide.createIcons();

const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTNE7wplZCgL9WhNifkBZsxsMYqqJOu5girzODTk1Q3XRNBySDHnOcjOLyQRSXbB_O3RPZn__JMWRRe/pub?output=csv';

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return [d.getUTCFullYear(), weekNo];
}

async function loadAnalytics() {
    try {
        const response = await fetch(csvUrl);
        const dataText = await response.text();
        
        const rows = dataText.split('\n').slice(1);
        const cleanData = rows.map(row => {
            if (!row.trim()) return null;
            const cols = row.split(',');
            if (cols.length < 5) return null;

            const rawWeight = cols[4].replace(',', '.').replace(/"/g, '').trim();
            const rawDateStr = cols[0].replace(/"/g, '').trim();
            
            const dateParts = rawDateStr.split(' ')[0].split('.');
            if (dateParts.length < 3) return null;
            const jsDate = new Date(dateParts[2], dateParts[1]-1, dateParts[0]);

            return {
                jsDate: jsDate,
                company: cols[1].replace(/"/g, '').trim(),
                type: cols[3].replace(/"/g, '').trim(),
                weight: parseFloat(rawWeight) || 0
            };
        }).filter(item => item && item.weight > 0);

        if (cleanData.length === 0) return;

        updateStats(cleanData);
        
        const weeklyData = {};
        cleanData.forEach(item => {
            const [year, week] = getWeekNumber(item.jsDate);
            const label = `Тиждень ${week}, ${year}`;
            if (!weeklyData[label]) {
                weeklyData[label] = { total: 0, sortDate: item.jsDate };
            }
            weeklyData[label].total += item.weight;
        });

        const sortedWeeks = Object.entries(weeklyData).sort((a,b) => a[1].sortDate - b[1].sortDate);
        renderLineChart(sortedWeeks.map(i => i[0]), sortedWeeks.map(i => i[1].total));

        renderPieChart(cleanData);
        renderBarChart(cleanData);

    } catch (err) {
        console.error("Помилка завантаження даних:", err);
    }
}

function updateStats(data) {
    const totalWeight = data.reduce((sum, item) => sum + item.weight, 0);
    document.getElementById('totalWeight').innerText = totalWeight.toFixed(1);
    document.getElementById('totalDeals').innerText = data.length;
}

function renderLineChart(labels, values) {
    const ctx = document.getElementById('lineChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Загальна вага за тиждень (т)',
                data: values,
                borderColor: '#E65100',
                backgroundColor: 'rgba(230, 81, 0, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: '#E65100'
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            layout: { padding: { bottom: 20 } },
            plugins: {
                legend: { position: 'bottom', labels: { padding: 20 } }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderPieChart(data) {
    const ctx = document.getElementById('pieChart').getContext('2d');
    const typesCount = {};
    data.forEach(item => {
        typesCount[item.type] = (typesCount[item.type] || 0) + item.weight;
    });

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(typesCount),
            datasets: [{
                data: Object.values(typesCount),
                backgroundColor: ['#E65100', '#1E293B', '#64748B', '#CBD5E1', '#94A3B8', '#BF360C']
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            layout: { padding: { bottom: 30, top: 10 } },
            plugins: {
                legend: { 
                    position: 'bottom', 
                    labels: { padding: 15, boxWidth: 12, font: { size: 12 } } 
                }
            }
        }
    });
}

function renderBarChart(data) {
    const ctx = document.getElementById('barChart').getContext('2d');
    const companies = {};
    data.forEach(item => {
        companies[item.company] = (companies[item.company] || 0) + item.weight;
    });
    const sorted = Object.entries(companies).sort((a,b) => b[1] - a[1]).slice(0, 5);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(i => i[0]),
            datasets: [{
                label: 'Вага (т)',
                data: sorted.map(i => i[1]),
                backgroundColor: '#1E293B',
                borderRadius: 4
            }]
        },
        options: { 
            indexAxis: 'y', 
            responsive: true, 
            maintainAspectRatio: false,
            layout: { 
                padding: { left: 10, bottom: 25, right: 20, top: 10 } 
            },
            plugins: { legend: { display: false } },
            scales: {
                x: { 
                    beginAtZero: true, 
                    grid: { display: false },
                    ticks: { 
                        font: { size: 11 },
                        padding: 10 
                    }
                },
                y: { 
                    grid: { display: false },
                    ticks: { font: { size: 11 } } 
                }
            }
        }
    });
}

loadAnalytics();

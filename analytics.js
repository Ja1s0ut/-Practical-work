lucide.createIcons();

const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTNE7wplZCgL9WhNifkBZsxsMYqqJOu5girzODTk1Q3XRNBySDHnOcjOLyQRSXbB_O3RPZn__JMWRRe/pub?output=csv';

async function loadAnalytics() {
    try {
        console.log("1. Починаємо завантаження даних...");
        const response = await fetch(csvUrl);
        const dataText = await response.text();
        
        console.log("2. Дані отримано! Перші 100 символів:", dataText.substring(0, 100));
        
        const rows = dataText.split('\n').slice(1);
        const cleanData = rows.map(row => {
            if (!row.trim()) return null;        
            const cols = row.split(',');
            if (cols.length < 5) return null;
            const rawWeight = cols[4].replace(',', '.').replace(/"/g, '').trim();

            return {
                date: cols[0].replace(/"/g, '').trim(),
                company: cols[1].replace(/"/g, '').trim(),
                type: cols[3].replace(/"/g, '').trim(),
                weight: parseFloat(rawWeight) || 0
            };
        }).filter(item => item && item.weight > 0);

        console.log("3. Дані після обробки (масив):", cleanData);

        if (cleanData.length === 0) {
            console.error("УВАГА: Масив порожній! Можливо, формат CSV не співпадає.");
            return;
        }

        updateStats(cleanData);
        renderLineChart(cleanData);
        renderPieChart(cleanData);
        renderBarChart(cleanData);
        
        console.log("4. Графіки успішно побудовані!");

    } catch (err) {
        console.error("Помилка завантаження даних:", err);
    }
}

function updateStats(data) {
    const totalWeight = data.reduce((sum, item) => sum + item.weight, 0);
    document.getElementById('totalWeight').innerText = totalWeight.toFixed(1);
    document.getElementById('totalDeals').innerText = data.length;
}

function renderLineChart(data) {
    const ctx = document.getElementById('lineChart').getContext('2d');
    const labels = data.map(item => item.date.split(' ')[0]).reverse();
    const values = data.map(item => item.weight).reverse();

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Тонни',
                data: values,
                borderColor: '#E65100',
                backgroundColor: 'rgba(230, 81, 0, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
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
                backgroundColor: ['#E65100', '#1E293B', '#64748B', '#CBD5E1', '#F8FAFC', '#BF360C']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
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
                label: 'Вага від постачальника (т)',
                data: sorted.map(i => i[1]),
                backgroundColor: '#1E293B'
            }]
        },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false }
    });
}

loadAnalytics();
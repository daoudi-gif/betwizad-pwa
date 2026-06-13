const API_URL = "https://votre-backend.onrender.com/predictions"; // À remplacer

function colorizePercent(val, maxVal, minVal) {
    if (!val) return '<span class="white">-</span>';
    if (val === maxVal && maxVal > 0) return `<span class="green">${val}</span>`;
    if (val === minVal && minVal < maxVal) return `<span class="red">${val}</span>`;
    return `<span class="white">${val}</span>`;
}

function colorizeTip(tip, maxVal, favori) {
    if (!tip) return '-';
    if (tip === favori) return `<span class="green">${tip}</span>`;
    if (["1X","X2","12"].includes(tip)) return `<span class="cyan">${tip}</span>`;
    return `<span class="yellow">${tip}</span>`;
}

async function loadPredictions() {
    const loadingDiv = document.getElementById('loading');
    const container = document.getElementById('table-container');
    const errorDiv = document.getElementById('error');
    try {
        loadingDiv.style.display = 'block';
        errorDiv.style.display = 'none';
        const resp = await fetch(API_URL);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        let html = '';
        for (const [champ, matches] of Object.entries(data)) {
            if (matches.length === 0) continue;
            html += `<div class="champ">🏆 ${champ}</div>`;
            html += `<table><thead><tr>
                <th>TIME</th><th>MATCH</th><th>1 (%)</th><th>X (%)</th><th>2 (%)</th>
                <th>TIPS</th><th>HT/FT</th><th>CS TIPS</th>
            </tr></thead><tbody>`;
            for (const m of matches) {
                const v1 = parseFloat(m.odds_1) || 0;
                const vX = parseFloat(m.odds_x) || 0;
                const v2 = parseFloat(m.odds_2) || 0;
                const maxVal = Math.max(v1, vX, v2);
                const minVal = Math.min(v1, vX, v2);
                let favori = '';
                if (maxVal === v1) favori = '1';
                else if (maxVal === vX) favori = 'X';
                else if (maxVal === v2) favori = '2';
                const p1 = colorizePercent(m.odds_1, maxVal, minVal);
                const pX = colorizePercent(m.odds_x, maxVal, minVal);
                const p2 = colorizePercent(m.odds_2, maxVal, minVal);
                const tip = colorizeTip(m.tip, maxVal, favori);
                const matchName = `${m.home} - ${m.away}${m.score ? ' ('+m.score+')' : ''}`;
                html += `<tr>
                    <td>${m.time}</td>
                    <td style="text-align:left;">${matchName}</td>
                    <td>${p1}</td><td>${pX}</td><td>${p2}</td>
                    <td>${tip}</td><td>${m.htft}</td><td>${m.cs_tips}</td>
                </tr>`;
            }
            html += `</tbody></table>`;
        }
        if (html === '') html = '<p>Aucun match trouvé.</p>';
        container.innerHTML = html;
        loadingDiv.style.display = 'none';
    } catch (err) {
        loadingDiv.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.innerHTML = `⚠️ Erreur : ${err.message}<br>Vérifiez que le backend est actif.`;
        console.error(err);
    }
}

loadPredictions();
setInterval(loadPredictions, 5 * 60 * 1000); // refresh toutes les 5 minutes
function getTeamImage(teamSlug) {
    const team = window.findConstructorBySlug(teamSlug);
    return team && team.image ? team.image : null;
}

function searcher(query) {
    if (!query || typeof query !== 'string') return [];
    const q = query.trim().toLowerCase();

    const driverMatches = window.drivers
        .filter(driver =>
            driver.name.toLowerCase().includes(q) ||
            driver.team.toLowerCase().includes(q) ||
            (driver.nationality && driver.nationality.toLowerCase().includes(q)) ||
            (driver.code && driver.code.toLowerCase().includes(q))
        )
        .map(driver => ({ ...driver, type: 'driver' }));

    const constructorMatches = window.constructors
        .filter(team =>
            team.name.toLowerCase().includes(q) ||
            (team.origin && team.origin.toLowerCase().includes(q)) ||
            (team.engine && team.engine.toLowerCase().includes(q))
        )
        .map(team => ({ ...team, type: 'constructor' }));

    return [...driverMatches, ...constructorMatches];
}

function createTeamCell(teamName, code, colorClass, teamSlug) {
    const span = document.createElement('span');
    span.className = `team-chip ${colorClass}`.trim();

    const teamImage = teamSlug ? getTeamImage(teamSlug) : null;
    if (teamImage) {
        const img = document.createElement('img');
        img.className = 'team-cell-logo';
        img.src = teamImage;
        img.alt = `${teamName} logo`;
        span.appendChild(img);
    }

    const logo = document.createElement('span');
    logo.className = 'logo-badge';
    logo.textContent = code;

    const text = document.createElement('span');
    text.textContent = teamName;

    span.appendChild(logo);
    span.appendChild(text);
    return span;
}

function createEntityCard(entity, type) {
    const wrapper = document.createElement('article');
    wrapper.className = 'entity-card';

    const imageSrc = type === 'constructor' ? entity.image : getTeamImage(entity.teamSlug);
    if (imageSrc) {
        const img = document.createElement('img');
        img.className = 'entity-logo';
        img.src = imageSrc;
        img.alt = `${entity.name} logo`;
        wrapper.appendChild(img);
    }

    const badge = document.createElement('span');
    badge.className = `logo-badge ${entity.colorClass}`.trim();
    badge.textContent = entity.code;

    const title = document.createElement('h3');
    title.textContent = entity.name;

    const meta = document.createElement('p');
    meta.className = 'entity-meta';
    meta.textContent = type === 'driver' ? `${entity.team} • ${entity.points} pts` : `${entity.points} pts`;

    const info = document.createElement('p');
    info.className = 'entity-description';
    info.textContent = type === 'driver' ? entity.bio : entity.description;

    const link = document.createElement('a');
    link.className = 'detail-link';
    link.href = type === 'driver' ? `driver.html?slug=${entity.slug}` : `team.html?slug=${entity.slug}`;
    link.textContent = 'Ver mini página';

    wrapper.append(badge, title, meta, info, link);
    return wrapper;
}

function renderDriverStandings() {
    const tbody = document.querySelector('#driver-standings tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    window.drivers.forEach(driver => {
        const tr = document.createElement('tr');

        const positionCell = document.createElement('td');
        positionCell.className = 'position';
        positionCell.textContent = driver.position;

        const nameCell = document.createElement('td');
        nameCell.textContent = driver.name;

        const teamCell = document.createElement('td');
        teamCell.appendChild(createTeamCell(driver.team, driver.code, driver.colorClass, driver.teamSlug));

        const pointsCell = document.createElement('td');
        pointsCell.textContent = driver.points;
        pointsCell.className = 'strong-text';

        const detailCell = document.createElement('td');
        detailCell.innerHTML = `<a class="detail-link" href="driver.html?slug=${driver.slug}">Ver</a>`;

        tr.append(positionCell, nameCell, teamCell, pointsCell, detailCell);
        tbody.appendChild(tr);
    });
}

function renderConstructorStandings() {
    const tbody = document.querySelector('#constructor-standings tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    window.constructors.forEach(team => {
        const tr = document.createElement('tr');

        const positionCell = document.createElement('td');
        positionCell.className = 'position';
        positionCell.textContent = team.position;

        const nameCell = document.createElement('td');
        nameCell.appendChild(createTeamCell(team.name, team.code, team.colorClass, team.slug));

        const pointsCell = document.createElement('td');
        pointsCell.textContent = team.points;
        pointsCell.className = 'strong-text';

        const detailCell = document.createElement('td');
        detailCell.innerHTML = `<a class="detail-link" href="team.html?slug=${team.slug}">Ver</a>`;

        tr.append(positionCell, nameCell, pointsCell, detailCell);
        tbody.appendChild(tr);
    });
}

function renderCards(containerId, list, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    list.forEach(item => {
        container.appendChild(createEntityCard(item, type));
    });
}

function renderSearchResults(results) {
    const resultsList = document.getElementById('search-results');
    if (!resultsList) return;
    resultsList.innerHTML = '';

    if (!results.length) {
        const emptyItem = document.createElement('li');
        emptyItem.textContent = 'Escribe un nombre de piloto o escudería para buscar.';
        emptyItem.className = 'empty-message';
        resultsList.appendChild(emptyItem);
        return;
    }

    results.forEach(entry => {
        const li = document.createElement('li');
        li.className = 'search-result-item';

        const label = entry.type === 'driver' ? 'Piloto' : 'Escudería';
        const link = entry.type === 'driver' ? `driver.html?slug=${entry.slug}` : `team.html?slug=${entry.slug}`;
        const imageSrc = entry.type === 'driver' ? getTeamImage(entry.teamSlug) : entry.image;

        li.innerHTML = `
            ${imageSrc ? `<img class="search-result-logo" src="${imageSrc}" alt="${entry.name} logo">` : ''}
            <div class="search-result-content">
                <strong>${entry.name}</strong>
                <span class="result-type">${label}</span>
                <span class="result-points">${entry.points} pts</span>
            </div>
            <a class="detail-link-inline" href="${link}">Ver mini página</a>
        `;
        resultsList.appendChild(li);
    });
}

function getSlugFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get('slug');
}

function renderDriverDetail(slug) {
    const driver = window.findDriverBySlug(slug);
    const detail = document.getElementById('detail-content');
    const title = document.getElementById('detail-title');
    const subtitle = document.getElementById('detail-subtitle');
    if (!detail || !title || !subtitle) return;

    if (!driver) {
        title.textContent = 'Piloto no encontrado';
        subtitle.textContent = 'Prueba con otra búsqueda o regresa a la lista de pilotos.';
        detail.innerHTML = '<p class="empty-message">No existe esta mini página de piloto.</p>';
        return;
    }

    const color = (window.teamColors && window.teamColors[driver.teamSlug]) || '#888';
    const leader = window.drivers[0];
    const gap = driver.position === 1 ? 'Líder' : `-${leader.points - driver.points} pts del líder`;

    // Bandera real
    const flagHtml = driver.flagImg
        ? `<img src="${driver.flagImg}" alt="${driver.nationality}" class="detail-flag-img">`
        : `<span>${driver.flag || ''}</span>`;

    // Foto del piloto
    const photoHtml = driver.photo
        ? `<img class="driver-photo" src="${driver.photo}" alt="${driver.name}" style="border: 3px solid ${color}; box-shadow: 0 0 18px ${color}44;">`
        : '';

    // Logo del equipo
    const teamObj = window.findConstructorBySlug(driver.teamSlug);
    const teamLogoHtml = teamObj && teamObj.image
        ? `<img class="detail-team-logo" src="${teamObj.image}" alt="${teamObj.name}">`
        : '';

    // Tabla de resultados por carrera
    const racesDone = window.races || [];
    const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
    const raceRows = racesDone.map((race, i) => {
        const pos = driver.raceResults ? driver.raceResults[i] : null;
        const posLabel = pos == null
            ? '<span class="dnf">—</span>'
            : pos <= 3 ? `${medals[pos]} ${pos}º` : `${pos}º`;
        const pts = pos && pos >= 1 && pos <= 10 ? [25,18,15,12,10,8,6,4,2,1][pos-1] : 0;
        const rowClass = pos === 1 ? 'row-win' : (pos && pos <= 3 ? 'row-podium' : '');
        return `<tr class="${rowClass}">
            <td>${race.flag} ${race.name}${race.sprint ? ' <em class="sprint-tag">S</em>' : ''}</td>
            <td class="pos-cell">${posLabel}</td>
            <td class="pts-mini">${pts > 0 ? '+' + pts : '—'}</td>
        </tr>`;
    }).join('');

    // Gráfico SVG puntos acumulados
    const cumPts = window.getCumulativePoints ? window.getCumulativePoints(driver) : [];
    let chartHtml = '';
    if (cumPts.length > 1) {
        const W = 400, H = 150;
        const PAD = { top: 12, right: 16, bottom: 28, left: 36 };
        const iW = W - PAD.left - PAD.right;
        const iH = H - PAD.top - PAD.bottom;
        const maxPts = Math.max(...cumPts, 1);
        const n = cumPts.length;
        const xS = i => PAD.left + (i / (n - 1)) * iW;
        const yS = v => PAD.top + iH - (v / maxPts) * iH;
        const polyPts = cumPts.map((v, i) => `${xS(i)},${yS(v)}`).join(' ');
        const areaPts = [`${xS(0)},${PAD.top + iH}`,
            ...cumPts.map((v, i) => `${xS(i)},${yS(v)}`),
            `${xS(n - 1)},${PAD.top + iH}`].join(' ');
        const xLabels = racesDone.map((r, i) =>
            `<text x="${xS(i)}" y="${H - 4}" text-anchor="middle" fill="#555" font-size="9">${r.short}</text>`
        ).join('');
        const yLines = [0, 0.5, 1].map(t => {
            const y = PAD.top + iH - t * iH;
            return `<line x1="${PAD.left}" x2="${PAD.left + iW}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,0.06)"/>
                    <text x="${PAD.left - 4}" y="${y + 4}" text-anchor="end" fill="#555" font-size="9">${Math.round(t * maxPts)}</text>`;
        }).join('');
        const dots = cumPts.map((v, i) =>
            `<circle cx="${xS(i)}" cy="${yS(v)}" r="4" fill="${color}" stroke="#111" stroke-width="2"><title>${racesDone[i]?.name}: ${v} pts</title></circle>`
        ).join('');
        chartHtml = `<div class="chart-wrapper">
            <h4 class="chart-title">Evolución de puntos</h4>
            <svg viewBox="0 0 ${W} ${H}" class="points-chart">
                <defs><linearGradient id="ag-${driver.slug}" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
                </linearGradient></defs>
                ${yLines}${xLabels}
                <polygon points="${areaPts}" fill="url(#ag-${driver.slug})"/>
                <polyline points="${polyPts}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>
                ${dots}
            </svg></div>`;
    }

    title.innerHTML = `${flagHtml} ${driver.name}`;
    subtitle.textContent = `${driver.team} · ${driver.points} pts · P${driver.position}`;

    detail.innerHTML = `
        <div class="detail-grid">
            <div class="detail-card-main">
                <div class="driver-hero">
                    ${photoHtml}
                    <div class="driver-hero-info">
                        ${teamLogoHtml}
                        <div class="driver-stats-row">
                            <div class="driver-stat-pill" style="border-color:${color}">
                                <span class="stat-pill-num">${driver.wins}</span>
                                <span class="stat-pill-label">Victorias</span>
                            </div>
                            <div class="driver-stat-pill" style="border-color:${color}">
                                <span class="stat-pill-num">${driver.podiums}</span>
                                <span class="stat-pill-label">Podios</span>
                            </div>
                            <div class="driver-stat-pill" style="border-color:${color}">
                                <span class="stat-pill-num">${driver.poles || 0}</span>
                                <span class="stat-pill-label">Poles</span>
                            </div>
                            <div class="driver-stat-pill" style="border-color:${color}">
                                <span class="stat-pill-num">${driver.fastestLaps || 0}</span>
                                <span class="stat-pill-label">V. Rápidas</span>
                            </div>
                        </div>
                        <ul class="detail-list">
                            <li><strong>Posición:</strong> ${driver.position}º <span class="muted-text">(${gap})</span></li>
                            <li><strong>Puntos:</strong> ${driver.points}</li>
                            <li><strong>Nacionalidad:</strong> ${driver.nationality}</li>
                            <li><strong>Edad:</strong> ${driver.age} años</li>
                        </ul>
                    </div>
                </div>
                <p class="driver-bio">${driver.bio}</p>
                ${racesDone.length ? `
                <div class="race-results-table">
                    <h4>Resultados 2026</h4>
                    <table class="results-mini-table">
                        <thead><tr><th>Carrera</th><th>Pos.</th><th>Pts.</th></tr></thead>
                        <tbody>${raceRows}</tbody>
                    </table>
                </div>` : ''}
            </div>
            <div class="detail-aside">
                ${chartHtml}
                <h3 style="margin-top:1.25rem">Equipo</h3>
                <a class="team-link" href="team.html?slug=${driver.teamSlug}" style="color:${color}">${driver.team} →</a>
            </div>
        </div>`;
}

function renderTeamDetail(slug) {
    const team = window.findConstructorBySlug(slug);
    const detail = document.getElementById('detail-content');
    const title = document.getElementById('detail-title');
    const subtitle = document.getElementById('detail-subtitle');
    if (!detail || !title || !subtitle) return;

    if (!team) {
        title.textContent = 'Escudería no encontrada';
        subtitle.textContent = 'Prueba con otra búsqueda o regresa a la lista de equipos.';
        detail.innerHTML = '<p class="empty-message">No existe esta mini página de escudería.</p>';
        return;
    }

    const color = (window.teamColors && window.teamColors[team.slug]) || '#888';
    const leader = window.constructors[0];
    const gap = team.position === 1 ? 'Líder' : `-${leader.points - team.points} pts del líder`;

    const teamImage = team.image
        ? `<img class="detail-image" src="${team.image}" alt="${team.name} logo">`
        : '';

    // Banderas origen y base
    const originFlagHtml = team.originFlag
        ? `<img src="${team.originFlag}" class="detail-flag-img" alt=""> ${team.origin}`
        : team.origin || '—';
    const baseFlagHtml = team.baseFlag
        ? `<img src="${team.baseFlag}" class="detail-flag-img" alt=""> ${team.base}`
        : team.base || '—';

    // Pilotos con foto, bandera y puntos
    const driverCards = team.topDrivers.map(name => {
        const d = window.drivers.find(x => x.name === name);
        if (!d) return '';
        const dColor = (window.teamColors && window.teamColors[d.teamSlug]) || '#888';
        const pct = team.points > 0 ? Math.round((d.points / team.points) * 100) : 0;
        const dFlag = d.flagImg ? `<img src="${d.flagImg}" class="detail-flag-img" alt="">` : (d.flag || '');
        const dPhoto = d.photo ? `<img src="${d.photo}" class="driver-card-photo" alt="${d.name}" style="border-color:${dColor}">` : '';
        return `<div class="team-driver-card">
            ${dPhoto}
            <div class="team-driver-info">
                <div class="team-driver-name">${dFlag} <a href="driver.html?slug=${d.slug}" style="color:${dColor}">${d.name}</a></div>
                <div class="driver-bar-track" style="margin-top:0.4rem">
                    <div class="driver-bar-fill" style="width:${pct}%;background:${dColor}"></div>
                </div>
                <div class="team-driver-pts"><strong>${d.points}</strong> pts</div>
            </div>
        </div>`;
    }).join('');

    title.innerHTML = `${team.flagImg ? `<img src="${team.flagImg}" class="detail-flag-img" alt="">` : (team.flag || '')} ${team.name}`;
    subtitle.textContent = `${team.points} pts · P${team.position} · ${team.championships} campeonatos`;

    detail.innerHTML = `
        <div class="detail-grid">
            <div class="detail-card-main">
                ${teamImage}
                <p class="driver-bio">${team.description}</p>
                <ul class="detail-list">
                    <li><strong>Posición:</strong> ${team.position}º <span class="muted-text">(${gap})</span></li>
                    <li><strong>Puntos:</strong> ${team.points}</li>
                    <li><strong>Origen:</strong> ${originFlagHtml}</li>
                    <li><strong>Base:</strong> ${baseFlagHtml}</li>
                    <li><strong>Team Principal:</strong> ${team.teamPrincipal}</li>
                    <li><strong>Motor:</strong> ${team.engine}</li>
                    <li><strong>Campeonatos:</strong> ${team.championships}</li>
                </ul>
            </div>
            <div class="detail-aside">
                <h3>Pilotos</h3>
                <div class="team-drivers-grid">${driverCards}</div>
            </div>
        </div>`;
}

function initSearcher() {
    const input = document.getElementById('search-input');
    if (!input) return;

    input.addEventListener('input', () => {
        const results = searcher(input.value);
        renderSearchResults(results);
    });

    renderSearchResults([]);
}


// ─── COUNTDOWN ────────────────────────────────────────────────────────────────
function renderCountdown() {
    const el = document.getElementById('countdown');
    if (!el) return;
    const nextRace = (window.calendar || []).find(r => r.status === 'next' || r.status === 'upcoming');
    if (!nextRace) { el.style.display = 'none'; return; }
    const raceDate = new Date(`${nextRace.date}T${nextRace.time ? nextRace.time + ':00' : '12:00:00'}-03:00`);

    // Next sprint: find upcoming sprint weekend after current race
    const nextSprint = (window.calendar || []).find(r =>
        (r.status === 'next' || r.status === 'upcoming') && r.sprint && r.round !== nextRace.round
    );
    const sprintTag = nextRace.sprint
        ? '<span class="cd-sprint-badge">🏎 Fin de semana Sprint</span>'
        : (nextSprint ? '<span class="cd-next-sprint">Próximo Sprint: ' + nextSprint.flag + ' ' + nextSprint.name + ' (R' + nextSprint.round + ')</span>' : '');

    function tick() {
        const diff = raceDate - new Date();
        if (diff <= 0) { el.innerHTML = '<span class="countdown-live">¡EN VIVO AHORA!</span>'; return; }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        el.innerHTML =
            '<div class="countdown-label">Próxima: ' + (nextRace.flag || '') + ' ' + nextRace.name + '</div>' +
            sprintTag +
            '<div class="countdown-time">' +
            '<span class="cd-unit"><strong>' + d + '</strong><small>días</small></span>' +
            '<span class="cd-sep">:</span>' +
            '<span class="cd-unit"><strong>' + String(h).padStart(2,'0') + '</strong><small>hs</small></span>' +
            '<span class="cd-sep">:</span>' +
            '<span class="cd-unit"><strong>' + String(m).padStart(2,'0') + '</strong><small>min</small></span>' +
            '<span class="cd-sep">:</span>' +
            '<span class="cd-unit"><strong>' + String(s).padStart(2,'0') + '</strong><small>seg</small></span>' +
            '</div>' +
            (nextRace.time ? '<div class="countdown-hour">🇦🇷 ' + nextRace.time + ' hs Argentina · Fox Sports / Disney+</div>' : '');
    }
    tick();
    setInterval(tick, 1000);
}

// ─── LÍDERES EN HOME ─────────────────────────────────────────────────────────
function renderChampionshipLeaders() {
    var dEl = document.getElementById('driver-leader');
    var tEl = document.getElementById('team-leader');
    if (dEl && window.drivers && window.drivers.length) {
        var d = window.drivers[0];
        var dColor = (window.teamColors && window.teamColors[d.teamSlug]) || '#888';
        var dFlag = d.flagImg ? '<img src="' + d.flagImg + '" class="detail-flag-img" alt="">' : (d.flag || '');
        dEl.innerHTML =
            '<div class="leader-label">Líder de pilotos</div>' +
            '<div class="leader-name" style="color:' + dColor + '">' + dFlag + ' ' + d.name + '</div>' +
            '<div class="leader-detail">' + d.team + ' · <strong>' + d.points + ' pts</strong></div>' +
            '<a class="detail-link" href="driver.html?slug=' + d.slug + '">Ver →</a>';
    }
    if (tEl && window.constructors && window.constructors.length) {
        var t = window.constructors[0];
        var tColor = (window.teamColors && window.teamColors[t.slug]) || '#888';
        var tFlag = t.flagImg ? '<img src="' + t.flagImg + '" class="detail-flag-img" alt="">' : (t.flag || '');
        tEl.innerHTML =
            '<div class="leader-label">Líder de constructores</div>' +
            '<div class="leader-name" style="color:' + tColor + '">' + tFlag + ' ' + t.name + '</div>' +
            '<div class="leader-detail"><strong>' + t.points + ' pts</strong></div>' +
            '<a class="detail-link" href="team.html?slug=' + t.slug + '">Ver →</a>';
    }
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
function initPage() {
    var body = document.body;

    if (body.classList.contains('page-home')) {
        renderChampionshipLeaders();
        renderCountdown();
        return;
    }
    if (body.classList.contains('page-search')) {
        initSearcher();
        return;
    }
    if (body.classList.contains('page-calendar')) {
        return;
    }
    if (body.classList.contains('page-drivers')) {
        renderDriverStandings();
        renderCards('driver-cards', window.drivers, 'driver');
        initSearcher();
        return;
    }
    if (body.classList.contains('page-teams')) {
        renderConstructorStandings();
        renderCards('team-cards', window.constructors, 'constructor');
        initSearcher();
        return;
    }
    if (body.classList.contains('page-driver-detail')) {
        renderDriverDetail(getSlugFromQuery());
        initSearcher();
        return;
    }
    if (body.classList.contains('page-team-detail')) {
        renderTeamDetail(getSlugFromQuery());
        initSearcher();
        return;
    }
    if (body.classList.contains('page-compare')) {
        initCompare();
        return;
    }
    if (body.classList.contains('page-circuits')) {
        renderCircuits();
        return;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}

// ─── COMPARADOR DE PILOTOS ────────────────────────────────────────────────────
function initCompare() {
    const selA = document.getElementById('driver-a');
    const selB = document.getElementById('driver-b');
    if (!selA || !selB) return;

    window.drivers.forEach((d, i) => {
        const optA = document.createElement('option');
        optA.value = d.slug;
        optA.textContent = d.name + ' (' + d.team + ')';
        selA.appendChild(optA);

        const optB = document.createElement('option');
        optB.value = d.slug;
        optB.textContent = d.name + ' (' + d.team + ')';
        selB.appendChild(optB);
    });

    // Default to first two drivers
    if (selA.options.length > 1) selB.selectedIndex = 1;

    // Auto compare on selection change
    selA.addEventListener('change', runCompare);
    selB.addEventListener('change', runCompare);
    document.getElementById('compare-btn').addEventListener('click', runCompare);

    runCompare();
}

function runCompare() {
    const slugA = document.getElementById('driver-a').value;
    const slugB = document.getElementById('driver-b').value;
    const dA = window.findDriverBySlug(slugA);
    const dB = window.findDriverBySlug(slugB);
    const result = document.getElementById('compare-result');
    if (!dA || !dB || !result) return;

    if (slugA === slugB) {
        result.className = 'card compare-same-warning';
        result.innerHTML = '<p>Seleccioná dos pilotos distintos para comparar.</p>';
        return;
    }

    const colA = window.getTeamColor(dA.teamSlug);
    const colB = window.getTeamColor(dB.teamSlug);
    const racesDone = (window.races || []);
    const cumA = window.getCumulativePoints(dA);
    const cumB = window.getCumulativePoints(dB);

    function statBar(valA, valB, label, formatFn) {
        const fmt = formatFn || (v => v);
        const maxVal = Math.max(valA, valB, 1);
        const pctA = (valA / maxVal) * 100;
        const pctB = (valB / maxVal) * 100;
        const winnerA = valA > valB ? 'compare-stat-winner' : '';
        const winnerB = valB > valA ? 'compare-stat-winner' : '';
        return `<div class="cmp-stat-row">
            <div class="cmp-stat-a ${winnerA}">
                <span class="cmp-val" style="color:${colA}">${fmt(valA)}</span>
                <div class="cmp-bar-track"><div class="cmp-bar-fill" style="width:${pctA}%;background:${colA}"></div></div>
            </div>
            <div class="cmp-stat-label">${label}</div>
            <div class="cmp-stat-b ${winnerB}">
                <div class="cmp-bar-track cmp-bar-right"><div class="cmp-bar-fill cmp-bar-fill-right" style="width:${pctB}%;background:${colB}"></div></div>
                <span class="cmp-val" style="color:${colB}">${fmt(valB)}</span>
            </div>
        </div>`;
    }

    // Race-by-race comparison table
    const raceRows = racesDone.map((race, i) => {
        const posA = dA.raceResults ? dA.raceResults[i] : null;
        const posB = dB.raceResults ? dB.raceResults[i] : null;
        const pts = [25,18,15,12,10,8,6,4,2,1];
        const ptsA = posA && posA >= 1 && posA <= 10 ? pts[posA-1] : 0;
        const ptsB = posB && posB >= 1 && posB <= 10 ? pts[posB-1] : 0;
        const clsA = posA !== null && (posB === null || posA < posB) ? 'cmp-race-winner' : '';
        const clsB = posB !== null && (posA === null || posB < posA) ? 'cmp-race-winner' : '';
        return `<tr>
            <td class="cmp-race-cell ${clsA}" style="${clsA ? 'color:'+colA : ''}">${posA !== null ? posA+'º' : '—'} <span class="cmp-race-pts">${ptsA > 0 ? '+'+ptsA : ''}</span></td>
            <td class="cmp-race-name">${race.flag} ${race.name}${race.sprint ? ' <em class="sprint-tag">S</em>' : ''}</td>
            <td class="cmp-race-cell ${clsB}" style="${clsB ? 'color:'+colB : ''}">${posB !== null ? posB+'º' : '—'} <span class="cmp-race-pts">${ptsB > 0 ? '+'+ptsB : ''}</span></td>
        </tr>`;
    }).join('');

    // SVG dual-line chart
    let chartHtml = '';
    if (cumA.length > 1 && cumB.length > 1) {
        const W = 500, H = 160;
        const PAD = { top: 12, right: 16, bottom: 28, left: 40 };
        const iW = W - PAD.left - PAD.right;
        const iH = H - PAD.top - PAD.bottom;
        const n = racesDone.length;
        const maxPts = Math.max(...cumA, ...cumB, 1);
        const xS = i => PAD.left + (i / (n - 1)) * iW;
        const yS = v => PAD.top + iH - (v / maxPts) * iH;

        const polyA = cumA.map((v, i) => `${xS(i)},${yS(v)}`).join(' ');
        const polyB = cumB.map((v, i) => `${xS(i)},${yS(v)}`).join(' ');
        const xLabels = racesDone.map((r, i) =>
            `<text x="${xS(i)}" y="${H - 4}" text-anchor="middle" fill="#555" font-size="9">${r.short}</text>`
        ).join('');
        const dotsA = cumA.map((v, i) =>
            `<circle cx="${xS(i)}" cy="${yS(v)}" r="4" fill="${colA}" stroke="#111" stroke-width="2"><title>${racesDone[i]?.name}: ${v} pts</title></circle>`
        ).join('');
        const dotsB = cumB.map((v, i) =>
            `<circle cx="${xS(i)}" cy="${yS(v)}" r="4" fill="${colB}" stroke="#111" stroke-width="2"><title>${racesDone[i]?.name}: ${v} pts</title></circle>`
        ).join('');

        chartHtml = `<div class="cmp-chart-wrap">
            <h4 class="chart-title">Evolución de puntos</h4>
            <div class="cmp-chart-legend">
                <span><span class="cmp-legend-dot" style="background:${colA}"></span> ${dA.name}</span>
                <span><span class="cmp-legend-dot" style="background:${colB}"></span> ${dB.name}</span>
            </div>
            <svg viewBox="0 0 ${W} ${H}" class="points-chart cmp-chart-svg">
                ${xLabels}
                <polyline points="${polyA}" fill="none" stroke="${colA}" stroke-width="2.5" stroke-linejoin="round"/>
                <polyline points="${polyB}" fill="none" stroke="${colB}" stroke-width="2.5" stroke-linejoin="round" stroke-dasharray="6 3"/>
                ${dotsA}${dotsB}
            </svg>
        </div>`;
    }

    result.className = 'compare-result-visible';
    result.innerHTML = `
        <!-- Headers -->
        <div class="cmp-headers">
            <div class="cmp-header-a card" style="border-top:3px solid ${colA}">
                <img src="${dA.flagImg || ''}" class="detail-flag-img" alt="">
                <div class="cmp-hname" style="color:${colA}">${dA.name}</div>
                <div class="cmp-hteam">${dA.team}</div>
                <div class="cmp-hpts">${dA.points} pts · P${dA.position}</div>
            </div>
            <div class="cmp-vs-badge">VS</div>
            <div class="cmp-header-b card" style="border-top:3px solid ${colB}">
                <img src="${dB.flagImg || ''}" class="detail-flag-img" alt="">
                <div class="cmp-hname" style="color:${colB}">${dB.name}</div>
                <div class="cmp-hteam">${dB.team}</div>
                <div class="cmp-hpts">${dB.points} pts · P${dB.position}</div>
            </div>
        </div>

        <!-- Estadísticas -->
        <div class="card cmp-stats-card">
            <h3>Estadísticas</h3>
            <div class="cmp-stats-grid">
                ${statBar(dA.points, dB.points, 'Puntos')}
                ${statBar(dA.wins, dB.wins, 'Victorias')}
                ${statBar(dA.podiums, dB.podiums, 'Podios')}
                ${statBar(dA.poles || 0, dB.poles || 0, 'Poles')}
                ${statBar(dA.fastestLaps || 0, dB.fastestLaps || 0, 'V. Rápidas')}
                ${statBar(dA.age, dB.age, 'Edad', v => v + ' años')}
            </div>
        </div>

        <!-- Gráfico -->
        ${chartHtml ? '<div class="card">' + chartHtml + '</div>' : ''}

        <!-- Carrera a carrera -->
        ${raceRows ? `<div class="card cmp-race-card">
            <h3>Carrera a carrera</h3>
            <table class="cmp-race-table">
                <thead>
                    <tr>
                        <th style="color:${colA}">${dA.code}</th>
                        <th>Carrera</th>
                        <th style="color:${colB}">${dB.code}</th>
                    </tr>
                </thead>
                <tbody>${raceRows}</tbody>
            </table>
        </div>` : ''}
    `;
}

// ─── CIRCUITOS ───────────────────────────────────────────────────────────────
async function fetchCircuitSVG(slug) {
    try {
        const res = await fetch(`img/circuits/${slug}.svg`);
        if (!res.ok) return null;
        const text = await res.text();
        // Extract just the path data from the SVG
        const match = text.match(/<path[^>]+d="([^"]+)"/);
        const vbMatch = text.match(/viewBox="([^"]+)"/);
        return { d: match ? match[1] : null, viewBox: vbMatch ? vbMatch[1] : '0 0 500 500' };
    } catch { return null; }
}

function renderCircuits() {
    const grid = document.getElementById('circuits-grid');
    if (!grid || !window.circuits) return;

    // Render shells first, then async fill in SVGs
    grid.innerHTML = (window.circuits || []).map(c => {
        const flagHtml = c.flagImg ? `<img src="${c.flagImg}" class="detail-flag-img" alt="">` : (c.flag || '');
        return `<div class="card circuit-card" id="cc-${c.slug}">
            <div class="circuit-header">
                <div>
                    <div class="circuit-country">${flagHtml} ${c.country} · ${c.city}</div>
                    <h3 class="circuit-name">${c.name}</h3>
                </div>
                <div class="circuit-year">Desde ${c.firstGP}</div>
            </div>
            <div class="circuit-layout-wrap" id="clw-${c.slug}">
                <div class="circuit-svg-loading"></div>
            </div>
            <div class="circuit-stats">
                <div class="circuit-stat"><span class="cs-val">${c.length} km</span><span class="cs-label">Longitud</span></div>
                <div class="circuit-stat"><span class="cs-val">${c.laps}</span><span class="cs-label">Vueltas</span></div>
                <div class="circuit-stat"><span class="cs-val">${c.lapRecord}</span><span class="cs-label">Récord de vuelta</span></div>
            </div>
            <div class="circuit-record-holder">${c.lapRecordHolder} · ${c.lapRecordYear}</div>
            <p class="circuit-desc">${c.description}</p>
        </div>`;
    }).join('');

    // Async load each SVG
    window.circuits.forEach(async c => {
        const wrap = document.getElementById(`clw-${c.slug}`);
        if (!wrap) return;
        const svgData = await fetchCircuitSVG(c.slug);
        if (svgData && svgData.d) {
            wrap.innerHTML = `<svg viewBox="${svgData.viewBox}" class="circuit-svg" xmlns="http://www.w3.org/2000/svg">
                <path d="${svgData.d}" fill="none" stroke="${c.color}" stroke-width="5"
                      stroke-linejoin="round" stroke-linecap="round" opacity="0.3"/>
                <path d="${svgData.d}" fill="none" stroke="${c.color}" stroke-width="2.5"
                      stroke-linejoin="round" stroke-linecap="round"/>
            </svg>`;
        } else {
            wrap.innerHTML = `<div class="circuit-no-svg">Trazado no disponible</div>`;
        }
    });
}

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
    if (body.classList.contains('page-glossary')) {
        initGlossary();
        return;
    }
    if (body.classList.contains('page-rookies')) {
        renderRookies();
        return;
    }
    if (body.classList.contains('page-today')) {
        initToday();
        return;
    }
    if (body.classList.contains('page-livrees')) {
        renderLivrees();
        return;
    }
    if (body.classList.contains('page-stats')) {
        renderStats();
        return;
    }
    if (body.classList.contains('page-timeline')) {
        renderTimeline();
        return;
    }
    if (body.classList.contains('page-predictor')) {
        renderPredictor();
        return;
    }
    if (body.classList.contains('page-trivia')) {
        renderTrivia();
        return;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        initPage();
        initGlobalSearch();
        initCalendarExport();
        initDriverSwipe();
        initShareButtons();
        injectNotifyButton();
        initPWA();
        // Scroll animations run last, after page content is rendered
        requestAnimationFrame(() => initScrollAnimations());
    });
} else {
    initTheme();
    initPage();
    initGlobalSearch();
    initCalendarExport();
    initDriverSwipe();
    initShareButtons();
    injectNotifyButton();
    initPWA();
    requestAnimationFrame(() => initScrollAnimations());
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

// ═══════════════════════════════════════════════════════════════════════════════
// BLOQUE 1 — GLOSARIO, ROOKIES, ESTE DÍA EN LA F1, LIVRÉES
// ═══════════════════════════════════════════════════════════════════════════════

// ─── DATOS: GLOSARIO F1 2026 ─────────────────────────────────────────────────
window.glossaryTerms = [
    // Reglamento 2026 — novedades
    {
        term: 'MOS',
        full: 'Manual Override System',
        cat: '2026',
        tag: 'NUEVO 2026',
        def: 'Reemplaza al DRS desde 2026. El piloto activa manualmente un modo de mayor potencia eléctrica en las zonas designadas de la pista. A diferencia del DRS, no abre un alerón trasero sino que boost la MGU-K para generar hasta 350 kW adicionales. Se puede usar en zonas de detección marcadas por la FIA, igual que el antiguo DRS.'
    },
    {
        term: 'Power Unit 2026',
        full: 'Nueva Unidad de Potencia',
        cat: '2026',
        tag: 'NUEVO 2026',
        def: 'El reglamento 2026 introdujo motores completamente nuevos: el componente eléctrico (MGU-K) ahora aporta aproximadamente el 50% de la potencia total (~350 kW frente a ~120 kW anteriores). La MGU-H fue eliminada. El motor de combustión interna (ICE) sigue siendo un V6 turbo de 1.6L pero optimizado para correr con combustibles 100% sostenibles (e-fuels).'
    },
    {
        term: 'E-Fuels',
        full: 'Combustibles sostenibles',
        cat: '2026',
        tag: 'NUEVO 2026',
        def: 'Desde 2026, todos los autos de F1 corren con combustibles 100% sostenibles, elaborados a partir de residuos agrícolas, biológicos o captura de carbono. No son eléctricos — el motor sigue quemando combustible, pero con huella de carbono neta cero.'
    },
    {
        term: 'Active Aerodynamics',
        full: 'Aerodinámica activa',
        cat: '2026',
        tag: 'NUEVO 2026',
        def: 'En 2026 los autos tienen elementos aerodinámicos que cambian su posición en carrera de forma automática: modo "Z" (baja resistencia) en rectas y modo "X" (máxima carga) en curvas. El sistema lo gestiona la ECU y no el piloto directamente, reemplazando la función del DRS.'
    },
    {
        term: 'MGU-K',
        full: 'Motor Generator Unit – Kinetic',
        cat: 'Motor',
        def: 'Unidad que recupera energía cinética durante el frenado y la devuelve como potencia eléctrica al acelerar. En 2026 es el componente eléctrico principal de la power unit, aportando hasta 350 kW — mucho más que en generaciones anteriores. La MGU-H fue eliminada.'
    },
    {
        term: 'ICE',
        full: 'Internal Combustion Engine',
        cat: 'Motor',
        def: 'El motor de combustión interna de la F1: V6 turboalimentado de 1.6 litros que gira hasta 15.000 RPM. Desde 2026 corre exclusivamente con e-fuels. Cada piloto puede usar un máximo de 4 ICE por temporada antes de recibir penalidades en la grilla.'
    },
    {
        term: 'ERS',
        full: 'Energy Recovery System',
        cat: 'Motor',
        def: 'Sistema de recuperación de energía. En 2026 solo incluye la MGU-K (ya no hay MGU-H). Recupera energía en los frenos y la almacena en la batería para ser usada como boost eléctrico, especialmente en las zonas de activación del MOS.'
    },
    {
        term: 'Parc Fermé',
        full: 'Parque cerrado',
        cat: 'Reglamento',
        def: 'Período en el que los equipos no pueden hacer cambios significativos al auto. Comienza al final de la clasificación y termina al arrancar la carrera. En fines de semana Sprint, el parc fermé es más largo. Cambios no autorizados implican largada desde el pit lane.'
    },
    {
        term: 'Undercut',
        full: 'Estrategia de adelantamiento por boxes',
        cat: 'Estrategia',
        def: 'Estrategia donde un piloto entra al pit lane antes que su rival, monta neumáticos frescos y da una vuelta rápida para salir adelante cuando el rival haga su propia parada. Efectivo cuando hay tráfico o cuando los neumáticos nuevos generan mucho tiempo por vuelta.'
    },
    {
        term: 'Overcut',
        full: 'Estrategia inversa al undercut',
        cat: 'Estrategia',
        def: 'Lo opuesto al undercut: el piloto espera más que su rival para hacer la parada, confiando en que puede mantener el ritmo con neumáticos más gastados y salir adelante aprovechando que el rival pierde tiempo al detenerse en boxes primero.'
    },
    {
        term: 'Degración',
        full: 'Degradación de neumáticos',
        cat: 'Neumáticos',
        def: 'Pérdida de rendimiento de un neumático a lo largo de su vida útil. Alta degradación significa que el piloto debe hacer más paradas o cuidar más los gomas. Es uno de los factores estratégicos más importantes de cada carrera.'
    },
    {
        term: 'Graining',
        full: 'Granulación del neumático',
        cat: 'Neumáticos',
        def: 'Fenómeno donde pequeños trozos de goma se desprenden del neumático y se adhieren a la superficie, creando una capa irregular que reduce el agarre. Suele ocurrir al inicio de un stint cuando el neumático aún no llegó a la temperatura óptima. Diferente a la degradación estructural.'
    },
    {
        term: 'Stint',
        full: 'Período entre paradas',
        cat: 'Estrategia',
        def: 'El período de vueltas que un piloto completa con el mismo juego de neumáticos entre paradas en boxes. Una carrera de dos paradas tiene tres stints. La duración y ritmo de cada stint es clave para la estrategia.'
    },
    {
        term: 'VSC',
        full: 'Virtual Safety Car',
        cat: 'Carrera',
        def: 'Procedimiento de neutralización donde todos los pilotos deben reducir velocidad a un delta mínimo sin necesidad de agruparse detrás del Safety Car físico. Se activa ante incidentes menores. Es momento clave para hacer paradas en boxes sin perder mucho tiempo.'
    },
    {
        term: 'Safety Car',
        full: 'Auto de seguridad',
        cat: 'Carrera',
        def: 'Vehículo oficial que sale a pista ante incidentes graves, obligando a todos los pilotos a formar una fila detrás suyo a baja velocidad. No se permite adelantar. Las paradas durante el Safety Car son muy valoradas porque el tiempo perdido en boxes se minimiza.'
    },
    {
        term: 'Formation Lap',
        full: 'Vuelta de formación',
        cat: 'Carrera',
        def: 'La vuelta que dan todos los pilotos antes de la salida para calentar neumáticos y frenos, y formar la grilla en las posiciones correctas. Los pilotos realizan zigzags para generar calor en los neumáticos.'
    },
    {
        term: 'Pit Window',
        full: 'Ventana de parada',
        cat: 'Estrategia',
        def: 'El rango de vueltas en el que estratégicamente conviene hacer una parada en boxes. Los equipos calculan la pit window considerando degradación de neumáticos, tráfico y posibles Safety Cars.'
    },
    {
        term: 'Flat Spot',
        full: 'Zona plana en el neumático',
        cat: 'Neumáticos',
        def: 'Desgaste plano en un punto del neumático causado por el bloqueo de ruedas en una frenada. Genera vibración en el auto y puede forzar una parada no planeada en boxes si el daño es severo.'
    },
    {
        term: 'FIA',
        full: 'Fédération Internationale de l\'Automobile',
        cat: 'Organización',
        def: 'El organismo rector del automovilismo mundial. Establece y hace cumplir el Reglamento Deportivo y Técnico de la F1. Los comisarios deportivos de la FIA son los encargados de investigar y sancionar incidentes en carrera.'
    },
    {
        term: 'FOM',
        full: 'Formula One Management',
        cat: 'Organización',
        def: 'La empresa comercial que administra los derechos televisivos, de marketing y la organización logística del campeonato de F1. Es propiedad de Liberty Media. Diferente a la FIA, que es el ente regulador.'
    },
    {
        term: 'Parrilla de largada',
        full: 'Grid de salida',
        cat: 'Carrera',
        def: 'Las posiciones de inicio de la carrera, determinadas por los tiempos de clasificación. El piloto más rápido en la Q3 larga desde la pole position. Las posiciones pueden modificarse por penalidades (cambio de motor, incidentes).'
    },
    {
        term: 'Pole Position',
        full: 'Primera posición en la grilla',
        cat: 'Carrera',
        def: 'La posición número 1 de la grilla de largada, otorgada al piloto más rápido en la sesión de clasificación. Da una ventaja importante en circuitos donde adelantar es difícil (como Mónaco o Hungaroring). Vale 1 punto adicional si se registra la vuelta más rápida en Q1, Q2 o Q3.'
    },
    {
        term: 'Q1 / Q2 / Q3',
        full: 'Fases de clasificación',
        cat: 'Clasificación',
        def: 'La clasificación se divide en tres segmentos eliminatorios. Q1 (18 min): eliminan los 5 más lentos. Q2 (15 min): eliminan otros 5. Q3 (12 min): los 10 restantes pelean por la pole. En Q2, los pilotos que avanzan a Q3 deben largar con los neumáticos usados en Q2.'
    },
    {
        term: 'Sprint',
        full: 'Carrera Sprint',
        cat: 'Formato',
        def: 'Carrera corta de aproximadamente 100 km (un tercio de la distancia normal) que se disputa algunos fines de semana. En 2026 hay 6 fines de semana Sprint. La grilla Sprint se determina en una clasificación específica (Sprint Shootout). Los puntos son reducidos: 8-7-6-5-4-3-2-1 para los top 8.'
    },
    {
        term: 'Sprint Shootout',
        full: 'Clasificación para el Sprint',
        cat: 'Formato',
        def: 'La sesión de clasificación que determina la grilla de la carrera Sprint en los fines de semana que la incluyen. Es independiente de la clasificación principal y no afecta la grilla de la carrera del domingo.'
    },
    {
        term: 'Marbles',
        full: 'Bolitas de goma',
        cat: 'Pista',
        def: 'Pequeños trozos de goma que se acumulan fuera de la línea de carrera durante la carrera. Si un piloto sale de la trayectoria ideal (por ejemplo en una maniobra de adelantamiento), puede pisar marbles y perder agarre repentinamente.'
    },
    {
        term: 'DRS',
        full: 'Drag Reduction System',
        cat: 'Histórico',
        tag: 'ELIMINADO 2026',
        def: 'Sistema que permitía abrir el alerón trasero para reducir resistencia aerodinámica y facilitar adelantamientos. Estuvo vigente desde 2011 hasta 2025. En 2026 fue reemplazado por el MOS (Manual Override System) y la aerodinámica activa del nuevo reglamento.'
    },
    {
        term: 'MGU-H',
        full: 'Motor Generator Unit – Heat',
        cat: 'Histórico',
        tag: 'ELIMINADO 2026',
        def: 'Unidad que recuperaba energía del turbocompresor (calor de los gases de escape) y la convertía en electricidad. Era el componente más complejo y costoso de la power unit 2014–2025. Fue eliminada en 2026 para reducir costos y atraer nuevos fabricantes de motores.'
    },
    {
        term: 'Concorde Agreement',
        full: 'Acuerdo Concorde',
        cat: 'Organización',
        def: 'El contrato entre la FIA, la FOM y los equipos que regula la participación en el campeonato, la distribución de los ingresos comerciales y las reglas de gobernanza. El acuerdo vigente va hasta 2029.'
    },
    {
        term: 'Cost Cap',
        full: 'Límite de presupuesto',
        cat: 'Reglamento',
        def: 'Límite al gasto de los equipos introducido en 2021. En 2026 es de aproximadamente 135 millones de dólares por temporada para los equipos grandes, con ajustes según posición en el campeonato. Excederlo resulta en penalidades deportivas y económicas.'
    },
    {
        term: 'Punto extra por VR',
        full: 'Punto por vuelta rápida',
        cat: 'Puntuación',
        def: 'Desde 2019, el piloto que registra la vuelta más rápida de la carrera recibe 1 punto extra, pero solo si termina dentro de los top 10. En 2026 este sistema sigue vigente. No aplica en las carreras Sprint.'
    },
];

// ─── DATOS: ESTE DÍA EN LA F1 ─────────────────────────────────────────────────
// Formato: { month: 1-12, day: 1-31, year, title, desc, category }
window.f1History = [
    { month:1,  day:8,  year:1980, title:'Jody Scheckter anuncia su retiro', desc:'El campeón del mundo 1979 con Ferrari anuncia oficialmente su retiro de la Fórmula 1 tras una temporada 1980 complicada.', category:'Pilotos' },
    { month:1,  day:17, year:2019, title:'Presentación del Williams FW42', desc:'Williams presenta el FW42, su monoplaza para la temporada 2019, iniciando la era de presentaciones digitales de autos en F1.', category:'Equipos' },
    { month:2,  day:1,  year:2014, title:'Reglamento turbo V6', desc:'Entra en vigor el nuevo reglamento que introduce los motores turbo V6 híbridos en F1, los llamados power units que dominaron hasta 2025.', category:'Reglamento' },
    { month:2,  day:14, year:2020, title:'Ferrari SF1000', desc:'Ferrari presenta el SF1000, el auto con el que Charles Leclerc y Sebastian Vettel disputarían la temporada 2020.', category:'Equipos' },
    { month:3,  day:8,  year:1992, title:'Mansell gana en Sudáfrica', desc:'Nigel Mansell arranca la temporada 1992 con victoria en Kyalami, camino a su único título mundial con Williams.', category:'Carreras' },
    { month:3,  day:15, year:1970, title:'Debut del Lotus 72', desc:'El revolucionario Lotus 72 de Colin Chapman hace su debut, introduciendo la distribución de peso adelantada y los pontones laterales que cambiarían el diseño de los autos de F1.', category:'Técnica' },
    { month:3,  day:26, year:2000, title:'Michael Schumacher gana el GP de Australia', desc:'Schumacher arranca el año 2000 dominando en Melbourne, temporada en la que lograría su primer título con Ferrari tras 21 años de sequía del equipo.', category:'Carreras' },
    { month:4,  day:1,  year:2001, title:'Ralf Schumacher gana en San Marino', desc:'Ralf Schumacher logra su segunda victoria en F1 en Imola, por delante de su hermano Michael en un doblete histórico de los Schumacher.', category:'Carreras' },
    { month:4,  day:19, year:1970, title:'Fallece Bruce McLaren', desc:'El fundador del equipo McLaren fallece en un accidente probando el McLaren Can-Am en Goodwood. Tenía 32 años. Su equipo continuaría y se convertiría en uno de los más exitosos de la historia.', category:'Pilotos' },
    { month:5,  day:3,  year:1987, title:'Alain Prost gana en Bélgica', desc:'Prost victorioso en Spa, en una temporada dominada por la rivalidad con Senna dentro del equipo McLaren.', category:'Carreras' },
    { month:5,  day:10, year:1994, title:'Funeral de Ayrton Senna', desc:'Brasil despide a Ayrton Senna con un funeral de estado en São Paulo. Millones de personas se agolparon en las calles para despedir al tricampeón del mundo.', category:'Pilotos' },
    { month:5,  day:23, year:1982, title:'Gilles Villeneuve fallece en Bélgica', desc:'El querido piloto canadiense fallece tras un accidente durante la clasificación del GP de Bélgica en Zolder. El circuito de Montreal lleva su nombre en su honor.', category:'Pilotos' },
    { month:6,  day:5,  year:2011, title:'Sebastian Vettel en Monaco', desc:'Vettel gana en Montecarlo dominando toda la carrera y ampliando su ventaja en el campeonato 2011, temporada en la que se consagraría bicampeón del mundo.', category:'Carreras' },
    { month:6,  day:11, year:1950, title:'Primer GP de la historia', desc:'Se disputa el primer Gran Premio del Campeonato Mundial de Fórmula 1 en Silverstone. Giuseppe Farina gana la carrera y se convertiría en el primer campeón del mundo de F1.', category:'Historia' },
    { month:6,  day:14, year:1998, title:'Michael Schumacher gana en Canadá', desc:'Schumacher victorioso en Montreal con Ferrari, en una de las mejores actuaciones del año en su marcha hacia el título. Fue la primera victoria de Ferrari en Canadá desde 1985.', category:'Carreras' },
    { month:6,  day:20, year:2010, title:'Mark Webber gana en Valencia', desc:'Webber logra una memorable victoria en el GP de Europa disputado en el circuito urbano de Valencia, en una carrera con múltiples incidentes.', category:'Carreras' },
    { month:7,  day:2,  year:2017, title:'Lewis Hamilton gana en Austria', desc:'Hamilton derrota a su compañero Bottas en el Red Bull Ring en una carrera cerrada, manteniendo su ventaja en el campeonato 2017.', category:'Carreras' },
    { month:7,  day:14, year:1996, title:'Damon Hill campeón virtual', desc:'Hill gana en Alemania y ya parece imparable hacia su primer título mundial, que confirmaría más adelante en Japón.', category:'Carreras' },
    { month:7,  day:18, year:2021, title:'Verstappen y Hamilton chocan en Silverstone', desc:'El choque en la primera curva de Copse entre Verstappen y Hamilton se convierte en uno de los más polémicos de la historia reciente. Verstappen se lleva el peor parte y Hamilton gana.', category:'Incidentes' },
    { month:7,  day:22, year:2007, title:'Ferrari presenta el sistema KERS', desc:'Ferrari anuncia que trabaja en el sistema de recuperación de energía cinética que introduciría en 2009, anticipándose a los cambios técnicos que vendrían.', category:'Técnica' },
    { month:8,  day:1,  year:1976, title:'Niki Lauda sobrevive al fuego en Nürburgring', desc:'Niki Lauda sufre un terrible accidente en el Nürburgring y casi pierde la vida entre las llamas de su Ferrari. Su recuperación y regreso apenas 40 días después sigue siendo una de las historias más increíbles del deporte.', category:'Historia' },
    { month:8,  day:13, year:2000, title:'Schumacher 41 victorias, récord de Prost', desc:'Michael Schumacher supera el récord de 41 victorias en F1 de Alain Prost al ganar en Hungría, convirtiéndose en el piloto con más victorias de la historia (hasta ese momento).', category:'Récords' },
    { month:8,  day:27, year:2023, title:'Verstappen récord de victorias consecutivas', desc:'Max Verstappen gana su décima carrera consecutiva en el GP de Bélgica, rompiendo el récord histórico de victorias seguidas en una misma temporada.', category:'Récords' },
    { month:9,  day:3,  year:2017, title:'Lewis Hamilton supera 300 puntos en 2017', desc:'Hamilton en racha imparable hacia su cuarto título, superando los 300 puntos en el campeonato de pilotos en la primera mitad de la temporada 2017.', category:'Récords' },
    { month:9,  day:7,  year:2008, title:'Felipe Massa gana en Italia', desc:'Massa victorioso en Monza en su temporada más competitiva, en la que estuvo a un punto de ganar el campeonato del mundo perdido en el último segundo en Brasil.', category:'Carreras' },
    { month:9,  day:11, year:2022, title:'Charles Leclerc gana en Monza', desc:'Leclerc triunfa en el Templo de la Velocidad ante su tifosi, logrando una de sus victorias más emotivas con Ferrari.', category:'Carreras' },
    { month:9,  day:20, year:2015, title:'Lewis Hamilton campeón del mundo', desc:'Hamilton se consagra tricampeón del mundo en Japón con tres carreras de antelación, igualdando a Niki Lauda y Nelson Piquet. Sería el primero de cuatro títulos consecutivos.', category:'Campeones' },
    { month:10, day:2,  year:2016, title:'Nico Rosberg gana en Malasia', desc:'Victoria de Rosberg en un fin de semana en que el motor de Hamilton falla, cambiando el rumbo del campeonato 2016 que Rosberg terminaría ganando.', category:'Carreras' },
    { month:10, day:9,  year:2022, title:'Verstappen tetracampeón potencial', desc:'Verstappen se acerca al segundo título en Japón 2022 en circunstancias confusas con la lluvia y el Safety Car. Sería el inicio de la era dominante de Red Bull.', category:'Campeones' },
    { month:10, day:21, year:2018, title:'Lewis Hamilton, quinto campeonato', desc:'Hamilton iguala a Juan Manuel Fangio con cinco títulos mundiales al ganar en México 2018, consolidándose como uno de los más grandes de la historia.', category:'Campeones' },
    { month:11, day:1,  year:2020, title:'Hamilton iguala récord de Schumacher', desc:'Lewis Hamilton gana su séptimo campeonato del mundo en Turquía 2020, igualando el récord histórico de Michael Schumacher que parecía inalcanzable.', category:'Récords' },
    { month:11, day:14, year:2021, title:'Verstappen lidera el campeonato en Brasil', desc:'Verstappen y Hamilton electrizan a la F1 con una batalla épica en Interlagos. Hamilton remonta desde el fondo y gana, pero el holandés mantiene la ventaja en el campeonato.', category:'Carreras' },
    { month:11, day:22, year:2020, title:'Primer GP de Las Vegas nocturno', desc:'La F1 anuncia oficialmente el retorno del Gran Premio de Las Vegas para 2023, corriendo de noche por el Strip, con un formato completamente nuevo y espectacular.', category:'Historia' },
    { month:12, day:8,  year:2019, title:'Carlos Sainz firma con McLaren', desc:'Sainz anuncia su fichaje por McLaren para 2019 luego de destacarse en Renault, iniciando el período de mayor crecimiento de su carrera.', category:'Pilotos' },
    { month:12, day:12, year:2021, title:'Max Verstappen, primer campeón holandés', desc:'En la vuelta más dramática de la historia de la F1, Verstappen supera a Hamilton en la última vuelta del GP de Abu Dhabi 2021 para ganar su primer campeonato del mundo.', category:'Campeones' },
];

// ─── DATOS: ROOKIES 2026 ──────────────────────────────────────────────────────
window.rookieSlugs = [
    'kimi-antonelli',
    'isack-hadjar',
    'arvid-lindblad',
    'gabriel-bortoleto',
    'oliver-bearman',
];

window.rookieExtra = {
    'kimi-antonelli': {
        dob: '25 de agosto de 2006',
        hometown: 'Bolonia, Italia',
        champion: 'F2 2024',
        quote: '"Siempre soñé con esto. Ahora tengo que demostrarlo carrera a carrera."',
        highlight: 'Lidera el campeonato en su primera temporada completa — el rookie más joven en lograrlo.',
    },
    'isack-hadjar': {
        dob: '28 de febrero de 2005',
        hometown: 'París, Francia',
        champion: 'F2 2024 (subcampeón)',
        quote: '"Cada vuelta es un aprendizaje. Estoy absorbiendo todo lo que puedo."',
        highlight: 'Consistente debut con Red Bull Racing, sumando puntos importantes.',
    },
    'arvid-lindblad': {
        dob: '26 de septiembre de 2007',
        hometown: 'Newark, Reino Unido',
        champion: 'F3 2024',
        quote: '"Soy el más joven de la parrilla pero eso no me detiene."',
        highlight: 'Con 18 años, uno de los pilotos más jóvenes en debutar en la historia de la F1.',
    },
    'gabriel-bortoleto': {
        dob: '14 de octubre de 2004',
        hometown: 'São Paulo, Brasil',
        champion: 'F3 2023, F2 2024',
        quote: '"Brasil vuelve a tener un piloto peleando en F1. Eso me llena de orgullo."',
        highlight: 'Campeón de F2 y F3 consecutivo — uno de los rookies más preparados de los últimos años.',
    },
    'oliver-bearman': {
        dob: '8 de mayo de 2005',
        hometown: 'Chelmsford, Reino Unido',
        champion: 'F2 2023 (subcampeón)',
        quote: '"Ya corrí para Ferrari en 2024. Ahora quiero demostrar que puedo pelear arriba con regularidad."',
        highlight: 'Ya tenía experiencia en F1 por sustituciones. Su primera temporada completa confirma su talento.',
    },
};

// ─── RENDER: GLOSARIO ─────────────────────────────────────────────────────────
function renderGlossary(filter = '', catFilter = 'Todos') {
    const list = document.getElementById('glossary-list');
    const empty = document.getElementById('glossary-empty');
    const emptyQ = document.getElementById('glossary-empty-q');
    if (!list) return;

    const q = filter.trim().toLowerCase();
    const terms = window.glossaryTerms.filter(t => {
        const matchCat = catFilter === 'Todos' || t.cat === catFilter;
        const matchQ = !q ||
            t.term.toLowerCase().includes(q) ||
            (t.full && t.full.toLowerCase().includes(q)) ||
            t.def.toLowerCase().includes(q);
        return matchCat && matchQ;
    });

    if (terms.length === 0) {
        list.innerHTML = '';
        empty.style.display = '';
        if (emptyQ) emptyQ.textContent = filter;
        return;
    }
    empty.style.display = 'none';

    // Group by category
    const bycat = {};
    terms.forEach(t => {
        if (!bycat[t.cat]) bycat[t.cat] = [];
        bycat[t.cat].push(t);
    });

    const catOrder = ['2026', 'Motor', 'Estrategia', 'Neumáticos', 'Carrera', 'Clasificación', 'Formato', 'Pista', 'Reglamento', 'Puntuación', 'Organización', 'Histórico'];
    const orderedCats = catOrder.filter(c => bycat[c]).concat(Object.keys(bycat).filter(c => !catOrder.includes(c)));

    list.innerHTML = orderedCats.map(cat => `
        <div class="glossary-cat-section">
            <h3 class="glossary-cat-title">${cat}</h3>
            <div class="glossary-cat-items">
                ${bycat[cat].map(t => `
                    <div class="card glossary-item">
                        <div class="glossary-item-header">
                            <div>
                                <span class="glossary-term">${t.term}</span>
                                ${t.full ? `<span class="glossary-full">— ${t.full}</span>` : ''}
                            </div>
                            ${t.tag ? `<span class="glossary-tag ${t.tag.includes('ELIM') ? 'tag-eliminated' : 'tag-new'}">${t.tag}</span>` : ''}
                        </div>
                        <p class="glossary-def">${t.def}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function initGlossary() {
    const catsEl = document.getElementById('glossary-cats');
    const searchEl = document.getElementById('glossary-search');
    if (!catsEl || !searchEl) return;

    // Build category filters
    const cats = ['Todos', ...new Set(window.glossaryTerms.map(t => t.cat))];
    const catOrder = ['Todos', '2026', 'Motor', 'Estrategia', 'Neumáticos', 'Carrera', 'Clasificación', 'Formato', 'Pista', 'Reglamento', 'Puntuación', 'Organización', 'Histórico'];
    const orderedCats = catOrder.filter(c => cats.includes(c)).concat(cats.filter(c => !catOrder.includes(c)));

    let activeCat = 'Todos';
    catsEl.innerHTML = orderedCats.map(c => `
        <button class="glossary-cat-btn ${c === 'Todos' ? 'active' : ''}" data-cat="${c}">${c}</button>
    `).join('');

    catsEl.addEventListener('click', e => {
        const btn = e.target.closest('.glossary-cat-btn');
        if (!btn) return;
        activeCat = btn.dataset.cat;
        catsEl.querySelectorAll('.glossary-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderGlossary(searchEl.value, activeCat);
    });

    searchEl.addEventListener('input', () => renderGlossary(searchEl.value, activeCat));

    renderGlossary();
}

// ─── RENDER: ROOKIES ──────────────────────────────────────────────────────────
function renderRookies() {
    const grid = document.getElementById('rookies-grid');
    const chartEl = document.getElementById('rookies-compare-chart');
    if (!grid) return;

    const rookies = (window.rookieSlugs || [])
        .map(s => window.drivers.find(d => d.slug === s))
        .filter(Boolean);

    grid.innerHTML = rookies.map(d => {
        const color = window.getTeamColor(d.teamSlug);
        const extra = (window.rookieExtra || {})[d.slug] || {};
        const cum = window.getCumulativePoints(d);
        const lastPts = cum.length > 0 ? cum[cum.length - 1] : 0;

        // Mini sparkline
        const W = 200, H = 50;
        const maxP = Math.max(...cum, 1);
        const n = cum.length;
        let sparkline = '';
        if (n > 1) {
            const pts = cum.map((v, i) => `${20 + (i/(n-1))*(W-40)},${H - 8 - (v/maxP)*(H-16)}`).join(' ');
            sparkline = `<svg viewBox="0 0 ${W} ${H}" class="rookie-sparkline">
                <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
                ${cum.map((v, i) => `<circle cx="${20 + (i/(n-1))*(W-40)}" cy="${H - 8 - (v/maxP)*(H-16)}" r="3" fill="${color}"/>`).join('')}
            </svg>`;
        }

        return `<div class="card rookie-card" style="border-top: 3px solid ${color}">
            <div class="rookie-header">
                <img src="${d.flagImg || ''}" class="detail-flag-img" alt="">
                <div>
                    <h3 class="rookie-name" style="color:${color}">${d.name}</h3>
                    <div class="rookie-team">${d.team} · #${d.code}</div>
                </div>
                <div class="rookie-pos">P${d.position}</div>
            </div>
            ${extra.highlight ? `<div class="rookie-highlight">⭐ ${extra.highlight}</div>` : ''}
            <div class="rookie-stats-row">
                <div class="rookie-stat"><span class="rs-val" style="color:${color}">${d.points}</span><span class="rs-label">Puntos</span></div>
                <div class="rookie-stat"><span class="rs-val" style="color:${color}">${d.wins}</span><span class="rs-label">Victorias</span></div>
                <div class="rookie-stat"><span class="rs-val" style="color:${color}">${d.podiums}</span><span class="rs-label">Podios</span></div>
                <div class="rookie-stat"><span class="rs-val" style="color:${color}">${d.poles || 0}</span><span class="rs-label">Poles</span></div>
            </div>
            ${sparkline ? `<div class="rookie-sparkline-wrap">${sparkline}</div>` : ''}
            <div class="rookie-extra">
                ${extra.dob ? `<div class="rookie-info-row"><span>🎂</span><span>${extra.dob}</span></div>` : ''}
                ${extra.hometown ? `<div class="rookie-info-row"><span>📍</span><span>${extra.hometown}</span></div>` : ''}
                ${extra.champion ? `<div class="rookie-info-row"><span>🏆</span><span>${extra.champion}</span></div>` : ''}
                ${extra.quote ? `<blockquote class="rookie-quote">${extra.quote}</blockquote>` : ''}
            </div>
            <a href="driver.html?slug=${d.slug}" class="rookie-detail-link" style="color:${color}">Ver perfil completo →</a>
        </div>`;
    }).join('');

    // Comparison chart
    if (chartEl && rookies.length > 1) {
        const W = 600, H = 180;
        const PAD = { top: 12, right: 20, bottom: 28, left: 36 };
        const iW = W - PAD.left - PAD.right;
        const iH = H - PAD.top - PAD.bottom;
        const n = window.races.length;
        const allCums = rookies.map(d => window.getCumulativePoints(d));
        const maxPts = Math.max(...allCums.flat(), 1);
        const xS = i => PAD.left + (n > 1 ? (i / (n-1)) * iW : iW/2);
        const yS = v => PAD.top + iH - (v / maxPts) * iH;

        const lines = rookies.map((d, ri) => {
            const cum = allCums[ri];
            const color = window.getTeamColor(d.teamSlug);
            const poly = cum.map((v, i) => `${xS(i)},${yS(v)}`).join(' ');
            const dots = cum.map((v, i) => `<circle cx="${xS(i)}" cy="${yS(v)}" r="4" fill="${color}" stroke="#111" stroke-width="1.5"><title>${d.name}: ${v} pts</title></circle>`).join('');
            return `<polyline points="${poly}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
                    ${dots}`;
        }).join('');

        const xLabels = window.races.map((r, i) =>
            `<text x="${xS(i)}" y="${H - 4}" text-anchor="middle" fill="#555" font-size="9">${r.short}</text>`
        ).join('');

        const legend = rookies.map((d, ri) => {
            const color = window.getTeamColor(d.teamSlug);
            return `<span style="display:inline-flex;align-items:center;gap:4px;margin-right:12px">
                <span style="width:10px;height:10px;border-radius:50%;background:${color};display:inline-block"></span>
                <span style="font-size:0.78rem;color:#aaa">${d.name.split(' ')[1] || d.name}</span>
            </span>`;
        }).join('');

        chartEl.innerHTML = `
            <div style="margin-bottom:0.5rem">${legend}</div>
            <svg viewBox="0 0 ${W} ${H}" style="width:100%">
                ${xLabels}${lines}
            </svg>`;
    }
}

// ─── RENDER: ESTE DÍA EN LA F1 ────────────────────────────────────────────────
let todayOffset = 0;

function renderToday(offset) {
    const mainEl = document.getElementById('today-main');
    const moreEl = document.getElementById('today-more');
    const labelEl = document.getElementById('today-date-label');
    const navLabelEl = document.getElementById('today-nav-label');
    if (!mainEl) return;

    const d = new Date();
    d.setDate(d.getDate() + offset);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const months = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const dateStr = `${day} de ${months[month]}`;

    if (labelEl) labelEl.textContent = dateStr;
    if (navLabelEl) navLabelEl.textContent = dateStr;

    const facts = (window.f1History || []).filter(f => f.month === month && f.day === day);

    const catColors = {
        'Historia': '#FF8700', 'Campeones': '#FFD700', 'Récords': '#00D2BE',
        'Carreras': '#E10600', 'Pilotos': '#6692FF', 'Técnica': '#64C4FF',
        'Equipos': '#FF8700', 'Reglamento': '#B6BABD', 'Incidentes': '#ff4444',
    };

    if (facts.length === 0) {
        mainEl.innerHTML = `
            <div class="today-empty">
                <div style="font-size:2.5rem;margin-bottom:0.75rem">🏎</div>
                <h3>Sin registros para el ${dateStr}</h3>
                <p>No hay hechos históricos registrados para este día. ¡Todavía puede pasar algo!</p>
            </div>`;
        if (moreEl) moreEl.innerHTML = '';
        return;
    }

    // Main feature: the most significant fact (latest year or most important)
    const main = facts[0];
    const color = catColors[main.category] || '#888';
    mainEl.innerHTML = `
        <div class="today-cat-label" style="color:${color}">${main.category}</div>
        <div class="today-year">${main.year}</div>
        <h2 class="today-title">${main.title}</h2>
        <p class="today-desc">${main.desc}</p>
    `;

    // More facts this day
    if (moreEl) {
        const rest = facts.slice(1);
        if (rest.length > 0) {
            moreEl.innerHTML = `
                <h3 class="today-more-title">También pasó un ${dateStr}…</h3>
                ${rest.map(f => {
                    const c = catColors[f.category] || '#888';
                    return `<div class="card today-more-card">
                        <div class="today-more-header">
                            <span class="today-cat-label" style="color:${c}">${f.category}</span>
                            <span class="today-more-year">${f.year}</span>
                        </div>
                        <strong class="today-more-fact-title">${f.title}</strong>
                        <p class="today-more-desc">${f.desc}</p>
                    </div>`;
                }).join('')}`;
        } else {
            moreEl.innerHTML = '';
        }
    }
}

function initToday() {
    const mainEl = document.getElementById('today-main');
    if (!mainEl) return;
    renderToday(0);
    document.getElementById('prev-day-btn')?.addEventListener('click', () => {
        todayOffset--;
        renderToday(todayOffset);
    });
    document.getElementById('next-day-btn')?.addEventListener('click', () => {
        todayOffset++;
        renderToday(todayOffset);
    });
}

// ─── RENDER: LIVRÉES ──────────────────────────────────────────────────────────
function renderLivrees() {
    const grid = document.getElementById('livrées-grid');
    if (!grid) return;

    grid.innerHTML = (window.constructors || []).map(team => {
        const drivers = window.drivers.filter(d => d.teamSlug === team.slug);
        const c1 = team.color || '#888';
        // Generate a simple livery SVG based on team colors
        const livSvg = generateLiverySVG(team);

        const livreeDesc = {
            'mercedes':        'Negro y plata con acentos verde Petronas. El W17 mantiene la identidad oscura de las últimas temporadas.',
            'ferrari':         'Rojo Scuderia más intenso que en 2025, inspirado en la livrée especial de Monza. Más blanco alrededor del cockpit.',
            'mclaren':         'Papaya naranja predominante con negro antracita. Campeones del mundo 2025 sin cambios drásticos.',
            'red-bull-racing': 'Azul más intenso en homenaje al nuevo socio Ford. Combinado con rojo y amarillo dorado.',
            'alpine':          'Azul eléctrico con rosa BWT como en temporadas anteriores. Continuidad visual pese al cambio a motor Mercedes.',
            'racing-bulls':    'Cuerpo blanco con acentos azul Ford y rojo. Elegida la más bella de la grilla por los fanáticos en 2025.',
            'haas':            'Blanco predominante con negro y rojo Toyota Gazoo Racing, nuevo patrocinador titular.',
            'williams':        'Azul gloss vibrante con negro en los pontones y detalles blancos. Celebra el aniversario del FW14B de Mansell.',
            'audi':            'Plata con acentos naranja en la parte trasera. Los aros de Audi en el alerón trasero son el elemento más llamativo.',
            'cadillac':        'Negro y blanco asimétrico con patrón inspirado en el chevron de Cadillac. Revelada en el Super Bowl LX.',
            'aston-martin':    'Verde British Racing Green oscuro con dorado Aramco. Primer auto diseñado por Adrian Newey.',
        }[team.slug] || team.description || '';
        return `<div class="card livree-card" style="border-top: 3px solid ${c1}">
            <div class="livree-team-header">
                <img src="${team.flagImg || ''}" class="detail-flag-img" alt="">
                <div>
                    <h3 class="livree-team-name" style="color:${c1}">${team.name}</h3>
                    <div class="livree-engine">${team.engine} Power Unit · ${team.base}</div>
                </div>
            </div>
            <div class="livree-svg-wrap">
                ${livSvg}
            </div>
            <div class="livree-colors">
                ${getLiveryColors(team).map(col => `
                    <div class="livree-color-chip">
                        <div class="livree-color-swatch" style="background:${col.hex}"></div>
                        <span class="livree-color-name">${col.name}</span>
                    </div>
                `).join('')}
            </div>
            ${livreeDesc ? `<p class="livree-desc">${livreeDesc}</p>` : ''}
            <div class="livree-drivers">
                ${drivers.map(d => `
                    <a href="driver.html?slug=${d.slug}" class="livree-driver-chip">
                        <img src="${d.flagImg}" class="livree-driver-flag" alt="">
                        <span>${d.name}</span>
                        <span class="livree-driver-num" style="color:${c1}">#${d.code}</span>
                    </a>
                `).join('')}
            </div>
        </div>`;
    }).join('');
}

function getLiveryColors(team) {
    // Colores reales de las livrées 2026 según presentaciones oficiales
    const palettes = {
        'mercedes':        [{ hex:'#1a1a1a', name:'Negro' }, { hex:'#A8A8A8', name:'Plata' }, { hex:'#00D2BE', name:'Verde Petronas' }],
        'ferrari':         [{ hex:'#E8002D', name:'Rosso Scuderia' }, { hex:'#FFFFFF', name:'Blanco' }, { hex:'#FFCC00', name:'Giallo' }],
        'mclaren':         [{ hex:'#FF8000', name:'Papaya Orange' }, { hex:'#1a1a1a', name:'Antracita' }, { hex:'#FFFFFF', name:'Blanco' }],
        'red-bull-racing': [{ hex:'#1B3FAB', name:'Azul Ford/RBR' }, { hex:'#CC1E4A', name:'Rojo' }, { hex:'#FFC906', name:'Amarillo' }],
        'alpine':          [{ hex:'#005AFF', name:'Azul Alpine' }, { hex:'#FF67C7', name:'Rosa BWT' }, { hex:'#FFFFFF', name:'Blanco' }],
        'racing-bulls':    [{ hex:'#FFFFFF', name:'Blanco' }, { hex:'#3671C6', name:'Azul Ford' }, { hex:'#CC1E4A', name:'Rojo' }],
        'haas':            [{ hex:'#FFFFFF', name:'Blanco' }, { hex:'#111111', name:'Negro' }, { hex:'#E10600', name:'Rojo Toyota' }],
        'williams':        [{ hex:'#005AFF', name:'Azul gloss' }, { hex:'#111111', name:'Negro' }, { hex:'#FFFFFF', name:'Blanco' }],
        'audi':            [{ hex:'#C0C0C0', name:'Plata' }, { hex:'#111111', name:'Negro' }, { hex:'#FF6600', name:'Naranja acento' }],
        'cadillac':        [{ hex:'#111111', name:'Negro' }, { hex:'#FFFFFF', name:'Blanco' }, { hex:'#888888', name:'Gris Chevron' }],
        'aston-martin':    [{ hex:'#00594F', name:'British Racing Green' }, { hex:'#FFD700', name:'Dorado Aramco' }, { hex:'#FFFFFF', name:'Blanco' }],
    };
    return palettes[team.slug] || [{ hex: team.color, name: 'Color principal' }];
}

function generateLiverySVG(team) {
    const cols = getLiveryColors(team);
    const c1 = cols[0]?.hex || '#888';
    const c2 = cols[1]?.hex || '#222';
    const c3 = cols[2]?.hex || '#fff';

    // Livery-specific schemes for accurate rendering
    const schemes = {
        'mercedes': {
            body: '#1a1a1a', sidepod: '#2a2a2a', nose: '#1a1a1a',
            accent: '#00D2BE', cockpit: '#111', halo: '#00D2BE',
            frontWing: '#00D2BE', rearWing: '#1a1a1a', stripe: '#A8A8A8'
        },
        'ferrari': {
            body: '#E8002D', sidepod: '#cc0022', nose: '#E8002D',
            accent: '#FFFFFF', cockpit: '#cc0022', halo: '#FFCC00',
            frontWing: '#E8002D', rearWing: '#E8002D', stripe: '#FFFFFF'
        },
        'mclaren': {
            body: '#FF8000', sidepod: '#1a1a1a', nose: '#FF8000',
            accent: '#FFFFFF', cockpit: '#1a1a1a', halo: '#FF8000',
            frontWing: '#FF8000', rearWing: '#1a1a1a', stripe: '#FF8000'
        },
        'red-bull-racing': {
            body: '#1B3FAB', sidepod: '#162f85', nose: '#1B3FAB',
            accent: '#FFC906', cockpit: '#CC1E4A', halo: '#FFC906',
            frontWing: '#1B3FAB', rearWing: '#1B3FAB', stripe: '#CC1E4A'
        },
        'alpine': {
            body: '#005AFF', sidepod: '#0044cc', nose: '#005AFF',
            accent: '#FF67C7', cockpit: '#003db3', halo: '#FFFFFF',
            frontWing: '#005AFF', rearWing: '#005AFF', stripe: '#FF67C7'
        },
        'racing-bulls': {
            body: '#FFFFFF', sidepod: '#e8e8e8', nose: '#FFFFFF',
            accent: '#3671C6', cockpit: '#3671C6', halo: '#3671C6',
            frontWing: '#FFFFFF', rearWing: '#3671C6', stripe: '#CC1E4A'
        },
        'haas': {
            body: '#FFFFFF', sidepod: '#e8e8e8', nose: '#FFFFFF',
            accent: '#E10600', cockpit: '#111111', halo: '#E10600',
            frontWing: '#FFFFFF', rearWing: '#111111', stripe: '#E10600'
        },
        'williams': {
            body: '#005AFF', sidepod: '#0044cc', nose: '#005AFF',
            accent: '#FFFFFF', cockpit: '#111111', halo: '#FFFFFF',
            frontWing: '#005AFF', rearWing: '#111111', stripe: '#FFFFFF'
        },
        'audi': {
            body: '#C0C0C0', sidepod: '#aaaaaa', nose: '#C0C0C0',
            accent: '#FF6600', cockpit: '#111111', halo: '#FF6600',
            frontWing: '#C0C0C0', rearWing: '#111111', stripe: '#FF6600'
        },
        'cadillac': {
            body: '#111111', sidepod: '#222222', nose: '#111111',
            accent: '#FFFFFF', cockpit: '#FFFFFF', halo: '#888888',
            frontWing: '#111111', rearWing: '#FFFFFF', stripe: '#888888'
        },
        'aston-martin': {
            body: '#00594F', sidepod: '#004a42', nose: '#00594F',
            accent: '#FFD700', cockpit: '#003d36', halo: '#FFD700',
            frontWing: '#00594F', rearWing: '#00594F', stripe: '#FFD700'
        },
    };

    const s = schemes[team.slug] || {
        body: c1, sidepod: c2, nose: c1, accent: c3,
        cockpit: c2, halo: c3, frontWing: c1, rearWing: c2, stripe: c3
    };

    const textColor = ['#FFFFFF','#FFF','white'].includes(s.body.toUpperCase()) || s.body === '#FFFFFF' ? '#111' : '#fff';

    return `<svg viewBox="0 0 440 170" class="livree-svg" xmlns="http://www.w3.org/2000/svg">
        <!-- Ground shadow -->
        <ellipse cx="218" cy="158" rx="155" ry="7" fill="rgba(0,0,0,0.35)"/>

        <!-- === REAR WING === -->
        <rect x="352" y="52" width="6" height="42" rx="2" fill="${s.rearWing}"/>
        <rect x="342" y="48" width="40" height="8" rx="3" fill="${s.rearWing}"/>
        <rect x="344" y="56" width="36" height="4" rx="1" fill="${s.accent}" opacity="0.7"/>

        <!-- === MAIN BODY === -->
        <!-- Sidepods -->
        <path d="M 155,88 L 150,112 L 285,112 L 298,102 L 308,88 Z" fill="${s.sidepod}"/>
        <!-- Body top surface -->
        <path d="M 68,92 L 82,70 L 108,58 L 148,50 L 210,48 L 272,50 L 308,58 L 330,72 L 340,88 L 335,98 L 68,98 Z" fill="${s.body}"/>
        <!-- Livery stripe -->
        <path d="M 108,58 L 310,66" fill="none" stroke="${s.stripe}" stroke-width="3.5" stroke-linecap="round" opacity="0.55"/>

        <!-- === ENGINE COVER / INTAKE === -->
        <path d="M 190,48 L 195,40 L 230,38 L 245,46" fill="none" stroke="${s.accent}" stroke-width="2" opacity="0.5"/>

        <!-- === COCKPIT === -->
        <path d="M 163,50 L 172,34 L 192,27 L 218,27 L 238,32 L 248,48 Z" fill="${s.cockpit}"/>
        <!-- Windscreen -->
        <path d="M 172,34 L 182,26 L 218,25 L 234,32" fill="none" stroke="${s.accent}" stroke-width="1.5" opacity="0.6"/>

        <!-- === HALO === -->
        <path d="M 170,34 Q 200,22 232,30" fill="none" stroke="${s.halo}" stroke-width="5" stroke-linecap="round"/>
        <path d="M 195,26 L 198,34" stroke="${s.halo}" stroke-width="4" stroke-linecap="round"/>

        <!-- === NOSE === -->
        <path d="M 68,92 L 80,70 L 92,74 L 88,92 Z" fill="${s.nose}"/>
        <path d="M 68,92 L 55,94 L 50,97 L 55,99 L 68,98 Z" fill="${s.nose}"/>

        <!-- === FRONT WING === -->
        <rect x="28" y="95" width="40" height="5" rx="2" fill="${s.frontWing}"/>
        <rect x="20" y="97" width="56" height="3.5" rx="1.5" fill="${s.accent}" opacity="0.7"/>
        <rect x="26" y="100" width="44" height="3" rx="1.5" fill="${s.frontWing}"/>

        <!-- === WHEELS (with tires) === -->
        <!-- Front wheel -->
        <ellipse cx="110" cy="116" rx="6" ry="18" fill="#1a1a1a"/>
        <rect x="92" y="100" width="12" height="32" rx="6" fill="#1a1a1a"/>
        <ellipse cx="98" cy="116" rx="6" ry="18" fill="#1a1a1a" stroke="#333" stroke-width="1"/>
        <ellipse cx="98" cy="116" rx="3.5" ry="11" fill="#2d2d2d"/>
        <ellipse cx="98" cy="116" rx="1.5" ry="5" fill="${s.accent}"/>
        <!-- Rear wheel -->
        <rect x="296" y="98" width="14" height="36" rx="7" fill="#1a1a1a"/>
        <ellipse cx="303" cy="116" rx="7" ry="20" fill="#1a1a1a" stroke="#333" stroke-width="1"/>
        <ellipse cx="303" cy="116" rx="4" ry="12" fill="#2d2d2d"/>
        <ellipse cx="303" cy="116" rx="1.8" ry="5.5" fill="${s.accent}"/>

        <!-- === TEAM NAME === -->
        <text x="195" y="80" text-anchor="middle" fill="${textColor === '#111' ? '#333' : '#fff'}"
              font-size="10" font-weight="900" font-family="Arial Black, Arial"
              letter-spacing="2.5" opacity="0.9">${team.name.toUpperCase()}</text>
    </svg>`;
}


// ═══════════════════════════════════════════════════════════════════════════════
// BLOQUE 2 — ESTADÍSTICAS, TIMELINE, RÉCORDS, HEAD-TO-HEAD, MATRIZ
// ═══════════════════════════════════════════════════════════════════════════════

// ─── RENDER: ESTADÍSTICAS GLOBALES ───────────────────────────────────────────
function renderStats() {
    const el = document.getElementById('stats-content');
    if (!el) return;

    const drivers = window.drivers;
    const races   = window.races;
    const PTS = [25,18,15,12,10,8,6,4,2,1];

    // ── Récords de temporada
    const records = computeSeasonRecords();

    // ── Victorias por equipo
    const winsByTeam = {};
    const podiumsByTeam = {};
    const polesByTeam = {};
    drivers.forEach(d => {
        if (!winsByTeam[d.teamSlug])   winsByTeam[d.teamSlug]   = 0;
        if (!podiumsByTeam[d.teamSlug]) podiumsByTeam[d.teamSlug] = 0;
        if (!polesByTeam[d.teamSlug])  polesByTeam[d.teamSlug]  = 0;
        winsByTeam[d.teamSlug]   += d.wins   || 0;
        podiumsByTeam[d.teamSlug] += d.podiums || 0;
        polesByTeam[d.teamSlug]  += d.poles  || 0;
    });

    // ── Nationalidades en la parrilla
    const natCount = {};
    drivers.forEach(d => { natCount[d.nationality] = (natCount[d.nationality] || 0) + 1; });
    const natSorted = Object.entries(natCount).sort((a,b) => b[1]-a[1]);

    // ── Constructores carrera a carrera
    const constructorRaceHistory = buildConstructorRaceHistory();

    el.innerHTML = `
        <!-- RÉCORDS -->
        <section class="stats-section">
            <h2 class="stats-section-title">🏆 Récords de la temporada</h2>
            <div class="records-grid">
                ${records.map(r => `
                    <div class="card record-card" style="border-left: 3px solid ${r.color}">
                        <div class="record-label">${r.label}</div>
                        <div class="record-value" style="color:${r.color}">${r.value}</div>
                        <div class="record-holder">${r.holder}</div>
                        ${r.sub ? `<div class="record-sub">${r.sub}</div>` : ''}
                    </div>`).join('')}
            </div>
        </section>

        <!-- VICTORIAS POR EQUIPO -->
        <section class="stats-section">
            <h2 class="stats-section-title">🏁 Victorias por escudería</h2>
            <div class="card stats-bar-card">
                ${buildBarChart(winsByTeam, 'Victorias')}
            </div>
        </section>

        <!-- POLES POR EQUIPO -->
        <section class="stats-section">
            <h2 class="stats-section-title">⚡ Poles por escudería</h2>
            <div class="card stats-bar-card">
                ${buildBarChart(polesByTeam, 'Poles')}
            </div>
        </section>

        <!-- PODIOS POR EQUIPO -->
        <section class="stats-section">
            <h2 class="stats-section-title">🥇 Podios por escudería</h2>
            <div class="card stats-bar-card">
                ${buildBarChart(podiumsByTeam, 'Podios')}
            </div>
        </section>

        <!-- MATRIZ DE RESULTADOS -->
        <section class="stats-section">
            <h2 class="stats-section-title">📊 Tabla de posiciones carrera a carrera (top 10)</h2>
            <div class="card" style="overflow-x:auto">
                ${buildResultsMatrix()}
            </div>
        </section>

        <!-- HEAD-TO-HEAD COMPAÑEROS -->
        <section class="stats-section">
            <h2 class="stats-section-title">⚔️ Head-to-head entre compañeros de equipo</h2>
            <div class="h2h-grid">
                ${buildH2H()}
            </div>
        </section>

        <!-- NACIONALIDADES -->
        <section class="stats-section">
            <h2 class="stats-section-title">🌍 Nacionalidades en la parrilla</h2>
            <div class="card stats-nat-card">
                ${natSorted.map(([nat, count]) => {
                    const driver = drivers.find(d => d.nationality === nat);
                    const flagImg = driver?.flagImg || '';
                    return `<div class="nat-row">
                        <img src="${flagImg}" class="nat-flag" alt="${nat}">
                        <span class="nat-name">${nat}</span>
                        <div class="nat-bar-track">
                            <div class="nat-bar" style="width:${(count/drivers.length)*100}%"></div>
                        </div>
                        <span class="nat-count">${count} piloto${count>1?'s':''}</span>
                    </div>`;
                }).join('')}
            </div>
        </section>

        <!-- CONSTRUCTORES CARRERA A CARRERA -->
        <section class="stats-section">
            <h2 class="stats-section-title">📈 Evolución constructores carrera a carrera</h2>
            <div class="card" style="padding:1.5rem">
                ${buildConstructorsChart(constructorRaceHistory)}
            </div>
        </section>
    `;
}

function computeSeasonRecords() {
    const drivers = window.drivers;
    const races = window.races;
    const PTS = [25,18,15,12,10,8,6,4,2,1];

    // Leader
    const leader = drivers[0];
    const leaderColor = window.getTeamColor(leader.teamSlug);

    // Best single race (most points in one race)
    let bestRacePts = 0, bestRaceDriver = null, bestRaceName = '';
    drivers.forEach(d => {
        (d.raceResults || []).forEach((pos, i) => {
            const p = pos >= 1 && pos <= 10 ? PTS[pos-1] : 0;
            if (p > bestRacePts) {
                bestRacePts = p;
                bestRaceDriver = d;
                bestRaceName = races[i]?.name || '';
            }
        });
    });

    // Most wins
    const topWins = [...drivers].sort((a,b) => b.wins - a.wins)[0];

    // Most poles
    const topPoles = [...drivers].sort((a,b) => (b.poles||0) - (a.poles||0))[0];

    // Most podiums
    const topPodiums = [...drivers].sort((a,b) => b.podiums - a.podiums)[0];

    // Most consistent (lowest average position, min 3 races)
    let bestAvg = 99, bestAvgDriver = null;
    drivers.forEach(d => {
        const valid = (d.raceResults||[]).filter(p => p !== null);
        if (valid.length >= 3) {
            const avg = valid.reduce((a,b) => a+b, 0) / valid.length;
            if (avg < bestAvg) { bestAvg = avg; bestAvgDriver = d; }
        }
    });

    // Best team mate ratio
    const teams = [...new Set(drivers.map(d => d.teamSlug))];
    let bestH2H = null, bestH2HTeam = '';
    teams.forEach(slug => {
        const pair = drivers.filter(d => d.teamSlug === slug);
        if (pair.length === 2) {
            let winsA = 0, winsB = 0;
            const n = Math.min((pair[0].raceResults||[]).length, (pair[1].raceResults||[]).length);
            for (let i = 0; i < n; i++) {
                const a = pair[0].raceResults[i], b = pair[1].raceResults[i];
                if (a !== null && b !== null) {
                    if (a < b) winsA++; else if (b < a) winsB++;
                }
            }
            const total = winsA + winsB;
            if (total > 0) {
                const ratio = Math.max(winsA, winsB) / total;
                if (!bestH2H || ratio > bestH2H.ratio) {
                    const winner = winsA > winsB ? pair[0] : pair[1];
                    bestH2H = { ratio, driver: winner, winsA, winsB, total };
                    bestH2HTeam = pair[0].team;
                }
            }
        }
    });

    return [
        {
            label: 'Líder del campeonato',
            value: `${leader.points} pts`,
            holder: leader.name,
            sub: `${leader.team} · P1`,
            color: leaderColor
        },
        {
            label: 'Más victorias',
            value: `${topWins.wins} victoria${topWins.wins !== 1 ? 's' : ''}`,
            holder: topWins.name,
            sub: topWins.team,
            color: window.getTeamColor(topWins.teamSlug)
        },
        {
            label: 'Más poles',
            value: `${topPoles.poles || 0} pole${(topPoles.poles||0) !== 1 ? 's' : ''}`,
            holder: topPoles.name,
            sub: topPoles.team,
            color: window.getTeamColor(topPoles.teamSlug)
        },
        {
            label: 'Más podios',
            value: `${topPodiums.podiums} podio${topPodiums.podiums !== 1 ? 's' : ''}`,
            holder: topPodiums.name,
            sub: topPodiums.team,
            color: window.getTeamColor(topPodiums.teamSlug)
        },
        {
            label: 'Piloto más constante',
            value: bestAvgDriver ? `P${bestAvg.toFixed(1)} promedio` : '—',
            holder: bestAvgDriver?.name || '—',
            sub: bestAvgDriver?.team || '',
            color: bestAvgDriver ? window.getTeamColor(bestAvgDriver.teamSlug) : '#888'
        },
        {
            label: 'Mayor puntuación en carrera',
            value: `+${bestRacePts} pts`,
            holder: bestRaceDriver?.name || '—',
            sub: bestRaceName,
            color: bestRaceDriver ? window.getTeamColor(bestRaceDriver.teamSlug) : '#888'
        },
    ];
}

function buildBarChart(dataBySlug, label) {
    const teams = window.constructors;
    const max = Math.max(...Object.values(dataBySlug), 1);
    const rows = teams
        .filter(t => (dataBySlug[t.slug] || 0) > 0)
        .sort((a,b) => (dataBySlug[b.slug]||0) - (dataBySlug[a.slug]||0));

    if (rows.length === 0) return `<p style="color:var(--muted);padding:1rem">Sin datos aún.</p>`;

    return `<div class="stats-bars">
        ${rows.map(t => {
            const val = dataBySlug[t.slug] || 0;
            const pct = (val / max) * 100;
            const color = window.getTeamColor(t.slug);
            return `<div class="stats-bar-row">
                <div class="stats-bar-name">
                    <img src="${t.flagImg}" class="nat-flag" alt="">
                    <span>${t.name}</span>
                </div>
                <div class="stats-bar-track">
                    <div class="stats-bar-fill" style="width:${pct}%;background:${color}"></div>
                </div>
                <span class="stats-bar-val" style="color:${color}">${val}</span>
            </div>`;
        }).join('')}
    </div>`;
}

function buildResultsMatrix() {
    const races = window.races;
    const top10 = window.drivers.slice(0, 10);
    const PTS = [25,18,15,12,10,8,6,4,2,1];

    if (!races.length) return '<p style="color:var(--muted);padding:1rem">Sin carreras disputadas.</p>';

    const headers = races.map(r => `<th class="matrix-race-th">${r.flag}<br><small>${r.short}</small></th>`).join('');

    const rows = top10.map(d => {
        const color = window.getTeamColor(d.teamSlug);
        const cells = races.map((_, i) => {
            const pos = d.raceResults?.[i];
            if (pos === null || pos === undefined) return '<td class="matrix-cell matrix-null">—</td>';
            const pts = pos >= 1 && pos <= 10 ? PTS[pos-1] : 0;
            const cls = pos === 1 ? 'matrix-p1' : pos <= 3 ? 'matrix-p3' : pos <= 10 ? 'matrix-pts' : 'matrix-nopt';
            return `<td class="matrix-cell ${cls}" title="+${pts} pts">${pos}</td>`;
        }).join('');
        return `<tr>
            <td class="matrix-driver-cell">
                <span class="matrix-dot" style="background:${color}"></span>
                <span>${d.code}</span>
            </td>
            ${cells}
            <td class="matrix-total" style="color:${color}">${d.points}</td>
        </tr>`;
    }).join('');

    return `<table class="matrix-table">
        <thead>
            <tr>
                <th class="matrix-driver-th">Piloto</th>
                ${headers}
                <th class="matrix-total-th">PTS</th>
            </tr>
        </thead>
        <tbody>${rows}</tbody>
    </table>`;
}

function buildH2H() {
    const teams = window.constructors;
    const drivers = window.drivers;
    const races = window.races;

    return teams.map(team => {
        const pair = drivers.filter(d => d.teamSlug === team.slug);
        if (pair.length < 2) return '';
        const [dA, dB] = pair;
        const color = window.getTeamColor(team.slug);
        let wA = 0, wB = 0, ties = 0;
        const n = Math.min((dA.raceResults||[]).length, (dB.raceResults||[]).length, races.length);

        for (let i = 0; i < n; i++) {
            const a = dA.raceResults?.[i], b = dB.raceResults?.[i];
            if (a !== null && b !== null && a !== undefined && b !== undefined) {
                if (a < b) wA++;
                else if (b < a) wB++;
                else ties++;
            }
        }
        const total = wA + wB;
        const pctA = total > 0 ? Math.round((wA/total)*100) : 50;
        const pctB = 100 - pctA;

        return `<div class="card h2h-card" style="border-top: 2px solid ${color}">
            <div class="h2h-team">${team.name}</div>
            <div class="h2h-names">
                <span style="color:${color}">${dA.code}</span>
                <span class="h2h-vs">vs</span>
                <span style="color:${color}">${dB.code}</span>
            </div>
            <div class="h2h-bar-wrap">
                <div class="h2h-bar-a" style="width:${pctA}%;background:${color};opacity:0.9"></div>
                <div class="h2h-bar-b" style="width:${pctB}%;background:${color};opacity:0.4"></div>
            </div>
            <div class="h2h-scores">
                <span class="h2h-score ${wA > wB ? 'h2h-winner' : ''}">${wA}</span>
                <span class="h2h-score-label">${total > 0 ? `de ${total}` : 'carreras'}</span>
                <span class="h2h-score ${wB > wA ? 'h2h-winner' : ''}">${wB}</span>
            </div>
            <div class="h2h-pts-row">
                <span style="color:${color}">${dA.points} pts</span>
                <span style="color:var(--muted);font-size:0.72rem">puntos</span>
                <span style="color:${color}">${dB.points} pts</span>
            </div>
        </div>`;
    }).join('');
}

function buildConstructorRaceHistory() {
    const teams = window.constructors;
    const PTS = [25,18,15,12,10,8,6,4,2,1];
    const n = window.races.length;
    const history = {};

    teams.forEach(team => {
        const teamDrivers = window.drivers.filter(d => d.teamSlug === team.slug);
        let cum = 0;
        history[team.slug] = [];
        for (let i = 0; i < n; i++) {
            teamDrivers.forEach(d => {
                const pos = d.raceResults?.[i];
                if (pos !== null && pos !== undefined && pos >= 1 && pos <= 10) {
                    cum += PTS[pos-1];
                }
            });
            history[team.slug].push(cum);
        }
    });
    return history;
}

function buildConstructorsChart(history) {
    const W = 600, H = 220;
    const PAD = { top: 12, right: 80, bottom: 28, left: 44 };
    const iW = W - PAD.left - PAD.right;
    const iH = H - PAD.top - PAD.bottom;
    const races = window.races;
    const n = races.length;
    if (n === 0) return '<p style="color:var(--muted)">Sin datos aún.</p>';

    const teams = window.constructors;
    const maxPts = Math.max(...Object.values(history).map(arr => Math.max(...arr, 0)), 1);
    const xS = i => PAD.left + (n > 1 ? (i / (n-1)) * iW : iW/2);
    const yS = v => PAD.top + iH - (v / maxPts) * iH;

    const lines = teams.map(team => {
        const data = history[team.slug] || [];
        if (!data.length) return '';
        const color = window.getTeamColor(team.slug);
        const poly = data.map((v, i) => `${xS(i)},${yS(v)}`).join(' ');
        const lastX = xS(data.length - 1) + 6;
        const lastY = yS(data[data.length-1]);
        return `
            <polyline points="${poly}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>
            <circle cx="${xS(data.length-1)}" cy="${yS(data[data.length-1])}" r="4" fill="${color}" stroke="#111" stroke-width="1.5"/>
            <text x="${lastX}" y="${lastY+4}" fill="${color}" font-size="9" font-weight="700">${team.code}</text>`;
    }).join('');

    const xLabels = races.map((r, i) =>
        `<text x="${xS(i)}" y="${H - 4}" text-anchor="middle" fill="#555" font-size="9">${r.short}</text>`
    ).join('');

    // Y axis labels
    const yLabels = [0, 0.25, 0.5, 0.75, 1].map(f => {
        const v = Math.round(maxPts * f);
        const y = yS(v);
        return `<text x="${PAD.left - 6}" y="${y + 4}" text-anchor="end" fill="#444" font-size="8">${v}</text>
                <line x1="${PAD.left}" y1="${y}" x2="${PAD.left + iW}" y2="${y}" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>`;
    }).join('');

    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;overflow:visible">
        ${yLabels}${xLabels}${lines}
    </svg>`;
}

// ─── RENDER: TIMELINE DEL CAMPEONATO ─────────────────────────────────────────
function renderTimeline() {
    const el = document.getElementById('timeline-content');
    if (!el) return;

    const drivers = window.drivers;
    const races = window.races;
    const PTS = [25,18,15,12,10,8,6,4,2,1];
    const top8 = drivers.slice(0, 8);

    // Build cumulative points after each race
    const cumData = {}; // slug → [pts after each race]
    top8.forEach(d => { cumData[d.slug] = window.getCumulativePoints(d); });

    // Championship leader after each race
    const leaders = races.map((_, i) => {
        let best = null, bestPts = -1;
        top8.forEach(d => {
            const pts = cumData[d.slug][i] || 0;
            if (pts > bestPts) { bestPts = pts; best = d; }
        });
        return best;
    });

    if (!races.length) {
        el.innerHTML = '<div class="card" style="padding:2rem;color:var(--muted)">Sin carreras disputadas aún.</div>';
        return;
    }

    // Gap chart
    const W = 600, H = 260;
    const PAD = { top: 16, right: 90, bottom: 28, left: 44 };
    const iW = W - PAD.left - PAD.right;
    const iH = H - PAD.top - PAD.bottom;
    const n = races.length;
    const maxPts = Math.max(...top8.map(d => Math.max(...(cumData[d.slug] || [0]))), 1);
    const xS = i => PAD.left + (n > 1 ? (i / (n-1)) * iW : iW/2);
    const yS = v => PAD.top + iH - (v / maxPts) * iH;

    const lines = top8.map(d => {
        const color = window.getTeamColor(d.teamSlug);
        const data = cumData[d.slug] || [];
        if (!data.length) return '';
        const poly = data.map((v, i) => `${xS(i)},${yS(v)}`).join(' ');
        const lastY = yS(data[data.length-1]);
        const lastX = xS(data.length-1) + 6;
        return `
            <polyline points="${poly}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>
            ${data.map((v, i) => `<circle cx="${xS(i)}" cy="${yS(v)}" r="3.5" fill="${color}" stroke="#111" stroke-width="1.5"/>`).join('')}
            <text x="${lastX}" y="${lastY+4}" fill="${color}" font-size="9" font-weight="700">${d.code}</text>`;
    }).join('');

    const xLabels = races.map((r, i) =>
        `<text x="${xS(i)}" y="${H-4}" text-anchor="middle" fill="#555" font-size="9">${r.flag} ${r.short}</text>`
    ).join('');

    const yLabels = [0, 0.25, 0.5, 0.75, 1].map(f => {
        const v = Math.round(maxPts * f);
        return `<text x="${PAD.left-6}" y="${yS(v)+4}" text-anchor="end" fill="#444" font-size="8">${v}</text>
                <line x1="${PAD.left}" y1="${yS(v)}" x2="${PAD.left+iW}" y2="${yS(v)}" stroke="rgba(255,255,255,0.05)"/>`;
    }).join('');

    // Race-by-race leader cards
    const raceCards = races.map((race, i) => {
        const leader = leaders[i];
        const leaderPts = leader ? cumData[leader.slug][i] : 0;
        const color = leader ? window.getTeamColor(leader.teamSlug) : '#888';
        const winner = window.drivers.find(d => d.name === race.winner);
        const winColor = winner ? window.getTeamColor(winner.teamSlug) : '#888';

        // Standings after this race (top 3)
        const standing = [...top8].sort((a,b) => (cumData[b.slug][i]||0) - (cumData[a.slug][i]||0)).slice(0,3);

        return `<div class="card timeline-race-card">
            <div class="tl-race-header">
                <div class="tl-round">R${race.round}</div>
                <div class="tl-race-info">
                    <div class="tl-race-name">${race.flag} ${race.name}${race.sprint ? ' <em class="sprint-tag">S</em>' : ''}</div>
                    <div class="tl-winner" style="color:${winColor}">🏆 ${race.winner}</div>
                </div>
                <div class="tl-leader-wrap">
                    <div class="tl-leader-label">Líder</div>
                    <div class="tl-leader-name" style="color:${color}">${leader?.code || '—'}</div>
                    <div class="tl-leader-pts">${leaderPts} pts</div>
                </div>
            </div>
            <div class="tl-podium">
                ${standing.map((d, ri) => {
                    const c = window.getTeamColor(d.teamSlug);
                    const pts = cumData[d.slug][i] || 0;
                    return `<div class="tl-pos-chip">
                        <span class="tl-pos-num">${ri+1}</span>
                        <span class="tl-pos-code" style="color:${c}">${d.code}</span>
                        <span class="tl-pos-pts">${pts}</span>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    }).join('');

    el.innerHTML = `
        <!-- Chart -->
        <div class="card" style="padding:1.5rem">
            <h2 style="margin:0 0 1rem;font-size:1rem">Evolución del campeonato — Top 8</h2>
            <svg viewBox="0 0 ${W} ${H}" style="width:100%;overflow:visible">
                ${yLabels}${xLabels}${lines}
            </svg>
            <div class="tl-legend">
                ${top8.map(d => {
                    const c = window.getTeamColor(d.teamSlug);
                    return `<span style="display:inline-flex;align-items:center;gap:4px;margin:2px 8px 2px 0">
                        <span style="width:10px;height:10px;border-radius:50%;background:${c};display:inline-block;flex-shrink:0"></span>
                        <span style="font-size:0.75rem;color:#aaa">${d.name}</span>
                    </span>`;
                }).join('')}
            </div>
        </div>

        <!-- Race cards -->
        <div class="timeline-races-grid">${raceCards}</div>
    `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOQUE 3 — PREDICTOR, TRIVIA, EXPORTAR .ICS, BUSCADOR GLOBAL Ctrl+K
// ═══════════════════════════════════════════════════════════════════════════════

// ─── PREDICTOR ───────────────────────────────────────────────────────────────
const PRED_KEY = 'f1arg_predictions';

function loadPredictions() {
    try { return JSON.parse(localStorage.getItem(PRED_KEY)) || {}; }
    catch { return {}; }
}
function savePredictions(data) {
    localStorage.setItem(PRED_KEY, JSON.stringify(data));
}

function renderPredictor() {
    const el = document.getElementById('predictor-content');
    if (!el) return;

    const preds = loadPredictions();
    const nextRace = window.calendar.find(r => r.status === 'next' || r.status === 'upcoming');
    const doneRaces = window.calendar.filter(r => r.status === 'done');

    // Scoring: 3 pts exact position, 1 pt correct driver wrong position
    function scorePredict(pred, race) {
        if (!pred || !race) return null;
        const actual = window.races.find(r => r.round === race.round);
        if (!actual) return null;
        // For done races we have winner — only score P1 for now
        let score = 0, max = 9;
        const positions = ['p1','p2','p3'];
        const actuals = [actual.winner, null, null]; // expand when we have full podium
        positions.forEach((pos, i) => {
            if (!pred[pos] || !actuals[i]) return;
            if (pred[pos] === actuals[i]) score += 3;
            else if (actuals.includes(pred[pos])) score += 1;
        });
        return { score, max, pct: Math.round((score/3)*100) };
    }

    // Build prediction form for next race
    const driverOptions = window.drivers.map(d =>
        `<option value="${d.name}">${d.name} (${d.team})</option>`
    ).join('');

    const nextPred = nextRace ? (preds[nextRace.round] || {}) : {};
    const nextForm = nextRace ? `
        <div class="card pred-form-card">
            <h2 class="pred-race-title">
                ${nextRace.flag} ${nextRace.name}
                ${nextRace.sprint ? '<em class="sprint-tag">Sprint</em>' : ''}
            </h2>
            <p class="pred-race-sub">${nextRace.date} · ${nextRace.circuit}</p>
            <div class="pred-podium-inputs">
                ${['p1','p2','p3'].map((pos, i) => `
                    <div class="pred-pos-group">
                        <div class="pred-pos-medal">${['🥇','🥈','🥉'][i]}</div>
                        <label class="pred-pos-label">P${i+1}</label>
                        <select class="pred-select" id="pred-${pos}">
                            <option value="">— Elegir piloto —</option>
                            ${driverOptions}
                        </select>
                    </div>`).join('')}
            </div>
            <button class="btn-primary pred-save-btn" id="pred-save-btn" style="margin-top:1rem">
                Guardar predicción 🎯
            </button>
            <div id="pred-saved-msg" class="pred-saved-msg" style="display:none">
                ✅ Predicción guardada para ${nextRace.name}
            </div>
        </div>` : `<div class="card" style="padding:1.5rem;color:var(--muted)">No hay próxima carrera disponible.</div>`;

    // History of predictions vs results
    const historyCards = doneRaces.map(race => {
        const pred = preds[race.round];
        const actual = window.races.find(r => r.round === race.round);
        if (!pred && !actual) return '';
        const s = pred ? scorePredict(pred, race) : null;

        return `<div class="card pred-hist-card">
            <div class="pred-hist-header">
                <span class="pred-hist-race">${race.flag} ${race.name}</span>
                ${s ? `<span class="pred-hist-score" style="color:${s.pct >= 66 ? '#6eff99' : s.pct >= 33 ? '#ffcc00' : '#ff6b6b'}">
                    ${s.score}/3 pts
                </span>` : '<span class="pred-hist-score" style="color:var(--muted)">Sin predicción</span>'}
            </div>
            <div class="pred-hist-compare">
                <div class="pred-hist-col">
                    <div class="pred-hist-col-title">Tu predicción</div>
                    ${pred ? ['p1','p2','p3'].map((p,i) => `
                        <div class="pred-hist-row">
                            <span class="pred-hist-pos">${['🥇','🥈','🥉'][i]}</span>
                            <span class="pred-hist-name">${pred[p] || '—'}</span>
                        </div>`).join('') : '<p style="color:var(--muted);font-size:0.82rem">No predijiste esta carrera</p>'}
                </div>
                <div class="pred-hist-divider"></div>
                <div class="pred-hist-col">
                    <div class="pred-hist-col-title">Resultado real</div>
                    <div class="pred-hist-row">
                        <span class="pred-hist-pos">🥇</span>
                        <span class="pred-hist-name">${actual?.winner || '—'}</span>
                    </div>
                    <div class="pred-hist-row"><span class="pred-hist-pos">🥈</span><span class="pred-hist-name" style="color:var(--muted)">—</span></div>
                    <div class="pred-hist-row"><span class="pred-hist-pos">🥉</span><span class="pred-hist-name" style="color:var(--muted)">—</span></div>
                </div>
            </div>
        </div>`;
    }).filter(Boolean).reverse().join('');

    // Total score
    let totalScore = 0, totalMax = 0;
    doneRaces.forEach(race => {
        const s = scorePredict(preds[race.round], race);
        if (s) { totalScore += s.score; totalMax += s.max; }
    });
    const totalPct = totalMax > 0 ? Math.round((totalScore/totalMax)*100) : 0;

    el.innerHTML = `
        ${nextForm}
        ${totalMax > 0 ? `
        <div class="card pred-score-summary">
            <div class="pred-score-label">Tu puntaje total</div>
            <div class="pred-score-value" style="color:${totalPct>=66?'#6eff99':totalPct>=33?'#ffcc00':'#ff6b6b'}">${totalScore} <span style="font-size:1rem;color:var(--muted)">/ ${totalMax} pts posibles</span></div>
            <div class="pred-score-bar-track"><div class="pred-score-bar" style="width:${totalPct}%;background:${totalPct>=66?'#6eff99':totalPct>=33?'#ffcc00':'#ff6b6b'}"></div></div>
        </div>` : ''}
        ${historyCards ? `<div>
            <h3 style="font-size:0.85rem;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted);margin:0.5rem 0 0.75rem">Historial de predicciones</h3>
            <div class="pred-history-grid">${historyCards}</div>
        </div>` : ''}
    `;

    // Pre-fill saved values
    if (nextRace) {
        ['p1','p2','p3'].forEach(pos => {
            const sel = document.getElementById(`pred-${pos}`);
            if (sel && nextPred[pos]) sel.value = nextPred[pos];
        });
        document.getElementById('pred-save-btn')?.addEventListener('click', () => {
            const p1 = document.getElementById('pred-p1')?.value;
            const p2 = document.getElementById('pred-p2')?.value;
            const p3 = document.getElementById('pred-p3')?.value;
            if (!p1 && !p2 && !p3) return;
            const all = loadPredictions();
            all[nextRace.round] = { p1, p2, p3, savedAt: new Date().toISOString() };
            savePredictions(all);
            const msg = document.getElementById('pred-saved-msg');
            if (msg) { msg.style.display = ''; setTimeout(() => msg.style.display = 'none', 3000); }
        });
    }
}

// ─── TRIVIA ───────────────────────────────────────────────────────────────────
window.triviaQuestions = [
    // 2026
    { q: '¿Quién lidera el campeonato de pilotos en 2026?', opts: ['George Russell','Kimi Antonelli','Charles Leclerc','Lando Norris'], ans: 1, cat: '2026' },
    { q: '¿Qué reemplazó al DRS en el reglamento 2026?', opts: ['ERS Boost','Active Aero Mode','MOS (Manual Override System)','Kinetic Push'], ans: 2, cat: '2026' },
    { q: '¿Cuántas carreras tiene el calendario 2026 después de las cancelaciones?', opts: ['24','23','22','21'], ans: 2, cat: '2026' },
    { q: '¿Cuál fue el primer equipo nuevo en entrar a la F1 en 2026?', opts: ['Audi','Cadillac','Andretti','Porsche'], ans: 1, cat: '2026' },
    { q: '¿Qué equipo presentó su livrée 2026 durante el Super Bowl LX?', opts: ['Audi','Williams','Cadillac','Haas'], ans: 2, cat: '2026' },
    { q: '¿Qué par de GPs fue cancelado en 2026 por conflicto bélico?', opts: ['Turquía y Rusia','Bahrein y Arabia Saudita','Israel y Emiratos','Qatar y Kuwait'], ans: 1, cat: '2026' },
    { q: '¿Qué equipo contrató a Adrian Newey para diseñar su auto 2026?', opts: ['Ferrari','Red Bull','Aston Martin','Williams'], ans: 2, cat: '2026' },
    { q: '¿Cuál es el motor proveedor de Alpine en 2026?', opts: ['Renault','Ferrari','Honda','Mercedes'], ans: 3, cat: '2026' },
    { q: '¿Quién ganó la primera carrera de 2026 en Australia?', opts: ['Kimi Antonelli','Lando Norris','George Russell','Charles Leclerc'], ans: 2, cat: '2026' },
    { q: '¿De qué ciudad argentina es originario Franco Colapinto?', opts: ['Buenos Aires','Mendoza','San Andrés de Giles','Neuquén'], ans: 2, cat: '2026' },
    // Historia
    { q: '¿Cuántos campeonatos mundiales tiene Lewis Hamilton?', opts: ['5','6','7','8'], ans: 2, cat: 'Historia' },
    { q: '¿En qué año se disputó el primer Campeonato del Mundo de F1?', opts: ['1948','1950','1952','1955'], ans: 1, cat: 'Historia' },
    { q: '¿Quién tiene más victorias en la historia de la F1?', opts: ['Michael Schumacher','Ayrton Senna','Lewis Hamilton','Max Verstappen'], ans: 2, cat: 'Historia' },
    { q: '¿En qué circuito se disputa el GP de Mónaco?', opts: ['Circuit de Monaco','Montecarlo GP Track','Principality Circuit','Monaco Street Circuit'], ans: 0, cat: 'Historia' },
    { q: '¿Qué piloto ganó 4 títulos consecutivos con Red Bull entre 2010 y 2013?', opts: ['Mark Webber','Daniel Ricciardo','Sebastian Vettel','Nico Rosberg'], ans: 2, cat: 'Historia' },
    { q: '¿Cuántas vueltas tiene el GP de Mónaco?', opts: ['65','72','78','80'], ans: 2, cat: 'Historia' },
    { q: '¿Qué significa "undercut" en F1?', opts: ['Adelantamiento en pista','Entrar a boxes antes que el rival para ganar posición','Estrategia de neumáticos duros','Penalidad por salida falsa'], ans: 1, cat: 'Reglamento' },
    { q: '¿Cuántos puntos vale una victoria en F1?', opts: ['20','25','30','10'], ans: 1, cat: 'Reglamento' },
    { q: '¿Qué es el "parc fermé"?', opts: ['Zona de boxes','Período en que no se pueden modificar los autos','Área de prensa','Pit lane cerrado'], ans: 1, cat: 'Reglamento' },
    { q: '¿Cuántos puntos se dan al ganador de una carrera Sprint?', opts: ['10','12','8','25'], ans: 2, cat: 'Reglamento' },
    { q: '¿Qué país tiene más GPs en el calendario 2026?', opts: ['Reino Unido','Alemania','Estados Unidos','Italia'], ans: 2, cat: '2026' },
    { q: '¿Cuál es el circuito más corto del calendario 2026?', opts: ['Mónaco','Red Bull Ring','Hungaroring','Zandvoort'], ans: 1, cat: 'Circuitos' },
    { q: '¿Qué circuito es conocido como el "Templo de la Velocidad"?', opts: ['Silverstone','Suzuka','Monza','Spa'], ans: 2, cat: 'Circuitos' },
    { q: '¿En qué país se ubica el circuito de Suzuka?', opts: ['China','Corea del Sur','Japón','Tailandia'], ans: 2, cat: 'Circuitos' },
    { q: '¿Cuántos títulos de constructores tiene Ferrari?', opts: ['12','14','16','18'], ans: 2, cat: 'Historia' },
];

const TRIVIA_KEY = 'f1arg_trivia_score';

function renderTrivia() {
    const el = document.getElementById('trivia-content');
    if (!el) return;

    let state = {
        questions: shuffle([...window.triviaQuestions]).slice(0, 10),
        current: 0,
        score: 0,
        answered: [],
        finished: false,
        catFilter: 'Todos'
    };

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function renderQuestion() {
        if (state.finished) { renderResults(); return; }
        const q = state.questions[state.current];
        const shuffledOpts = q.opts.map((opt, i) => ({ opt, i }));

        el.innerHTML = `
            <div class="card trivia-progress-card">
                <div class="trivia-progress-header">
                    <span class="trivia-cat-tag">${q.cat}</span>
                    <span class="trivia-counter">${state.current + 1} / ${state.questions.length}</span>
                    <span class="trivia-score-live">🎯 ${state.score} pts</span>
                </div>
                <div class="trivia-progress-bar-track">
                    <div class="trivia-progress-bar" style="width:${(state.current/state.questions.length)*100}%"></div>
                </div>
            </div>
            <div class="card trivia-question-card">
                <h2 class="trivia-question">${q.q}</h2>
                <div class="trivia-options" id="trivia-opts">
                    ${shuffledOpts.map(({opt, i}) => `
                        <button class="trivia-opt-btn" data-idx="${i}">${opt}</button>
                    `).join('')}
                </div>
                <div id="trivia-feedback" class="trivia-feedback" style="display:none"></div>
                <button id="trivia-next-btn" class="btn-primary trivia-next-btn" style="display:none">
                    ${state.current + 1 < state.questions.length ? 'Siguiente →' : 'Ver resultados 🏁'}
                </button>
            </div>`;

        document.querySelectorAll('.trivia-opt-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const chosen = parseInt(btn.dataset.idx);
                const correct = q.ans;
                const isCorrect = chosen === correct;
                if (isCorrect) state.score++;
                state.answered.push({ q: q.q, chosen, correct, isCorrect });

                document.querySelectorAll('.trivia-opt-btn').forEach(b => {
                    b.disabled = true;
                    if (parseInt(b.dataset.idx) === correct) b.classList.add('trivia-correct');
                    else if (parseInt(b.dataset.idx) === chosen && !isCorrect) b.classList.add('trivia-wrong');
                });

                const fb = document.getElementById('trivia-feedback');
                fb.style.display = '';
                fb.innerHTML = isCorrect
                    ? `<span class="trivia-fb-correct">✅ ¡Correcto! +1 punto</span>`
                    : `<span class="trivia-fb-wrong">❌ Incorrecto. La respuesta era: <strong>${q.opts[correct]}</strong></span>`;

                document.getElementById('trivia-next-btn').style.display = '';
            });
        });

        document.getElementById('trivia-next-btn')?.addEventListener('click', () => {
            state.current++;
            if (state.current >= state.questions.length) state.finished = true;
            renderQuestion();
        });
    }

    function renderResults() {
        const pct = Math.round((state.score / state.questions.length) * 100);
        const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '🎖' : pct >= 40 ? '👍' : '📚';
        const msg = pct >= 80 ? '¡Experto en F1!' : pct >= 60 ? '¡Buen nivel!' : pct >= 40 ? 'Podés mejorar' : 'Seguí aprendiendo';

        // Save best score
        const prev = parseInt(localStorage.getItem(TRIVIA_KEY) || '0');
        if (state.score > prev) localStorage.setItem(TRIVIA_KEY, state.score);

        el.innerHTML = `
            <div class="card trivia-results-card">
                <div class="trivia-result-emoji">${emoji}</div>
                <h2 class="trivia-result-title">${msg}</h2>
                <div class="trivia-result-score">${state.score}<span style="font-size:1.5rem;color:var(--muted)"> / ${state.questions.length}</span></div>
                <div class="trivia-result-pct" style="color:${pct>=80?'#6eff99':pct>=60?'#ffcc00':'#ff6b6b'}">${pct}% de aciertos</div>
                <div class="trivia-result-bar-track"><div class="trivia-result-bar" style="width:${pct}%;background:${pct>=80?'#6eff99':pct>=60?'#ffcc00':'#ff6b6b'}"></div></div>
                <button class="btn-primary" id="trivia-restart-btn" style="margin-top:1.5rem;width:100%">Jugar de nuevo 🔄</button>
            </div>
            <div class="card trivia-review-card">
                <h3 style="margin:0 0 1rem;font-size:0.9rem">Revisión de respuestas</h3>
                ${state.answered.map((a, i) => `
                    <div class="trivia-review-item ${a.isCorrect ? 'review-correct' : 'review-wrong'}">
                        <div class="review-q">${i+1}. ${a.q}</div>
                        <div class="review-a">${a.isCorrect ? '✅' : '❌'} ${state.questions[i].opts[a.chosen]}
                        ${!a.isCorrect ? `<span style="color:#6eff99;margin-left:0.5rem">→ ${state.questions[i].opts[a.correct]}</span>` : ''}
                        </div>
                    </div>`).join('')}
            </div>`;

        document.getElementById('trivia-restart-btn')?.addEventListener('click', () => {
            state = {
                questions: shuffle([...window.triviaQuestions]).slice(0, 10),
                current: 0, score: 0, answered: [], finished: false
            };
            renderQuestion();
        });
    }

    renderQuestion();
}

// ─── EXPORTAR CALENDARIO .ICS ─────────────────────────────────────────────────
function exportCalendarICS() {
    const races = window.calendar;
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//F1 Info ARG//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];

    races.forEach(race => {
        const dateStr = race.date.replace(/-/g, '');
        const timeStr = race.time ? race.time.replace(':', '') + '00' : '120000';
        // Convert Argentina time (UTC-3) to UTC
        const hour = race.time ? parseInt(race.time.split(':')[0]) + 3 : 15;
        const timeUTC = String(hour % 24).padStart(2,'0') + (race.time?.split(':')[1] || '00') + '00';
        const dtStart = `${dateStr}T${timeUTC}Z`;
        // Race is ~2h
        const endHour = String((hour + 2) % 24).padStart(2,'0');
        const dtEnd = `${dateStr}T${endHour}${(race.time?.split(':')[1] || '00')}00Z`;

        lines.push('BEGIN:VEVENT');
        lines.push(`UID:f1arg-2026-r${race.round}@formula1arg`);
        lines.push(`DTSTART:${dtStart}`);
        lines.push(`DTEND:${dtEnd}`);
        lines.push(`SUMMARY:🏎 ${race.name} 2026`);
        lines.push(`DESCRIPTION:Ronda ${race.round} · ${race.circuit}${race.sprint ? ' · Fin de semana Sprint' : ''}${race.winner ? ' · Ganador: ' + race.winner : ''}`);
        lines.push(`LOCATION:${race.circuit}`);
        lines.push(`CATEGORIES:F1,Formula 1`);
        lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'F1-2026-calendario.ics';
    a.click();
    URL.revokeObjectURL(url);
}

// Attach ICS export button if present
function initCalendarExport() {
    const btn = document.getElementById('export-ics-btn');
    if (btn) btn.addEventListener('click', exportCalendarICS);
}

// ─── BUSCADOR GLOBAL Ctrl+K ───────────────────────────────────────────────────
function initGlobalSearch() {
    // Inject modal HTML
    if (document.getElementById('global-search-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'global-search-modal';
    modal.className = 'gs-modal';
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
        <div class="gs-backdrop" id="gs-backdrop"></div>
        <div class="gs-dialog">
            <div class="gs-input-wrap">
                <span class="gs-icon">🔍</span>
                <input type="text" id="gs-input" class="gs-input"
                       placeholder="Buscar piloto, equipo, circuito, término…"
                       autocomplete="off" spellcheck="false">
                <kbd class="gs-esc-hint">ESC</kbd>
            </div>
            <div id="gs-results" class="gs-results"></div>
            <div class="gs-footer">
                <span><kbd>↑↓</kbd> navegar</span>
                <span><kbd>↵</kbd> abrir</span>
                <span><kbd>ESC</kbd> cerrar</span>
            </div>
        </div>`;
    document.body.appendChild(modal);

    const input = document.getElementById('gs-input');
    const resultsEl = document.getElementById('gs-results');
    let selectedIdx = -1;

    function openModal() {
        modal.classList.add('gs-open');
        input.value = '';
        resultsEl.innerHTML = '';
        selectedIdx = -1;
        setTimeout(() => input.focus(), 50);
    }
    function closeModal() {
        modal.classList.remove('gs-open');
        input.blur();
    }

    // Triggers
    document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openModal(); }
        if (e.key === 'Escape') closeModal();
        if (modal.classList.contains('gs-open')) {
            const items = resultsEl.querySelectorAll('.gs-result-item');
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIdx = Math.min(selectedIdx + 1, items.length - 1);
                items.forEach((el, i) => el.classList.toggle('gs-selected', i === selectedIdx));
                items[selectedIdx]?.scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIdx = Math.max(selectedIdx - 1, 0);
                items.forEach((el, i) => el.classList.toggle('gs-selected', i === selectedIdx));
                items[selectedIdx]?.scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'Enter') {
                const sel = items[selectedIdx] || items[0];
                if (sel?.dataset.href) window.location.href = sel.dataset.href;
            }
        }
    });

    document.getElementById('gs-backdrop')?.addEventListener('click', closeModal);

    // Search logic
    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        selectedIdx = -1;
        if (!q) { resultsEl.innerHTML = ''; return; }

        const results = [];

        // Drivers
        window.drivers.forEach(d => {
            const score =
                (d.name.toLowerCase().includes(q) ? 3 : 0) +
                (d.code.toLowerCase().includes(q) ? 2 : 0) +
                (d.nationality?.toLowerCase().includes(q) ? 1 : 0) +
                (d.team.toLowerCase().includes(q) ? 1 : 0);
            if (score > 0) results.push({
                type: 'driver', score,
                title: d.name, sub: `${d.team} · ${d.nationality}`,
                href: `driver.html?slug=${d.slug}`,
                color: window.getTeamColor(d.teamSlug),
                icon: d.flagImg ? `<img src="${d.flagImg}" style="width:18px;height:12px;object-fit:cover;border-radius:2px">` : '👤'
            });
        });

        // Teams
        window.constructors.forEach(t => {
            const score =
                (t.name.toLowerCase().includes(q) ? 3 : 0) +
                (t.origin?.toLowerCase().includes(q) ? 1 : 0) +
                (t.engine?.toLowerCase().includes(q) ? 1 : 0);
            if (score > 0) results.push({
                type: 'team', score,
                title: t.name, sub: `${t.base} · Motor ${t.engine}`,
                href: `team.html?slug=${t.slug}`,
                color: window.getTeamColor(t.slug),
                icon: `<span style="width:12px;height:12px;border-radius:50%;background:${window.getTeamColor(t.slug)};display:inline-block"></span>`
            });
        });

        // Circuits
        (window.circuits || []).forEach(c => {
            const score =
                (c.name.toLowerCase().includes(q) ? 3 : 0) +
                (c.country.toLowerCase().includes(q) ? 2 : 0) +
                (c.city.toLowerCase().includes(q) ? 1 : 0);
            if (score > 0) results.push({
                type: 'circuit', score,
                title: c.name, sub: `${c.country} · ${c.length} km`,
                href: `circuits.html`,
                color: c.color || '#888',
                icon: c.flag || '🏁'
            });
        });

        // Glossary
        (window.glossaryTerms || []).forEach(t => {
            if (t.term.toLowerCase().includes(q) || t.full?.toLowerCase().includes(q)) {
                results.push({
                    type: 'glossary', score: 1,
                    title: t.term, sub: t.full || t.cat,
                    href: `glossary.html`,
                    color: '#00D2BE',
                    icon: '📖'
                });
            }
        });

        // Pages
        const pages = [
            { title: 'Estadísticas', sub: 'Victorias, poles, récords', href: 'stats.html', icon: '📊' },
            { title: 'Timeline', sub: 'Evolución del campeonato', href: 'timeline.html', icon: '📈' },
            { title: 'Predictor', sub: 'Predecí el próximo podio', href: 'predictor.html', icon: '🎯' },
            { title: 'Trivia', sub: '¿Cuánto sabés de F1?', href: 'trivia.html', icon: '🧠' },
            { title: 'Rookies', sub: 'Debutantes 2026', href: 'rookies.html', icon: '🌟' },
            { title: 'Glosario', sub: 'Términos F1 2026', href: 'glossary.html', icon: '📖' },
            { title: 'Livrées', sub: 'Diseños de los autos', href: 'livrees.html', icon: '🎨' },
            { title: 'Calendario', sub: 'Carreras 2026', href: 'calendar.html', icon: '📅' },
            { title: 'Circuitos', sub: 'Trazados y récords', href: 'circuits.html', icon: '🗺' },
        ];
        pages.forEach(p => {
            if (p.title.toLowerCase().includes(q)) results.push({ ...p, type: 'page', score: 2, color: '#888' });
        });

        results.sort((a,b) => b.score - a.score);
        const top = results.slice(0, 8);

        if (!top.length) {
            resultsEl.innerHTML = `<div class="gs-empty">Sin resultados para "<strong>${q}</strong>"</div>`;
            return;
        }

        const typeLabels = { driver:'Piloto', team:'Escudería', circuit:'Circuito', glossary:'Glosario', page:'Página' };
        resultsEl.innerHTML = top.map((r, i) => `
            <a href="${r.href}" class="gs-result-item ${i === 0 ? 'gs-selected' : ''}" data-href="${r.href}">
                <span class="gs-result-icon">${typeof r.icon === 'string' ? r.icon : ''}</span>
                <span class="gs-result-info">
                    <span class="gs-result-title" style="color:${r.color}">${r.title}</span>
                    <span class="gs-result-sub">${r.sub}</span>
                </span>
                <span class="gs-result-type">${typeLabels[r.type] || r.type}</span>
            </a>`).join('');

        selectedIdx = 0;
        resultsEl.querySelectorAll('.gs-result-item').forEach(item => {
            item.addEventListener('click', () => closeModal());
        });
    });

    // Add trigger hint badge to page if not on mobile
    if (window.innerWidth > 768) {
        const hint = document.createElement('div');
        hint.className = 'gs-trigger-hint';
        hint.innerHTML = '<kbd>Ctrl</kbd> <kbd>K</kbd>';
        hint.addEventListener('click', openModal);
        document.body.appendChild(hint);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOQUE 4 — MODO CLARO/OSCURO, SCROLL ANIM, SWIPE, PWA, PUSH, SHARE IMAGE
// ═══════════════════════════════════════════════════════════════════════════════

// ─── MODO CLARO / OSCURO ─────────────────────────────────────────────────────
const THEME_KEY = 'f1arg_theme';

function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'dark' : prefersDark;
    applyTheme(isDark ? 'dark' : 'light', false);
    injectThemeToggle();
}

function applyTheme(theme, save = true) {
    document.documentElement.setAttribute('data-theme', theme);
    if (save) localStorage.setItem(THEME_KEY, theme);
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function injectThemeToggle() {
    if (document.getElementById('theme-toggle-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'theme-toggle-btn';
    btn.className = 'theme-toggle-btn';
    btn.title = 'Cambiar tema';
    btn.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
    });
    document.body.appendChild(btn);
}

// ─── ANIMACIONES AL HACER SCROLL ─────────────────────────────────────────────
function initScrollAnimations() {
    // Only animate if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) return;

    const targets = document.querySelectorAll('.card');
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scroll-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    targets.forEach((el, i) => {
        // Skip cards already in view (above the fold) — animate them immediately
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            el.classList.add('scroll-visible');
            return;
        }
        el.classList.add('scroll-hidden');
        el.style.transitionDelay = `${Math.min(i % 4, 3) * 50}ms`;
        observer.observe(el);
    });
}

// ─── SWIPE ENTRE PILOTOS (mobile, página de detalle) ─────────────────────────
function initDriverSwipe() {
    if (!document.body.classList.contains('page-driver-detail')) return;
    const params = new URLSearchParams(window.location.search);
    const currentSlug = params.get('slug');
    if (!currentSlug) return;

    const drivers = window.drivers;
    const idx = drivers.findIndex(d => d.slug === currentSlug);
    if (idx < 0) return;

    const prevDriver = idx > 0 ? drivers[idx - 1] : null;
    const nextDriver = idx < drivers.length - 1 ? drivers[idx + 1] : null;

    // Inject swipe nav
    const nav = document.createElement('div');
    nav.className = 'swipe-nav';
    nav.innerHTML = `
        ${prevDriver ? `<a class="swipe-btn swipe-prev" href="driver.html?slug=${prevDriver.slug}">
            ← <span>${prevDriver.name}</span>
        </a>` : '<span class="swipe-btn swipe-disabled">←</span>'}
        <span class="swipe-counter">${idx + 1} / ${drivers.length}</span>
        ${nextDriver ? `<a class="swipe-btn swipe-next" href="driver.html?slug=${nextDriver.slug}">
            <span>${nextDriver.name}</span> →
        </a>` : '<span class="swipe-btn swipe-disabled">→</span>'}`;

    const container = document.querySelector('.container');
    if (container) container.insertBefore(nav, container.firstChild);

    // Touch swipe
    let touchStartX = 0;
    document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    document.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) < 60) return;
        if (dx < 0 && nextDriver) window.location.href = `driver.html?slug=${nextDriver.slug}`;
        if (dx > 0 && prevDriver) window.location.href = `driver.html?slug=${prevDriver.slug}`;
    });

    // Arrow keys
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft' && prevDriver) window.location.href = `driver.html?slug=${prevDriver.slug}`;
        if (e.key === 'ArrowRight' && nextDriver) window.location.href = `driver.html?slug=${nextDriver.slug}`;
    });
}

// ─── COMPARTIR RESULTADO COMO IMAGEN ─────────────────────────────────────────
function initShareButtons() {
    // Inject share button on driver detail and race result cards
    document.querySelectorAll('.driver-detail-share-target, .race-result-card').forEach(el => {
        const btn = document.createElement('button');
        btn.className = 'share-img-btn';
        btn.textContent = '📤 Compartir';
        btn.addEventListener('click', () => shareAsImage(el));
        el.appendChild(btn);
    });

    // Also add share to standings if on drivers page
    if (document.body.classList.contains('page-home') || document.body.classList.contains('page-drivers')) {
        const fabShare = document.createElement('button');
        fabShare.className = 'share-fab-btn';
        fabShare.title = 'Compartir clasificación';
        fabShare.textContent = '📤';
        fabShare.addEventListener('click', shareStandings);
        document.body.appendChild(fabShare);
    }
}

function shareStandings() {
    const canvas = document.createElement('canvas');
    const W = 540, ROWS = Math.min(window.drivers.length, 10);
    const ROW_H = 54, HEADER_H = 90, FOOTER_H = 48;
    canvas.width = W;
    canvas.height = HEADER_H + ROWS * ROW_H + FOOTER_H;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header gradient
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, '#1a0a0a');
    grad.addColorStop(1, '#0f0f1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, HEADER_H);

    // Red accent bar
    ctx.fillStyle = '#E10600';
    ctx.fillRect(0, 0, 4, HEADER_H);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px Arial';
    ctx.fillText('Campeonato de Pilotos 2026', 24, 36);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '13px Arial';
    const racesDone = window.races.length;
    ctx.fillText(`Después de ${racesDone} carrera${racesDone !== 1 ? 's' : ''}`, 24, 58);

    // Rows
    window.drivers.slice(0, ROWS).forEach((d, i) => {
        const y = HEADER_H + i * ROW_H;
        const color = window.getTeamColor(d.teamSlug);

        // Row bg alternating
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent';
        ctx.fillRect(0, y, W, ROW_H);

        // Team color accent
        ctx.fillStyle = color;
        ctx.fillRect(0, y + 8, 3, ROW_H - 16);

        // Position
        ctx.fillStyle = i < 3 ? '#FFD700' : 'rgba(255,255,255,0.35)';
        ctx.font = `bold ${i < 3 ? '20' : '17'}px Arial`;
        ctx.fillText(`${i + 1}`, 18, y + ROW_H / 2 + 7);

        // Name
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 15px Arial';
        ctx.fillText(d.name, 44, y + ROW_H / 2 + 5);

        // Team
        ctx.fillStyle = color;
        ctx.font = '11px Arial';
        ctx.fillText(d.team, 44, y + ROW_H / 2 + 20);

        // Points
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 17px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`${d.points} pts`, W - 20, y + ROW_H / 2 + 7);
        ctx.textAlign = 'left';
    });

    // Footer
    const fy = HEADER_H + ROWS * ROW_H;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(0, fy, W, FOOTER_H);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '11px Arial';
    ctx.fillText('F1 Info ARG · @formula1arg__ en Instagram', 20, fy + 28);

    // Download / share
    canvas.toBlob(blob => {
        if (navigator.share && navigator.canShare({ files: [new File([blob], 'f1-standings.png', { type: 'image/png' })] })) {
            navigator.share({
                title: 'Campeonato F1 2026',
                text: `Top 10 después de ${window.races.length} carreras`,
                files: [new File([blob], 'f1-standings.png', { type: 'image/png' })]
            });
        } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'f1-standings-2026.png';
            a.click();
            URL.revokeObjectURL(url);
        }
    }, 'image/png');
}

function shareAsImage(el) {
    // Fallback: just use Web Share API with text
    const text = el.innerText?.slice(0, 200) || 'F1 Info ARG 2026';
    if (navigator.share) {
        navigator.share({ title: 'F1 Info ARG', text, url: window.location.href });
    } else {
        navigator.clipboard?.writeText(window.location.href);
        alert('URL copiada al portapapeles');
    }
}

// ─── PWA: SERVICE WORKER + INSTALL PROMPT ────────────────────────────────────
function initPWA() {
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }

    // Install prompt
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallBanner();
    });

    function showInstallBanner() {
        if (document.getElementById('pwa-install-banner')) return;
        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.className = 'pwa-banner';
        banner.innerHTML = `
            <div class="pwa-banner-content">
                <img src="img/logo-f1arg.jpg" class="pwa-banner-icon" alt="F1 Info ARG">
                <div>
                    <strong>Instalá F1 Info ARG</strong>
                    <p>Accedé como app desde tu pantalla de inicio</p>
                </div>
            </div>
            <div class="pwa-banner-actions">
                <button class="pwa-install-btn" id="pwa-install-btn">Instalar</button>
                <button class="pwa-dismiss-btn" id="pwa-dismiss-btn">✕</button>
            </div>`;
        document.body.appendChild(banner);
        setTimeout(() => banner.classList.add('pwa-banner-visible'), 100);

        document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            deferredPrompt = null;
            banner.remove();
        });
        document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
            banner.classList.remove('pwa-banner-visible');
            setTimeout(() => banner.remove(), 300);
        });
    }
}

// ─── NOTIFICACIONES PUSH ──────────────────────────────────────────────────────
function initNotifications() {
    if (!('Notification' in window)) return;

    const btn = document.getElementById('notify-btn');
    if (!btn) return;

    function updateBtn() {
        if (Notification.permission === 'granted') {
            btn.textContent = '🔔 Notificaciones activas';
            btn.classList.add('notify-active');
        } else if (Notification.permission === 'denied') {
            btn.textContent = '🔕 Notificaciones bloqueadas';
            btn.disabled = true;
        } else {
            btn.textContent = '🔔 Activar notificaciones de GP';
        }
    }
    updateBtn();

    btn.addEventListener('click', async () => {
        if (Notification.permission === 'granted') {
            // Test notification
            new Notification('F1 Info ARG 🏎', {
                body: 'Las notificaciones están activas. Te avisaremos antes de cada GP.',
                icon: 'img/logo-f1arg.jpg'
            });
            return;
        }
        const result = await Notification.requestPermission();
        updateBtn();
        if (result === 'granted') {
            new Notification('F1 Info ARG 🏎', {
                body: '¡Notificaciones activadas! Te avisaremos antes de cada Gran Premio.',
                icon: 'img/logo-f1arg.jpg'
            });
            scheduleRaceNotifications();
        }
    });
}

function scheduleRaceNotifications() {
    const nextRace = window.calendar.find(r => r.status === 'next' || r.status === 'upcoming');
    if (!nextRace || !nextRace.time) return;

    const raceDate = new Date(`${nextRace.date}T${nextRace.time}:00-03:00`);
    const oneDayBefore = new Date(raceDate - 24 * 60 * 60 * 1000);
    const now = new Date();

    // Store in localStorage for SW to pick up
    const scheduled = JSON.parse(localStorage.getItem('f1arg_notifs') || '[]');
    scheduled.push({
        title: `🏎 Mañana: ${nextRace.name}`,
        body: `${nextRace.circuit} · ${nextRace.time} hs Argentina`,
        scheduledFor: oneDayBefore.toISOString(),
        raceRound: nextRace.round
    });
    localStorage.setItem('f1arg_notifs', JSON.stringify(scheduled));
}

// Inject notify button into index if present
function injectNotifyButton() {
    const el = document.getElementById('notify-btn-wrap');
    if (!el) return;
    const btn = document.createElement('button');
    btn.id = 'notify-btn';
    btn.className = 'notify-btn';
    btn.textContent = '🔔 Activar notificaciones de GP';
    el.appendChild(btn);
    initNotifications();
}

function getTeamImage(teamSlug) {
    const team = window.findConstructorBySlug(teamSlug);
    return team && team.image ? team.image : null;
}

function searcher(query) {
    if (!query || typeof query !== 'string') return [];
    const q = query.trim().toLowerCase();

    const driverMatches = window.drivers
        .filter(driver => driver.name.toLowerCase().includes(q) || driver.team.toLowerCase().includes(q))
        .map(driver => ({ ...driver, type: 'driver' }));

    const constructorMatches = window.constructors
        .filter(team => team.name.toLowerCase().includes(q))
        .map(team => ({ ...team, type: 'constructor' }));

    return [...driverMatches, ...constructorMatches];
}

function createTeamCell(teamName, code, colorClass) {
    const span = document.createElement('span');
    span.className = `team-chip ${colorClass}`.trim();

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
        teamCell.appendChild(createTeamCell(driver.team, driver.code, driver.colorClass));

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
        nameCell.appendChild(createTeamCell(team.name, team.code, team.colorClass));

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
        const label = entry.type === 'driver' ? 'Piloto' : 'Escudería';
        const link = entry.type === 'driver' ? `driver.html?slug=${entry.slug}` : `team.html?slug=${entry.slug}`;
        li.innerHTML = `
            <strong>${entry.name}</strong>
            <span class="result-type">${label}</span>
            <span class="result-points">${entry.points} pts</span>
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

    title.textContent = driver.name;
    subtitle.textContent = `${driver.team} • ${driver.points} puntos`;

    const team = window.findConstructorBySlug(driver.teamSlug);
    const teamImage = team && team.image ? `<img class="detail-image" src="${team.image}" alt="${team.name} logo">` : '';

    detail.innerHTML = `
        <div class="detail-grid">
            <div class="detail-card-main">
                ${teamImage}
                <span class="logo-badge ${driver.colorClass}">${driver.code}</span>
                <h2>${driver.team}</h2>
                <p>${driver.bio}</p>
                <ul class="detail-list">
                    <li><strong>Posición:</strong> ${driver.position}</li>
                    <li><strong>País:</strong> ${driver.nationality}</li>
                    <li><strong>Edad:</strong> ${driver.age} años</li>
                    <li><strong>Victorias:</strong> ${driver.wins}</li>
                    <li><strong>Podios:</strong> ${driver.podiums}</li>
                </ul>
            </div>
            <div class="detail-aside">
                <h3>Equipo</h3>
                <a class="team-link" href="team.html?slug=${driver.teamSlug}">${driver.team}</a>
                <p>Abre la mini página de su escudería para ver detalles del equipo, base y resultados.</p>
            </div>
        </div>
    `;
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

    title.textContent = team.name;
    subtitle.textContent = `${team.points} puntos • ${team.championships} títulos`;

    const teamImage = team.image ? `<img class="detail-image" src="${team.image}" alt="${team.name} logo">` : '';
    const driverLinks = team.topDrivers.map(name => `<a class="team-link" href="drivers.html#${window.slugify(name)}">${name}</a>`).join('');

    detail.innerHTML = `
        <div class="detail-grid">
            <div class="detail-card-main">
                ${teamImage}
                <span class="logo-badge ${team.colorClass}">${team.code}</span>
                <h2>${team.base}</h2>
                <p>${team.description}</p>
                <ul class="detail-list">
                    <li><strong>Team Principal:</strong> ${team.teamPrincipal}</li>
                    <li><strong>Motor:</strong> ${team.engine}</li>
                    <li><strong>Campeonatos:</strong> ${team.championships}</li>
                    <li><strong>Pilotos principales:</strong></li>
                    ${team.topDrivers.map(driver => `<li>${driver}</li>`).join('')}
                </ul>
            </div>
            <div class="detail-aside">
                <h3>Pilotos destacados</h3>
                <p>Abre las mini páginas individuales para conocer su rendimiento.</p>
                ${driverLinks}
            </div>
        </div>
    `;
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

function initPage() {
    if (document.body.classList.contains('page-home')) {
        initSearcher();
        return;
    }

    if (document.body.classList.contains('page-drivers')) {
        renderDriverStandings();
        renderCards('driver-cards', window.drivers, 'driver');
        initSearcher();
        return;
    }

    if (document.body.classList.contains('page-teams')) {
        renderConstructorStandings();
        renderCards('team-cards', window.constructors, 'constructor');
        initSearcher();
        return;
    }

    if (document.body.classList.contains('page-driver-detail')) {
        const slug = getSlugFromQuery();
        renderDriverDetail(slug);
        initSearcher();
        return;
    }

    if (document.body.classList.contains('page-team-detail')) {
        const slug = getSlugFromQuery();
        renderTeamDetail(slug);
        initSearcher();
        return;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { searcher, renderSearchResults, renderDriverStandings, renderConstructorStandings, renderCards, renderDriverDetail, renderTeamDetail, initSearcher, initPage };
}

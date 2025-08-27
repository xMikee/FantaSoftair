// Variabili globali
let currentUser = null;
let users = [];
let players = [];
let ranking = [];
let events = [];
let isAuthenticated = false;
let currentProtectedSection = null;

const API_BASE = window.location.origin + '/api';

document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadInitialData();
        updateUI();
        hideLoading();
        showAlert('Applicazione caricata con successo!', 'success');
    } catch (error) {
        console.error('Errore nell\'inizializzazione:', error);
        showAlert('Errore nel caricamento dell\'applicazione', 'error');
        hideLoading();
    }
});

async function apiCall(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore nella richiesta');
    }

    return response.json();
}

async function loadInitialData() {
    users = await apiCall('/users');
    ranking = await apiCall('/ranking');
    events = await apiCall('/events');
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function updateUI() {
    updateUserSelect();
    updateAdminPlayerSelect();
    updateClassifica();
    updateMarketList();
    updateEventHistory();
}

function updateUserSelect() {
    const userSelect = document.getElementById('user-select');
    userSelect.innerHTML = '<option value="">Scegli associato...</option>';

    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        userSelect.appendChild(option);
    });
}

function updateAdminPlayerSelect() {
    const playerSelect = document.getElementById('admin-player-select');
    playerSelect.innerHTML = '<option value="">Scegli giocatore...</option>';

    fetch(`${API_BASE}/players`)
        .then(response => response.json())
        .then(allPlayers => {
            allPlayers.forEach(player => {
                const option = document.createElement('option');
                option.value = player.id;
                option.textContent = `${player.name} (${player.current_points} pts)`;
                playerSelect.appendChild(option);
            });
        });
}

function updateClassifica() {
    const rankingList = document.getElementById('ranking-list');
    rankingList.innerHTML = '';

    let firstPosition = 'generale.png';
    let secondPosition = 'colonnello.png';
    let thirdPosition = 'capitano.png';

    ranking.forEach((user, index) => {
        const rankingItem = document.createElement('div');
        rankingItem.className = 'ranking-item';
        let medalHtml = '';
        if (index === 0) {
            medalHtml = `<img src="../img/${firstPosition}" alt="1°" class="ranking-medal"/>`;
        } else if (index === 1) {
            medalHtml = `<img src="../img/${secondPosition}" alt="2°" class="ranking-med"/>`;
        } else if (index === 2) {
            medalHtml = `<img src="../img/${thirdPosition}" alt="3°" class="ranking-med"/>`;
        }else if (index === ranking.length - 1){
            medalHtml = `<img src="../img/soldato.png" alt="3°" class="ranking-med"/>`;
        }else{
            medalHtml = index+1;
        }
        rankingItem.innerHTML = `    
            <div class="ranking-position">${medalHtml}</div>
            <div class="ranking-name">${user.name}</div>
            <div class="ranking-points">${user.total_points} pts (${user.team_size}/8)</div>
        `;
        rankingList.appendChild(rankingItem);
    });
}

async function updateMarketList() {
    try {
        const availablePlayers = await apiCall('/players?available=true');
        const marketList = document.getElementById('market-list');
        marketList.innerHTML = '';

        if (availablePlayers.length === 0) {
            marketList.innerHTML = '<p>Nessun giocatore disponibile nel mercato.</p>';
            return;
        }

        availablePlayers.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'market-player';
            playerDiv.innerHTML = `
                <div class="market-player-info">
                    <div class="market-player-name">${player.name}</div>
                    <div class="market-player-value">Valore: ${player.base_value} crediti | Punti: ${player.current_points}</div>
                </div>
                <button class="btn btn-success" onclick="buyPlayer(${player.id}, ${player.base_value})">Acquista</button>
            `;
            marketList.appendChild(playerDiv);
        });
    } catch (error) {
        console.error('Errore aggiornamento mercato:', error);
    }
}

async function updateUserTeam(userId) {
    const userTeam = document.getElementById('user-team');
    const teamList = document.getElementById('team-list');

    if (!userId) {
        userTeam.style.display = 'none';
        return;
    }

    try {
        const userPlayers = await apiCall(`/players?userId=${userId}`);
        const teamSize = userPlayers.length;

        userTeam.style.display = 'block';
        userTeam.querySelector('h3').textContent = `La Tua Squadra (${teamSize}/8)`;

        teamList.innerHTML = '';
        if (userPlayers.length === 0) {
            teamList.innerHTML = '<p>Nessun giocatore in squadra. Acquista dal mercato!</p>';
            return;
        }

        userPlayers.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'team-player';
            playerDiv.innerHTML = `
                <div>
                    <strong>${player.name}</strong><br>
                    <small>Valore: ${player.base_value} | Punti: ${player.current_points}</small>
                </div>
                <button class="btn btn-danger" onclick="sellPlayer(${player.id})">Vendi</button>
            `;
            teamList.appendChild(playerDiv);
        });
    } catch (error) {
        console.error('Errore aggiornamento squadra:', error);
    }
}

async function updateUserCredits(userId) {
    if (!userId) {
        document.getElementById('user-credits').style.display = 'none';
        return;
    }

    try {
        const user = users.find(u => u.id == userId);
        if (user) {
            document.getElementById('user-credits').style.display = 'block';
            document.getElementById('credits-amount').textContent = user.credits;
        }
    } catch (error) {
        console.error('Errore aggiornamento crediti:', error);
    }
}

function updateEventHistory() {
    const eventHistory = document.getElementById('event-history');
    eventHistory.innerHTML = '';

    if (events.length === 0) {
        eventHistory.innerHTML = '<p>Nessun evento registrato.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Data</th>
                <th>Giocatore</th>
                <th>Punti</th>
                <th>Descrizione</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');
    events.slice(0, 20).forEach(event => {
        const row = document.createElement('tr');
        const formattedDate = new Date(event.date).toLocaleDateString('it-IT');
        const pointsClass = event.points >= 0 ? 'color: #48bb78;' : 'color: #f56565;';
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${event.player_name}</td>
            <td style="${pointsClass}"><strong>${event.points > 0 ? '+' : ''}${event.points}</strong></td>
            <td>${event.description || 'N/A'}</td>
        `;
        tbody.appendChild(row);
    });

    eventHistory.appendChild(table);
}

async function onUserSelect() {
    const userId = document.getElementById('user-select').value;

    currentUser = userId;
    await updateUserCredits(userId);
    await updateUserTeam(userId);
}

async function buyPlayer(playerId, playerValue) {
    if (!currentUser) {
        showAlert('Seleziona prima un associato!', 'error');
        return;
    }

    try {
        const result = await apiCall('/buy-player', {
            method: 'POST',
            body: JSON.stringify({
                userId: currentUser,
                playerId: playerId
            })
        });

        showAlert(result.message, 'success');

        // Ricarica i dati
        await loadInitialData();
        updateUI();
        await updateUserCredits(currentUser);
        await updateUserTeam(currentUser);
        await updateMarketList();

    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function sellPlayer(playerId) {
    if (!currentUser) return;

    try {
        const result = await apiCall('/sell-player', {
            method: 'POST',
            body: JSON.stringify({
                userId: currentUser,
                playerId: playerId
            })
        });

        showAlert(result.message, 'success');

        // Ricarica i dati
        await loadInitialData();
        updateUI();
        await updateUserCredits(currentUser);
        await updateUserTeam(currentUser);
        await updateMarketList();

    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function updatePlayerScore() {
    const playerId = document.getElementById('admin-player-select').value;
    const eventType = document.getElementById('event-type').value;
    const customPoints = document.getElementById('custom-points').value;
    const description = document.getElementById('event-description').value;

    if (!playerId) {
        showAlert('Seleziona un giocatore!', 'error');
        return;
    }

    let points = 0;
    if (customPoints) {
        points = parseInt(customPoints);
    } else if (eventType) {
        points = parseInt(eventType);
    } else {
        showAlert('Seleziona un tipo di evento o inserisci punti personalizzati!', 'error');
        return;
    }

    try {
        const result = await apiCall('/update-score', {
            method: 'POST',
            body: JSON.stringify({
                playerId: playerId,
                points: points,
                description: description || 'Evento registrato dall\'admin'
            })
        });

        showAlert(result.message, 'success');

        document.getElementById('admin-player-select').value = '';
        document.getElementById('event-type').value = '';
        document.getElementById('custom-points').value = '';
        document.getElementById('event-description').value = '';

        await loadInitialData();
        updateUI();
        updateAdminPlayerSelect();
        if (currentUser) {
            await updateUserTeam(currentUser);
        }

    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function resetSystem(type) {
    let confirmMessage = '';
    switch(type) {
        case 'market':
            confirmMessage = 'Sei sicuro di voler resettare il mercato? Tutti i giocatori torneranno disponibili e i crediti saranno ripristinati.';
            break;
        case 'scores':
            confirmMessage = 'Sei sicuro di voler resettare tutti i punteggi?';
            break;
        case 'all':
            confirmMessage = 'ATTENZIONE: Questa operazione cancellerà tutti i dati! Sei sicuro?';
            break;
    }

    if (!confirm(confirmMessage)) {
        return;
    }

    try {
        const result = await apiCall('/reset', {
            method: 'POST',
            body: JSON.stringify({ type: type })
        });

        showAlert(result.message, 'success');


        await loadInitialData();
        updateUI();


        currentUser = null;
        document.getElementById('user-select').value = '';
        document.getElementById('user-credits').style.display = 'none';
        document.getElementById('user-team').style.display = 'none';

    } catch (error) {
        showAlert(error.message, 'error');
    }
}


function showSection(sectionName) {

    if (isProtectedSection(sectionName) && !isAuthenticated) {
        showAuthModal(sectionName);
        return;
    }

    showSectionDirect(sectionName);
}

async function updateAllTeams() {
    const allTeamsContainer = document.getElementById('all-teams');
    allTeamsContainer.innerHTML = '';

    try {
        const currentRanking = await apiCall('/ranking');

        for (const user of currentRanking) {
            const userPlayers = await apiCall(`/players?userId=${user.id}`);

            const teamCard = document.createElement('div');
            teamCard.className = 'card';

            let playersList = '<p>Nessun giocatore</p>';
            if (userPlayers.length > 0) {
                playersList = userPlayers.map(p =>
                    `<div class="team-player"><span>${p.name} (${p.current_points} pts)</span></div>`
                ).join('');
            }

            teamCard.innerHTML = `
                <h3>${user.name}</h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <span><strong>Squadra:</strong> ${user.team_size}/8</span>
                    <span><strong>Crediti:</strong> ${user.credits}</span>
                    <span><strong>Punti Totali:</strong> ${user.total_points}</span>
                </div>
                <div class="listplayers">
                    ${playersList}
                </div>
            `;
            allTeamsContainer.appendChild(teamCard);
        }
    } catch (error) {
        console.error('Errore aggiornamento squadre:', error);
        allTeamsContainer.innerHTML = '<p>Errore nel caricamento delle squadre.</p>';
    }
}

function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alert-container');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    alertContainer.appendChild(alert);


    setTimeout(() => {
        if (alertContainer.contains(alert)) {
            alertContainer.removeChild(alert);
        }
    }, 3000);
}


function showAuthModal(sectionName) {
    currentProtectedSection = sectionName;
    const modal = document.getElementById('auth-modal');
    const sectionNameSpan = document.getElementById('protected-section-name');
    
    sectionNameSpan.textContent = sectionName === 'mercato' ? 'Mercato' : 'Admin';
    modal.style.display = 'flex';

    setTimeout(() => {
        document.getElementById('admin-password').focus();
    }, 100);
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.style.display = 'none';
    currentProtectedSection = null;
    document.getElementById('admin-password').value = '';
    

    showSection('classifica');
}

async function authenticateUser(password) {
    try {
        const result = await apiCall('/authenticate', {
            method: 'POST',
            body: JSON.stringify({ password: password })
        });
        
        if (result.success) {
            isAuthenticated = true;
            showAlert('Autenticazione riuscita!', 'success');
            closeAuthModal();
            
            // Ora mostra la sezione protetta
            if (currentProtectedSection) {
                showSectionDirect(currentProtectedSection);
            }
            
            return true;
        } else {
            showAlert('Password non corretta!', 'error');
            return false;
        }
    } catch (error) {
        showAlert('Errore durante l\'autenticazione', 'error');
        return false;
    }
}

function isProtectedSection(sectionName) {
    return sectionName === 'mercato' || sectionName === 'admin';
}

function showSectionDirect(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(sectionName).classList.add('active');

    const targetBtn = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }

    if (sectionName === 'squadre') {
        updateAllTeams();
    } else if (sectionName === 'classifica') {
        apiCall('/ranking').then(data => {
            ranking = data;
            updateClassifica();
        });
    }
}

document.getElementById('user-select').addEventListener('change', onUserSelect);

document.getElementById('auth-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;
    
    if (password) {
        await authenticateUser(password);
    } else {
        showAlert('Inserisci la password!', 'error');
    }
});
// Variabili globali
let currentUser = null;
let users = [];
let players = [];
let ranking = [];
let events = [];
let isAuthenticated = false;
let currentProtectedSection = null;
let userToken = null;
let currentUserInfo = null;
let selectedUserForLogin = null;

const API_BASE = window.location.origin + '/api';

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Check if user is already logged in
        const savedToken = localStorage.getItem('userToken');
        const savedUserInfo = localStorage.getItem('currentUserInfo');
        
        if (savedToken && savedUserInfo) {
            userToken = savedToken;
            currentUserInfo = JSON.parse(savedUserInfo);
        }

        await loadInitialData();
        updateUI();
        
        // Restore logged-in user state
        if (currentUserInfo) {
            document.getElementById('my-user-select').value = currentUserInfo.id;
            await updateMyUserCredits(currentUserInfo.id);
            await updateMyUserTeam(currentUserInfo.id);
        }
        
        hideLoading();
        showAlert('Applicazione caricata con successo!', 'success');
    } catch (error) {
        console.error('Errore nell\'inizializzazione:', error);
        showAlert('Errore nel caricamento dell\'applicazione', 'error');
        hideLoading();
    }
});

async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        headers,
        ...options
    });

    if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
            // Token expired or invalid, logout user
            userToken = null;
            currentUserInfo = null;
            localStorage.removeItem('userToken');
            localStorage.removeItem('currentUserInfo');
            showAlert('Sessione scaduta. Effettua nuovamente il login.', 'error');
            showSection('mia-squadra');
        }
        throw new Error(error.message || error.error || 'Errore nella richiesta');
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
    const myUserSelect = document.getElementById('my-user-select');
    
    userSelect.innerHTML = '<option value="">Scegli associato...</option>';
    myUserSelect.innerHTML = '<option value="">Scegli il tuo nome...</option>';

    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        userSelect.appendChild(option);

        const myOption = document.createElement('option');
        myOption.value = user.id;
        myOption.textContent = user.name;
        myUserSelect.appendChild(myOption);
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
                option.textContent = `${player.name} (${player.currentPoints} pts)`;
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
            <div class="ranking-points">${user.total_points} pts (${user.lineup_size || 0}/8 in campo)</div>
        `;
        rankingList.appendChild(rankingItem);
    });
}

async function updateMarketList() {
    try {
        const availablePlayers = await apiCall('/players?available=true');
        const marketList = document.getElementById('market-list');
        marketList.innerHTML = '';

        if (!currentUserInfo || !userToken) {
            marketList.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <h3>🔐 Accesso Richiesto</h3>
                    <p>Per accedere al mercato devi prima effettuare il login.</p>
                    <p>Vai alla sezione <strong>"La Mia Squadra"</strong> e seleziona il tuo nome.</p>
                </div>
            `;
            return;
        }

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
                    <div class="market-player-value">Valore: ${player.baseValue} crediti | Punti: ${player.currentPoints}</div>
                </div>
                <button class="btn btn-success" onclick="buyPlayer(${player.id}, ${player.baseValue})">Acquista</button>
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
        userTeam.querySelector('h3').textContent = `La Tua Squadra (${teamSize}/11)`;

        teamList.innerHTML = '';
        if (userPlayers.length === 0) {
            teamList.innerHTML = '<p>Nessun giocatore in squadra. Acquista dal mercato!</p>';
            return;
        }

        userPlayers.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'team-player';
            const isSelected = player.selectedForLineup || false;
            playerDiv.innerHTML = `
                <div>
                    <input type="checkbox" id="player-${player.id}" ${isSelected ? 'checked' : ''} 
                           onchange="togglePlayerSelection(${player.id})" />
                    <label for="player-${player.id}">
                        <strong>${player.name}</strong> ${isSelected ? '⚡' : ''}<br>
                        <small>Valore: ${player.baseValue} | Punti: ${player.currentPoints}</small>
                    </label>
                </div>
                <button class="btn btn-danger" onclick="sellPlayer(${player.id})">Vendi</button>
            `;
            teamList.appendChild(playerDiv);
        });

        // Add lineup management buttons
        const lineupControls = document.createElement('div');
        lineupControls.className = 'lineup-controls';
        lineupControls.innerHTML = `
            <button class="btn btn-success" onclick="saveLineup()">Salva Formazione</button>
            <button class="btn btn-warning" onclick="clearLineup()">Azzera Formazione</button>
            <p><small>Seleziona fino a 8 giocatori per la formazione titolare</small></p>
        `;
        teamList.appendChild(lineupControls);
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

async function onMyUserSelect() {
    const userSelect = document.getElementById('my-user-select');
    const userId = userSelect.value;
    
    if (!userId) {
        // User wants to logout
        await logoutUser();
        return;
    }
    
    const selectedUser = users.find(u => u.id == userId);
    if (!selectedUser) {
        showAlert('Utente non trovato', 'error');
        return;
    }
    
    selectedUserForLogin = selectedUser;
    showUserLoginModal(selectedUser.name);
}

async function loginUser(userName, password = '') {
    try {
        const result = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userName: userName, password: password })
        });

        if (!result.ok) {
            const error = await result.json();
            throw new Error(error.message || 'Errore durante il login');
        }

        const loginData = await result.json();
        
        userToken = loginData.accessToken;
        currentUserInfo = loginData.user;
        
        // Save to localStorage
        localStorage.setItem('userToken', userToken);
        localStorage.setItem('currentUserInfo', JSON.stringify(currentUserInfo));
        
        showAlert(`Login effettuato con successo! Benvenuto ${currentUserInfo.name}!`, 'success');
        
        await updateMyUserCredits(currentUserInfo.id);
        await updateMyUserTeam(currentUserInfo.id);
        
        return loginData;
        
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

async function logoutUser() {
    userToken = null;
    currentUserInfo = null;
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUserInfo');
    
    document.getElementById('my-user-select').value = '';
    document.getElementById('my-user-credits').style.display = 'none';
    document.getElementById('my-user-team').style.display = 'none';
    
    showAlert('Logout effettuato con successo', 'success');
}

async function updateMyUserCredits(userId) {
    if (!userId) {
        document.getElementById('my-user-credits').style.display = 'none';
        return;
    }

    try {
        const user = users.find(u => u.id == userId);
        if (user) {
            document.getElementById('my-user-credits').style.display = 'block';
            document.getElementById('my-credits-amount').textContent = user.credits;
        }
    } catch (error) {
        console.error('Errore aggiornamento crediti:', error);
    }
}

async function updateMyUserTeam(userId) {
    const userTeam = document.getElementById('my-user-team');
    const teamList = document.getElementById('my-team-list');

    if (!userId) {
        userTeam.style.display = 'none';
        return;
    }

    try {
        const userPlayers = await apiCall(`/players?userId=${userId}`);
        const teamSize = userPlayers.length;

        userTeam.style.display = 'block';
        userTeam.querySelector('h3').textContent = `La Tua Squadra (${teamSize}/11)`;

        teamList.innerHTML = '';
        if (userPlayers.length === 0) {
            teamList.innerHTML = '<p>Nessun giocatore in squadra. Vai al <strong>Mercato</strong> per acquistare giocatori!</p>';
            return;
        }

        userPlayers.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'team-player';
            const isSelected = player.selectedForLineup || false;
            playerDiv.innerHTML = `
                <div>
                    <input type="checkbox" id="my-player-${player.id}" ${isSelected ? 'checked' : ''} 
                           onchange="toggleMyPlayerSelection(${player.id})" />
                    <label for="my-player-${player.id}">
                        <strong>${player.name}</strong> ${isSelected ? '⚡' : ''}<br>
                        <small>Valore: ${player.baseValue} | Punti: ${player.currentPoints}</small>
                    </label>
                </div>
                <div class="player-status">
                    ${isSelected ? '<span class="selected-badge">IN CAMPO</span>' : '<span class="bench-badge">PANCHINA</span>'}
                </div>
            `;
            teamList.appendChild(playerDiv);
        });

        // Add lineup management buttons
        const lineupControls = document.createElement('div');
        lineupControls.className = 'lineup-controls';
        lineupControls.innerHTML = `
            <button class="btn btn-success" onclick="saveMyLineup(${userId})">Salva Formazione</button>
            <button class="btn btn-warning" onclick="clearMyLineup(${userId})">Azzera Formazione</button>
            <p><small>Seleziona fino a 8 giocatori per la formazione titolare</small></p>
        `;
        teamList.appendChild(lineupControls);
    } catch (error) {
        console.error('Errore aggiornamento squadra:', error);
    }
}

async function buyPlayer(playerId, playerValue) {
    if (!currentUserInfo || !userToken) {
        showAlert('Devi effettuare il login dalla sezione "La Mia Squadra"!', 'error');
        return;
    }

    try {
        const result = await apiCall('/buy-player', {
            method: 'POST',
            body: JSON.stringify({
                playerId: playerId
            })
        });

        showAlert(result.message, 'success');

        // Ricarica i dati
        await loadInitialData();
        updateUI();
        await updateMyUserCredits(currentUserInfo.id);
        await updateMyUserTeam(currentUserInfo.id);
        await updateMarketList();

        // Update currentUser section if it's the same user
        if (currentUser == currentUserInfo.id) {
            await updateUserCredits(currentUser);
            await updateUserTeam(currentUser);
        }

    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function sellPlayer(playerId) {
    if (!currentUserInfo || !userToken) {
        showAlert('Devi effettuare il login dalla sezione "La Mia Squadra"!', 'error');
        return;
    }

    try {
        const result = await apiCall('/sell-player', {
            method: 'POST',
            body: JSON.stringify({
                playerId: playerId
            })
        });

        showAlert(result.message, 'success');

        // Ricarica i dati
        await loadInitialData();
        updateUI();
        await updateMyUserCredits(currentUserInfo.id);
        await updateMyUserTeam(currentUserInfo.id);
        await updateMarketList();

        // Update currentUser section if it's the same user
        if (currentUser == currentUserInfo.id) {
            await updateUserCredits(currentUser);
            await updateUserTeam(currentUser);
        }

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
    // Admin section still requires password authentication
    if (sectionName === 'admin' && !isAuthenticated) {
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

            let playersList = '<p style="color:darkred">Nessun giocatore</p>';
            if (userPlayers.length > 0) {
                playersList = userPlayers.map(p =>
                    `<div class="team-player"><span>${p.name} (${p.currentPoints} pts)</span></div>`
                ).join('');
            }

            teamCard.innerHTML = `
                <h3>${user.name}</h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <span><strong>Squadra:</strong> ${user.team_size}/11</span>
                    <span><strong>In Campo:</strong> ${user.lineup_size || 0}/8</span>
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
        const result = await apiCall('/auth/authenticate', {
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
    return sectionName === 'admin';
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
    } else if (sectionName === 'mia-squadra') {
        // No specific action needed, the section will load when user selects their name
    } else if (sectionName === 'mercato') {
        updateMarketList();
    }
}

document.getElementById('user-select').addEventListener('change', onUserSelect);
document.getElementById('my-user-select').addEventListener('change', onMyUserSelect);

document.getElementById('auth-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;
    
    if (password) {
        await authenticateUser(password);
    } else {
        showAlert('Inserisci la password!', 'error');
    }
});

// User login modal handlers
document.getElementById('user-login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const password = document.getElementById('user-password').value;
    
    if (password && selectedUserForLogin) {
        try {
            await loginUser(selectedUserForLogin.name, password);
            closeUserLoginModal();
            
            // Ensure the user select shows the logged in user
            document.getElementById('my-user-select').value = currentUserInfo.id;
        } catch (error) {
            showAlert(error.message, 'error');
            document.getElementById('user-password').value = '';
        }
    } else {
        showAlert('Inserisci la password!', 'error');
    }
});

// User login modal functions
function showUserLoginModal(userName) {
    document.getElementById('login-user-name').textContent = userName;
    document.getElementById('user-login-modal').style.display = 'flex';
    document.getElementById('user-password').value = '';
    document.getElementById('set-password-form').style.display = 'none';
    
    setTimeout(() => {
        document.getElementById('user-password').focus();
    }, 100);
}

function closeUserLoginModal() {
    document.getElementById('user-login-modal').style.display = 'none';
    selectedUserForLogin = null;
    document.getElementById('user-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    
    // Reset user selection
    document.getElementById('my-user-select').value = '';
}

function showSetPasswordForm() {
    document.getElementById('set-password-form').style.display = 'block';
    document.getElementById('new-password').focus();
}

function hideSetPasswordForm() {
    document.getElementById('set-password-form').style.display = 'none';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
}

async function setNewPassword() {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (!newPassword || !confirmPassword) {
        showAlert('Compila entrambi i campi password!', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showAlert('Le password non coincidono!', 'error');
        return;
    }
    
    if (newPassword.length < 4) {
        showAlert('La password deve essere di almeno 4 caratteri!', 'error');
        return;
    }
    
    try {
        // Login with the new password directly (the user should know their current password)
        const loginData = await loginUser(selectedUserForLogin.name, newPassword);
        
        showAlert('Login effettuato con successo!', 'success');
        closeUserLoginModal();
        
        // Ensure the user select shows the logged in user
        document.getElementById('my-user-select').value = currentUserInfo.id;
        
    } catch (error) {
        showAlert('Password non corretta! Inserisci la password corretta.', 'error');
    }
}

// Lineup management functions
function togglePlayerSelection(playerId) {
    const checkbox = document.getElementById(`player-${playerId}`);
    const selectedCount = document.querySelectorAll('input[id^="player-"]:checked').length;
    
    if (checkbox.checked && selectedCount > 8) {
        checkbox.checked = false;
        showAlert('Massimo 8 giocatori possono essere schierati!', 'error');
        return;
    }
}

function toggleMyPlayerSelection(playerId) {
    const checkbox = document.getElementById(`my-player-${playerId}`);
    const selectedCount = document.querySelectorAll('input[id^="my-player-"]:checked').length;
    
    if (checkbox.checked && selectedCount > 8) {
        checkbox.checked = false;
        showAlert('Massimo 8 giocatori possono essere schierati!', 'error');
        return;
    }
}

async function saveLineup() {
    if (!currentUser) {
        showAlert('Seleziona prima un associato!', 'error');
        return;
    }

    // Check if the current user is the logged-in user
    if (currentUser != (currentUserInfo && currentUserInfo.id)) {
        showAlert('Puoi modificare solo la tua formazione! Vai alla sezione "La Mia Squadra" e effettua il login.', 'error');
        return;
    }

    const selectedCheckboxes = document.querySelectorAll('input[id^="player-"]:checked');
    const playerIds = Array.from(selectedCheckboxes).map(cb => 
        parseInt(cb.id.replace('player-', ''))
    );

    if (playerIds.length === 0) {
        showAlert('Seleziona almeno un giocatore!', 'error');
        return;
    }

    if (playerIds.length > 8) {
        showAlert('Massimo 8 giocatori possono essere schierati!', 'error');
        return;
    }

    try {
        const result = await apiCall('/players/lineup', {
            method: 'POST',
            body: JSON.stringify({
                playerIds: playerIds
            })
        });

        showAlert(result.message, 'success');
        
        // Refresh data
        await loadInitialData();
        updateUI();
        await updateUserTeam(currentUser);

    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function clearLineup() {
    if (!currentUser) {
        showAlert('Seleziona prima un associato!', 'error');
        return;
    }

    // Check if the current user is the logged-in user
    if (currentUser != (currentUserInfo && currentUserInfo.id)) {
        showAlert('Puoi modificare solo la tua formazione! Vai alla sezione "La Mia Squadra" e effettua il login.', 'error');
        return;
    }

    try {
        const result = await apiCall('/players/lineup', {
            method: 'POST',
            body: JSON.stringify({
                playerIds: []
            })
        });

        showAlert('Formazione azzerata!', 'success');
        
        // Refresh data
        await loadInitialData();
        updateUI();
        await updateUserTeam(currentUser);

    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function saveMyLineup(userId) {
    if (!currentUserInfo || !userToken) {
        showAlert('Devi effettuare il login!', 'error');
        return;
    }

    const selectedCheckboxes = document.querySelectorAll('input[id^="my-player-"]:checked');
    const playerIds = Array.from(selectedCheckboxes).map(cb => 
        parseInt(cb.id.replace('my-player-', ''))
    );

    if (playerIds.length === 0) {
        showAlert('Seleziona almeno un giocatore!', 'error');
        return;
    }

    if (playerIds.length > 8) {
        showAlert('Massimo 8 giocatori possono essere schierati!', 'error');
        return;
    }

    try {
        const result = await apiCall('/players/lineup', {
            method: 'POST',
            body: JSON.stringify({
                playerIds: playerIds
            })
        });

        showAlert(result.message, 'success');
        
        // Refresh data
        await loadInitialData();
        updateUI();
        await updateMyUserTeam(userId);

    } catch (error) {
        showAlert(error.message, 'error');
    }
}

async function clearMyLineup(userId) {
    if (!currentUserInfo || !userToken) {
        showAlert('Devi effettuare il login!', 'error');
        return;
    }

    try {
        const result = await apiCall('/players/lineup', {
            method: 'POST',
            body: JSON.stringify({
                playerIds: []
            })
        });

        showAlert('Formazione azzerata!', 'success');
        
        // Refresh data
        await loadInitialData();
        updateUI();
        await updateMyUserTeam(userId);

    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// Admin function to show all passwords
async function showAllPasswords() {
    try {
        const result = await fetch(`${API_BASE}/auth/get-all-passwords`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ adminPassword: 'admin123' })
        });

        if (!result.ok) {
            const error = await result.json();
            throw new Error(error.message || 'Errore nel recupero password');
        }

        const data = await result.json();
        const passwordsList = document.getElementById('passwords-list');
        const passwordsContent = document.getElementById('passwords-content');
        
        let html = '<table class="table" style="font-size: 14px;"><thead><tr><th>Utente</th><th>Password</th></tr></thead><tbody>';
        
        data.users.forEach(user => {
            html += `<tr><td><strong>${user.name}</strong></td><td><code>${user.password}</code></td></tr>`;
        });
        
        html += '</tbody></table>';
        html += '<p style="margin-top: 15px; font-size: 12px; color: #718096;">💡 Condividi queste password con gli utenti rispettivi</p>';
        
        passwordsContent.innerHTML = html;
        passwordsList.style.display = 'block';
        
        showAlert('Password caricate con successo!', 'success');
        
    } catch (error) {
        showAlert('Errore: ' + error.message, 'error');
    }
}
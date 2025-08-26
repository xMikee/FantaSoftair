const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase, getDB } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Password amministratore (in un'applicazione reale, questo dovrebbe essere in un file di configurazione sicuro)
const ADMIN_PASSWORD = "admin123";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Lista degli associati
const associati = [
    "Carlo Tedesco", "Nicola Maino", "Miki Braná", "Filippo Tafuni",
    "Bartolo Diele", "Antonio Petrara", "Michele Farella", "Marcantonio Dambrosio",
    "Carlo Traetta", "Francesco Perrucci", "Michele Picerno", "Antonio Clemente",
    "Pasquale Tamborra", "Vincenzo Rotunno", "Michele Ardino", "Sandro Squicciarini",
    "Antonio Robortella", "Giacomo Caserta", "Vincenzo Cisterna", "Antonio Denora",
    "Francesco Tafuni", "Leonardo Di noya", "Domenico Carone", "Antonio Miglionico",
    "Vincenzo Cicirelli", "Giuseppe Baldini Anastasio", "Michele Morgese", "Andrea Lauriero",
    "Nicola Colonna", "Michele Caggiano", "Eleonora Varone", "Tommaso Rinaldi",
    "Angelo Tragni", "Lorenzo Tritto", "Giovanni Ragone", "Saverio Leone",
    "Angelo Ostuni", "Pasquale Tragni", "Stefano Maggio", "Claudio Lanza",
    "Paolo Colonna", "Vito Tafuno", "Giuseppe Monitillo", "Pietro Colonna",
    "Giovanni Pepe", "Denny Lorusso", "Antonio Picerno", "Adriano Rizzo"
];

// API Routes

// GET /api/users - Ottieni tutti gli utenti
app.get('/api/users', (req, res) => {
    const db = getDB();
    db.all("SELECT * FROM users ORDER BY name", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// GET /api/players - Ottieni tutti i giocatori
app.get('/api/players', (req, res) => {
    const db = getDB();
    const available = req.query.available === 'true';
    const userId = req.query.userId;

    let sql = "SELECT * FROM players";
    let params = [];

    if (available) {
        sql += " WHERE owner_id IS NULL";
    } else if (userId) {
        sql += " WHERE owner_id = ?";
        params = [userId];
    }

    sql += " ORDER BY base_value DESC";

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// GET /api/ranking - Ottieni la classifica
app.get('/api/ranking', (req, res) => {
    const db = getDB();
    const sql = `
        SELECT 
            u.id,
            u.name,
            u.credits,
            COALESCE(SUM(p.current_points), 0) as total_points,
            COUNT(p.id) as team_size
        FROM users u
        LEFT JOIN players p ON u.id = p.owner_id
        GROUP BY u.id, u.name
        ORDER BY total_points DESC
    `;

    db.all(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST /api/buy-player - Acquista un giocatore
app.post('/api/buy-player', (req, res) => {
    const { userId, playerId } = req.body;
    const db = getDB();

    // Verifica crediti e dimensione squadra
    db.get("SELECT credits FROM users WHERE id = ?", [userId], (err, user) => {
        if (err || !user) {
            res.status(400).json({ error: 'Utente non trovato' });
            return;
        }

        db.get("SELECT base_value FROM players WHERE id = ? AND owner_id IS NULL", [playerId], (err, player) => {
            if (err || !player) {
                res.status(400).json({ error: 'Giocatore non disponibile' });
                return;
            }

            if (user.credits < player.base_value) {
                res.status(400).json({ error: 'Crediti insufficienti' });
                return;
            }

            db.get("SELECT COUNT(*) as count FROM players WHERE owner_id = ?", [userId], (err, result) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }

                if (result.count >= 8) {
                    res.status(400).json({ error: 'Squadra completa (8 giocatori max)' });
                    return;
                }

                // Esegui l'acquisto
                db.serialize(() => {
                    db.run("UPDATE players SET owner_id = ? WHERE id = ?", [userId, playerId]);
                    db.run("UPDATE users SET credits = credits - ? WHERE id = ?", [player.base_value, userId]);
                });

                res.json({ success: true, message: 'Giocatore acquistato con successo!' });
            });
        });
    });
});

// POST /api/sell-player - Vendi un giocatore
app.post('/api/sell-player', (req, res) => {
    const { userId, playerId } = req.body;
    const db = getDB();

    db.get("SELECT base_value FROM players WHERE id = ? AND owner_id = ?", [playerId, userId], (err, player) => {
        if (err || !player) {
            res.status(400).json({ error: 'Giocatore non trovato nella tua squadra' });
            return;
        }

        const sellValue = Math.floor(player.base_value * 0.8);

        db.serialize(() => {
            db.run("UPDATE players SET owner_id = NULL WHERE id = ?", [playerId]);
            db.run("UPDATE users SET credits = credits + ? WHERE id = ?", [sellValue, userId]);
        });

        res.json({ success: true, message: `Giocatore venduto per ${sellValue} crediti!` });
    });
});

// POST /api/update-score - Aggiorna punteggio giocatore
app.post('/api/update-score', (req, res) => {
    const { playerId, points, description } = req.body;
    const db = getDB();

    db.serialize(() => {
        db.run("UPDATE players SET current_points = current_points + ? WHERE id = ?", [points, playerId]);
        db.run("INSERT INTO events (player_id, points, description, date) VALUES (?, ?, ?, datetime('now'))",
            [playerId, points, description || 'Evento registrato dall\'admin']);
    });

    res.json({ success: true, message: `Punteggio aggiornato: ${points > 0 ? '+' : ''}${points} punti!` });
});

// GET /api/events - Ottieni storico eventi
app.get('/api/events', (req, res) => {
    const db = getDB();
    const sql = `
        SELECT 
            e.id,
            e.date,
            e.points,
            e.description,
            p.name as player_name
        FROM events e
        JOIN players p ON e.player_id = p.id
        ORDER BY e.date DESC
        LIMIT 50
    `;

    db.all(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST /api/authenticate - Autenticazione amministratore
app.post('/api/authenticate', (req, res) => {
    const { password } = req.body;
    
    if (!password) {
        res.status(400).json({ error: 'Password richiesta' });
        return;
    }
    
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true, message: 'Autenticazione riuscita' });
    } else {
        res.status(401).json({ success: false, error: 'Password non corretta' });
    }
});

// POST /api/reset - Reset sistema
app.post('/api/reset', (req, res) => {
    const { type } = req.body; // 'market', 'scores', 'all'
    const db = getDB();

    db.serialize(() => {
        switch(type) {
            case 'market':
                db.run("UPDATE players SET owner_id = NULL");
                db.run("UPDATE users SET credits = 1000");
                break;
            case 'scores':
                db.run("UPDATE players SET current_points = 0");
                db.run("DELETE FROM events");
                break;
            case 'all':
                db.run("DELETE FROM events");
                db.run("UPDATE players SET current_points = 0, owner_id = NULL");
                db.run("UPDATE users SET credits = 1000, total_points = 0");
                break;
        }
    });

    res.json({ success: true, message: 'Reset completato!' });
});

// Inizializza il database e avvia il server
initDatabase(associati).then(() => {
    app.listen(PORT, () => {
        console.log(`🎯 Fanta Softair A-Team server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Errore nell\'inizializzazione del database:', err);
});
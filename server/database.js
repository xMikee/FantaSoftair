const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;

function initDatabase(associati) {
    return new Promise((resolve, reject) => {
        const fs = require('fs');
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        const dbPath = path.join(__dirname, '../data/fanta-softair.db');
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Errore connessione database:', err);
                reject(err);
                return;
            }
            console.log('Connesso al database SQLite');

            createTables()
                .then(() => initializeData(associati))
                .then(() => {
                    console.log('Database inizializzato con successo');
                    resolve();
                })
                .catch(reject);
        });
    });
}

function createTables() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    credits INTEGER DEFAULT 1000,
                    total_points INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) reject(err);
            });

            db.run(`
                CREATE TABLE IF NOT EXISTS players (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    base_value INTEGER DEFAULT 100,
                    current_points INTEGER DEFAULT 0,
                    owner_id INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (owner_id) REFERENCES users (id)
                )
            `, (err) => {
                if (err) reject(err);
            });

            db.run(`
                CREATE TABLE IF NOT EXISTS events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    player_id INTEGER NOT NULL,
                    points INTEGER NOT NULL,
                    description TEXT,
                    date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (player_id) REFERENCES players (id)
                )
            `, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });
}

function initializeData(associati) {
    return new Promise((resolve, reject) => {
        db.get("SELECT COUNT(*) as count FROM users", (err, result) => {
            if (err) {
                reject(err);
                return;
            }

            if (result.count > 0) {
                console.log('Dati già presenti nel database');
                resolve();
                return;
            }

            console.log('Inizializzazione dati...');

            db.serialize(() => {
                const userStmt = db.prepare("INSERT INTO users (name, credits, total_points) VALUES (?, 1000, 0)");
                associati.forEach(nome => {
                    userStmt.run(nome);
                });
                userStmt.finalize();

                const playerStmt = db.prepare("INSERT INTO players (name, base_value, current_points) VALUES (?, ?, 0)");
                associati.forEach(nome => {
                    const baseValue = Math.floor(Math.random() * 200) + 50;
                    playerStmt.run(nome, baseValue);
                });
                playerStmt.finalize(() => {
                    console.log(`Inseriti ${associati.length} associati e ${associati.length} giocatori`);
                    resolve();
                });
            });
        });
    });
}

function getDB() {
    return db;
}

function closeDatabase() {
    return new Promise((resolve) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    console.error('Errore chiusura database:', err);
                } else {
                    console.log('Database chiuso');
                }
                resolve();
            });
        } else {
            resolve();
        }
    });
}

module.exports = {
    initDatabase,
    getDB,
    closeDatabase
};
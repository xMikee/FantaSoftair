# 🎯 FantaSoftair A-Team - Sistema Fantasy Softair Completo

Sistema avanzato di gestione fantasy per il club A-Team con mercato giocatori, punteggi per eventi, classifiche in tempo reale e admin panel completo.

## 🔄 Aggiornamenti Recenti

### **Migrazione Database - Settembre 2025**
- **Da SQLite a MySQL**: Sistema migrato a database MySQL per performance superiori
- **Reset completo database**: Sistema pulito per nuova stagione
- **Struttura ottimizzata**: Schema database MySQL professionale
- **Performance enhanced**: Velocità e scalabilità notevolmente migliorate
- **Dati freschi**: Eliminati dati di test e sviluppo

### **Miglioramenti Sistema**
- **Stabilità aumentata**: Correzione bug minori
- **UI responsive**: Ottimizzazioni mobile e desktop
- **Gestione eventi**: Sistema più fluido per assegnazione punteggi
- **Admin panel**: Interface migliorata per gestione sistema

## 🚀 Nuove Funzionalità Implementate

### ✨ Sistema Eventi e Punteggi Avanzato
- **Eventi Gioco**: Creazione e gestione eventi con date programmate
- **Punteggi per Evento**: Assegnazione punteggi specifici per ogni evento
- **Countdown Eventi**: Timer automatico per eventi in arrivo
- **Storico Completo**: Visualizzazione cronologica di tutti gli eventi
- **Classifiche per Evento**: Ranking specifico per ogni giocata

### 🏆 Sistema Ranking Migliorato
- **Top Player**: Classifica migliori giocatori per punteggio
- **Ranking Utenti**: Classifica generale utenti con punteggi totali
- **Punteggi Stagionali**: Tracciamento punti annuali separati
- **Formazioni Salvate**: Snapshot formazioni per ogni evento

### 📱 Interfaccia Utente Rinnovata
- **Design Responsive**: Ottimizzato per mobile e desktop
- **Cards Animate**: Effetti hover e transizioni fluide
- **Layout Moderno**: Griglia responsive con gradients
- **Countdown Visuale**: Timer eleganti per eventi futuri

### 🔧 Architettura Migliorata
- **NestJS Framework**: Backend scalabile e modulare
- **TypeORM**: ORM avanzato per gestione database
- **Swagger API**: Documentazione automatica endpoints
- **Event Scoring Module**: Sistema dedicato calcolo punteggi

## 🏗️ Architettura

### **Backend**: NestJS + TypeORM + MySQL
- Framework modulare e altamente scalabile
- API REST completamente documentate
- Database MySQL con relazioni complesse e performance ottimizzate
- Validazione automatica e type safety

### **Frontend**: Vanilla JavaScript + CSS3
- Interface responsive mobile-first
- Design moderno con animazioni CSS
- Gestione stato client-side ottimizzata

## 🚀 Setup e Installazione

### Prerequisiti
- Node.js 18+
- npm
- MySQL 8.0+ (o MariaDB 10.5+)

### 1. Clona il progetto
```bash
git clone https://github.com/xMikee/FantaSoftair.git
cd FantaSoftair
```

### 2. Installa le dipendenze
```bash
npm install
```

### 3. Configura il Database MySQL

**IMPORTANTE**: Il sistema è stato migrato da SQLite a MySQL per performance superiori.

**NOTA MIGRAZIONE**: Il database è stato cambiato da SQLite a MySQL per:
- Performance e scalabilità migliorate
- Supporto concurrent access
- Gestione transazioni avanzate
- Backup e recovery professionali

#### Configurazione MySQL

```bash
# 1. Installa e avvia MySQL
# Su Ubuntu/Debian:
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql

# Su macOS con Homebrew:
brew install mysql
brew services start mysql

# Su Windows: Scarica MySQL Installer
```

#### Crea Database e Utente

```sql
# Accedi a MySQL come root
mysql -u root -p

# Crea il database
CREATE DATABASE fanta_softair CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Crea utente dedicato (opzionale ma consigliato)
CREATE USER 'fanta_user'@'localhost' IDENTIFIED BY 'fanta_password';
GRANT ALL PRIVILEGES ON fanta_softair.* TO 'fanta_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Configurazione Environment (Opzionale)

```bash
# Crea file .env nella root del progetto
echo "DB_HOST=localhost" >> .env
echo "DB_PORT=3306" >> .env
echo "DB_USERNAME=fanta_user" >> .env
echo "DB_PASSWORD=fanta_password" >> .env
echo "DB_NAME=fanta_softair" >> .env
```

### 4. Prima Esecuzione e Setup Tabelle

```bash
# Avvia l'applicazione in modalità development
# TypeORM creerà automaticamente le tabelle MySQL
npm run start:dev
```

**NOTA**: Al primo avvio, TypeORM creerà automaticamente tutte le tabelle nel database MySQL basandosi sulle entità definite.

#### Popolamento Dati Iniziali (Opzionale)

```bash
# IMPORTANTE: Prima aggiorna populate-teams.js per MySQL
# Poi esegui il popolamento
node populate-teams.js
```

### 5. Avvia l'Applicazione

#### Modalità Sviluppo (Consigliata)
```bash
npm run start:dev
```

#### Modalità Produzione
```bash
# Build del progetto
npm run build

# Avvio produzione
npm run start:prod
```

### 6. Accedi all'Applicazione
- **App**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs (Swagger UI)

## 📋 Funzionalità Complete

### 🔒 Sistema di Autenticazione
- **Accesso Pubblico**: Classifiche e visualizzazione formazioni
- **Admin Panel**: Gestione completa sistema (password protetto)
- **JWT Authentication**: Tokens sicuri per sessioni admin

### 🏆 Classifiche e Ranking
- **Classifica Generale**: Ranking utenti per punteggio totale
- **Top Players**: Migliori giocatori per prestazioni
- **Classifiche per Evento**: Ranking specifico per ogni giocata
- **Statistiche Avanzate**: Medie, trend, performance

### 👥 Gestione Squadre
- **Formazioni**: Creazione e gestione squadre (max 8 giocatori)
- **Lineup**: Selezione formazione titolare per eventi
- **Mercato Integrato**: Acquisto/vendita giocatori
- **Budget Management**: Gestione crediti e valori di mercato

### 🛒 Sistema Mercato
- **1000 crediti** iniziali per ogni utente
- **Valori Dinamici**: Prezzi basati su prestazioni
- **Acquisto/Vendita**: Sistema completo transazioni
- **Vendita al 80%**: Meccanica di rivendita realistica

### 📅 Gestione Eventi
- **Creazione Eventi**: Eventi programmati con date
- **Countdown**: Timer automatico per eventi futuri
- **Stato Eventi**: Attivi, chiusi, archiviati
- **Assegnazione Punteggi**: Sistema completo scoring per evento

### ⚙️ Admin Panel Completo
- **Gestione Eventi**: Creazione, modifica, chiusura eventi
- **Assegnazione Punteggi**: Interface per tutti i tipi di punteggio
- **Reset Sistema**: Reset mercato/punteggi/completo
- **Storico Completo**: Visualizzazione tutti i dati storici
- **Statistiche Advanced**: Report e analytics

## 🎮 Sistema Punteggi Dettagliato

### **Malus** ❌
| Evento | Punti | Codice | Descrizione |
|--------|-------|--------|-------------|
| Non mette presenza | -2 | NO_PRESENCE | Assenza non comunicata |
| Bidona domenica | -5 | SUNDAY_BAIL | Assenza il giorno della partita |
| Ritardo/uscita anticipata | -1 | LATE_EARLY | Per ogni 15 minuti |
| Consiglio disciplinare | -6 | DISCIPLINARY | Sanzione disciplinare |
| Assente con avviso | -2 | NOTIFIED_ABSENCE | Assenza comunicata |
| Non offre dopo compleanno | -2 | NO_BIRTHDAY_TREAT | Mancata offerta |
| Sporca il bosco | -5 | LITTERING | Comportamento antiecologico |
| Perde equipaggiamento | -3 | LOST_EQUIPMENT | Perdita materiali |
| Radio assente/scarica | -3 | RADIO_ISSUE | Problemi comunicazione |
| Batteria scarica | -2 | LOW_BATTERY | Batteria insufficiente |
| Patch alta visibilità | -1 | HIGH_VIS_PATCH | Equipaggiamento non conforme |

### **Bonus** ✅
| Evento | Punti | Codice | Descrizione |
|--------|-------|--------|-------------|
| Presente | +4 | PRESENT | Partecipazione base |
| Anticipo organizzazione | +2 | EARLY_HELP | Aiuto preparazione |
| Silent kill | +3 | SILENT_KILL | Eliminazione silenziosa |
| Kill a 1 colpo | +1 | ONE_SHOT_KILL | Eliminazione precisa |
| Cornetti base | +5 | BASIC_TREATS | Offerta cornetti |
| + Bonus salmone | +1 | SALMON_BONUS | Aggiunta salmone |
| + Senza lattosio | +1 | LACTOSE_FREE | Opzione senza lattosio |
| Presenze consecutive | +5 | CONSECUTIVE | Dopo 3 consecutive |
| Trova equipaggiamento | +2 | FOUND_EQUIPMENT | Recupero materiali |
| Crea scenografia | +5 | SCENOGRAPHY | Contributo ambientazione |
| Obiettivo speciale | +3 | SPECIAL_OBJECTIVE | Creazione sfida |
| Aiuto manovalanza | +3 | MANUAL_HELP | Supporto organizzativo |
| Convocazione evento | +2 | EVENT_CALL | Partecipazione speciale |

## 📁 Struttura Database MySQL

### **Entità Principali**

#### **Users** - Utenti/Associati
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL,
    credits INT DEFAULT 1000,
    total_points INT DEFAULT 0,
    team_password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **Players** - Giocatori del Club
```sql
CREATE TABLE players (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    base_value INT DEFAULT 100,
    current_points INT DEFAULT 0,
    yearly_points INT DEFAULT 0,
    position VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **Game Events** - Eventi/Giocate
```sql
CREATE TABLE game_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    date DATETIME NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### **Event Scores** - Punteggi per Evento
```sql
CREATE TABLE event_scores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    player_id INT NOT NULL,
    game_event_id INT NOT NULL,
    points INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (game_event_id) REFERENCES game_events(id) ON DELETE CASCADE,
    UNIQUE(player_id, game_event_id)
);
```

#### **User Players** - Possesso Giocatori
```sql
CREATE TABLE user_players (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    player_id INT NOT NULL,
    selected_for_lineup BOOLEAN DEFAULT FALSE,
    is_in_formation BOOLEAN DEFAULT FALSE,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE(user_id, player_id)
);
```

#### **User Event Scores** - Punteggi Utente per Evento
```sql
CREATE TABLE user_event_scores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    game_event_id INT NOT NULL,
    total_points INT DEFAULT 0,
    formation_snapshot TEXT,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_event_id) REFERENCES game_events(id) ON DELETE CASCADE,
    UNIQUE(user_id, game_event_id)
);
```

### Creazione Database MySQL da Zero

Se il database viene eliminato, seguire questi passaggi:

```bash
# 1. Crea nuovo database MySQL
mysql -u root -p -e "DROP DATABASE IF EXISTS fanta_softair; CREATE DATABASE fanta_softair CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Avvia l'app - TypeORM creerà le tabelle automaticamente
npm run start:dev

# 3. Il database viene creato con la struttura completa
# Le entità TypeORM generano automaticamente le tabelle MySQL
```

### Backup e Restore Database MySQL

```bash
# Backup completo
mysqldump -u root -p fanta_softair > "backup-fanta-softair-$(date +%Y%m%d_%H%M%S).sql"

# Restore da backup
mysql -u root -p fanta_softair < backup-fanta-softair-20241201_143022.sql

# Backup specifico tabelle
mysqldump -u root -p fanta_softair users players game_events > backup-core.sql

# Restore selectivo
mysql -u root -p fanta_softair < backup-core.sql
```

## 🌐 API Endpoints

### **Autenticazione**
- `POST /auth/login` - Login amministratore

### **Utenti**
- `GET /users` - Lista tutti gli utenti
- `GET /users/:id` - Dettaglio utente specifico
- `GET /users/:id/players` - Giocatori posseduti da utente

### **Giocatori**
- `GET /players` - Lista tutti i giocatori
- `GET /players/available` - Giocatori disponibili per acquisto
- `GET /players/top` - Top giocatori per punteggio

### **Mercato**
- `POST /market/buy` - Acquista giocatore
- `POST /market/sell` - Vendi giocatore
- `GET /market/transactions` - Storico transazioni

### **Eventi**
- `GET /game-events` - Lista eventi
- `POST /game-events` - Crea nuovo evento (admin)
- `PUT /game-events/:id` - Modifica evento (admin)
- `DELETE /game-events/:id` - Elimina evento (admin)

### **Punteggi Eventi**
- `GET /event-scoring/event/:id` - Punteggi per evento
- `POST /event-scoring/assign` - Assegna punteggi (admin)
- `GET /event-scoring/rankings/:eventId` - Classifica evento

### **Amministrazione**
- `POST /admin/reset` - Reset sistema completo
- `GET /admin/stats` - Statistiche generali
- `POST /admin/calculate-scores` - Ricalcola punteggi

### **Team/Formazioni**
- `GET /team/:userId` - Formazione utente
- `POST /team/:userId/lineup` - Aggiorna formazione titolare

## 🛠️ Struttura Progetto

```
FantaSoftair-New2/
├── src/                           # Codice sorgente NestJS
│   ├── admin/                    # Modulo amministrazione
│   ├── auth/                     # Autenticazione JWT
│   ├── database/                 # Configurazione DB e entità
│   │   └── entities/            # Entità TypeORM
│   │       ├── user.entity.ts
│   │       ├── player.entity.ts
│   │       ├── game-event.entity.ts
│   │       ├── event-score.entity.ts
│   │       ├── user-event-score.entity.ts
│   │       └── user-player.entity.ts
│   ├── event-scoring/           # Sistema punteggi eventi
│   ├── game-events/             # Gestione eventi gioco
│   ├── market/                  # Sistema mercato
│   ├── players/                 # Gestione giocatori
│   ├── team/                    # Gestione formazioni
│   ├── users/                   # Gestione utenti
│   ├── app.module.ts            # Modulo principale
│   └── main.ts                  # Entry point
├── public/                       # Frontend statico
│   ├── index.html               # App principale
│   ├── admin.html               # Panel admin
│   ├── classifica.html          # Classifiche
│   ├── script.js                # Logica frontend
│   └── style.css                # Stili responsive
├── data/                         # Database SQLite
│   └── fanta-softair.db         # File database principale
├── dist/                         # Build output TypeScript
├── package.json                  # Dipendenze e scripts
└── README.md                     # Questa documentazione
```

## 🔧 Scripts NPM

```json
{
  "build": "nest build",
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:debug": "nest start --debug --watch", 
  "start:prod": "node dist/main",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:cov": "jest --coverage"
}
```

## 🚀 Deploy in Produzione

### Server VPS/Cloud

```bash
# Installa Node.js 18+ e PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pm2

# Deploy applicazione
git clone https://github.com/xMikee/FantaSoftair.git
cd FantaSoftair
npm install
npm run build

# Avvia con PM2
pm2 start dist/main.js --name "fanta-softair"
pm2 startup
pm2 save
```

### Docker Setup (con MySQL)

```dockerfile
FROM node:18-alpine

# Installa dipendenze MySQL client
RUN apk add --no-cache mysql-client

WORKDIR /app

# Copy e installa dipendenze
COPY package*.json ./
RUN npm ci --only=production

# Copy codice sorgente
COPY . .

# Build applicazione
RUN npm run build

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/users || exit 1

CMD ["npm", "run", "start:prod"]
```

#### Docker Compose con MySQL

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USERNAME=fanta_user
      - DB_PASSWORD=fanta_password
      - DB_NAME=fanta_softair
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=fanta_softair
      - MYSQL_USER=fanta_user
      - MYSQL_PASSWORD=fanta_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

## 🔐 Sicurezza

### Configurazione Produzione

```bash
# Variabili ambiente
export NODE_ENV=production
export JWT_SECRET=your-super-secret-jwt-key
export ADMIN_PASSWORD=your-secure-admin-password
```

### Rate Limiting (Consigliato)

```bash
npm install @nestjs/throttler
```

## 📱 PWA Support (Futuro)

Il sistema è predisposto per diventare una Progressive Web App:

- Service Worker ready
- Responsive design completo
- Offline capabilities (parziali)
- App-like experience mobile

## 🐛 Troubleshooting

### Problemi connessione MySQL
```bash
# Verifica servizio MySQL
sudo systemctl status mysql

# Test connessione
mysql -u root -p -e "SELECT 1;"

# Verifica database
mysql -u root -p -e "SHOW DATABASES;" | grep fanta_softair
```

### Porta 3000 occupata
```bash
# Trova processo
lsof -i :3000
# Termina processo
kill -9 [PID]
```

### Reset completo sistema
```bash
# Ricrea database MySQL e rebuild
mysql -u root -p -e "DROP DATABASE IF EXISTS fanta_softair; CREATE DATABASE fanta_softair CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
rm -rf dist/
npm run build
npm run start:dev
```

## 📊 Funzionalità Future Pianificate

- [ ] **Notifiche Push**: Per eventi e aggiornamenti
- [ ] **Chat Integrata**: Comunicazione tra utenti
- [ ] **Statistiche Avanzate**: Grafici e analytics
- [ ] **Mobile App**: PWA o app nativa
- [ ] **Integrazione Social**: Condivisione risultati
- [ ] **Sistema Premi**: Riconoscimenti automatici
- [ ] **Backup Cloud**: Sincronizzazione automatica

## 📞 Supporto e Contatti

Per problemi tecnici, miglioramenti o domande:
- Controlla i logs: `npm run start:dev`
- Verifica database: `mysql -u root -p -e "USE fanta_softair; SHOW TABLES;"`
- API Documentation: http://localhost:3000/api-docs

---

## 🎯 Quick Start

```bash
# Setup completo in una linea
git clone https://github.com/xMikee/FantaSoftair.git && cd FantaSoftair && npm install && npm run start:dev
```

**Porta**: http://localhost:3000
**Admin**: Password di default (configurabile)
**Database**: MySQL `fanta_softair` su localhost:3306

---

*🎯 Buona fortuna con il FantaSoftair! Che la fortuna sia sempre dalla parte del tuo fantasy team! 🏆*

# 🎯 Fanta Softair A-Team

Sistema di gestione fantasy per il club A-Team con mercato giocatori, punteggi e classifiche.

## 🏗️ Architettura

Il progetto è stato migrato da Express.js a **NestJS** per una maggiore scalabilità e manutenibilità.

### **Backend**: NestJS + TypeORM
- Framework modulare e scalabile
- API REST documentate con Swagger
- Database SQLite con TypeORM
- Validazione automatica con class-validator

### **Frontend**: Vanilla JavaScript
- Interface responsive e mobile-first
- Design moderno con gradiente e animazioni
- Gestione stato client-side

## 🚀 Setup Rapido

### 1. Clona il progetto
```bash
git clone https://github.com/xMikee/FantaSoftair.git
cd FantaSoftair
```

### 2. Installa le dipendenze
```bash
npm install
```

### 3. Avvia l'applicazione

#### Modalità Sviluppo NestJS (Consigliata)
```bash
npm run start:dev
```

#### Modalità Produzione
```bash
# Build del progetto
npm run build

# Avvio produzione
npm start
```

#### Modalità Legacy (Express.js)
```bash
npm run start:old
```

### 4. Apri il browser
- **App**: `http://localhost:3000`
- **API Docs**: `http://localhost:3000/api-docs`

## 📋 Funzionalità

### 🔒 **Sistema di Autenticazione**
- **Accesso libero**: Classifica e visualizzazione squadre
- **Password Admin**: `admin123` (per mercato e amministrazione)
- **Auto-logout**: Le sessioni scadono alla chiusura del browser
- **Protezione sezioni**: Mercato e Admin protetti da password

### 🏆 **Classifica** (Accesso Libero)
- Classifica in tempo reale basata sui punti totali
- Visualizzazione squadre (massimo 8 giocatori)

### 👥 **Squadre** (Accesso Libero)
- Visualizzazione di tutte le squadre
- Riepilogo crediti e punti totali

### 🛒 **Mercato** (Password Protetto)
- **Password**: `admin123`
- 1000 crediti iniziali per ogni associato
- 48 giocatori disponibili (tutti gli associati del club)
- Valori randomizzati tra 50-250 crediti
- Sistema acquisto/vendita (vendita al 80%)

### ⚙️ **Admin Panel** (Password Protetto)
- **Password**: `admin123`
- Sistema punteggi completo con tutti gli eventi
- Storico eventi con data e descrizione
- Reset mercato/punteggi/completo

## 🎮 Sistema Punteggi

### **Malus** ❌
| Evento | Punti | Descrizione |
|--------|-------|-------------|
| Non mette presenza | -2 | Assenza non comunicata |
| Bidona domenica | -5 | Assenza il giorno della partita |
| Ritardo/uscita anticipata | -1 | Ogni 15 minuti |
| Consiglio disciplinare | -6 | Sanzione disciplinare |
| Assente con avviso | -2 | Assenza comunicata |
| Non offre dopo compleanno | -2 | Mancata offerta post-evento |
| Sporca il bosco | -5 | Comportamento antiecologico |
| Perde equipaggiamento | -3 | Perdita materiali |
| Radio assente/scarica | -3 | Problemi comunicazione |
| Batteria scarica | -2 | Batteria insufficiente |
| Patch alta visibilità | -1 | Equipaggiamento non conforme |

### **Bonus** ✅
| Evento | Punti | Descrizione |
|--------|-------|-------------|
| Presente | +4 | Partecipazione alla giocata |
| Anticipo organizzazione | +2 | Aiuto preparazione |
| Silent kill | +3 | Eliminazione silenziosa |
| Kill a 1 colpo | +1 | Eliminazione precisa |
| Cornetti sul campo | +5 | Offerta base |
| + Bonus salmone | +1 | Aggiunta salmone |
| + Senza lattosio | +1 | Opzione senza lattosio |
| Presenze cumulative | +5 | Dopo 3 consecutive |
| Trova equipaggiamento | +2 | Recupero materiali |
| Crea scenografia | +5 | Contributo ambientazione |
| Obiettivo speciale | +3 | Creazione sfida |
| Aiuto manovalanza | +3 | Supporto organizzativo |
| Convocazione evento | +2 | Partecipazione speciale |

## 🔧 **Configurazione Sviluppo**

### **Scripts NPM Disponibili**
```json
{
  "build": "tsc",              // Compila TypeScript
  "start": "node dist/main",   // Avvio produzione NestJS
  "start:dev": "ts-node src/main.ts", // Sviluppo NestJS
  "start:old": "node server/server.js", // Server Express legacy
  "dev": "nodemon server/server.js",    // Sviluppo Express
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

### **WebStorm Configuration**
1. **TypeScript**: Configurazione automatica con `tsconfig.json`
2. **Debugging NestJS**: 
   - Avvia con `npm run start:dev`
   - Attach debugger Node.js su porta 3000
3. **Live Reload**: Utilizzare `npm run start:dev` per auto-restart

## 📁 **Struttura Database**

### **Entità TypeORM**

#### **User Entity** (`src/database/entities/user.entity.ts`)
```typescript
export class User {
  id: number;
  name: string;
  credits: number;
  totalScore: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Player Entity** (`src/database/entities/player.entity.ts`)
```typescript
export class Player {
  id: number;
  name: string;
  value: number;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Event Entity** (`src/database/entities/event.entity.ts`)
```typescript
export class Event {
  id: number;
  playerId: number;
  eventType: string;
  points: number;
  description: string;
  date: Date;
}
```

### **Backup Database**
Il database SQLite si trova in `data/fanta-softair.db`
```bash
# Backup
cp data/fanta-softair.db data/backup-$(date +%Y%m%d).db

# Restore
cp data/backup-20241201.db data/fanta-softair.db
```

## 🌐 **Deploy Produzione**

### **Server VPS/Cloud**
```bash
# Installa Node.js e PM2
npm install -g pm2

# Deploy
git clone [repo-url]
cd fanta-softair-ateam
npm install
pm2 start server/server.js --name "fanta-softair"
```

### **Docker** (opzionale)
```dockerfile
FROM node:18-alpine

# Installa dependencies per SQLite
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copia package files
COPY package*.json ./
COPY tsconfig.json ./

# Installa dependencies
RUN npm install

# Copia sorgenti
COPY src/ ./src/
COPY public/ ./public/
COPY server/ ./server/

# Build TypeScript
RUN npm run build

# Crea directory data
RUN mkdir -p data

EXPOSE 3000

# Avvia NestJS
CMD ["npm", "start"]
```

## 🛠️ **Sviluppo**

### **Struttura del Progetto**
```
FantaSoftair/
├── src/                     # Codice sorgente NestJS
│   ├── admin/              # Modulo amministrazione
│   ├── auth/               # Modulo autenticazione
│   ├── database/           # Configurazione database
│   │   └── entities/       # Entità TypeORM
│   ├── events/             # Modulo eventi
│   ├── market/             # Modulo mercato
│   ├── players/            # Modulo giocatori
│   ├── users/              # Modulo utenti
│   ├── app.module.ts       # Modulo principale
│   └── main.ts            # Entry point NestJS
├── server/                 # Server Express.js legacy
├── public/                 # Frontend statico
│   ├── img/               # Immagini e asset
│   ├── index.html         # Interfaccia principale
│   ├── script.js          # Logica frontend
│   └── style.css          # Stili CSS
├── data/                   # Database SQLite
└── dist/                   # Build output
```

### **API Endpoints NestJS**
Documentazione completa disponibile su: `http://localhost:3000/api-docs`

#### **Autenticazione**
- `POST /auth/login` - Login amministratore

#### **Utenti**
- `GET /users` - Lista associati
- `GET /users/:id` - Dettaglio utente

#### **Giocatori**
- `GET /players` - Lista giocatori
- `GET /players/available` - Giocatori disponibili

#### **Mercato**
- `POST /market/buy` - Acquista giocatore
- `POST /market/sell` - Vendi giocatore

#### **Eventi**
- `GET /events` - Storico eventi
- `GET /events/user/:userId` - Eventi per utente

#### **Amministrazione**
- `POST /admin/score` - Aggiorna punteggi
- `POST /admin/reset` - Reset sistema

### **Aggiungere nuove funzionalità**

#### **Backend NestJS**
1. Crea nuovi moduli con `nest generate module nome-modulo`
2. Genera controller: `nest generate controller nome-modulo`
3. Genera service: `nest generate service nome-modulo`
4. Definisci entità in `src/database/entities/`
5. Aggiorna `app.module.ts` per importare nuovi moduli

#### **Frontend**
1. Aggiorna `public/script.js` per nuove funzionalità
2. Modifica `public/style.css` per nuovi stili
3. Estendi `public/index.html` per nuovi elementi UI

#### **Database**
- Le migrazioni sono automatiche con TypeORM
- Modifica le entità per cambiare la struttura DB

## 📱 **Mobile**
L'app è completamente responsive e funziona su tutti i dispositivi.

## 🔐 **Sicurezza e Password**

### **Password Predefinita**
- **Password Unica**: `admin123` (per mercato e amministrazione)

### **Cambiare la Password**
Modifica il file `server/server.js`:
```javascript
const ADMIN_PASSWORD = "tua_nuova_password";
```

### **Livelli di Accesso**
1. **Pubblico** (senza password):
    - ✅ Visualizzazione classifica
    - ✅ Visualizzazione squadre formate

2. **Amministratori** (password admin):
    - ✅ Accesso al mercato
    - ✅ Acquisto/vendita giocatori  
    - ✅ Gestione delle squadre
    - ✅ Aggiornamento punteggi
    - ✅ Gestione eventi
    - ✅ Reset sistema
    - ✅ Visualizzazione storico completo

### **Sicurezza Aggiuntiva per Produzione**
Per un ambiente di produzione, considera:
```bash
npm install express-session bcrypt
```

E implementa:
- Session management con cookie sicuri
- Hash delle password con bcrypt
- HTTPS obbligatorio
- Rate limiting per login tentativi

## 📞 **Supporto**
Per problemi o miglioramenti, contatta l'admin del club!

---
*Buona fortuna con il Fanta Softair! 🎯*

## 🎯 **Quick Start Commands**

```bash
# Setup completo NestJS
git clone https://github.com/xMikee/FantaSoftair.git && cd FantaSoftair && npm install && npm run start:dev

# Setup Express.js legacy
git clone https://github.com/xMikee/FantaSoftair.git && cd FantaSoftair && npm install && npm run start:old
```

## 🔄 **Aggiornamenti Futuri**

### **Funzionalità Pianificate**
- [ ] **Autenticazione**: Login per ogni associato
- [ ] **Notifiche Push**: Avvisi per nuovi eventi
- [ ] **Statistiche Avanzate**: Grafici e trend
- [ ] **Mobile App**: PWA o app nativa
- [ ] **Integrazione WhatsApp**: Bot per aggiornamenti
- [ ] **Foto Eventi**: Upload immagini delle giocate
- [ ] **Calendario**: Pianificazione eventi futuri
- [ ] **Premi**: Sistema ricompense automatico

### **Miglioramenti Tecnici**
- [x] **NestJS Framework**: Migrazione completata
- [x] **TypeORM**: ORM moderno per database
- [x] **Swagger Documentation**: API docs automatiche
- [ ] **Redis Cache**: Per performance migliori
- [ ] **WebSocket**: Aggiornamenti in tempo reale
- [ ] **API Rate Limiting**: Protezione da abusi
- [ ] **Backup Automatico**: Salvataggi programmati
- [ ] **Test Suite**: Unit e integration tests
- [ ] **CI/CD Pipeline**: Deploy automatizzato

## 🐛 **Troubleshooting**

### **Problemi Comuni**

#### **Porta già in uso**
```bash
# Trova processo sulla porta 3000
lsof -i :3000
# Termina il processo
kill -9 [PID]
```

#### **Database non si crea**
```bash
# Controlla permessi cartella
chmod 755 data/
# Ricrea database
rm data/fanta-softair.db
npm start
```

#### **Errore CORS in produzione**
Modifica `server/server.js`:
```javascript
app.use(cors({
    origin: ['http://localhost:3000', 'https://yourdomain.com'],
    credentials: true
}));
```

#### **Giocatori non si caricano**
1. Verifica connessione database
2. Controlla logs: `npm run dev`
3. Reset database: API `/api/reset` con type "all"

### **Log Debugging**
```bash
# Logs in tempo reale
tail -f logs/app.log

# Logs database
sqlite3 data/fanta-softair.db ".schema"
sqlite3 data/fanta-softair.db "SELECT * FROM users LIMIT 5;"
```

## 📊 **Monitoraggio**

### **Metriche Importanti**
- Numero utenti attivi
- Transazioni mercato giornaliere
- Eventi registrati per giocata
- Performance tempo risposta API

### **Health Check**
```bash
curl http://localhost:3000/api/users
```

## 🎨 **Personalizzazione**

### **Cambiare Colori**
Modifica `public/style.css`:
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #48bb78;
    --danger-color: #f56565;
}
```


### **Personalizzare Punteggi**
Modifica array eventi in `server/server.js` e `public/index.html`.

## 🚀 **Performance Tips**

### **Ottimizzazioni Database**
```sql
-- Indici per query frequenti
CREATE INDEX idx_players_owner ON players(owner_id);
CREATE INDEX idx_events_player ON events(player_id);
CREATE INDEX idx_events_date ON events(date);
```

### **Cache Strategie**
- Cache classifica per 1 minuto
- Cache mercato per 30 secondi
- Cache eventi per 5 minuti

### **Compressione Assets**
```bash
npm install compression
```

Aggiungi in `server.js`:
```javascript
const compression = require('compression');
app.use(compression());
```

## 🔐 **Sicurezza Produzione**

### **Variabili Ambiente**
Crea `.env`:
```env
NODE_ENV=production
PORT=3000
DB_PATH=./data/fanta-softair.db
SECRET_KEY=your-secret-key-here
ADMIN_PASSWORD=admin-password
```

### **HTTPS Setup**
```javascript
const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync('private-key.pem'),
    cert: fs.readFileSync('certificate.pem')
};

https.createServer(options, app).listen(443);
```

### **Rate Limiting**
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuti
    max: 100 // max 100 richieste per IP
});

app.use('/api/', limiter);
```

## 📱 **PWA Setup**

### **Service Worker**
Crea `public/sw.js`:
```javascript
const CACHE_NAME = 'fanta-softair-v1';
const urlsToCache = [
    '/',
    '/style.css',
    '/script.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});
```

### **Manifest**
Crea `public/manifest.json`:
```json
{
  "name": "Fanta Softair",
  "short_name": "FantaSoftair",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#667eea",
  "theme_color": "#667eea",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## 📧 **Integrazioni**

### **Email Notifiche**
```bash
npm install nodemailer
```

### **WhatsApp Bot**
```bash
npm install whatsapp-web.js
```

### **Telegram Bot**
```bash
npm install node-telegram-bot-api
```

## 🏆 **Best Practices**

### **Codice**
- Usa ESLint per code style
- Implementa testing con Jest
- Documenta API con Swagger
- Usa TypeScript per type safety

### **Database**
- Backup regolari automatici
- Validazione input sanitizzata
- Transazioni per operazioni critiche
- Indici su colonne frequent queries

### **UI/UX**
- Loading states per tutte le azioni
- Error handling user-friendly
- Mobile-first design
- Accessibility compliance (WCAG)

---

## 🎉 **Conclusione**

Hai ora un sistema completo per il Fanta Softair del club! Il sistema è:

✅ **Completo**: Mercato, punteggi, classifiche, admin panel
✅ **Scalabile**: Architettura modulare e estendibile  
✅ **Mobile-Ready**: Design responsive per tutti i dispositivi
✅ **Production-Ready**: Database persistente e API robuste

### **Prossimi Passi Consigliati:**

1. **Test**: Prova tutte le funzionalità con dati reali
2. **Backup**: Imposta backup automatici del database
3. **Deploy**: Metti online su un server/cloud
4. **Training**: Forma gli admin sull'uso del sistema
5. **Feedback**: Raccogli feedback dagli associati
6. **Iterate**: Migliora basandoti sull'uso reale

**Buona fortuna con il Fanta Softair! 🎯🏆**

*"Il gioco è più bello quando tutti partecipano!"*
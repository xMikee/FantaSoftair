# 🎯 Fanta Softair A-Team

Sistema di gestione fantasy per il club A-Team con mercato giocatori, punteggi e classifiche.

## 🚀 Setup Rapido

### 1. Clona/Crea il progetto
```bash
mkdir fanta-softair-ateam
cd fanta-softair-ateam
```

### 2. Inizializza Node.js
```bash
npm init -y
```

### 3. Installa le dipendenze
```bash
npm install express sqlite3 cors
npm install --save-dev nodemon
```

### 4. Crea la struttura delle cartelle
```
fanta-softair-ateam/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server/
│   ├── server.js
│   └── database.js
├── data/
│   └── (il database si creerà automaticamente)
├── package.json
└── README.md
```

### 5. Copia i file
- Copia il contenuto di `package.json` dall'artifact
- Copia `server/server.js` dall'artifact
- Copia `server/database.js` dall'artifact
- Copia `public/index.html` dall'artifact
- Copia `public/script.js` dall'artifact
- Copia `public/style.css` dall'artifact

### 6. Avvia l'applicazione
```bash
# Modalità sviluppo (auto-restart)
npm run dev

# Modalità produzione
npm start
```

### 7. Apri il browser
Vai su: `http://localhost:3000`

## 📋 Funzionalità

### 🔒 **Sistema di Autenticazione**
- **Accesso libero**: Classifica e visualizzazione squadre
- **Password Mercato**: `ateam2024` (per gli associati)
- **Password Admin**: `admin2024` (per gli amministratori)
- **Auto-logout**: Le sessioni scadono alla chiusura del browser

### 🏆 **Classifica** (Accesso Libero)
- Classifica in tempo reale basata sui punti totali
- Visualizzazione squadre (massimo 8 giocatori)

### 👥 **Squadre** (Accesso Libero)
- Visualizzazione di tutte le squadre
- Riepilogo crediti e punti totali

### 🛒 **Mercato** (Password Protetto)
- **Password**: `ateam2024`
- 1000 crediti iniziali per ogni associato
- 48 giocatori disponibili (tutti gli associati del club)
- Valori randomizzati tra 50-250 crediti
- Sistema acquisto/vendita (vendita al 80%)

### ⚙️ **Admin Panel** (Password Protetto)
- **Password**: `admin2024`
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

## 🔧 **Configurazione WebStorm**

### **Scripts NPM**
Aggiungi in WebStorm → Run/Debug Configurations:
- **Start**: `npm start` (produzione)
- **Dev**: `npm run dev` (sviluppo con auto-restart)

### **Debugging**
1. Imposta breakpoints in WebStorm
2. Avvia con `npm run dev`
3. Attach debugger su porta 3000

## 📁 **Struttura Database**

### **Tabelle**
- **users**: Associati con crediti e punti totali
- **players**: Giocatori disponibili/acquistati
- **events**: Storico eventi e punteggi

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
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🛠️ **Sviluppo**

### **API Endpoints**
- `GET /api/users` - Lista associati
- `GET /api/players` - Lista giocatori
- `GET /api/ranking` - Classifica
- `POST /api/buy-player` - Acquista giocatore
- `POST /api/sell-player` - Vendi giocatore
- `POST /api/update-score` - Aggiorna punteggi
- `POST /api/reset` - Reset sistema

### **Aggiungere nuove funzionalità**
1. Modifica `server/server.js` per nuove API
2. Aggiorna `public/script.js` per il frontend
3. Modifica `server/database.js` per nuove tabelle

## 📱 **Mobile**
L'app è completamente responsive e funziona su tutti i dispositivi.

## 🔐 **Sicurezza e Password**

### **Password Predefinite**
- **Mercato**: `ateam2024` (associati del club)
- **Admin**: `admin2024` (amministratori)

### **Cambiare le Password**
Modifica il file `server/server.js`:
```javascript
const PASSWORDS = {
    MARKET: 'tua_password_mercato',     // Password mercato
    ADMIN: 'tua_password_admin'         // Password admin
};
```

### **Livelli di Accesso**
1. **Pubblico** (senza password):
    - ✅ Visualizzazione classifica
    - ✅ Visualizzazione squadre formate

2. **Associati** (password mercato):
    - ✅ Accesso al mercato
    - ✅ Acquisto/vendita giocatori
    - ✅ Gestione della propria squadra

3. **Admin** (password admin):
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
Per problemi o miglioramenti, contatta l'admin del club A-Team!

---
*Buona fortuna con il Fanta Softair A-Team! 🎯*

## 🎯 **Quick Start Commands**

```bash
# Setup completo in un comando
git clone [your-repo] fanta-softair-ateam && cd fanta-softair-ateam && npm install && npm run dev
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
- [ ] **Redis Cache**: Per performance migliori
- [ ] **WebSocket**: Aggiornamenti in tempo reale
- [ ] **API Rate Limiting**: Protezione da abusi
- [ ] **Backup Automatico**: Salvataggi programmati
- [ ] **Monitoring**: Log e metriche sistema
- [ ] **Docker Compose**: Deploy semplificato

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

### **Aggiungere Logo Club**
In `public/index.html`:
```html
<div class="header">
    <img src="logo-ateam.png" alt="A-Team Logo" class="logo">
    <h1>🎯 Fanta Softair A-Team</h1>
</div>
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
  "name": "Fanta Softair A-Team",
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

Hai ora un sistema completo per il Fanta Softair del club A-Team! Il sistema è:

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

**Buona fortuna con il Fanta Softair A-Team! 🎯🏆**

*"Il gioco è più bello quando tutti partecipano!"* - A-Team Club
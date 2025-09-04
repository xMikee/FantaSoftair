# 🔧 GUIDA AMMINISTRATORE - FANTA SOFTAIR A-TEAM

## Panoramica

Il sistema FantaSoftair A-Team è una piattaforma fantasy football adattata al gioco del softair. Come amministratore, hai il controllo completo del sistema per gestire eventi, giocatori, punteggi e squadre.

## 🔐 Accesso Admin

1. Accedi al pannello admin con la password amministratore
2. L'interfaccia admin si trova all'indirizzo `/admin`
3. La password viene richiesta automaticamente all'accesso

## 📅 GESTIONE EVENTI

### Creazione di Nuovi Eventi
1. **Nome Evento**: Inserisci un nome descrittivo (es: "Battaglia di Primavera 2025")
2. **Data e Ora**: Seleziona quando si svolgerà l'evento
3. **Descrizione**: Aggiungi dettagli opzionali sull'evento
4. Clicca "Crea Evento" per salvare

### Modifica Eventi Esistenti
- Visualizza tutti gli eventi nella sezione "Eventi Esistenti"
- Modifica nome, data, descrizione o stato attivo
- Elimina eventi se necessario

## 🛒 GESTIONE MERCATO

### Assegnazione Giocatori alle Squadre
1. **Seleziona Squadra**: Scegli quale squadra gestire dal dropdown
2. **Visualizza Crediti**: Ogni squadra ha un budget di 80 crediti iniziali
3. **Giocatori Disponibili**: Vedi tutti i giocatori non ancora assegnati
4. **Acquista Giocatori**: Clicca su un giocatore per aggiungerlo alla squadra
5. **Vendi Giocatori**: Rimuovi giocatori dalla squadra per liberare crediti

### Limitazioni del Mercato
- Ogni squadra può avere massimo 11 giocatori
- Ogni giocatore ha un valore in crediti
- Il sistema controlla automaticamente i crediti disponibili

## 🎯 GESTIONE PUNTEGGI

### Sistema Unificato Eventi-Punteggi
**IMPORTANTE**: Tutti i punteggi DEVONO essere collegati a un evento specifico per garantire l'integrità storica.

### Assegnazione Punteggi
1. **Seleziona Evento**: Obbligatorio - scegli l'evento di riferimento
2. **Seleziona Giocatore**: Scegli il giocatore da premiare/penalizzare
3. **Tipo Evento**: Usa il menu predefinito con i valori standard:

#### Punteggi Positivi
- **+7**: Cornetti senza lattosio
- **+6**: Cornetti + salmone  
- **+5**: Cornetti sul campo, Cassa peroni fresca, Presenze cumulative, Crea scenografia
- **+4**: Presente all'evento
- **+3**: Crea obiettivo speciale, Aiuto manovalanza, Silent kill
- **+2**: In anticipo organizzazione, Trova equipaggiamento, Convocazione evento
- **+1**: Kill in pistola (per ogni kill), Kill a 1 colpo

#### Punteggi Negativi (Malus)
- **-6**: Consiglio disciplinare
- **-5**: Bidona domenica, Sporca il bosco
- **-3**: Perde equipaggiamento, Assenza radio/scarica
- **-2**: Non mangia carne in compagnia, Assente domenica con avviso, Sgrana/non funziona fucile, Non offre dopo compleanno, Non mette presenza, Batteria scarica, Sgamare
- **-1**: Ritardo/uscita anticipata, Senza pallini sul campo, Patch alta visibilità

4. **Punti Personalizzati**: Se necessario, inserisci un valore diverso da quello predefinito
5. **Descrizione**: Aggiungi dettagli specifici sull'evento
6. Clicca "Aggiorna Punteggio"

## 🏁 CHIUSURA GIORNATE/EVENTI

### Sistema Fantasy Football
Il sistema funziona come un fantasy football tradizionale:

1. **Durante l'Evento**: I punteggi si accumulano in "currentPoints"
2. **Chiusura Giornata**: 
   - Seleziona l'evento/giornata da chiudere
   - I punti vengono trasferiti dallo storico giornaliero a quello annuale ("yearlyPoints")
   - I "currentPoints" vengono azzerati per il prossimo evento
   - L'evento viene marcato come "chiuso"

### Procedura di Chiusura
1. Vai alla sezione "Chiusura Giornata"
2. Seleziona l'evento da chiudere dal dropdown
3. Clicca "Chiudi Giornata Selezionata"
4. Il sistema automaticamente trasferisce tutti i punteggi

## 📊 CLASSIFICHE E STATISTICHE

### Tipologie di Classifica
1. **Classifica Tempo Reale**: Basata sui "currentPoints" dell'evento in corso
2. **Classifica Annuale**: Basata sui "yearlyPoints" accumulati negli eventi chiusi
3. **Migliori/Peggiori Giocatori**: Ranking individuale dei giocatori per performance

### Visualizzazione Dati
- **Storico Eventi**: Visualizza tutti gli eventi passati con i relativi punteggi
- **Storico Utente**: Vedi la cronologia completa dei punteggi di ogni giocatore

## ⚙️ FUNZIONI DI SISTEMA

### Reset Sistema
**ATTENZIONE**: Operazioni irreversibili!

1. **Reset Mercato**: Rimuove tutte le assegnazioni giocatori-squadre, ripristina crediti a 1000
2. **Reset Punteggi**: Azzera tutti i punteggi (currentPoints e yearlyPoints)
3. **Reset Completo**: Combina entrambe le operazioni precedenti

### Gestione Password
- **Visualizza Password**: Mostra le password di accesso di tutti gli utenti/squadre
- Utile per aiutare i giocatori che hanno dimenticato le credenziali

## 🔍 MONITORAGGIO E CONTROLLO

### Verifiche da Fare Regolarmente
1. **Prima di ogni evento**:
   - Controlla che tutti abbiano selezionato la formazione (max 8 giocatori schierati)
   - Verifica che l'evento sia creato e attivo nel sistema

2. **Durante l'evento**:
   - Assegna punteggi in tempo reale
   - Assicurati che ogni punteggio sia collegato all'evento corretto

3. **Dopo l'evento**:
   - Completa l'assegnazione di tutti i punteggi
   - Chiudi l'evento per trasferire i punti allo storico annuale
   - Verifica che le classifiche siano corrette

### Risoluzione Problemi Comuni
- **Giocatore non trova la password**: Usa "Mostra Tutte le Password"
- **Punteggio errato**: I punteggi possono essere corretti assegnando nuovi punti (positivi o negativi)
- **Squadra fuori budget**: Usa la gestione mercato per vendere giocatori
- **Evento non chiuso**: Verifica di aver selezionato l'evento corretto nella chiusura giornata

## 🚨 IMPORTANTE

### Regole Fondamentali
1. **Mai assegnare punteggi senza evento**: Il sistema richiede sempre un evento di riferimento
2. **Chiudere sempre gli eventi**: Necessario per il corretto calcolo delle classifiche storiche
3. **Backup regolari**: Anche se non gestiti dall'interfaccia admin, sono fondamentali
4. **Controllo formazioni**: Massimo 8 giocatori schierati per squadra

### Flusso Operativo Consigliato
1. Crea l'evento prima della giornata di gioco
2. I giocatori selezionano le formazioni
3. Durante il gioco, assegna punteggi collegati all'evento
4. A fine giornata, chiudi l'evento per consolidare i punteggi
5. Verifica le classifiche aggiornate

Questa guida copre tutte le funzionalità principali del sistema. Per qualsiasi dubbio o problema tecnico, consulta i log di sistema o contatta il supporto tecnico.
# Notes Chat

Una semplice applicazione Vue 3 + Vite con autenticazione Google per gestire delle Notes.

## Funzionalità

- Pagina Notes accessibile solo agli utenti autenticati
- Login con Google tramite Google Identity Services
- Sistema di routing con guardie di autenticazione
- Persistenza della sessione tramite localStorage
- Logout per disconnettere l'utente

## Struttura del progetto

```
├─ src
│  ├─ main.js          # Bootstrap dell'applicazione
│  ├─ App.vue          # Componente root con router-view
│  ├─ style.css        # CSS globale semplificato
│  ├─ router/
│  │  └─ index.js      # Configurazione Vue Router con guardie auth
│  ├─ store/
│  │  └─ auth.js       # Store autenticazione con localStorage
│  ├─ components/
│     ├─ EmojiPicker.vue # Componente per gestire gli emoji
│  └─ views/
│     ├─ Login.vue     # Pagina di login con Google
│     └─ Home.vue      # Pagina Hello World con logout
├─ public/
│  └─ index.html       # HTML con script Google Identity Services
├─ package.json
└─ vite.config.js
```

## Configurazione

### Google OAuth

Per far funzionare il login Google, devi configurare un'app OAuth 2.0 su Google Cloud Console:

1. Vai a https://console.cloud.google.com/apis/credentials
2. Crea un nuovo progetto o seleziona uno esistente
3. Clicca su "Crea credenziali" > "ID client OAuth 2.0"
4. Configura la schermata di consenso OAuth (puoi usare "Esterno" per test)
5. Aggiungi i domini autorizzati:
   - Per sviluppo: `http://localhost:8080`
   - Per produzione: il tuo dominio (es. `https://tuo-sito.com`)
6. Copia il "ID client" generato
7. Incolla il Client ID in `src/views/Login.vue` al posto di `YOUR_GOOGLE_CLIENT_ID`

## Comandi

```bash
# Avvia il server di sviluppo
npm run dev

# Build per produzione
npm run build

# Anteprima della build
npm run preview
```

## Funzionamento

- `/` - Redirect intelligente:
  - Se l'utente è loggato → `/home`
  - Se l'utente non è loggato → `/login`
- `/login` - Pagina di login con Google
- `/` - Pagina principale (protetta, richiede autenticazione)

## Stack tecnologico

- **Vue 3.5** - Framework JavaScript reattivo
- **Vite 7** - Build tool e dev server
- **Vue Router 5** - Routing client-side
- **Google Identity Services** - Autenticazione OAuth 2.0
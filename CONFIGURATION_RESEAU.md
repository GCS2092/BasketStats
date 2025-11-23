# Configuration pour accès réseau local

Ce guide explique comment configurer BasketStats pour y accéder depuis un autre appareil sur le même réseau.

## Problème
Lorsque vous essayez d'accéder à l'application depuis un autre appareil sur le même réseau, vous obtenez des erreurs CORS ou `ERR_CONNECTION_TIMED_OUT`.

## Solution rapide

**Option 1 : Script automatique (recommandé)**
```powershell
.\DEMARRER_RESEAU.ps1
```

Ce script configure automatiquement :
- ✅ Détection de l'IP réseau
- ✅ Configuration du pare-feu Windows
- ✅ Création du fichier `.env.local` du frontend
- ✅ Démarrage des serveurs (optionnel)

**Option 2 : Configuration manuelle**

### 1. Trouver l'IP de votre machine

**Windows:**
```powershell
ipconfig
```
Cherchez l'adresse IPv4 de votre carte réseau (généralement `192.168.x.x` ou `10.x.x.x`)

**Linux/Mac:**
```bash
ifconfig
# ou
ip addr show
```

### 2. Configurer le Frontend

Créez un fichier `.env.local` dans le dossier `frontend/` avec le contenu suivant :

```env
# Remplacez 192.168.1.118 par l'IP de votre machine
NEXT_PUBLIC_API_URL=http://192.168.1.118:3001/api
NEXT_PUBLIC_WS_URL=http://192.168.1.118:3001

# NextAuth
NEXTAUTH_URL=http://192.168.1.118:3000
NEXTAUTH_SECRET=votre_nextauth_secret_changez_moi
```

**Important:** Redémarrez le serveur frontend après avoir créé/modifié ce fichier.

### 3. Vérifier que les serveurs écoutent sur toutes les interfaces

Le backend et le frontend sont déjà configurés pour écouter sur `0.0.0.0`, ce qui permet l'accès depuis le réseau local.

### 4. Démarrer les serveurs

**Backend:**
```bash
cd backend
npm run start:dev
```

Le backend affichera automatiquement l'IP réseau détectée dans la console.

**Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Accéder depuis un autre appareil

Sur un autre appareil connecté au même réseau WiFi :

1. Ouvrez un navigateur
2. Accédez à : `http://VOTRE_IP:3000`
   - Exemple : `http://192.168.1.118:3000`

### 6. Vérification

- ✅ Le backend doit afficher l'IP réseau dans la console
- ✅ Le frontend doit être accessible depuis l'IP réseau
- ✅ Les requêtes API doivent fonctionner sans erreur CORS

## Dépannage

### Erreur CORS persistante

1. Vérifiez que l'IP dans `.env.local` correspond à l'IP affichée par le backend
2. Vérifiez que les deux appareils sont sur le même réseau WiFi
3. Vérifiez que le pare-feu Windows n'bloque pas les ports 3000 et 3001

### Pare-feu Windows

Si le pare-feu bloque les connexions :

```powershell
# Autoriser le port 3000 (Frontend)
New-NetFirewallRule -DisplayName "BasketStats Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# Autoriser le port 3001 (Backend)
New-NetFirewallRule -DisplayName "BasketStats Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

### IP change à chaque connexion

Si votre IP change fréquemment, vous pouvez :
1. Configurer une IP statique sur votre machine
2. Utiliser un service comme ngrok pour un accès externe (non recommandé pour la production)

### Erreur ERR_CONNECTION_TIMED_OUT

Si vous obtenez cette erreur :

1. **Vérifier que le backend est démarré**
   - Le backend doit afficher l'IP réseau dans la console
   - Si ce n'est pas le cas, redémarrez-le

2. **Vérifier le pare-feu**
   ```powershell
   # Vérifier les règles
   Get-NetFirewallRule -DisplayName "BasketStats*"
   
   # Si elles n'existent pas, les créer
   New-NetFirewallRule -DisplayName "BasketStats Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "BasketStats Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
   ```

3. **Vérifier que les ports écoutent**
   ```powershell
   Get-NetTCPConnection -LocalPort 3000,3001 | Select-Object LocalAddress, LocalPort, State
   ```
   Vous devriez voir `State: Listen` et `LocalAddress: 0.0.0.0` ou votre IP réseau

4. **Tester la connexion**
   ```powershell
   Test-NetConnection -ComputerName 192.168.1.118 -Port 3001
   ```
   Remplacez `192.168.1.118` par votre IP

### Commandes utiles

```powershell
# Trouver votre IP
ipconfig | Select-String "IPv4"

# Vérifier la connectivité
.\VERIFIER_CONNEXION_RESEAU.ps1

# Voir les processus qui utilisent les ports
Get-NetTCPConnection -LocalPort 3000,3001 | Select-Object OwningProcess | ForEach-Object { Get-Process -Id $_.OwningProcess }
```


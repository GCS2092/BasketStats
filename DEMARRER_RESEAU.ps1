# Script PowerShell pour démarrer BasketStats avec support réseau
Write-Host "🚀 Démarrage de BasketStats avec support réseau local" -ForegroundColor Cyan
Write-Host ""

# 1. Détecter l'IP réseau
Write-Host "1️⃣ Détection de l'IP réseau..." -ForegroundColor Yellow
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" 
} | Select-Object -First 1).IPAddress

if (-not $ipAddress) {
    Write-Host "   ❌ Impossible de détecter l'IP réseau" -ForegroundColor Red
    exit 1
}

Write-Host "   ✅ IP détectée: $ipAddress" -ForegroundColor Green
Write-Host ""

# 2. Vérifier/Créer les règles de pare-feu
Write-Host "2️⃣ Configuration du pare-feu..." -ForegroundColor Yellow
$firewallRule3000 = Get-NetFirewallRule -DisplayName "BasketStats Frontend" -ErrorAction SilentlyContinue
$firewallRule3001 = Get-NetFirewallRule -DisplayName "BasketStats Backend" -ErrorAction SilentlyContinue

if (-not $firewallRule3000) {
    Write-Host "   ➕ Création règle pare-feu Frontend (port 3000)..." -ForegroundColor Cyan
    New-NetFirewallRule -DisplayName "BasketStats Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null
    Write-Host "   ✅ Règle créée" -ForegroundColor Green
} else {
    Write-Host "   ✅ Règle pare-feu Frontend existe déjà" -ForegroundColor Green
}

if (-not $firewallRule3001) {
    Write-Host "   ➕ Création règle pare-feu Backend (port 3001)..." -ForegroundColor Cyan
    New-NetFirewallRule -DisplayName "BasketStats Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null
    Write-Host "   ✅ Règle créée" -ForegroundColor Green
} else {
    Write-Host "   ✅ Règle pare-feu Backend existe déjà" -ForegroundColor Green
}
Write-Host ""

# 3. Vérifier que les ports ne sont pas déjà utilisés
Write-Host "3️⃣ Vérification des ports..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue

if ($port3000) {
    Write-Host "   ⚠️  Port 3000 déjà utilisé" -ForegroundColor Yellow
    Write-Host "      → Arrêtez le processus qui utilise ce port ou changez le port" -ForegroundColor Yellow
}

if ($port3001) {
    Write-Host "   ⚠️  Port 3001 déjà utilisé" -ForegroundColor Yellow
    Write-Host "      → Arrêtez le processus qui utilise ce port ou changez le port" -ForegroundColor Yellow
}

if (-not $port3000 -and -not $port3001) {
    Write-Host "   ✅ Ports 3000 et 3001 disponibles" -ForegroundColor Green
}
Write-Host ""

# 4. Vérifier/Créer le fichier .env.local du frontend
Write-Host "4️⃣ Configuration du frontend..." -ForegroundColor Yellow
$frontendEnvPath = "frontend\.env.local"
$frontendEnvContent = @"
# Configuration réseau - IP: $ipAddress
NEXT_PUBLIC_API_URL=http://$ipAddress:3001/api
NEXT_PUBLIC_WS_URL=http://$ipAddress:3001
NEXTAUTH_URL=http://$ipAddress:3000
NEXTAUTH_SECRET=changez_moi_en_production_$(Get-Random -Minimum 1000 -Maximum 9999)
"@

if (Test-Path $frontendEnvPath) {
    Write-Host "   ⚠️  Fichier .env.local existe déjà" -ForegroundColor Yellow
    $existingContent = Get-Content $frontendEnvPath -Raw
    if ($existingContent -notmatch $ipAddress) {
        Write-Host "   ➕ Mise à jour avec l'IP réseau..." -ForegroundColor Cyan
        Set-Content -Path $frontendEnvPath -Value $frontendEnvContent
        Write-Host "   ✅ Fichier mis à jour" -ForegroundColor Green
    } else {
        Write-Host "   ✅ Configuration déjà correcte" -ForegroundColor Green
    }
} else {
    Write-Host "   ➕ Création du fichier .env.local..." -ForegroundColor Cyan
    Set-Content -Path $frontendEnvPath -Value $frontendEnvContent
    Write-Host "   ✅ Fichier créé" -ForegroundColor Green
}
Write-Host ""

# 5. Afficher les informations de connexion
Write-Host "📋 Informations de connexion:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   IP réseau: $ipAddress" -ForegroundColor White
Write-Host "   Frontend:  http://$ipAddress:3000" -ForegroundColor Green
Write-Host "   Backend:   http://$ipAddress:3001" -ForegroundColor Green
Write-Host ""
Write-Host "   Pour accéder depuis un autre appareil:" -ForegroundColor Yellow
Write-Host "   1. Connectez-vous au même réseau WiFi" -ForegroundColor White
Write-Host "   2. Ouvrez: http://$ipAddress:3000" -ForegroundColor White
Write-Host ""

# 6. Demander si on veut démarrer les serveurs
Write-Host "❓ Voulez-vous démarrer les serveurs maintenant? (O/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "O" -or $response -eq "o" -or $response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "🚀 Démarrage des serveurs..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Pour arrêter: Ctrl+C dans chaque terminal" -ForegroundColor Yellow
    Write-Host ""
    
    # Démarrer le backend dans un nouveau terminal
    Write-Host "   📦 Démarrage du backend..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host '🚀 Backend BasketStats' -ForegroundColor Cyan; npm run start:dev"
    Start-Sleep -Seconds 3
    
    # Démarrer le frontend dans un nouveau terminal
    Write-Host "   🎨 Démarrage du frontend..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host '🎨 Frontend BasketStats' -ForegroundColor Cyan; npm run dev"
    
    Write-Host ""
    Write-Host "✅ Serveurs démarrés dans des fenêtres séparées" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Attendez quelques secondes que les serveurs démarrent..." -ForegroundColor Yellow
    Write-Host "   Puis testez: http://$ipAddress:3000" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "ℹ️  Pour démarrer manuellement:" -ForegroundColor Cyan
    Write-Host "   Backend:  cd backend && npm run start:dev" -ForegroundColor White
    Write-Host "   Frontend: cd frontend && npm run dev" -ForegroundColor White
}

Write-Host ""


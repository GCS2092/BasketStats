# Script PowerShell pour vérifier la connectivité réseau
Write-Host "🔍 Vérification de la connectivité réseau pour BasketStats" -ForegroundColor Cyan
Write-Host ""

# 1. Obtenir l'IP locale
Write-Host "1️⃣ Détection de l'IP réseau locale..." -ForegroundColor Yellow
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" 
} | Select-Object -First 1).IPAddress

if ($ipAddress) {
    Write-Host "   ✅ IP détectée: $ipAddress" -ForegroundColor Green
} else {
    Write-Host "   ❌ Impossible de détecter l'IP réseau" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Vérifier que le backend écoute sur le port 3001
Write-Host "2️⃣ Vérification du backend (port 3001)..." -ForegroundColor Yellow
$backendLocal = Test-NetConnection -ComputerName localhost -Port 3001 -WarningAction SilentlyContinue
$backendNetwork = Test-NetConnection -ComputerName $ipAddress -Port 3001 -WarningAction SilentlyContinue

if ($backendLocal.TcpTestSucceeded) {
    Write-Host "   ✅ Backend accessible sur localhost:3001" -ForegroundColor Green
} else {
    Write-Host "   ❌ Backend NON accessible sur localhost:3001" -ForegroundColor Red
    Write-Host "      → Assurez-vous que le backend est démarré" -ForegroundColor Yellow
}

if ($backendNetwork.TcpTestSucceeded) {
    Write-Host "   ✅ Backend accessible sur $ipAddress:3001" -ForegroundColor Green
} else {
    Write-Host "   ❌ Backend NON accessible sur $ipAddress:3001" -ForegroundColor Red
    Write-Host "      → Vérifiez le pare-feu Windows" -ForegroundColor Yellow
}

Write-Host ""

# 3. Vérifier que le frontend écoute sur le port 3000
Write-Host "3️⃣ Vérification du frontend (port 3000)..." -ForegroundColor Yellow
$frontendLocal = Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue
$frontendNetwork = Test-NetConnection -ComputerName $ipAddress -Port 3000 -WarningAction SilentlyContinue

if ($frontendLocal.TcpTestSucceeded) {
    Write-Host "   ✅ Frontend accessible sur localhost:3000" -ForegroundColor Green
} else {
    Write-Host "   ❌ Frontend NON accessible sur localhost:3000" -ForegroundColor Red
    Write-Host "      → Assurez-vous que le frontend est démarré" -ForegroundColor Yellow
}

if ($frontendNetwork.TcpTestSucceeded) {
    Write-Host "   ✅ Frontend accessible sur $ipAddress:3000" -ForegroundColor Green
} else {
    Write-Host "   ❌ Frontend NON accessible sur $ipAddress:3000" -ForegroundColor Red
    Write-Host "      → Vérifiez le pare-feu Windows" -ForegroundColor Yellow
}

Write-Host ""

# 4. Vérifier les règles de pare-feu
Write-Host "4️⃣ Vérification des règles de pare-feu..." -ForegroundColor Yellow
$firewallRule3000 = Get-NetFirewallRule -DisplayName "BasketStats Frontend" -ErrorAction SilentlyContinue
$firewallRule3001 = Get-NetFirewallRule -DisplayName "BasketStats Backend" -ErrorAction SilentlyContinue

if ($firewallRule3000) {
    Write-Host "   ✅ Règle pare-feu Frontend (port 3000) trouvée" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Règle pare-feu Frontend (port 3000) non trouvée" -ForegroundColor Yellow
    Write-Host "      → Création de la règle..." -ForegroundColor Cyan
    New-NetFirewallRule -DisplayName "BasketStats Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null
    Write-Host "      ✅ Règle créée" -ForegroundColor Green
}

if ($firewallRule3001) {
    Write-Host "   ✅ Règle pare-feu Backend (port 3001) trouvée" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Règle pare-feu Backend (port 3001) non trouvée" -ForegroundColor Yellow
    Write-Host "      → Création de la règle..." -ForegroundColor Cyan
    New-NetFirewallRule -DisplayName "BasketStats Backend" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null
    Write-Host "      ✅ Règle créée" -ForegroundColor Green
}

Write-Host ""

# 5. Résumé et instructions
Write-Host "📋 Résumé et instructions:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   IP réseau: $ipAddress" -ForegroundColor White
Write-Host "   Frontend:  http://$ipAddress:3000" -ForegroundColor White
Write-Host "   Backend:   http://$ipAddress:3001" -ForegroundColor White
Write-Host ""
Write-Host "   Pour accéder depuis un autre appareil:" -ForegroundColor Yellow
Write-Host "   1. Connectez-vous au même réseau WiFi" -ForegroundColor White
Write-Host "   2. Ouvrez: http://$ipAddress:3000" -ForegroundColor White
Write-Host ""
Write-Host "   Configuration frontend (.env.local):" -ForegroundColor Yellow
Write-Host "   NEXT_PUBLIC_API_URL=http://$ipAddress:3001/api" -ForegroundColor White
Write-Host "   NEXT_PUBLIC_WS_URL=http://$ipAddress:3001" -ForegroundColor White
Write-Host "   NEXTAUTH_URL=http://$ipAddress:3000" -ForegroundColor White
Write-Host ""


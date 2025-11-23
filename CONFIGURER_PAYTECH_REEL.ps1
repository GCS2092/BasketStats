# Script pour configurer PayTech avec de vraies cles
# Ce script vous guide pour obtenir et configurer vos cles PayTech

Write-Host "Configuration PayTech avec de vraies cles..." -ForegroundColor Green
Write-Host ""

# 1. Instructions pour obtenir les cles
Write-Host "ETAPE 1: Obtenir vos cles PayTech" -ForegroundColor Yellow
Write-Host "1. Allez sur https://paytech.sn" -ForegroundColor White
Write-Host "2. Creer un compte vendeur" -ForegroundColor White
Write-Host "3. Obtenir vos cles API (API_KEY et API_SECRET)" -ForegroundColor White
Write-Host "4. Notez-les quelque part" -ForegroundColor White
Write-Host ""

# 2. Demander les cles a l'utilisateur
Write-Host "ETAPE 2: Saisir vos cles PayTech" -ForegroundColor Yellow
$apiKey = Read-Host "Entrez votre API_KEY PayTech"
$apiSecret = Read-Host "Entrez votre API_SECRET PayTech"

if ([string]::IsNullOrEmpty($apiKey) -or [string]::IsNullOrEmpty($apiSecret)) {
    Write-Host "Erreur: Les cles ne peuvent pas etre vides" -ForegroundColor Red
    exit 1
}

# 3. Demarrer ngrok pour obtenir l'URL
Write-Host ""
Write-Host "ETAPE 3: Demarrage de ngrok..." -ForegroundColor Yellow

# Verifier si ngrok est deja en cours
try {
    $ngrokResponse = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get -ErrorAction Stop
    $ngrokUrl = $ngrokResponse.tunnels[0].public_url
    Write-Host "Ngrok deja actif: $ngrokUrl" -ForegroundColor Green
} catch {
    Write-Host "Demarrage de ngrok..." -ForegroundColor Yellow
    $ngrokProcess = Start-Process -FilePath "ngrok" -ArgumentList "http", "3001" -PassThru -WindowStyle Hidden
    Start-Sleep -Seconds 5
    
    try {
        $ngrokResponse = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get
        $ngrokUrl = $ngrokResponse.tunnels[0].public_url
        Write-Host "Ngrok demarre: $ngrokUrl" -ForegroundColor Green
    } catch {
        Write-Host "Erreur: Impossible de demarrer ngrok" -ForegroundColor Red
        exit 1
    }
}

# 4. Mettre a jour le fichier .env
Write-Host ""
Write-Host "ETAPE 4: Mise a jour de la configuration..." -ForegroundColor Yellow

$envPath = "backend\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    # Configuration PayTech reelle
    $paytechConfig = @{
        'PAYTECH_API_KEY' = $apiKey
        'PAYTECH_API_SECRET' = $apiSecret
        'PAYTECH_ENV' = 'prod'
        'PAYTECH_BASE_URL' = 'https://paytech.sn/api'
        'PAYTECH_IPN_URL' = "$ngrokUrl/api/paytech/ipn"
        'PAYTECH_SUCCESS_URL' = "$ngrokUrl/api/paytech/success"
        'PAYTECH_CANCEL_URL' = "$ngrokUrl/api/paytech/cancel"
        'SKIP_PAYTECH' = 'false'
    }
    
    # Mettre a jour chaque variable
    foreach ($varName in $paytechConfig.Keys) {
        $newValue = $paytechConfig[$varName]
        $pattern = "^$varName=.*$"
        
        if ($envContent -match $pattern) {
            $envContent = $envContent -replace $pattern, "$varName=`"$newValue`""
            Write-Host "$varName mis a jour" -ForegroundColor Green
        } else {
            $envContent += "`n$varName=`"$newValue`""
            Write-Host "$varName ajoute" -ForegroundColor Green
        }
    }
    
    # Ajouter l'URL ngrok pour reference
    $ngrokPattern = "^NGROK_URL=.*$"
    if ($envContent -match $ngrokPattern) {
        $envContent = $envContent -replace $ngrokPattern, "NGROK_URL=`"$ngrokUrl`""
    } else {
        $envContent += "`nNGROK_URL=`"$ngrokUrl`""
    }
    
    # Ecrire le fichier .env mis a jour
    Set-Content -Path $envPath -Value $envContent
    Write-Host "Configuration PayTech mise a jour avec succes!" -ForegroundColor Green
} else {
    Write-Host "Erreur: Fichier .env non trouve" -ForegroundColor Red
    exit 1
}

# 5. Afficher la configuration
Write-Host ""
Write-Host "CONFIGURATION PAYTECH:" -ForegroundColor Cyan
Write-Host "API_KEY: $($apiKey.Substring(0, 10))..." -ForegroundColor White
Write-Host "API_SECRET: $($apiSecret.Substring(0, 10))..." -ForegroundColor White
Write-Host "ENV: prod" -ForegroundColor White
Write-Host "IPN_URL: $ngrokUrl/api/paytech/ipn" -ForegroundColor White
Write-Host "SUCCESS_URL: $ngrokUrl/api/paytech/success" -ForegroundColor White
Write-Host "CANCEL_URL: $ngrokUrl/api/paytech/cancel" -ForegroundColor White
Write-Host ""

# 6. Demarrer le backend
Write-Host "ETAPE 5: Demarrage du backend..." -ForegroundColor Yellow
Set-Location backend

Write-Host "Lancement du backend avec PayTech reel..." -ForegroundColor Green
Write-Host "Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Ngrok: $ngrokUrl" -ForegroundColor Cyan
Write-Host "Frontend: http://192.168.1.118:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour arreter: Ctrl+C" -ForegroundColor Red
Write-Host ""

# Lancer le backend
npm run start:dev

# Nettoyage a la fermeture
Write-Host ""
Write-Host "Arret en cours..." -ForegroundColor Yellow
if ($ngrokProcess -and !$ngrokProcess.HasExited) {
    $ngrokProcess.Kill()
    Write-Host "Ngrok arrete" -ForegroundColor Green
}
Write-Host "Arret termine" -ForegroundColor Green

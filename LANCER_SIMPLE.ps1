# Script de Demarrage Simple avec Ngrok
# Version sans caracteres speciaux

Write-Host "Demarrage automatique avec ngrok..." -ForegroundColor Green
Write-Host ""

# 1. Verifier ngrok
Write-Host "Verification de ngrok..." -ForegroundColor Yellow
try {
    $ngrokVersion = ngrok version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Ngrok trouve: $ngrokVersion" -ForegroundColor Green
    } else {
        Write-Host "Ngrok non trouve. Installation necessaire." -ForegroundColor Red
        Write-Host "Telechargez ngrok depuis https://ngrok.com/download" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "Erreur lors de la verification de ngrok" -ForegroundColor Red
    exit 1
}

# 2. Demarrer ngrok
Write-Host ""
Write-Host "Demarrage de ngrok..." -ForegroundColor Yellow
$ngrokProcess = Start-Process -FilePath "ngrok" -ArgumentList "http", "3001" -PassThru -WindowStyle Hidden

# Attendre que ngrok demarre
Start-Sleep -Seconds 3

# 3. Recuperer l'URL ngrok
Write-Host "Recuperation de l'URL ngrok..." -ForegroundColor Yellow
try {
    $ngrokResponse = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get
    $ngrokUrl = $ngrokResponse.tunnels[0].public_url
    
    if ($ngrokUrl) {
        Write-Host "URL ngrok trouvee: $ngrokUrl" -ForegroundColor Green
    } else {
        Write-Host "Impossible de recuperer l'URL ngrok" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Erreur lors de la recuperation de l'URL ngrok" -ForegroundColor Red
    Write-Host "Verifiez que ngrok est accessible sur http://localhost:4040" -ForegroundColor Yellow
    exit 1
}

# 4. Mettre a jour les URLs dans .env
Write-Host ""
Write-Host "Mise a jour des URLs dans .env..." -ForegroundColor Yellow

$envPath = "backend\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    # URLs a mettre a jour
    $ngrokUrls = @{
        'PAYTECH_IPN_URL' = "$ngrokUrl/api/paytech/ipn"
        'PAYTECH_SUCCESS_URL' = "$ngrokUrl/api/paytech/success"
        'PAYTECH_CANCEL_URL' = "$ngrokUrl/api/paytech/cancel"
    }
    
    # Mettre a jour chaque URL
    foreach ($varName in $ngrokUrls.Keys) {
        $newValue = $ngrokUrls[$varName]
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
    Write-Host "Fichier .env mis a jour" -ForegroundColor Green
} else {
    Write-Host "Fichier .env non trouve" -ForegroundColor Red
    exit 1
}

# 5. Demarrer le backend
Write-Host ""
Write-Host "Demarrage du backend..." -ForegroundColor Yellow
Set-Location backend

# Verifier que npm est disponible
try {
    $npmVersion = npm --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "NPM trouve: $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "NPM non trouve" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Erreur lors de la verification de NPM" -ForegroundColor Red
    exit 1
}

# Demarrer le backend
Write-Host "Lancement du backend..." -ForegroundColor Green
Write-Host "Backend accessible sur: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Ngrok accessible sur: $ngrokUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration PayTech:" -ForegroundColor Yellow
Write-Host "   - IPN URL: $ngrokUrl/api/paytech/ipn" -ForegroundColor White
Write-Host "   - Success URL: $ngrokUrl/api/paytech/success" -ForegroundColor White
Write-Host "   - Cancel URL: $ngrokUrl/api/paytech/cancel" -ForegroundColor White
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

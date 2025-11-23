@echo off
echo ========================================
echo   Demarrage BasketStats - Backend + Frontend
echo ========================================
echo.

REM Détecter l'IP réseau
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%
echo IP reseau detectee: %IP%
echo.

REM Créer les règles de pare-feu si elles n'existent pas
echo Configuration du pare-feu...
powershell -Command "if (-not (Get-NetFirewallRule -DisplayName 'BasketStats Frontend' -ErrorAction SilentlyContinue)) { New-NetFirewallRule -DisplayName 'BasketStats Frontend' -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow | Out-Null; Write-Host 'Regle pare-feu Frontend creee' } else { Write-Host 'Regle pare-feu Frontend existe deja' }"
powershell -Command "if (-not (Get-NetFirewallRule -DisplayName 'BasketStats Backend' -ErrorAction SilentlyContinue)) { New-NetFirewallRule -DisplayName 'BasketStats Backend' -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow | Out-Null; Write-Host 'Regle pare-feu Backend creee' } else { Write-Host 'Regle pare-feu Backend existe deja' }"
echo.

REM Vérifier/Créer le fichier .env.local
echo Configuration du frontend...
if not exist "frontend\.env.local" (
    echo Creation du fichier .env.local...
    (
        echo # Configuration reseau - IP: %IP%
        echo NEXT_PUBLIC_API_URL=http://%IP%:3001/api
        echo NEXT_PUBLIC_WS_URL=http://%IP%:3001
        echo NEXTAUTH_URL=http://%IP%:3000
        echo NEXTAUTH_SECRET=changez_moi_en_production
    ) > "frontend\.env.local"
    echo Fichier .env.local cree
) else (
    echo Fichier .env.local existe deja
)
echo.

echo ========================================
echo   Demarrage des serveurs...
echo ========================================
echo.
echo Backend:  http://%IP%:3001
echo Frontend: http://%IP%:3000
echo.
echo Pour arreter: Fermez les fenetres ou Ctrl+C
echo.

REM Démarrer le backend dans un nouveau terminal
start "BasketStats - Backend" powershell -NoExit -Command "cd '%CD%\backend'; Write-Host '========================================' -ForegroundColor Cyan; Write-Host '  BasketStats - Backend' -ForegroundColor Cyan; Write-Host '========================================' -ForegroundColor Cyan; Write-Host ''; Write-Host 'IP reseau: %IP%' -ForegroundColor Yellow; Write-Host 'URL: http://%IP%:3001' -ForegroundColor Green; Write-Host ''; npm run start:dev"

REM Attendre un peu avant de démarrer le frontend
timeout /t 2 /nobreak >nul

REM Démarrer le frontend dans un nouveau terminal
start "BasketStats - Frontend" powershell -NoExit -Command "cd '%CD%\frontend'; Write-Host '========================================' -ForegroundColor Cyan; Write-Host '  BasketStats - Frontend' -ForegroundColor Cyan; Write-Host '========================================' -ForegroundColor Cyan; Write-Host ''; Write-Host 'IP reseau: %IP%' -ForegroundColor Yellow; Write-Host 'URL: http://%IP%:3000' -ForegroundColor Green; Write-Host ''; npm run dev"

echo.
echo Serveurs demarres dans des fenetres separees!
echo.
echo Acces local:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001
echo.
echo Acces reseau:
echo   Frontend: http://%IP%:3000
echo   Backend:  http://%IP%:3001
echo.
pause


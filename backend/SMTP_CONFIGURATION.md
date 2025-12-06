# 📧 Configuration SMTP pour l'envoi d'emails

## ⚠️ Problème actuel

Le système affiche l'avertissement suivant :
```
⚠️ [AuthOtp] SMTP non configuré - Code OTP généré pour [email]: [code] (non envoyé par email)
```

Cela signifie que les variables d'environnement SMTP ne sont pas configurées.

## ✅ Solution

### 1. Configuration locale (.env)

Ajoutez ces variables dans votre fichier `.env` du backend :

```env
# Configuration SMTP
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre-email@gmail.com
MAIL_PASSWORD=votre-mot-de-passe-app
MAIL_FROM_ADDRESS=votre-email@gmail.com
```

### 2. Configuration Gmail

Si vous utilisez Gmail :

1. **Activer l'authentification à deux facteurs** sur votre compte Gmail
2. **Générer un mot de passe d'application** :
   - Allez sur https://myaccount.google.com/apppasswords
   - Sélectionnez "Mail" et "Autre (nom personnalisé)"
   - Entrez "BasketStats" comme nom
   - Copiez le mot de passe généré (16 caractères)
   - Utilisez ce mot de passe dans `MAIL_PASSWORD`

### 3. Configuration Render (Production)

Sur Render, ajoutez ces variables d'environnement dans les paramètres de votre service :

1. Allez dans votre service backend sur Render
2. Cliquez sur "Environment"
3. Ajoutez les variables suivantes :
   - `MAIL_HOST` = `smtp.gmail.com`
   - `MAIL_PORT` = `587`
   - `MAIL_USERNAME` = `votre-email@gmail.com`
   - `MAIL_PASSWORD` = `votre-mot-de-passe-app` (le mot de passe d'application Gmail)
   - `MAIL_FROM_ADDRESS` = `votre-email@gmail.com`

### 4. Autres fournisseurs SMTP

#### Outlook/Hotmail
```env
MAIL_HOST=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_USERNAME=votre-email@outlook.com
MAIL_PASSWORD=votre-mot-de-passe
```

#### SendGrid
```env
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=votre-api-key-sendgrid
```

#### Mailgun
```env
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=votre-username-mailgun
MAIL_PASSWORD=votre-password-mailgun
```

## 🔍 Vérification

Après configuration, redémarrez le serveur backend. Vous devriez voir :
```
📧 Code OTP envoyé à [email]: [code]
```

Au lieu de :
```
⚠️ [AuthOtp] SMTP non configuré...
```

## 📝 Note

En développement local, si SMTP n'est pas configuré, le code OTP est quand même généré et affiché dans les logs pour faciliter les tests. En production, il est recommandé de configurer SMTP pour envoyer les emails.


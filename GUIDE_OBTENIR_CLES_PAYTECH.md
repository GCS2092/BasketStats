# 🔑 Guide pour Obtenir les Clés PayTech

## 🎯 **Objectif**
Obtenir de vraies clés API PayTech pour tester les paiements réels.

## 📋 **Étapes à Suivre**

### **1. Aller sur PayTech**
- **Site** : https://paytech.sn
- **Créer un compte** vendeur
- **Vérifier votre email**

### **2. Se Connecter**
- Utiliser vos identifiants
- Aller dans la section **"API"** ou **"Développeur"**

### **3. Obtenir les Clés**
- **API_KEY** : Clé publique pour identifier votre compte
- **API_SECRET** : Clé secrète pour signer les requêtes

### **4. Configurer PayTech**
- **Mode** : `prod` (production) ou `test` (test)
- **URLs de retour** : Votre URL ngrok + endpoints

## 🚀 **Comment Configurer**

### **Option 1 : Script Automatique (Recommandé)**
```powershell
.\CONFIGURER_PAYTECH_REEL.ps1
```

### **Option 2 : Manuel**
1. **Obtenir les clés** sur PayTech
2. **Démarrer ngrok** : `ngrok http 3001`
3. **Mettre à jour** le fichier `backend/.env` :
   ```env
   PAYTECH_API_KEY="votre_vraie_cle_api"
   PAYTECH_API_SECRET="votre_vrai_secret_api"
   PAYTECH_ENV="prod"
   SKIP_PAYTECH=false
   ```

## 🧪 **Tester PayTech**

### **1. Lancer le Projet**
```powershell
.\CONFIGURER_PAYTECH_REEL.ps1
```

### **2. Tester le Paiement**
- Aller sur `/subscription`
- Cliquer sur "Changer de plan"
- Sélectionner un plan payant
- Vérifier la redirection vers PayTech

### **3. Vérifier les Logs**
Chercher dans les logs backend :
```
✅ Requête de paiement créée avec succès
```

## 🔍 **Dépannage**

### **Si erreur 401 (Unauthorized)**
- Vérifier que les clés sont correctes
- Vérifier que le compte PayTech est actif
- Vérifier que le mode est `prod` ou `test`

### **Si erreur 422 (Invalid Request)**
- Vérifier que les URLs sont complètes
- Vérifier que ngrok est accessible
- Vérifier le format des données

### **Si PayTech ne répond pas**
- Vérifier la connexion internet
- Vérifier que PayTech est accessible
- Vérifier les logs PayTech

## 📞 **Support PayTech**

- **Email** : support@paytech.sn
- **Documentation** : https://paytech.sn/docs
- **Status** : https://status.paytech.sn

## 🎉 **Résultat Attendu**

Avec les vraies clés PayTech :
- ✅ **Redirection vers PayTech** fonctionnelle
- ✅ **Paiements traités** correctement
- ✅ **Webhooks reçus** et traités
- ✅ **Abonnements créés** automatiquement

## 💡 **Conseils**

1. **Commencez par le mode test** si disponible
2. **Testez avec de petits montants** d'abord
3. **Vérifiez les logs** régulièrement
4. **Sauvegardez vos clés** en sécurité

**Une fois configuré, PayTech fonctionnera parfaitement !** 🚀

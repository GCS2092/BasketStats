# 🚀 Comment Lancer le Projet BasketStats

## ✅ **Script Fonctionnel**

Le seul script nécessaire est : **`LANCER_SIMPLE.ps1`**

## 🎯 **Comment Lancer le Projet**

### **1. Ouvrir PowerShell**
- Ouvrir PowerShell en tant qu'administrateur
- Naviguer vers le dossier BasketStats

### **2. Lancer le Script**
```powershell
.\LANCER_SIMPLE.ps1
```

**C'est tout !** Le script fait automatiquement :
- ✅ Démarre ngrok
- ✅ Met à jour les URLs PayTech
- ✅ Lance le backend
- ✅ Configure tout automatiquement

## 📋 **Ce que le Script Fait**

1. **Vérifie ngrok** : S'assure que ngrok est installé
2. **Démarre ngrok** : Lance `ngrok http 3001`
3. **Récupère l'URL** : Obtient l'URL ngrok automatiquement
4. **Met à jour .env** : Configure les URLs PayTech
5. **Lance le backend** : Démarre `npm run start:dev`

## 🎉 **Résultat**

Après avoir lancé le script, vous aurez :
- **Backend** : `http://localhost:3001`
- **Ngrok** : `https://votre-url.ngrok-free.dev`
- **Frontend** : `http://192.168.1.118:3000`
- **PayTech** : Configuré et fonctionnel

## 🧪 **Tester le Changement de Plan**

1. Aller sur `http://192.168.1.118:3000/subscription`
2. Cliquer sur "Changer de plan"
3. Sélectionner un plan payant
4. Vérifier la redirection vers PayTech

## 🛑 **Arrêter le Projet**

- Appuyer sur `Ctrl+C` dans le terminal
- Le script arrêtera automatiquement ngrok et le backend

## 📁 **Fichiers Gardés**

- ✅ `LANCER_SIMPLE.ps1` - Script principal
- ✅ `PAYTECH_INTEGRATION_COMPLETE.md` - Documentation PayTech
- ✅ `README.md` - Documentation générale

## 🎯 **Résumé**

**Une seule commande pour tout lancer :**
```powershell
.\LANCER_SIMPLE.ps1
```

**C'est tout ! Plus besoin d'autre chose.** 🚀

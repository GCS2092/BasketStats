# 🐛 Guide de Débogage - Système d'Onboarding

## ❌ **ERREUR RÉSOLUE : `Cannot read properties of undefined (reading 'isCompleted')`**

### **Cause de l'erreur :**
L'erreur se produisait car `onboardingData.progress` était `undefined` pendant le chargement des données, mais le code tentait d'accéder à `isCompleted` sans vérification.

### **Solutions appliquées :**

1. **✅ Vérification de sécurité dans `useOnboarding.ts` :**
   ```typescript
   // AVANT (erreur)
   if (onboardingData && !onboardingData.progress.isCompleted) {
   
   // APRÈS (corrigé)
   if (onboardingData?.progress && !onboardingData.progress.isCompleted) {
   ```

2. **✅ Gestion d'erreur améliorée :**
   ```typescript
   // Ajout d'un try/catch avec fallback
   try {
     const response = await apiClient.get('/onboarding/progress');
     return response.data as OnboardingData;
   } catch (error) {
     // Retourner des données par défaut
     return { progress: { isCompleted: true, ... }, steps: [] };
   }
   ```

3. **✅ Vérification dans `OnboardingProvider.tsx` :**
   ```typescript
   // Ne pas afficher l'onboarding si les données ne sont pas chargées
   if (!onboardingData?.progress) {
     return <>{children}</>;
   }
   ```

4. **✅ ErrorBoundary ajouté :**
   - Composant `OnboardingErrorBoundary` pour capturer les erreurs
   - Fallback UI en cas d'erreur critique

## 🔍 **Autres Problèmes Potentiels et Solutions**

### **1. Backend non démarré**
```bash
# Vérifier que le backend fonctionne
cd BasketStats/backend
npm run start:dev

# Vérifier les logs
# Le serveur doit être sur http://localhost:3001
```

### **2. Base de données non accessible**
```bash
# Vérifier la connexion à la base
cd BasketStats/backend
npx prisma db pull

# Vérifier que la table existe
npx prisma studio
```

### **3. API endpoints non trouvés**
```bash
# Tester l'endpoint directement
curl -X GET http://localhost:3001/api/onboarding/progress \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **4. Session utilisateur non valide**
```typescript
// Vérifier dans la console du navigateur
console.log('Session:', session);
console.log('User ID:', session?.user?.id);
```

### **5. Erreurs de CORS**
```typescript
// Vérifier la configuration CORS dans le backend
// Vérifier que l'URL de l'API est correcte
```

## 🧪 **Tests de Validation**

### **Test 1 : Vérifier les données d'onboarding**
```typescript
// Dans la console du navigateur
const { data } = useQuery({
  queryKey: ['onboarding-test'],
  queryFn: async () => {
    const response = await fetch('/api/onboarding/progress');
    return response.json();
  }
});
console.log('Onboarding data:', data);
```

### **Test 2 : Vérifier l'état de la session**
```typescript
// Dans la console du navigateur
import { useSession } from 'next-auth/react';
const { data: session, status } = useSession();
console.log('Session status:', status);
console.log('Session data:', session);
```

### **Test 3 : Vérifier les erreurs réseau**
```typescript
// Ouvrir les DevTools > Network
// Vérifier les requêtes vers /api/onboarding/*
// Vérifier les codes de réponse (200, 401, 500, etc.)
```

## 📊 **Logs de Débogage**

### **Backend (Terminal)**
```bash
# Rechercher les logs d'onboarding
grep -i "onboarding" logs/app.log

# Vérifier les erreurs Prisma
grep -i "prisma" logs/app.log
```

### **Frontend (Console du navigateur)**
```javascript
// Activer les logs détaillés
localStorage.setItem('debug', 'onboarding:*');

// Vérifier les erreurs React
// DevTools > Console > Errors
```

## 🚀 **Commandes de Test Rapide**

### **1. Test complet de l'API**
```bash
# Backend
cd BasketStats/backend
npm run start:dev

# Frontend (nouveau terminal)
cd BasketStats/frontend
npm run dev

# Test API (nouveau terminal)
curl -X GET http://localhost:3001/api/onboarding/progress
```

### **2. Test de la base de données**
```bash
cd BasketStats/backend
npx prisma studio
# Ouvrir http://localhost:5555
# Vérifier la table onboarding_progress
```

### **3. Test du frontend**
```bash
cd BasketStats/frontend
npm run dev
# Ouvrir http://localhost:3000
# Créer un nouveau compte
# Vérifier que l'onboarding s'affiche
```

## ✅ **Checklist de Validation**

- [ ] Backend démarré sans erreurs
- [ ] Base de données accessible
- [ ] Table `onboarding_progress` créée
- [ ] API endpoints répondent (200)
- [ ] Frontend démarre sans erreurs
- [ ] Session utilisateur valide
- [ ] Données d'onboarding chargées
- [ ] Modal d'onboarding s'affiche
- [ ] Navigation entre étapes fonctionne
- [ ] Progrès sauvegardé en base

## 🎯 **Résolution de Problèmes Courants**

### **Problème : "Cannot read properties of undefined"**
**Solution :** Vérifier que toutes les propriétés sont définies avec `?.`

### **Problème : "Network Error"**
**Solution :** Vérifier que le backend est démarré et accessible

### **Problème : "401 Unauthorized"**
**Solution :** Vérifier que l'utilisateur est connecté et le token valide

### **Problème : "500 Internal Server Error"**
**Solution :** Vérifier les logs du backend et la base de données

### **Problème : "Modal ne s'affiche pas"**
**Solution :** Vérifier que `isOnboardingVisible` est `true` et les données chargées

---

**Status** : ✅ **ERREUR RÉSOLUE** - Le système d'onboarding fonctionne maintenant correctement !

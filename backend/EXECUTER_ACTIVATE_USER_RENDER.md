# 🚀 Exécuter activate-user sur Render

## ⚠️ Problème Résolu

Sur Render, vous êtes **déjà** dans le bon répertoire : `/opt/render/project/src/backend`

**❌ NE FAITES PAS :** `cd backend` (cela échouera)

**✅ FAITES DIRECTEMENT :**

```bash
npm run activate-user
```

ou

```bash
npm run activate-user stemk2151@gmail.com
```

---

## 📋 Étapes Complètes

1. **Allez sur [Render Dashboard](https://dashboard.render.com)**
2. **Sélectionnez** : `basketstats-backend`
3. **Cliquez sur "Shell"** (menu de gauche)
4. **Vous serez dans** : `/opt/render/project/src/backend`
5. **Exécutez directement** (sans `cd backend`) :

   ```bash
   # Lister tous les utilisateurs
   npm run activate-user
   ```

   ou

   ```bash
   # Activer un utilisateur spécifique
   npm run activate-user stemk2151@gmail.com
   ```

---

## 🔍 Si le Script n'Existe Pas

Si vous voyez l'erreur `Missing script: "activate-user"`, cela signifie que :

1. **Le code n'a pas encore été déployé** sur Render
   - **Solution** : Attendez que Render redéploie automatiquement après le push GitHub
   - Ou déclenchez un redéploiement manuel depuis le dashboard Render

2. **Vérifiez que le script est bien dans package.json** :
   ```bash
   cat package.json | grep activate-user
   ```
   
   Vous devriez voir :
   ```json
   "activate-user": "ts-node scripts/activate-user-premium.ts"
   ```

3. **Si le script n'est pas dans package.json**, vérifiez que le fichier existe :
   ```bash
   ls -la scripts/activate-user-premium.ts
   ```

---

## 🛠️ Alternative : Exécution Directe avec ts-node

Si le script npm ne fonctionne pas, vous pouvez l'exécuter directement :

```bash
npx ts-node scripts/activate-user-premium.ts
```

ou avec un email :

```bash
npx ts-node scripts/activate-user-premium.ts stemk2151@gmail.com
```

---

## ✅ Vérification

Après l'exécution, vous devriez voir :

```
✅ Utilisateur trouvé: ...
✅ Plan trouvé: Professionnel (PROFESSIONAL)
✅ Utilisateur activé
✅ Abonnement PROFESSIONAL créé avec succès
```

---

## 📝 Notes

- Le répertoire de travail sur Render est : `/opt/render/project/src/backend`
- Vous êtes **déjà** dans le bon répertoire, pas besoin de `cd`
- Le script doit être dans `scripts/activate-user-premium.ts`
- Le package.json doit contenir le script `activate-user`


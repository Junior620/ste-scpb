# Comment vider le cache et tester les changements

## Problème actuel

L'auteur et la date de publication ne s'affichent pas sur la page article. Cela peut être dû à:

1. Le cache Next.js qui contient d'anciennes données
2. Le cache Sanity côté serveur
3. Les articles dans Sanity qui n'ont pas encore été mis à jour avec la nouvelle structure d'auteur

## Solutions

### 1. Vider TOUS les caches (Recommandé)

```bash
cd ste-scpb-website

# Vider le cache Next.js
rm -rf .next

# Redémarrer le serveur
npm run dev
```

Ou sur Windows PowerShell:

```powershell
cd ste-scpb-website
Remove-Item -Recurse -Force .next
npm run dev
```

Ou sur Windows CMD:

```cmd
cd ste-scpb-website
rmdir /s /q .next
npm run dev
```

### 2. Vider le cache Sanity via API

Visitez dans votre navigateur:

```
http://localhost:3000/api/clear-cache?secret=YOUR_REVALIDATE_SECRET
```

Remplacez `YOUR_REVALIDATE_SECRET` par la valeur de `REVALIDATE_SECRET` dans votre fichier `.env.local`.

### 3. Revalider une page spécifique

```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"YOUR_REVALIDATE_SECRET","type":"article","slug":"votre-slug"}'
```

### 4. Déboguer les données de l'article

Visitez: `http://localhost:3000/api/debug-article?slug=campagne-cafeiere-2025-2026-le-coup-d-envoi-est-donne-a-baditoum`

Cela vous montrera:

- Les données brutes retournées par Sanity
- Si l'auteur est présent
- La structure de l'auteur

## Mettre à jour les articles dans Sanity

Pour que les articles existants affichent l'auteur, vous devez les mettre à jour dans Sanity Studio:

1. **Ouvrir Sanity Studio** (http://localhost:3333 ou votre URL Sanity)
2. **Aller dans "Article"**
3. **Éditer l'article** "Campagne caféière 2025/2026"
4. **Dans le champ "Auteur"**:
   - Vous verrez maintenant deux options: "Membre de l'équipe" ou "Auteur externe"
   - **Option 1 - Membre de l'équipe**:
     - Sélectionner "Membre de l'équipe"
     - Choisir un membre dans la liste déroulante
   - **Option 2 - Auteur externe**:
     - Sélectionner "Auteur externe"
     - Saisir le nom de l'auteur (ex: "Jean Dupont")
     - Optionnellement, ajouter un lien (ex: "https://linkedin.com/in/jeandupont")
5. **Sauvegarder l'article**
6. **Vider le cache** (voir étapes ci-dessus)
7. **Rafraîchir la page** dans votre navigateur

## Structure attendue dans Sanity

### Nouveau format (ce que vous devez utiliser maintenant):

**Pour un membre de l'équipe:**

```json
{
  "author": {
    "authorType": "team",
    "teamMember": {
      "_ref": "id-du-membre-de-lequipe"
    }
  }
}
```

**Pour un auteur externe:**

```json
{
  "author": {
    "authorType": "external",
    "externalName": "John Doe",
    "externalLink": "https://example.com/john-doe"
  }
}
```

### Ancien format (supporté pour compatibilité):

Si vous avez des articles avec l'ancien format, ils devraient toujours fonctionner:

```json
{
  "author": {
    "_ref": "id-du-membre"
  }
}
```

Mais il est recommandé de les mettre à jour vers le nouveau format.

## Vérification

Après avoir suivi ces étapes:

1. ✅ L'auteur devrait s'afficher sous le titre
2. ✅ La date de publication devrait s'afficher
3. ✅ Si l'auteur a un lien, son nom devrait être cliquable

Si le problème persiste:

- Vérifiez les logs du serveur pour voir s'il y a des erreurs
- Utilisez l'API de debug pour voir les données brutes
- Assurez-vous que l'article a bien un auteur défini dans Sanity

---

## Revalider la page Statistiques

Si vous avez modifié les données de statistiques dans Sanity (par exemple, le nombre de pays desservis) et que les changements n'apparaissent pas en production, vous devez revalider la page.

### En production (ste-scpb.com)

**PowerShell:**

```powershell
# Revalider la version française
$body = @{secret="f7f1ae5631b3e4f955b16dcc6184cfc3b6d2bdd611dd8d18ca438f994776f098"; path="/fr/statistiques"} | ConvertTo-Json
Invoke-WebRequest -Uri "https://ste-scpb.com/api/revalidate" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing

# Revalider la version anglaise
$body = @{secret="f7f1ae5631b3e4f955b16dcc6184cfc3b6d2bdd611dd8d18ca438f994776f098"; path="/en/statistiques"} | ConvertTo-Json
Invoke-WebRequest -Uri "https://ste-scpb.com/api/revalidate" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
```

**Bash/cURL:**

```bash
# Revalider la version française
curl -X POST https://ste-scpb.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"f7f1ae5631b3e4f955b16dcc6184cfc3b6d2bdd611dd8d18ca438f994776f098","path":"/fr/statistiques"}'

# Revalider la version anglaise
curl -X POST https://ste-scpb.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"f7f1ae5631b3e4f955b16dcc6184cfc3b6d2bdd611dd8d18ca438f994776f098","path":"/en/statistiques"}'
```

### En local (localhost:3000)

```powershell
# Revalider la version française
$body = @{secret="f7f1ae5631b3e4f955b16dcc6184cfc3b6d2bdd611dd8d18ca438f994776f098"; path="/fr/statistiques"} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/api/revalidate" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
```

### Temps de revalidation automatique

La page statistiques se revalide automatiquement toutes les **1 heure** (3600 secondes). Si vous ne voulez pas attendre, utilisez les commandes ci-dessus pour forcer la revalidation immédiatement.

### Vérifier que les changements sont appliqués

1. Après avoir exécuté la commande de revalidation, attendez quelques secondes
2. Visitez la page: https://ste-scpb.com/fr/statistiques
3. Faites un "hard refresh" (Ctrl+Shift+R sur Windows/Linux, Cmd+Shift+R sur Mac)
4. Les nouvelles données devraient maintenant s'afficher

Si les changements n'apparaissent toujours pas:

- Vérifiez que les données sont bien mises à jour dans Sanity Studio
- Videz le cache du CMS: `POST https://ste-scpb.com/api/clear-cache`
- Attendez quelques minutes pour que le CDN Vercel se mette à jour

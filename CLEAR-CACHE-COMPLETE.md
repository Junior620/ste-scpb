# Guide de nettoyage complet du cache - Résolution des erreurs MIME

## Problème
Erreurs de type MIME incorrect et ERR_CONNECTION_REFUSED lors du chargement de la page, même après avoir changé de navigateur.

## Cause
Le cache du navigateur contient des références à des fichiers JavaScript/CSS corrompus ou d'une ancienne build qui n'existe plus.

## Solution complète

### Étape 1 : Arrêter tous les serveurs
```bash
# Arrêter le serveur de développement (Ctrl+C dans le terminal)
# Vérifier qu'aucun processus Node.js ne tourne sur le port 3000
```

### Étape 2 : Nettoyer le projet Next.js
```bash
# Dans le dossier ste-scpb-website
cd ste-scpb-website

# Supprimer le dossier .next
rmdir /s /q .next

# Supprimer le cache de Turbopack (si présent)
rmdir /s /q .turbo

# Optionnel : Nettoyer node_modules et réinstaller
rmdir /s /q node_modules
npm install
```

### Étape 3 : Nettoyer TOUS les caches du navigateur

#### Chrome/Edge/Brave
1. Ouvrir les DevTools (F12)
2. Clic droit sur le bouton de rafraîchissement
3. Sélectionner "Vider le cache et effectuer une actualisation forcée"
4. OU : Paramètres > Confidentialité > Effacer les données de navigation
   - Cocher "Images et fichiers en cache"
   - Cocher "Cookies et autres données de site"
   - Période : "Toutes les périodes"
   - Cliquer sur "Effacer les données"

#### Firefox
1. Ctrl+Shift+Delete
2. Cocher "Cache"
3. Cocher "Cookies"
4. Période : "Tout"
5. Cliquer sur "Effacer maintenant"

#### Solution universelle : Mode navigation privée
Ouvrir une fenêtre de navigation privée/incognito :
- Chrome/Edge : Ctrl+Shift+N
- Firefox : Ctrl+Shift+P

### Étape 4 : Rebuild et redémarrer

#### Pour le mode développement :
```bash
# Dans ste-scpb-website
pnpm dev
```

#### Pour le mode production :
```bash
# Dans ste-scpb-website
npm run build
npm start
```

### Étape 5 : Accéder à l'application
1. Ouvrir le navigateur en mode navigation privée
2. Aller sur http://localhost:3000
3. Si ça fonctionne, fermer la navigation privée
4. Nettoyer le cache du navigateur normal (Étape 3)
5. Réessayer en mode normal

## Vérification
Si tout fonctionne correctement, vous devriez voir :
- ✅ Pas d'erreurs MIME type dans la console
- ✅ Pas d'erreurs ERR_CONNECTION_REFUSED
- ✅ Les fichiers CSS et JS se chargent correctement
- ✅ La page s'affiche normalement

## Si le problème persiste

### Vérifier les ports
```bash
# Vérifier si le port 3000 est utilisé
netstat -ano | findstr :3000

# Si un processus utilise le port, le tuer
taskkill /PID <PID> /F
```

### Vérifier le fichier .next
Le dossier `.next` doit être complètement supprimé avant chaque rebuild si vous rencontrez des problèmes.

### Utiliser un autre port
```bash
# Démarrer sur un autre port
PORT=3001 pnpm dev
# Puis accéder à http://localhost:3001
```

## Prévention
Pour éviter ce problème à l'avenir :
1. Toujours arrêter proprement le serveur (Ctrl+C)
2. Nettoyer `.next` avant un rebuild si vous avez des doutes
3. Utiliser la navigation privée pour tester après un rebuild
4. Vider le cache du navigateur régulièrement pendant le développement

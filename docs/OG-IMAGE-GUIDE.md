# Guide : Image Open Graph Optimisée

## ✅ Ce qui a été fait

J'ai amélioré l'API `/api/og` pour générer des images Open Graph dynamiques de 1200x630px optimisées pour les réseaux sociaux.

---

## 🎨 Aperçu de l'Image

L'image générée contient :

- ✅ Dimensions : 1200x630px (format optimal)
- ✅ Fond dégradé vert (couleurs de la marque)
- ✅ Logo SCPB stylisé
- ✅ Titre personnalisable
- ✅ Sous-titre personnalisable
- ✅ Description de l'entreprise
- ✅ 3 badges : Export, Certifié, Devis 24h
- ✅ Éléments décoratifs (cercles)

---

## 🚀 Comment l'utiliser

### Option 1 : Image par défaut (Recommandé)

Modifiez `src/i18n/metadata.ts` :

```typescript
/**
 * Default Open Graph image
 * Using dynamic OG image generation for better social media previews
 */
export const DEFAULT_OG_IMAGE = `${BASE_URL}/api/og`;
```

**Résultat** : Toutes les pages utiliseront l'image OG dynamique

---

### Option 2 : Images personnalisées par page

Pour personnaliser l'image selon la page :

```typescript
// src/app/[locale]/produits/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(product.name)}&subtitle=Produit Premium`,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
  };
}
```

**Exemples d'URLs** :

- Page d'accueil : `https://ste-scpb.com/api/og`
- Produit cacao : `https://ste-scpb.com/api/og?title=Cacao Premium&subtitle=Origine Cameroun`
- Article blog : `https://ste-scpb.com/api/og?title=Guide Export Cacao&subtitle=Blog STE-SCPB`

---

## 🧪 Tester l'Image

### 1. En local

Démarrez le serveur :

```bash
npm run dev
```

Ouvrez dans votre navigateur :

```
http://localhost:3000/api/og
http://localhost:3000/api/og?title=Test&subtitle=Mon Sous-titre
```

### 2. En production

Une fois déployé sur Vercel :

```
https://ste-scpb.com/api/og
```

### 3. Tester sur les réseaux sociaux

**Facebook Debugger** :
https://developers.facebook.com/tools/debug/

**Twitter Card Validator** :
https://cards-dev.twitter.com/validator

**LinkedIn Post Inspector** :
https://www.linkedin.com/post-inspector/

**WhatsApp** :
Envoyez le lien dans un chat et vérifiez l'aperçu

---

## 📝 Paramètres disponibles

| Paramètre  | Description     | Exemple                        |
| ---------- | --------------- | ------------------------------ |
| `title`    | Titre principal | `STE-SCPB`                     |
| `subtitle` | Sous-titre      | `Export Cacao & Café Cameroun` |

**Exemple complet** :

```
/api/og?title=Cacao%20Premium%20Bio&subtitle=Certifié%20Fairtrade
```

---

## 🎯 Prochaines étapes

### Étape 1 : Activer l'API OG

Modifiez `src/i18n/metadata.ts` :

```typescript
// Remplacer :
export const DEFAULT_OG_IMAGE = `${BASE_URL}/logo.png`;

// Par :
export const DEFAULT_OG_IMAGE = `${BASE_URL}/api/og`;
```

### Étape 2 : Commit et Push

```bash
git add .
git commit -m "feat: improve Open Graph image with dynamic API"
git push
```

### Étape 3 : Vérifier le déploiement

Attendez que Vercel déploie automatiquement (2-3 minutes)

### Étape 4 : Tester

1. Ouvrez https://ste-scpb.com/api/og dans votre navigateur
2. Testez avec Facebook Debugger
3. Partagez sur WhatsApp pour vérifier

### Étape 5 : Forcer la mise à jour du cache

Les réseaux sociaux mettent en cache les images. Pour forcer la mise à jour :

**Facebook** :

1. Allez sur https://developers.facebook.com/tools/debug/
2. Entrez votre URL : `https://ste-scpb.com`
3. Cliquez sur "Scrape Again"

**Twitter** :

1. Allez sur https://cards-dev.twitter.com/validator
2. Entrez votre URL
3. Cliquez sur "Preview card"

**WhatsApp** :

- Attendez 24-48h pour que le cache expire
- Ou ajoutez un paramètre de version : `https://ste-scpb.com?v=2`

---

## 🎨 Option Alternative : Image Statique

Si vous préférez une image statique, vous pouvez :

### 1. Créer l'image avec un outil en ligne

**Outils recommandés** :

- **Canva** : https://www.canva.com/create/open-graph/
- **Figma** : Template OG 1200x630px
- **Photopea** : https://www.photopea.com/ (gratuit, comme Photoshop)

### 2. Spécifications

- **Dimensions** : 1200x630px (exactement)
- **Format** : PNG ou JPG
- **Poids** : < 300KB (idéal < 100KB)
- **Contenu** :
  - Logo STE-SCPB
  - Texte : "STE-SCPB - Export Cacao & Café Cameroun"
  - Couleurs : Vert (#1a472a) et Or (#d4af37)
  - Fond : Dégradé vert

### 3. Sauvegarder

Sauvegardez l'image dans :

```
ste-scpb-website/public/og-image-optimized.png
```

### 4. Utiliser

```typescript
// src/i18n/metadata.ts
export const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image-optimized.png`;
```

---

## 📊 Comparaison des Options

| Critère              | API Dynamique                | Image Statique                      |
| -------------------- | ---------------------------- | ----------------------------------- |
| **Facilité**         | ⭐⭐⭐⭐ (déjà fait)         | ⭐⭐ (besoin outil design)          |
| **Personnalisation** | ⭐⭐⭐⭐⭐ (par page)        | ⭐ (une seule image)                |
| **Performance**      | ⭐⭐⭐⭐ (généré à la volée) | ⭐⭐⭐⭐⭐ (statique)               |
| **Maintenance**      | ⭐⭐⭐⭐⭐ (code)            | ⭐⭐ (refaire l'image)              |
| **Qualité**          | ⭐⭐⭐⭐ (bon)               | ⭐⭐⭐⭐⭐ (excellent si bien fait) |

**Recommandation** : Utilisez l'API dynamique (Option 1) car elle est déjà prête et permet la personnalisation !

---

## ❓ FAQ

### Q: L'image ne s'affiche pas sur WhatsApp ?

**R**: WhatsApp met en cache les images pendant 7 jours. Attendez ou ajoutez `?v=2` à votre URL.

### Q: Puis-je ajouter le vrai logo ?

**R**: Oui ! L'API utilise actuellement un placeholder "SCPB". Pour ajouter le vrai logo, il faudrait :

1. Convertir logo.png en base64
2. L'intégrer dans l'API
3. Ou utiliser une image statique

### Q: L'image est floue sur mobile ?

**R**: Vérifiez que les dimensions sont exactement 1200x630px et que le format est PNG ou JPG de qualité.

### Q: Combien de temps pour voir les changements ?

**R**:

- Immédiat : Sur votre site
- 1-24h : Facebook, Twitter
- 24-48h : WhatsApp, LinkedIn

---

## 🎉 Résultat Attendu

Après activation, quand quelqu'un partage votre site :

**Avant** :

- Logo petit (logo.png)
- Pas optimisé pour les réseaux sociaux
- Peut être coupé ou mal affiché

**Après** :

- Image professionnelle 1200x630px
- Texte lisible et bien positionné
- Badges attractifs
- Couleurs de la marque
- Affichage parfait sur tous les réseaux

---

**Auteur** : Kiro AI  
**Date** : Janvier 2025  
**Statut** : ✅ Prêt à utiliser

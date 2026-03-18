# Guide du Carrousel AFREXIA

## 📍 Où modifier les images du carrousel ?

Le carrousel se trouve dans la section "Partenariat Stratégique AFREXIA" sur la page d'accueil.

### Fichier à modifier :

```
ste-scpb-website/src/components/sections/PartnerSection.tsx
```

## 🖼️ Comment ajouter des images ?

### 1. Place tes images dans le dossier public

```
ste-scpb-website/public/partners/
```

Exemple de structure :

```
public/
  └── partners/
      ├── afrexia-warehouse.jpg (déjà existante)
      ├── afrexia-image2.jpg (nouvelle)
      ├── afrexia-image3.jpg (nouvelle)
      └── afrexia-image4.jpg (nouvelle)
```

### 2. Modifie le tableau `carouselImages` dans PartnerSection.tsx

Trouve cette section dans le fichier (ligne ~15) :

```typescript
const carouselImages = [
  {
    src: '/partners/afrexia-warehouse.jpg',
    alt: 'AFREXIA - Contrôle qualité et traçabilité',
    caption: t('imageCaption'),
  },
  // Ajoute tes nouvelles images ici :
];
```

### 3. Ajoute tes images comme ceci :

```typescript
const carouselImages = [
  {
    src: '/partners/afrexia-warehouse.jpg',
    alt: 'AFREXIA - Contrôle qualité et traçabilité',
    caption: t('imageCaption'),
  },
  {
    src: '/partners/afrexia-image2.jpg',
    alt: 'AFREXIA - Transformation industrielle',
    caption: 'Transformation et conditionnement',
  },
  {
    src: '/partners/afrexia-image3.jpg',
    alt: "AFREXIA - Logistique d'exportation",
    caption: 'Logistique et export',
  },
  {
    src: '/partners/afrexia-image4.jpg',
    alt: 'AFREXIA - Réseau de coopératives',
    caption: 'Réseau de +2000 coopératives',
  },
];
```

## 📝 Structure d'une image

Chaque image dans le tableau doit avoir :

- **src** : Le chemin de l'image (commence toujours par `/partners/`)
- **alt** : Description de l'image (pour l'accessibilité et le SEO)
- **caption** : Légende affichée en bas de l'image (optionnel)

## ⚙️ Configuration du carrousel

### Vitesse de défilement automatique

Par défaut, le carrousel change d'image toutes les 5 secondes. Pour modifier :

```typescript
<Carousel images={carouselImages} autoPlayInterval={5000} className="h-full" />
```

Change `5000` (millisecondes) à la valeur souhaitée :

- 3000 = 3 secondes
- 7000 = 7 secondes
- 10000 = 10 secondes

## 🎨 Fonctionnalités du carrousel

✅ Défilement automatique toutes les 5 secondes
✅ Pause au survol de la souris
✅ Boutons de navigation (gauche/droite) visibles au survol
✅ Indicateurs de position (points en bas à droite)
✅ Légendes personnalisables pour chaque image
✅ Transitions fluides entre les images
✅ Responsive (s'adapte aux mobiles et tablettes)

## 🔧 Exemple complet

```typescript
const carouselImages = [
  {
    src: '/partners/afrexia-warehouse.jpg',
    alt: 'Entrepôt AFREXIA avec sacs de cacao',
    caption: 'Contrôle qualité et traçabilité AFREXIA',
  },
  {
    src: '/partners/afrexia-processing.jpg',
    alt: 'Ligne de transformation AFREXIA',
    caption: 'Transformation industrielle du cacao',
  },
  {
    src: '/partners/afrexia-logistics.jpg',
    alt: 'Camions de livraison AFREXIA',
    caption: "Logistique d'exportation efficace",
  },
  {
    src: '/partners/afrexia-farmers.jpg',
    alt: 'Agriculteurs partenaires AFREXIA',
    caption: 'Réseau de +2000 coopératives partenaires',
  },
];
```

## 📱 Test

Après avoir ajouté tes images :

1. Sauvegarde le fichier `PartnerSection.tsx`
2. Vérifie que tes images sont bien dans `public/partners/`
3. Rafraîchis la page d'accueil
4. Le carrousel devrait défiler automatiquement
5. Survole avec la souris pour voir les boutons de navigation

## ❓ Problèmes courants

### L'image ne s'affiche pas

- Vérifie que le chemin commence par `/partners/`
- Vérifie que l'image existe dans `public/partners/`
- Vérifie l'orthographe du nom de fichier

### Le carrousel ne défile pas

- Assure-toi d'avoir au moins 2 images dans le tableau
- Vérifie qu'il n'y a pas d'erreurs dans la console du navigateur

### Les images sont déformées

- Utilise des images avec un ratio similaire (idéalement 4:3 ou 16:9)
- Taille recommandée : 1200x800px minimum

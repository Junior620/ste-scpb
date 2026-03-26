# Guide du Marquee de Prix FOB

## 📍 Où modifier les prix ?

Le marquee de prix se trouve en haut de la page d'accueil, juste après le Hero.

### Fichier à modifier :

```
ste-scpb-website/src/components/sections/PriceTickerSection.tsx
```

## 💰 Comment modifier les prix ?

### Trouve cette section dans le fichier (ligne ~12) :

```typescript
const prices: PriceItem[] = [
  {
    product: 'Cacao',
    price: 2500,
    unit: 'FCFA/KG',
    trend: 'up',
    change: 2.5,
  },
  {
    product: 'Café Arabica',
    price: 3200,
    unit: 'FCFA/KG',
    trend: 'up',
    change: 1.8,
  },
  // ... autres produits
];
```

## 📝 Structure d'un prix

Chaque prix dans le tableau doit avoir :

- **product** : Nom du produit (ex: "Cacao", "Café Arabica")
- **price** : Prix en nombre (ex: 2500)
- **unit** : Unité de mesure (ex: "FCFA/KG")
- **trend** : Tendance du prix (optionnel)
  - `'up'` = Prix en hausse (flèche verte ↗)
  - `'down'` = Prix en baisse (flèche rouge ↘)
  - Omets cette ligne si pas de tendance
- **change** : Pourcentage de changement (optionnel, ex: 2.5 pour +2.5%)

## 🎯 Exemples de modification

### Modifier un prix existant :

```typescript
{
  product: 'Cacao',
  price: 2800,  // ← Change juste le prix ici
  unit: 'FCFA/KG',
  trend: 'up',
  change: 3.5,  // ← Et le pourcentage ici
},
```

### Ajouter un nouveau produit :

```typescript
const prices: PriceItem[] = [
  // ... produits existants
  {
    product: 'Poivre',
    price: 4500,
    unit: 'FCFA/KG',
    trend: 'up',
    change: 1.2,
  },
];
```

### Prix sans tendance :

```typescript
{
  product: 'Cacao',
  price: 2500,
  unit: 'FCFA/KG',
  // Pas de trend ni change = pas de flèche affichée
},
```

## ⚙️ Configuration du défilement

### Vitesse de défilement

Par défaut, le marquee fait un tour complet en 30 secondes. Pour modifier :

```typescript
<PriceMarquee prices={prices} speed={30} />
```

Change `speed={30}` à la valeur souhaitée :

- `speed={20}` = Plus rapide (20 secondes)
- `speed={40}` = Plus lent (40 secondes)
- `speed={60}` = Très lent (1 minute)

## 🎨 Fonctionnalités

✅ Défilement automatique continu
✅ Pause au survol de la souris
✅ Indicateurs de tendance (flèches vertes/rouges)
✅ Pourcentage de changement
✅ Effet de fondu sur les bords
✅ Responsive (s'adapte aux mobiles)
✅ Boucle infinie sans coupure

## 📍 Position sur la page

Le marquee est affiché :

- **Tout en haut de la page, au-dessus du menu de navigation**
- **Fixé en position sticky** - il reste visible même quand tu scrolles
- Sur toute la largeur de la page
- Visible sur toutes les pages du site (pas seulement l'accueil)

Pour changer sa position, modifie le fichier :

```
ste-scpb-website/src/app/[locale]/layout.tsx
```

Et déplace la ligne :

```typescript
<PriceTickerSection />
```

## 🔧 Exemple complet

```typescript
const prices: PriceItem[] = [
  {
    product: 'Cacao',
    price: 2500,
    unit: 'FCFA/KG',
    trend: 'up',
    change: 2.5,
  },
  {
    product: 'Café Arabica',
    price: 3200,
    unit: 'FCFA/KG',
    trend: 'up',
    change: 1.8,
  },
  {
    product: 'Café Robusta',
    price: 2800,
    unit: 'FCFA/KG',
    trend: 'down',
    change: -0.5,
  },
  {
    product: 'Maïs',
    price: 180,
    unit: 'FCFA/KG',
    trend: 'up',
    change: 3.2,
  },
  {
    product: 'Bois',
    price: 450,
    unit: 'FCFA/KG',
    trend: 'up',
    change: 1.2,
  },
];
```

## 📱 Test

Après avoir modifié les prix :

1. Sauvegarde le fichier `PriceTickerSection.tsx`
2. Rafraîchis la page d'accueil
3. Le marquee devrait défiler automatiquement
4. Survole avec la souris pour mettre en pause

## ❓ Problèmes courants

### Le marquee ne défile pas

- Vérifie qu'il y a au moins 2 produits dans le tableau
- Vérifie qu'il n'y a pas d'erreurs dans la console du navigateur

### Les prix ne s'affichent pas correctement

- Vérifie que chaque objet a bien `product`, `price`, et `unit`
- Vérifie les virgules entre les objets

### Le défilement est trop rapide/lent

- Ajuste la valeur de `speed` dans `<PriceMarquee prices={prices} speed={30} />`

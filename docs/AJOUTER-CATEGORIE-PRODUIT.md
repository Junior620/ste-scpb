# Guide : Ajouter une nouvelle catégorie de produit

## Méthode automatique (recommandée)

Utilisez le script d'ajout automatique :

```bash
npm run add-product-category
```

Le script vous demandera :

1. Le nom de la catégorie en français (ex: "Poivre")
2. Le slug/value (ex: "poivre")
3. Les traductions en anglais et russe

Le script mettra à jour automatiquement :

- Le schéma Sanity (`scpb/schemaTypes/product.ts`)
- Les fichiers de traductions i18n (fr.json, en.json, ru.json)

## Méthode manuelle

Si vous préférez ajouter manuellement une catégorie, suivez ces étapes :

### 1. Mettre à jour le schéma Sanity

Fichier : `scpb/schemaTypes/product.ts`

Ajoutez votre catégorie dans la liste des options :

```typescript
defineField({
  name: 'category',
  title: 'Catégorie',
  type: 'string',
  options: {
    list: [
      { title: 'Cacao', value: 'cacao' },
      { title: 'Café', value: 'cafe' },
      // ... autres catégories
      { title: 'Votre Catégorie', value: 'votre-categorie' }, // ← Ajoutez ici
    ],
  },
  validation: (Rule) => Rule.required(),
}),
```

### 2. Ajouter les traductions

Ajoutez la traduction dans les 3 fichiers de langue :

#### Français (`ste-scpb-website/src/i18n/messages/fr.json`)

```json
"products": {
  "categories": {
    "cacao": "Cacao",
    "cafe": "Café",
    // ... autres catégories
    "votre-categorie": "Votre Catégorie"
  }
}
```

#### Anglais (`ste-scpb-website/src/i18n/messages/en.json`)

```json
"products": {
  "categories": {
    "cacao": "Cocoa",
    "cafe": "Coffee",
    // ... autres catégories
    "votre-categorie": "Your Category"
  }
}
```

#### Russe (`ste-scpb-website/src/i18n/messages/ru.json`)

```json
"products": {
  "categories": {
    "cacao": "Какао",
    "cafe": "Кофе",
    // ... autres catégories
    "votre-categorie": "Ваша категория"
  }
}
```

### 3. Commit et push

```bash
# Dans le dossier scpb (Sanity)
cd scpb
git add .
git commit -m "feat: ajout de la catégorie votre-categorie"
git push origin main

# Dans le dossier ste-scpb-website (Next.js)
cd ../ste-scpb-website
git add .
git commit -m "feat: ajout des traductions pour la catégorie votre-categorie"
git push origin master
```

## Notes importantes

- Le `value` doit être en minuscules et sans espaces (utilisez des tirets)
- Le `title` dans Sanity est ce qui s'affiche dans l'interface d'administration
- Les traductions i18n sont ce qui s'affiche sur le site web
- Après modification du schéma Sanity, redémarrez le studio Sanity si nécessaire

## Exemple complet

Pour ajouter "Poivre" :

1. **Sanity** : `{ title: 'Poivre', value: 'poivre' }`
2. **FR** : `"poivre": "Poivre"`
3. **EN** : `"poivre": "Pepper"`
4. **RU** : `"poivre": "Перец"`

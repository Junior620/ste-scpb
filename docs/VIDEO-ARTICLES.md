# Support Vidéo pour les Articles

## Vue d'ensemble

Les articles peuvent maintenant inclure des vidéos en plus des images. Les vidéos remplacent l'image principale lorsqu'elles sont présentes.

## Plateformes supportées

1. **YouTube** - Vidéos hébergées sur YouTube
2. **Vimeo** - Vidéos hébergées sur Vimeo
3. **Lien direct** - Fichiers vidéo MP4 hébergés directement

## Configuration dans Sanity Studio

### Ajouter une vidéo à un article

1. Ouvrir l'article dans Sanity Studio
2. Faire défiler jusqu'au champ "Vidéo (optionnel)"
3. Remplir les champs:
   - **URL de la vidéo**: L'URL complète de la vidéo
   - **Plateforme**: Sélectionner YouTube, Vimeo ou Lien direct
   - **Miniature personnalisée** (optionnel): Image affichée avant la lecture

### Exemples d'URLs

**YouTube**:

```
https://www.youtube.com/watch?v=VIDEO_ID
https://youtu.be/VIDEO_ID
```

**Vimeo**:

```
https://vimeo.com/VIDEO_ID
```

**Lien direct (MP4)**:

```
https://example.com/videos/my-video.mp4
```

## Comportement

### Avec vidéo

- La vidéo remplace l'image principale
- Une miniature est affichée avec un bouton play
- Clic sur le bouton → lecture de la vidéo
- Pour YouTube/Vimeo: iframe embed
- Pour lien direct: lecteur HTML5 natif

### Sans vidéo

- L'image principale est affichée normalement
- Comportement identique à avant

## Miniature

### Miniature personnalisée

Si fournie, elle est utilisée comme aperçu avant la lecture.

### Miniature par défaut

Si non fournie:

- Pour YouTube/Vimeo: miniature de la plateforme
- Pour lien direct: image principale de l'article

## Accessibilité

- Bouton play avec `aria-label` approprié
- Iframe avec attribut `title`
- Support des contrôles natifs du navigateur
- Respect de `prefers-reduced-motion`

## SEO

### Schema.org VideoObject

Les articles avec vidéo incluent automatiquement le schema VideoObject pour le SEO:

```json
{
  "@type": "VideoObject",
  "name": "Titre de la vidéo",
  "description": "Description",
  "thumbnailUrl": "URL de la miniature",
  "uploadDate": "Date de publication",
  "contentUrl": "URL de la vidéo"
}
```

### Open Graph

Les métadonnées Open Graph sont mises à jour pour inclure:

- `og:type`: "video.other"
- `og:video`: URL de la vidéo
- `og:video:type`: Type MIME

## Performance

### Lazy Loading

- Les vidéos ne sont chargées qu'au clic
- Miniature optimisée avec Next.js Image
- Pas d'impact sur le LCP

### Formats recommandés

**Pour liens directs**:

- Format: MP4 (H.264)
- Résolution: 1920x1080 max
- Bitrate: 5-8 Mbps
- Durée: < 5 minutes recommandé

## Exemples d'utilisation

### Article sur la récolte du cacao

```typescript
{
  title: "La récolte du cacao au Cameroun",
  video: {
    url: "https://www.youtube.com/watch?v=abc123",
    platform: "youtube",
    thumbnail: {
      url: "/images/cacao-harvest-thumb.jpg",
      alt: "Récolte du cacao"
    }
  }
}
```

### Article avec vidéo Vimeo

```typescript
{
  title: "Processus de fermentation",
  video: {
    url: "https://vimeo.com/123456789",
    platform: "vimeo"
  }
}
```

### Article avec vidéo hébergée

```typescript
{
  title: "Visite de l'usine",
  video: {
    url: "https://cdn.ste-scpb.com/videos/factory-tour.mp4",
    platform: "direct",
    thumbnail: {
      url: "/images/factory-thumb.jpg",
      alt: "Visite de l'usine"
    }
  }
}
```

## Migration

### Articles existants

- Aucune migration nécessaire
- Les articles sans vidéo continuent de fonctionner normalement
- L'image principale est toujours requise

### Ajout progressif

- Ajouter des vidéos aux nouveaux articles
- Mettre à jour les articles populaires avec des vidéos
- Pas besoin de tout migrer d'un coup

## Bonnes pratiques

1. **Toujours fournir une image principale** - Utilisée comme fallback
2. **Miniature personnalisée** - Améliore l'expérience utilisateur
3. **Durée courte** - 2-5 minutes idéal pour le B2B
4. **Sous-titres** - Ajouter des sous-titres sur YouTube/Vimeo
5. **Qualité** - 1080p minimum pour un rendu professionnel
6. **Hébergement** - Préférer YouTube/Vimeo pour la bande passante

## Dépannage

### La vidéo ne s'affiche pas

- Vérifier que l'URL est correcte
- Vérifier que la plateforme est bien sélectionnée
- Pour YouTube: vérifier que la vidéo n'est pas privée
- Pour Vimeo: vérifier les paramètres de confidentialité

### La miniature ne s'affiche pas

- Vérifier que l'image est bien uploadée dans Sanity
- Vérifier les dimensions (16:9 recommandé)
- Vérifier que l'URL de l'image est accessible

### Problèmes de lecture

- Vérifier la connexion internet
- Essayer dans un autre navigateur
- Vérifier les bloqueurs de publicité (YouTube)
- Vérifier les paramètres de confidentialité (Vimeo)

## Support technique

Pour toute question ou problème:

1. Consulter cette documentation
2. Vérifier les logs du navigateur (Console)
3. Contacter l'équipe technique

---

_Dernière mise à jour: 30 Janvier 2025_

# Guide de Déploiement - STE-SCPB Website

Ce guide détaille les étapes pour déployer le site STE-SCPB sur Vercel.

## Table des Matières

- [Prérequis](#prérequis)
- [Configuration Vercel](#configuration-vercel)
- [Variables d'Environnement](#variables-denvironnement)
- [Webhooks CMS](#webhooks-cms)
- [Domaine Personnalisé](#domaine-personnalisé)
- [Monitoring](#monitoring)
- [Rollback](#rollback)
- [Troubleshooting](#troubleshooting)

## Prérequis

### Comptes Requis

1. **Vercel** - [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket** - Pour le repository
3. **Strapi ou Sanity** - CMS headless
4. **Resend** - Service email
5. **Upstash** - Redis serverless
6. **Google reCAPTCHA** - Protection spam
7. **Mapbox** - Cartes interactives
8. **Sentry** - Error tracking

### Secrets GitHub Actions (Optionnel)

Si vous utilisez les workflows GitHub Actions :

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Token API Vercel |
| `VERCEL_ORG_ID` | ID de l'organisation Vercel |
| `VERCEL_PROJECT_ID` | ID du projet Vercel |
| `CODECOV_TOKEN` | Token Codecov (optionnel) |
| `LHCI_GITHUB_APP_TOKEN` | Token Lighthouse CI (optionnel) |
| `SLACK_WEBHOOK_URL` | Webhook Slack pour notifications (optionnel) |

## Configuration Vercel

### 1. Création du Projet

```bash
# Via CLI
npm i -g vercel
vercel login
vercel link
```

Ou via l'interface web :
1. Connectez-vous à [vercel.com](https://vercel.com)
2. Cliquez sur "Add New Project"
3. Importez votre repository
4. Configurez le projet :
   - **Framework Preset** : Next.js
   - **Root Directory** : `ste-scpb-website` (si monorepo)
   - **Build Command** : `npm run build`
   - **Output Directory** : `.next`

### 2. Configuration du Build

Le fichier `vercel.json` configure automatiquement :
- Headers de sécurité
- Redirections HTTP → HTTPS
- Redirections de locale par défaut
- Durée maximale des fonctions API
- Cache des assets statiques

## Variables d'Environnement

### Configuration dans Vercel

1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez chaque variable pour les environnements appropriés :
   - **Production** : Variables de production
   - **Preview** : Variables de staging/test
   - **Development** : Variables de développement local

### Variables Requises

```bash
# Application
NEXT_PUBLIC_SITE_URL=https://ste-scpb.com
NEXT_PUBLIC_SITE_NAME=STE-SCPB

# CMS
CMS_PROVIDER=strapi
STRAPI_URL=https://cms.ste-scpb.com
STRAPI_API_TOKEN=your_strapi_token

# Email
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@ste-scpb.com
EMAIL_CONTACT_TO=contact@ste-scpb.com
EMAIL_RFQ_TO=commercial@ste-scpb.com

# Security
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lcxxxxx
RECAPTCHA_SECRET_KEY=6Lcxxxxx
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxxxxx

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJxxxxx

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_xxxxx
SENTRY_ORG=ste-scpb
SENTRY_PROJECT=ste-scpb-website

# Analytics (optionnel)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# ISR
REVALIDATE_SECRET=your_random_secret
```

### Génération du REVALIDATE_SECRET

```bash
# Générer un secret aléatoire
openssl rand -base64 32
```

## Webhooks CMS

### Configuration Strapi

1. Dans Strapi Admin, allez dans **Settings** → **Webhooks**
2. Créez un nouveau webhook :
   - **Name** : `Vercel Revalidation`
   - **URL** : `https://ste-scpb.com/api/revalidate`
   - **Events** : `entry.create`, `entry.update`, `entry.delete`, `entry.publish`, `entry.unpublish`

3. Headers personnalisés :
```json
{
  "Content-Type": "application/json"
}
```

4. Body template :
```json
{
  "secret": "VOTRE_REVALIDATE_SECRET",
  "type": "{{ model }}",
  "slug": "{{ entry.slug }}",
  "locale": "{{ entry.locale }}"
}
```

### Configuration Sanity

1. Dans Sanity Studio, allez dans **API** → **Webhooks**
2. Créez un webhook :
   - **URL** : `https://ste-scpb.com/api/revalidate`
   - **Dataset** : `production`
   - **Trigger on** : Create, Update, Delete

3. Projection GROQ :
```groq
{
  "secret": "VOTRE_REVALIDATE_SECRET",
  "type": _type,
  "slug": slug.current
}
```

### Test du Webhook

```bash
# Test manuel
curl -X POST https://ste-scpb.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret": "VOTRE_SECRET", "type": "product"}'
```

Réponse attendue :
```json
{
  "revalidated": true,
  "paths": ["/fr/produits", "/en/produits", "/fr", "/en"],
  "tags": [],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Domaine Personnalisé

### 1. Ajout du Domaine

1. Dans Vercel, allez dans **Settings** → **Domains**
2. Ajoutez votre domaine : `ste-scpb.com`
3. Ajoutez également `www.ste-scpb.com`

### 2. Configuration DNS

Configurez les enregistrements DNS chez votre registrar :

| Type | Nom | Valeur |
|------|-----|--------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

### 3. SSL/TLS

Le certificat SSL est automatiquement provisionné par Vercel via Let's Encrypt.

### 4. Redirection www

Vercel redirige automatiquement `www.ste-scpb.com` vers `ste-scpb.com`.

## Monitoring

### Sentry

1. Les erreurs sont automatiquement capturées côté client et serveur
2. Les sourcemaps sont uploadées lors du build
3. Dashboard : [sentry.io](https://sentry.io)

### Vercel Analytics

1. Activez dans **Settings** → **Analytics**
2. Métriques disponibles :
   - Core Web Vitals (LCP, FID, CLS)
   - Temps de réponse des fonctions
   - Trafic et géolocalisation

### Upstash

1. Dashboard : [console.upstash.com](https://console.upstash.com)
2. Métriques de rate limiting disponibles

## Rollback

### Via Vercel Dashboard

1. Allez dans **Deployments**
2. Trouvez le déploiement précédent stable
3. Cliquez sur **...** → **Promote to Production**

### Via CLI

```bash
# Lister les déploiements
vercel ls

# Promouvoir un déploiement spécifique
vercel promote <deployment-url>
```

## Troubleshooting

### Build Failures

**Erreur : Missing environment variables**
```
Solution : Vérifiez que toutes les variables sont configurées dans Vercel
```

**Erreur : TypeScript errors**
```bash
# Vérifier localement
npm run typecheck
```

### Runtime Errors

**Erreur 500 sur les API routes**
1. Vérifiez les logs dans Vercel Dashboard → **Functions**
2. Vérifiez les variables d'environnement
3. Testez localement avec `vercel dev`

**Erreur de rate limiting**
1. Vérifiez la connexion Upstash
2. Vérifiez les tokens dans les variables d'environnement

### ISR Issues

**Pages non mises à jour**
1. Vérifiez que le webhook CMS est configuré
2. Testez manuellement l'endpoint `/api/revalidate`
3. Vérifiez les logs de la fonction

**Erreur de revalidation**
```bash
# Forcer la revalidation
curl -X POST https://ste-scpb.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret": "xxx", "type": "all"}'
```

### Performance Issues

**LCP élevé**
1. Vérifiez les images (format WebP, taille optimisée)
2. Vérifiez le chargement des fonts
3. Optimisez le CSS critique

**CLS élevé**
1. Ajoutez des dimensions aux images
2. Réservez l'espace pour les éléments dynamiques

### Support

- **Vercel** : [vercel.com/support](https://vercel.com/support)
- **Documentation Next.js** : [nextjs.org/docs](https://nextjs.org/docs)
- **Sentry** : [docs.sentry.io](https://docs.sentry.io)

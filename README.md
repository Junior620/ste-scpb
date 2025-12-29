# STE-SCPB Website

Site web de la société STE-SCPB - Commerce de produits agricoles et matières premières du Cameroun.

Concept visuel "Constellations des Commodities" - Une expérience immersive 3D où chaque produit est représenté comme une constellation spatiale.

## Table des Matières

- [Stack Technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Développement](#développement)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [Architecture](#architecture)
- [Sécurité](#sécurité)
- [Internationalisation](#internationalisation)
- [Performance](#performance)
- [Licence](#licence)

## Stack Technique

| Catégorie | Technologie |
|-----------|-------------|
| **Framework** | Next.js 16+ (App Router) |
| **Language** | TypeScript 5+ |
| **Styling** | Tailwind CSS 4 |
| **3D** | React Three Fiber, Three.js, @react-three/drei |
| **Animations** | GSAP + ScrollTrigger |
| **CMS** | Strapi (self-hosted) ou Sanity (cloud) |
| **Email** | Resend |
| **Maps** | Mapbox GL JS via react-map-gl |
| **Analytics** | Google Analytics 4 / Plausible |
| **Error Tracking** | Sentry |
| **Rate Limiting** | Upstash Redis |
| **Testing** | Vitest (unit), Playwright (E2E), fast-check (property) |

## Prérequis

- **Node.js** 18.17+ (LTS recommandé)
- **npm** 9+ ou **pnpm** 8+
- **Git**

### Services Externes Requis

| Service | Usage | Lien |
|---------|-------|------|
| Strapi ou Sanity | CMS headless | [strapi.io](https://strapi.io) / [sanity.io](https://sanity.io) |
| Resend | Envoi d'emails | [resend.com](https://resend.com) |
| Upstash | Rate limiting Redis | [upstash.com](https://upstash.com) |
| Google reCAPTCHA v3 | Protection spam | [google.com/recaptcha](https://www.google.com/recaptcha) |
| Mapbox | Cartes interactives | [mapbox.com](https://www.mapbox.com) |
| Sentry | Error tracking | [sentry.io](https://sentry.io) |

## Installation

```bash
# 1. Cloner le repository
git clone <repository-url>
cd ste-scpb-website

# 2. Installer les dépendances
npm install

# 3. Copier le fichier d'environnement
cp .env.example .env.local

# 4. Configurer les variables d'environnement (voir section Configuration)

# 5. Lancer le serveur de développement
npm run dev
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000).

## Configuration

### Variables d'Environnement

Copiez `.env.example` vers `.env.local` et configurez les variables suivantes :

#### Application

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `NEXT_PUBLIC_SITE_URL` | URL publique du site | ✅ | `https://ste-scpb.com` |
| `NEXT_PUBLIC_SITE_NAME` | Nom du site | ✅ | `STE-SCPB` |

#### CMS (Strapi)

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `CMS_PROVIDER` | Provider CMS | ✅ | `strapi` ou `sanity` |
| `STRAPI_URL` | URL de l'API Strapi | Si Strapi | `https://cms.ste-scpb.com` |
| `STRAPI_API_TOKEN` | Token API Strapi (read-only) | Si Strapi | `abc123...` |
| `CMS_CACHE_TTL` | Durée cache en secondes | ❌ | `3600` (défaut) |

#### CMS (Sanity - Alternative)

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `SANITY_PROJECT_ID` | ID du projet Sanity | Si Sanity | `abc123` |
| `SANITY_DATASET` | Dataset Sanity | Si Sanity | `production` |
| `SANITY_API_TOKEN` | Token API Sanity | Si Sanity | `sk...` |

#### Email (Resend)

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `RESEND_API_KEY` | Clé API Resend | ✅ | `re_abc123...` |
| `EMAIL_FROM` | Adresse email expéditeur | ✅ | `noreply@ste-scpb.com` |
| `EMAIL_CONTACT_TO` | Email destination contact | ✅ | `contact@ste-scpb.com` |
| `EMAIL_RFQ_TO` | Email destination devis | ✅ | `commercial@ste-scpb.com` |

#### reCAPTCHA v3

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Clé site reCAPTCHA | ✅ | `6Lc...` |
| `RECAPTCHA_SECRET_KEY` | Clé secrète reCAPTCHA | ✅ | `6Lc...` |
| `RECAPTCHA_SCORE_THRESHOLD` | Seuil de score (0.0-1.0) | ❌ | `0.5` (défaut) |

#### Rate Limiting (Upstash Redis)

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `UPSTASH_REDIS_REST_URL` | URL REST Upstash | ✅ | `https://xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Token Upstash | ✅ | `AXxx...` |

#### Maps (Mapbox)

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Token public Mapbox | ✅ | `pk.eyJ1...` |

#### Analytics

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | ID Google Analytics 4 | ❌ | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Domaine Plausible | ❌ | `ste-scpb.com` |

#### Error Tracking (Sentry)

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `NEXT_PUBLIC_SENTRY_DSN` | DSN Sentry (client) | ✅ | `https://xxx@sentry.io/123` |
| `SENTRY_DSN` | DSN Sentry (server) | ✅ | `https://xxx@sentry.io/123` |
| `SENTRY_AUTH_TOKEN` | Token auth Sentry | Pour sourcemaps | `sntrys_...` |
| `SENTRY_ORG` | Organisation Sentry | Pour sourcemaps | `ste-scpb` |
| `SENTRY_PROJECT` | Projet Sentry | Pour sourcemaps | `ste-scpb-website` |

#### ISR Revalidation

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `REVALIDATE_SECRET` | Secret pour webhooks CMS | ✅ | `random-secret-string` |

## Développement

### Scripts Disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Lance le serveur de développement (hot reload) |
| `npm run build` | Build de production |
| `npm run start` | Lance le serveur de production |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm run lint:fix` | Corrige automatiquement les erreurs ESLint |
| `npm run format` | Formate le code avec Prettier |
| `npm run format:check` | Vérifie le formatage |
| `npm run typecheck` | Vérifie les types TypeScript |

### Conventions de Code

- **Commits** : Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)
- **Branches** : `feature/xxx`, `fix/xxx`, `docs/xxx`
- **Code Style** : ESLint + Prettier (appliqué automatiquement via Husky pre-commit)

### Structure des Fichiers

```
src/
├── app/                    # Next.js App Router (pages et API routes)
├── components/             # Composants React
│   ├── 3d/                # Composants Three.js (Scene, Starfield, Constellation)
│   ├── sections/          # Sections de page (Hero, ValueChain, etc.)
│   ├── ui/                # Composants UI réutilisables (Button, Input, etc.)
│   ├── forms/             # Formulaires (Contact, RFQ, Newsletter)
│   └── providers/         # Context providers (Analytics)
├── domain/                 # Couche domaine (DDD)
│   ├── entities/          # Entités métier (Product, Article, etc.)
│   ├── value-objects/     # Objets valeur (Email, Phone, Incoterm)
│   └── services/          # Services domaine
├── application/            # Couche application (CQRS - formulaires uniquement)
│   ├── commands/          # Commandes (mutations)
│   ├── queries/           # Requêtes (lectures)
│   └── handlers/          # Handlers
├── infrastructure/         # Couche infrastructure
│   ├── cms/               # Client CMS (Strapi/Sanity)
│   ├── email/             # Service email (Resend)
│   ├── analytics/         # Analytics (GA4/Plausible)
│   ├── rate-limiter/      # Rate limiting (Upstash)
│   ├── captcha/           # reCAPTCHA v3
│   └── monitoring/        # Sentry
├── lib/                    # Utilitaires (validation, schema, security)
├── hooks/                  # Hooks React personnalisés
├── i18n/                   # Internationalisation (next-intl)
│   └── messages/          # Fichiers de traduction (fr.json, en.json)
└── types/                  # Types TypeScript partagés
```

## Tests

### Tests Unitaires (Vitest)

```bash
# Exécuter tous les tests
npm run test

# Mode watch
npm run test:watch

# Avec couverture
npm run test:coverage
```

### Tests E2E (Playwright)

```bash
# Exécuter tous les tests E2E
npm run test:e2e

# Interface UI
npm run test:e2e:ui

# Mode headed (voir le navigateur)
npm run test:e2e:headed

# Chromium uniquement
npm run test:e2e:chromium

# Voir le rapport
npm run test:e2e:report
```

### Tests de Performance (Lighthouse)

```bash
# Audit manuel
npm run lighthouse

# CI (avec Lighthouse CI)
npm run lighthouse:ci
```

## Déploiement

### Vercel (Recommandé)

#### 1. Connexion du Repository

1. Connectez-vous à [vercel.com](https://vercel.com)
2. Cliquez sur "Add New Project"
3. Importez votre repository GitHub/GitLab/Bitbucket
4. Sélectionnez le dossier `ste-scpb-website` comme root directory

#### 2. Configuration des Variables d'Environnement

Dans Vercel Dashboard → Settings → Environment Variables, ajoutez toutes les variables de `.env.example` :

**Variables obligatoires pour la production :**

```
NEXT_PUBLIC_SITE_URL=https://votre-domaine.com
NEXT_PUBLIC_SITE_NAME=STE-SCPB
CMS_PROVIDER=strapi
STRAPI_URL=https://votre-cms.com
STRAPI_API_TOKEN=xxx
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@ste-scpb.com
EMAIL_CONTACT_TO=contact@ste-scpb.com
EMAIL_RFQ_TO=commercial@ste-scpb.com
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=xxx
RECAPTCHA_SECRET_KEY=xxx
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_DSN=https://xxx@sentry.io/xxx
REVALIDATE_SECRET=xxx
```

#### 3. Configuration du Build

Vercel détecte automatiquement Next.js. Vérifiez les paramètres :

- **Framework Preset** : Next.js
- **Build Command** : `npm run build`
- **Output Directory** : `.next`
- **Install Command** : `npm install`

#### 4. Déploiement Automatique

- **Production** : Chaque push sur `main` déclenche un déploiement
- **Preview** : Chaque PR crée un environnement de preview

### Webhooks CMS pour Revalidation

Configurez un webhook dans votre CMS pour déclencher la revalidation ISR :

**URL du webhook :**
```
POST https://votre-domaine.com/api/revalidate
```

**Body :**
```json
{
  "secret": "VOTRE_REVALIDATE_SECRET",
  "path": "/fr/produits"
}
```

**Événements à configurer :**
- `entry.create` → Revalider la page de liste
- `entry.update` → Revalider la page de détail et la liste
- `entry.delete` → Revalider la page de liste

### Domaine Personnalisé

1. Dans Vercel Dashboard → Settings → Domains
2. Ajoutez votre domaine (ex: `ste-scpb.com`)
3. Configurez les DNS selon les instructions Vercel
4. Le certificat SSL est automatiquement provisionné

## Architecture

### Architecture Hexagonale (Clean Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Pages     │  │ Components  │  │   3D Scene  │              │
│  │  (App Router)│  │    (UI)     │  │  (R3F/Three)│              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Use Cases  │  │   Commands  │  │   Queries   │              │
│  │             │  │   (CQRS)    │  │ (Read/CMS)  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DOMAIN LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Entities   │  │Value Objects│  │  Domain     │              │
│  │  (Product,  │  │ (Email,     │  │  Services   │              │
│  │   Contact)  │  │  Incoterm)  │  │             │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │    CMS      │  │   Email     │  │  Analytics  │              │
│  │  (Strapi/   │  │  (Resend)   │  │ (GA4/       │              │
│  │   Sanity)   │  │             │  │  Plausible) │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

### CQRS (Command Query Responsibility Segregation)

CQRS est appliqué uniquement sur les formulaires (mutations) :

- `SubmitContactCommand` → ContactCommandHandler
- `SubmitRFQCommand` → RFQCommandHandler
- `SubscribeNewsletterCommand` → NewsletterCommandHandler

Les queries CMS restent simples (fetch direct via CMSClient).

## Sécurité

### HTTPS Enforcement

- **HSTS Header** : `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- **Vercel** : Redirection automatique HTTP → HTTPS
- **vercel.json** : Configuration de redirection explicite

### Security Headers

| Header | Valeur | Description |
|--------|--------|-------------|
| `X-Frame-Options` | `DENY` | Prévient le clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prévient le MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Contrôle les informations referrer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Restreint les fonctionnalités |
| `X-XSS-Protection` | `1; mode=block` | Protection XSS (legacy) |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS |

### Content Security Policy (CSP)

- Mode `report-only` en développement
- Mode `enforce` en production
- Whitelist pour : Google reCAPTCHA, Mapbox, Analytics, CMS, Sentry

### Rate Limiting

| Formulaire | Limite |
|------------|--------|
| Contact | 5 requêtes/heure/IP |
| Devis (RFQ) | 10 requêtes/heure/IP |
| Newsletter | 3 requêtes/heure/IP |

### reCAPTCHA v3

Tous les formulaires sont protégés avec un seuil de score de 0.5.

## Internationalisation

### Langues Supportées

- 🇫🇷 Français (défaut) - `/fr/...`
- 🇬🇧 Anglais - `/en/...`

### Fichiers de Traduction

```
src/i18n/messages/
├── fr.json    # Traductions françaises
└── en.json    # Traductions anglaises
```

### Ajouter une Traduction

1. Ajoutez la clé dans `fr.json` et `en.json`
2. Utilisez `useTranslations('namespace')` dans le composant
3. Appelez `t('key')` pour afficher la traduction

## Performance

### Objectifs Lighthouse

| Métrique | Desktop | Mobile |
|----------|---------|--------|
| Performance | ≥ 80 | ≥ 70 |
| Accessibility | ≥ 90 | ≥ 90 |
| Best Practices | ≥ 90 | ≥ 90 |
| SEO | ≥ 90 | ≥ 90 |

### Core Web Vitals

| Métrique | Objectif |
|----------|----------|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |

### Optimisations 3D

Le système adapte automatiquement la qualité 3D selon les performances :

| Mode | Particules | Bloom | DOF | FPS Max |
|------|------------|-------|-----|---------|
| HIGH | 5000 | ✅ | ✅ | 60 |
| MEDIUM | 3000 | ✅ | ❌ | 60 |
| LOW | 2000 | ❌ | ❌ | 30 |

- **Mobile** : Mode MEDIUM par défaut
- **prefers-reduced-motion** : Mode LOW automatique
- **FPS < 30** : Downgrade automatique

## Licence

Propriétaire - STE-SCPB © 2024

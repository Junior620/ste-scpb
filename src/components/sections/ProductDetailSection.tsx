'use client';

/**
 * Product Detail Section Component
 * Validates: Requirements 2.3, 4.1, 4.2, 4.4, 4.5
 *
 * Displays detailed product information with:
 * - High-quality images with next/image
 * - Product details (name, description, origin, certifications, etc.)
 * - Technical specifications for B2B
 * - Contact commercial CTA
 * - Sample request modal
 * - Related products
 */

import { useState, Suspense, type JSX } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import type { Product, ProductCategory } from '@/domain/entities/Product';
import type { Locale } from '@/domain/value-objects/Locale';
import {
  Scene3DWrapper,
  Starfield,
  Constellation,
  PostProcessing,
  StaticHeroFallback,
} from '@/components/3d';
import { usePerformanceMode } from '@/hooks/usePerformanceMode';
import { PRODUCT_CONSTELLATIONS, PRODUCT_COLORS } from '@/lib/scene-presets';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button, BackButton } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { SampleRequestForm } from '@/components/forms/SampleRequestForm';

export interface ProductDetailSectionProps {
  product: Product;
  relatedProducts: Product[];
  similarProducts: Product[];
  locale: Locale;
}

/**
 * Default product descriptions for B2B when CMS data is missing
 */
const DEFAULT_DESCRIPTIONS: Record<ProductCategory, { fr: string; en: string; ru: string }> = {
  cacao: {
    fr: 'Fèves de cacao fin du Cameroun, issues des terroirs du Centre et du Sud. Fermentation maîtrisée (6-7 jours), séchage naturel, tri rigoureux. Profil aromatique fruité et équilibré, idéal pour chocolatiers et industriels exigeants.',
    en: 'Fine cocoa beans from Cameroon, sourced from Central and Southern terroirs. Controlled fermentation (6-7 days), natural drying, rigorous sorting. Fruity and balanced aromatic profile, ideal for demanding chocolatiers and manufacturers.',
    ru: 'Отборные какао-бобы из Камеруна, происходящие из терруаров Центрального и Южного регионов. Контролируемая ферментация (6-7 дней), естественная сушка, строгая сортировка. Фруктовый и сбалансированный ароматический профиль, идеально для требовательных шоколатье и производителей.',
  },
  cafe: {
    fr: "Café Arabica et Robusta du Cameroun, cultivé en altitude dans les hauts plateaux de l'Ouest. Récolte sélective, traitement humide ou naturel selon les lots. Grade export A, profil aromatique complexe avec notes de fruits et de chocolat.",
    en: 'Arabica and Robusta coffee from Cameroon, grown at altitude in the Western highlands. Selective harvesting, wet or natural processing depending on lots. Export grade A, complex aromatic profile with fruit and chocolate notes.',
    ru: 'Кофе Арабика и Робуста из Камеруна, выращенный на высоте в западных нагорьях. Селективный сбор, влажная или натуральная обработка в зависимости от партий. Экспортный сорт A, сложный ароматический профиль с нотами фруктов и шоколада.',
  },
  bois: {
    fr: "Bois tropicaux d'essences légales, conformes à la réglementation FLEGT. Traçabilité complète de la forêt à l'export. Essences disponibles : Ayous, Sapelli, Iroko, Padouk. Documentation forestière et certificats d'origine fournis.",
    en: 'Legal tropical wood species, FLEGT compliant. Full traceability from forest to export. Available species: Ayous, Sapelli, Iroko, Padouk. Forestry documentation and certificates of origin provided.',
    ru: 'Легальные тропические породы древесины, соответствующие требованиям FLEGT. Полная прослеживаемость от леса до экспорта. Доступные породы: Айоус, Сапелли, Ироко, Падук. Предоставляется лесная документация и сертификаты происхождения.',
  },
  mais: {
    fr: "Maïs grade alimentaire du Cameroun, séché et trié mécaniquement. Taux d'humidité contrôlé (≤14%), calibrage homogène. Adapté à l'alimentation humaine et animale. Conditionnement en sacs ou vrac conteneur.",
    en: 'Food-grade corn from Cameroon, mechanically dried and sorted. Controlled moisture content (≤14%), uniform calibration. Suitable for human and animal consumption. Packaging in bags or bulk container.',
    ru: 'Пищевая кукуруза из Камеруна, механически высушенная и отсортированная. Контролируемое содержание влаги (≤14%), однородная калибровка. Подходит для питания людей и животных. Упаковка в мешках или насыпью в контейнере.',
  },
  hevea: {
    fr: 'Latex et caoutchouc naturel du Cameroun, grade industriel. Spécifications techniques sur demande. Adapté aux applications industrielles : pneumatiques, joints, revêtements. Livraison en balles ou conteneurs.',
    en: 'Natural latex and rubber from Cameroon, industrial grade. Technical specifications on request. Suitable for industrial applications: tires, seals, coatings. Delivery in bales or containers.',
    ru: 'Натуральный латекс и каучук из Камеруна, промышленный сорт. Технические спецификации по запросу. Подходит для промышленных применений: шины, уплотнители, покрытия. Доставка в тюках или контейнерах.',
  },
  sesame: {
    fr: "Sésame décortiqué du Cameroun, pureté 99%+. Graines blanches ou naturelles selon les lots. Qualité export pour l'industrie alimentaire : huile, tahini, boulangerie. Conditionnement adapté à l'export.",
    en: 'Hulled sesame from Cameroon, 99%+ purity. White or natural seeds depending on lots. Export quality for food industry: oil, tahini, bakery. Export-adapted packaging.',
    ru: 'Очищенный кунжут из Камеруна, чистота 99%+. Белые или натуральные семена в зависимости от партий. Экспортное качество для пищевой промышленности: масло, тахини, выпечка. Упаковка, адаптированная для экспорта.',
  },
  cajou: {
    fr: "Noix de cajou décortiquées, calibre W320/W240. Qualité export premium, tri manuel. Idéal pour le snacking, la pâtisserie et l'industrie alimentaire. Conditionnement sous vide ou cartons.",
    en: 'Shelled cashew nuts, W320/W240 grade. Premium export quality, hand-sorted. Ideal for snacking, pastry and food industry. Vacuum or carton packaging.',
    ru: 'Очищенные орехи кешью, калибр W320/W240. Премиальное экспортное качество, ручная сортировка. Идеально для снеков, кондитерских изделий и пищевой промышленности. Вакуумная упаковка или картонные коробки.',
  },
  soja: {
    fr: "Soja non-OGM (selon lots), haute teneur en protéines. Certificat de conformité disponible. Adapté à l'alimentation animale et à la transformation industrielle. Livraison en vrac ou sacs.",
    en: 'Non-GMO soy (per batch), high protein content. Certificate of conformity available. Suitable for animal feed and industrial processing. Bulk or bag delivery.',
    ru: 'Соя без ГМО (в зависимости от партий), высокое содержание белка. Доступен сертификат соответствия. Подходит для кормов для животных и промышленной переработки. Доставка насыпью или в мешках.',
  },
  amandes: {
    fr: "Amandes de qualité premium, calibrées et triées. Origine contrôlée, traçabilité garantie. Pour l'industrie alimentaire, la pâtisserie et le snacking.",
    en: 'Premium quality almonds, calibrated and sorted. Controlled origin, guaranteed traceability. For food industry, pastry and snacking.',
    ru: 'Миндаль премиального качества, откалиброванный и отсортированный. Контролируемое происхождение, гарантированная прослеживаемость. Для пищевой промышленности, кондитерских изделий и снеков.',
  },
  sorgho: {
    fr: "Sorgho grade alimentaire, séché et calibré. Adapté à l'alimentation humaine et animale. Taux d'humidité contrôlé, conditionnement export.",
    en: 'Food-grade sorghum, dried and calibrated. Suitable for human and animal consumption. Controlled moisture content, export packaging.',
    ru: 'Пищевое сорго, высушенное и откалиброванное. Подходит для питания людей и животных. Контролируемое содержание влаги, экспортная упаковка.',
  },
};

/**
 * Technical specs by category for B2B
 */
const TECHNICAL_SPECS: Record<
  ProductCategory,
  Array<{ key: string; value: { fr: string; en: string; ru: string }; icon: string }>
> = {
  cacao: [
    { key: 'humidity', value: { fr: '7-8%', en: '7-8%', ru: '7-8%' }, icon: 'droplet' },
    { key: 'fatContent', value: { fr: '52-56%', en: '52-56%', ru: '52-56%' }, icon: 'flask' },
    {
      key: 'fermentation',
      value: { fr: '6-7 jours', en: '6-7 days', ru: '6-7 дней' },
      icon: 'clock',
    },
    {
      key: 'grade',
      value: { fr: 'Grade I / II', en: 'Grade I / II', ru: 'Grade I / II' },
      icon: 'award',
    },
    {
      key: 'standard',
      value: { fr: 'ICCO / ISO 2451', en: 'ICCO / ISO 2451', ru: 'ICCO / ISO 2451' },
      icon: 'check',
    },
  ],
  cafe: [
    {
      key: 'varieties',
      value: { fr: 'Arabica / Robusta', en: 'Arabica / Robusta', ru: 'Arabica / Robusta' },
      icon: 'coffee',
    },
    {
      key: 'altitude',
      value: { fr: '1000-2000m', en: '1000-2000m', ru: '1000-2000м' },
      icon: 'mountain',
    },
    { key: 'humidity', value: { fr: '11-12%', en: '11-12%', ru: '11-12%' }, icon: 'droplet' },
    {
      key: 'grade',
      value: { fr: 'Grade A export', en: 'Grade A export', ru: 'Grade A export' },
      icon: 'award',
    },
    {
      key: 'process',
      value: { fr: 'Lavé / Naturel', en: 'Washed / Natural', ru: 'Влажная / Натуральная' },
      icon: 'settings',
    },
  ],
  bois: [
    {
      key: 'species',
      value: {
        fr: 'Ayous, Sapelli, Iroko',
        en: 'Ayous, Sapelli, Iroko',
        ru: 'Ayous, Sapelli, Iroko',
      },
      icon: 'tree',
    },
    {
      key: 'compliance',
      value: { fr: 'FLEGT / CITES', en: 'FLEGT / CITES', ru: 'FLEGT / CITES' },
      icon: 'shield',
    },
    { key: 'humidity', value: { fr: '12-18%', en: '12-18%', ru: '12-18%' }, icon: 'droplet' },
    {
      key: 'format',
      value: { fr: 'Grumes / Sciages', en: 'Logs / Sawn', ru: 'Брёвна / Пиломатериалы' },
      icon: 'box',
    },
    {
      key: 'docs',
      value: { fr: 'Certificat origine', en: 'Origin certificate', ru: 'Сертификат происхождения' },
      icon: 'file',
    },
  ],
  mais: [
    {
      key: 'grade',
      value: { fr: 'Grade alimentaire', en: 'Food grade', ru: 'Пищевой сорт' },
      icon: 'award',
    },
    { key: 'humidity', value: { fr: '≤14%', en: '≤14%', ru: '≤14%' }, icon: 'droplet' },
    { key: 'impurities', value: { fr: '<2%', en: '<2%', ru: '<2%' }, icon: 'filter' },
    {
      key: 'packaging',
      value: { fr: 'Sacs 50kg / Vrac', en: 'Bags 50kg / Bulk', ru: 'Мешки 50кг / Насыпью' },
      icon: 'box',
    },
    {
      key: 'use',
      value: { fr: 'Humain / Animal', en: 'Human / Animal', ru: 'Люди / Животные' },
      icon: 'users',
    },
  ],
  hevea: [
    {
      key: 'type',
      value: { fr: 'Latex / Caoutchouc', en: 'Latex / Rubber', ru: 'Латекс / Каучук' },
      icon: 'circle',
    },
    {
      key: 'grade',
      value: { fr: 'Grade industriel', en: 'Industrial grade', ru: 'Промышленный сорт' },
      icon: 'award',
    },
    { key: 'drc', value: { fr: 'DRC 60%+', en: 'DRC 60%+', ru: 'DRC 60%+' }, icon: 'percent' },
    {
      key: 'packaging',
      value: { fr: 'Balles / Conteneurs', en: 'Bales / Containers', ru: 'Тюки / Контейнеры' },
      icon: 'box',
    },
    {
      key: 'specs',
      value: { fr: 'Sur demande', en: 'On request', ru: 'По запросу' },
      icon: 'file',
    },
  ],
  sesame: [
    { key: 'purity', value: { fr: '99%+', en: '99%+', ru: '99%+' }, icon: 'check' },
    {
      key: 'type',
      value: { fr: 'Blanc / Naturel', en: 'White / Natural', ru: 'Белый / Натуральный' },
      icon: 'circle',
    },
    { key: 'humidity', value: { fr: '≤6%', en: '≤6%', ru: '≤6%' }, icon: 'droplet' },
    { key: 'oil', value: { fr: '48-52%', en: '48-52%', ru: '48-52%' }, icon: 'flask' },
    {
      key: 'packaging',
      value: { fr: 'Sacs 25/50kg', en: 'Bags 25/50kg', ru: 'Мешки 25/50кг' },
      icon: 'box',
    },
  ],
  cajou: [
    {
      key: 'grade',
      value: { fr: 'W320 / W240', en: 'W320 / W240', ru: 'W320 / W240' },
      icon: 'award',
    },
    { key: 'humidity', value: { fr: '≤5%', en: '≤5%', ru: '≤5%' }, icon: 'droplet' },
    { key: 'broken', value: { fr: '<5%', en: '<5%', ru: '<5%' }, icon: 'filter' },
    {
      key: 'packaging',
      value: { fr: 'Cartons / Vide', en: 'Cartons / Vacuum', ru: 'Коробки / Вакуум' },
      icon: 'box',
    },
    { key: 'shelf', value: { fr: '12 mois', en: '12 months', ru: '12 месяцев' }, icon: 'calendar' },
  ],
  soja: [
    { key: 'protein', value: { fr: '36-40%', en: '36-40%', ru: '36-40%' }, icon: 'flask' },
    {
      key: 'ogm',
      value: { fr: 'Non-OGM (selon lots)', en: 'Non-GMO (per batch)', ru: 'Без ГМО (по партиям)' },
      icon: 'leaf',
    },
    { key: 'humidity', value: { fr: '≤13%', en: '≤13%', ru: '≤13%' }, icon: 'droplet' },
    { key: 'impurities', value: { fr: '<2%', en: '<2%', ru: '<2%' }, icon: 'filter' },
    {
      key: 'packaging',
      value: { fr: 'Sacs / Vrac', en: 'Bags / Bulk', ru: 'Мешки / Насыпью' },
      icon: 'box',
    },
  ],
  amandes: [
    { key: 'grade', value: { fr: 'Premium', en: 'Premium', ru: 'Premium' }, icon: 'award' },
    { key: 'humidity', value: { fr: '≤6%', en: '≤6%', ru: '≤6%' }, icon: 'droplet' },
    {
      key: 'caliber',
      value: { fr: 'Calibré', en: 'Calibrated', ru: 'Откалиброванный' },
      icon: 'ruler',
    },
    {
      key: 'packaging',
      value: { fr: 'Cartons / Vrac', en: 'Cartons / Bulk', ru: 'Коробки / Насыпью' },
      icon: 'box',
    },
    { key: 'shelf', value: { fr: '12 mois', en: '12 months', ru: '12 месяцев' }, icon: 'calendar' },
  ],
  sorgho: [
    {
      key: 'grade',
      value: { fr: 'Grade alimentaire', en: 'Food grade', ru: 'Пищевой сорт' },
      icon: 'award',
    },
    { key: 'humidity', value: { fr: '≤13%', en: '≤13%', ru: '≤13%' }, icon: 'droplet' },
    { key: 'impurities', value: { fr: '<2%', en: '<2%', ru: '<2%' }, icon: 'filter' },
    {
      key: 'packaging',
      value: { fr: 'Sacs 50kg / Vrac', en: 'Bags 50kg / Bulk', ru: 'Мешки 50кг / Насыпью' },
      icon: 'box',
    },
    {
      key: 'use',
      value: { fr: 'Humain / Animal', en: 'Human / Animal', ru: 'Люди / Животные' },
      icon: 'users',
    },
  ],
};

/**
 * Packaging options by category
 */
const PACKAGING_OPTIONS: Record<ProductCategory, Array<{ fr: string; en: string; ru: string }>> = {
  cacao: [
    {
      fr: 'Sacs jute + liner PE (60-70kg)',
      en: 'Jute bags + PE liner (60-70kg)',
      ru: 'Джутовые мешки + PE-вкладыш (60-70кг)',
    },
    { fr: 'Big bags (1T)', en: 'Big bags (1T)', ru: 'Биг-бэги (1т)' },
    { fr: "Conteneur 20' (18-20T)", en: "20' container (18-20T)", ru: "Контейнер 20' (18-20т)" },
    { fr: "Conteneur 40'", en: "40' container", ru: "Контейнер 40'" },
  ],
  cafe: [
    { fr: 'Sacs jute (60kg)', en: 'Jute bags (60kg)', ru: 'Джутовые мешки (60кг)' },
    { fr: 'Sacs GrainPro', en: 'GrainPro bags', ru: 'Мешки GrainPro' },
    { fr: "Conteneur 20' (18-20T)", en: "20' container (18-20T)", ru: "Контейнер 20' (18-20т)" },
    { fr: "Conteneur 40'", en: "40' container", ru: "Контейнер 40'" },
  ],
  bois: [
    { fr: 'Grumes', en: 'Logs', ru: 'Брёвна' },
    {
      fr: 'Sciages (planches, madriers)',
      en: 'Sawn (boards, beams)',
      ru: 'Пиломатериалы (доски, брусья)',
    },
    { fr: "Conteneur 40' / Vrac", en: "40' container / Bulk", ru: "Контейнер 40' / Насыпью" },
  ],
  mais: [
    { fr: 'Sacs PP (50kg)', en: 'PP bags (50kg)', ru: 'Мешки PP (50кг)' },
    { fr: 'Big bags (1T)', en: 'Big bags (1T)', ru: 'Биг-бэги (1т)' },
    { fr: 'Vrac conteneur', en: 'Bulk container', ru: 'Насыпью в контейнере' },
    { fr: "Conteneur 20'", en: "20' container", ru: "Контейнер 20'" },
    { fr: "Conteneur 40'", en: "40' container", ru: "Контейнер 40'" },
  ],
  hevea: [
    { fr: 'Balles (33.33kg)', en: 'Bales (33.33kg)', ru: 'Тюки (33.33кг)' },
    { fr: "Conteneur 20'", en: "20' container", ru: "Контейнер 20'" },
    { fr: "Conteneur 40'", en: "40' container", ru: "Контейнер 40'" },
  ],
  sesame: [
    { fr: 'Sacs PP (25/50kg)', en: 'PP bags (25/50kg)', ru: 'Мешки PP (25/50кг)' },
    { fr: 'Cartons', en: 'Cartons', ru: 'Коробки' },
    { fr: "Conteneur 20'", en: "20' container", ru: "Контейнер 20'" },
    { fr: "Conteneur 40'", en: "40' container", ru: "Контейнер 40'" },
  ],
  cajou: [
    { fr: 'Cartons (22.68kg)', en: 'Cartons (22.68kg)', ru: 'Коробки (22.68кг)' },
    { fr: 'Sous vide', en: 'Vacuum packed', ru: 'Вакуумная упаковка' },
    { fr: "Conteneur 20' (18T)", en: "20' container (18T)", ru: "Контейнер 20' (18т)" },
    { fr: "Conteneur 40'", en: "40' container", ru: "Контейнер 40'" },
  ],
  soja: [
    { fr: 'Sacs PP (50kg)', en: 'PP bags (50kg)', ru: 'Мешки PP (50кг)' },
    { fr: 'Big bags (1T)', en: 'Big bags (1T)', ru: 'Биг-бэги (1т)' },
    { fr: 'Vrac conteneur', en: 'Bulk container', ru: 'Насыпью в контейнере' },
    { fr: "Conteneur 20'", en: "20' container", ru: "Контейнер 20'" },
    { fr: "Conteneur 40'", en: "40' container", ru: "Контейнер 40'" },
  ],
  amandes: [
    { fr: 'Cartons (10/25kg)', en: 'Cartons (10/25kg)', ru: 'Коробки (10/25кг)' },
    { fr: 'Sous vide', en: 'Vacuum packed', ru: 'Вакуумная упаковка' },
    { fr: "Conteneur 20'", en: "20' container", ru: "Контейнер 20'" },
    { fr: "Conteneur 40'", en: "40' container", ru: "Контейнер 40'" },
  ],
  sorgho: [
    { fr: 'Sacs PP (50kg)', en: 'PP bags (50kg)', ru: 'Мешки PP (50кг)' },
    { fr: 'Big bags (1T)', en: 'Big bags (1T)', ru: 'Биг-бэги (1т)' },
    { fr: 'Vrac conteneur', en: 'Bulk container', ru: 'Насыпью в контейнере' },
    { fr: "Conteneur 20'", en: "20' container", ru: "Контейнер 20'" },
    { fr: "Conteneur 40'", en: "40' container", ru: "Контейнер 40'" },
  ],
};

/**
 * 3D Scene for product detail
 */
function ProductScene({ product }: { product: Product }) {
  const { config } = usePerformanceMode();
  const constellationConfig =
    product.constellation.nodes.length > 0
      ? product.constellation
      : PRODUCT_CONSTELLATIONS[product.category];

  return (
    <>
      <Starfield
        config={config}
        color="#ffffff"
        secondaryColor={PRODUCT_COLORS[product.category]}
        depth={30}
        parallaxIntensity={0.05}
        enableParallax={true}
      />
      <Constellation config={constellationConfig} isActive={true} />
      <PostProcessing config={config} />
      <ambientLight intensity={0.3} />
    </>
  );
}

/**
 * Image gallery component
 */
function ImageGallery({
  images,
  locale,
  productName,
}: {
  images: Product['images'];
  locale: Locale;
  productName: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Check if we have valid images
  const validImages = images.filter((img) => img.url && !img.url.includes('placeholder'));

  if (validImages.length === 0) {
    return (
      <div className="aspect-square bg-background-secondary rounded-xl flex items-center justify-center border border-border/50">
        <div className="text-center p-8">
          <svg
            className="w-16 h-16 mx-auto text-foreground-muted/50 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-foreground-muted">Image non disponible</span>
        </div>
      </div>
    );
  }

  const currentImage = validImages[selectedIndex] || validImages[0];

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-background-secondary">
        <Image
          src={currentImage.url}
          alt={currentImage.alt[locale] || productName}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {validImages.map((image, index) => {
            return (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedIndex === index
                    ? 'border-primary'
                    : 'border-transparent hover:border-border'
                }`}
                aria-label={`View image ${index + 1}`}
                aria-pressed={selectedIndex === index}
              >
                <Image
                  src={image.url}
                  alt={image.alt[locale] || `${productName} - ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Icon component for specs
 */
function SpecIcon({ name }: { name: string }) {
  const icons: Record<string, JSX.Element> = {
    droplet: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
        />
      </svg>
    ),
    flask: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
      </svg>
    ),
    clock: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    award: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        />
      </svg>
    ),
    check: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    box: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
    default: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };
  return icons[name] || icons.default;
}

/**
 * Product info section - B2B optimized
 */
function ProductInfo({ product, locale }: { product: Product; locale: Locale }) {
  const t = useTranslations('products');
  const tDetail = useTranslations('productDetail');
  const tSample = useTranslations('sampleRequest');
  const categoryColor = PRODUCT_COLORS[product.category];
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);

  // Get description from CMS or fallback to default
  const description =
    product.description[locale] || DEFAULT_DESCRIPTIONS[product.category]?.[locale] || '';

  // Get technical specs for this category
  const specs = TECHNICAL_SPECS[product.category] || [];

  // Get packaging options
  const packagingOpts = PACKAGING_OPTIONS[product.category] || [];

  return (
    <div className="space-y-8">
      {/* Category badge */}
      <span
        className="inline-block px-4 py-1.5 rounded-full text-sm font-medium text-white whitespace-nowrap"
        style={{ backgroundColor: categoryColor }}
      >
        {t(`categories.${product.category}`)}
      </span>

      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl capitalize">
        {product.name[locale]}
      </h1>

      {/* Description */}
      <p className="text-lg text-foreground-muted leading-relaxed">{description}</p>

      {/* Technical Specifications */}
      {specs.length > 0 && (
        <div className="bg-background-secondary/50 rounded-xl p-6 border border-border/50">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            {tDetail('technicalSpecs')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {specs.map((spec) => (
              <div key={spec.key} className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-background-tertiary text-primary">
                  <SpecIcon name={spec.icon} />
                </div>
                <div>
                  <p className="text-xs text-foreground-muted">{tDetail(`specs.${spec.key}`)}</p>
                  <p className="text-sm font-medium">{spec.value[locale]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Packaging Options */}
      {packagingOpts.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-foreground-muted mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            {tDetail('packaging')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {packagingOpts.map((opt, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-background-tertiary rounded-lg text-sm">
                {opt[locale]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {product.certifications.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-foreground-muted mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
            {t('details.certifications')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {product.certifications.map((cert) => (
              <span
                key={cert}
                className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium"
              >
                {cert}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Export Info */}
      <div className="bg-gradient-to-r from-primary/10 to-transparent rounded-xl p-6 border border-primary/20">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {tDetail('exportInfo')}
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground-muted">{tDetail('incoterms')}</p>
            <p className="font-medium">FOB / CIF / DAP</p>
          </div>
          <div>
            <p className="text-foreground-muted">{tDetail('ports')}</p>
            <p className="font-medium">Douala / Kribi</p>
          </div>
          <div>
            <p className="text-foreground-muted">{tDetail('destinations')}</p>
            <p className="font-medium">UE, USA, Asie, Afrique</p>
          </div>
          <div>
            <p className="text-foreground-muted">{tDetail('moq')}</p>
            <p className="font-medium">1 conteneur 20&apos;</p>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Link href="/devis" className="w-full sm:flex-1 sm:min-w-0">
          <Button variant="primary" size="lg" className="w-full glow-gold">
            {t('details.requestQuote')}
          </Button>
        </Link>
        <Button
          variant="secondary"
          size="lg"
          className="w-full sm:flex-1 sm:min-w-0"
          onClick={() => setIsSampleModalOpen(true)}
        >
          {product.category === 'bois' ? tSample('titleWood') : tSample('title')}
        </Button>
        <a
          href={`mailto:scpb@ste-scpb.com?subject=${encodeURIComponent(`Demande d'information - ${product.name[locale]}`)}`}
          className="w-full sm:flex-1 sm:min-w-0"
        >
          <Button variant="outline" size="lg" className="w-full">
            {tDetail('contactByEmail')}
          </Button>
        </a>
      </div>

      {/* Response time */}
      <p className="text-sm text-foreground-muted text-center sm:text-left">
        {tDetail('responseTime')}
      </p>

      {/* Sample Request Modal */}
      <Modal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        title={product.category === 'bois' ? tSample('titleWood') : tSample('title')}
        size="full"
        closeOnBackdropClick={false}
      >
        <SampleRequestForm
          productName={product.name[locale]}
          productSlug={product.slug}
          isWood={product.category === 'bois'}
          onSuccess={() => {
            setIsSampleModalOpen(false);
          }}
          onCancel={() => setIsSampleModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

/**
 * Related products section
 */
function RelatedProducts({ products, locale }: { products: Product[]; locale: Locale }) {
  const t = useTranslations('products');

  if (products.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t border-border">
      <h2 className="text-2xl font-bold mb-6">{t('related')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Link key={product.id} href={`/produits/${product.slug}`}>
            <Card variant="default" interactive className="h-full group">
              {product.images.length > 0 && (
                <div className="relative aspect-video overflow-hidden rounded-t-xl -mx-4 -mt-4 md:-mx-6 md:-mt-6 mb-4">
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt[locale] || product.name[locale]}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="lazy"
                  />
                </div>
              )}
              <CardHeader className="mb-2">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {product.name[locale]}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {product.description[locale]}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap"
                  style={{ backgroundColor: PRODUCT_COLORS[product.category] }}
                >
                  {t(`categories.${product.category}`)}
                </span>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * Similar products section (same category)
 * Shows products from the same category when no explicit related products exist
 */
function SimilarProducts({ products, locale }: { products: Product[]; locale: Locale }) {
  const t = useTranslations('products');

  if (products.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t border-border">
      <h2 className="text-2xl font-bold mb-6">{t('similar')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Link key={product.id} href={`/produits/${product.slug}`}>
            <Card variant="default" interactive className="h-full group">
              {product.images.length > 0 && (
                <div className="relative aspect-video overflow-hidden rounded-t-xl -mx-4 -mt-4 md:-mx-6 md:-mt-6 mb-4">
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt[locale] || product.name[locale]}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="lazy"
                  />
                </div>
              )}
              <CardHeader className="mb-2">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {product.name[locale]}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {product.description[locale]}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap"
                  style={{ backgroundColor: PRODUCT_COLORS[product.category] }}
                >
                  {t(`categories.${product.category}`)}
                </span>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * Main Product Detail Section component
 */
export function ProductDetailSection({
  product,
  relatedProducts,
  similarProducts,
  locale,
}: ProductDetailSectionProps) {
  return (
    <article className="pt-16">
      {/* 3D Header - pt-16 compensates for fixed navbar */}
      <div className="relative h-[30vh] min-h-[200px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Scene3DWrapper
            className="h-full w-full"
            fallback={<StaticHeroFallback starCount={80} />}
            camera={{ position: [0, 0, 8], fov: 60 }}
          >
            <ProductScene product={product} />
          </Scene3DWrapper>
        </div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-background/30 to-background" />

        {/* Back button - Wrapped in Suspense for useSearchParams */}
        <div className="relative z-10 container mx-auto px-4 pt-6">
          <Suspense fallback={<div className="h-10" />}>
            <BackButton />
          </Suspense>
        </div>
      </div>

      {/* Product content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image gallery */}
          <ImageGallery
            images={product.images}
            locale={locale}
            productName={product.name[locale]}
          />

          {/* Product info */}
          <ProductInfo product={product} locale={locale} />
        </div>

        {/* Related products (explicitly linked) */}
        <RelatedProducts products={relatedProducts} locale={locale} />

        {/* Similar products (same category) - shown when no related products or in addition */}
        <SimilarProducts products={similarProducts} locale={locale} />
      </div>
    </article>
  );
}

export default ProductDetailSection;

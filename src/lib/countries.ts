/**
 * List of countries for form selects
 * Sorted alphabetically with common B2B export destinations first
 */

export interface Country {
  code: string;
  name: {
    fr: string;
    en: string;
    ru: string;
  };
}

// Priority countries (common export destinations) - shown first
export const PRIORITY_COUNTRIES: Country[] = [
  { code: 'FR', name: { fr: 'France', en: 'France', ru: 'Франция' } },
  { code: 'BE', name: { fr: 'Belgique', en: 'Belgium', ru: 'Бельгия' } },
  { code: 'DE', name: { fr: 'Allemagne', en: 'Germany', ru: 'Германия' } },
  { code: 'NL', name: { fr: 'Pays-Bas', en: 'Netherlands', ru: 'Нидерланды' } },
  { code: 'CH', name: { fr: 'Suisse', en: 'Switzerland', ru: 'Швейцария' } },
  { code: 'IT', name: { fr: 'Italie', en: 'Italy', ru: 'Италия' } },
  { code: 'ES', name: { fr: 'Espagne', en: 'Spain', ru: 'Испания' } },
  { code: 'GB', name: { fr: 'Royaume-Uni', en: 'United Kingdom', ru: 'Великобритания' } },
  { code: 'US', name: { fr: 'États-Unis', en: 'United States', ru: 'США' } },
  { code: 'CN', name: { fr: 'Chine', en: 'China', ru: 'Китай' } },
];

// All countries alphabetically
export const ALL_COUNTRIES: Country[] = [
  { code: 'AF', name: { fr: 'Afghanistan', en: 'Afghanistan', ru: 'Афганистан' } },
  { code: 'ZA', name: { fr: 'Afrique du Sud', en: 'South Africa', ru: 'ЮАР' } },
  { code: 'AL', name: { fr: 'Albanie', en: 'Albania', ru: 'Албания' } },
  { code: 'DZ', name: { fr: 'Algérie', en: 'Algeria', ru: 'Алжир' } },
  { code: 'DE', name: { fr: 'Allemagne', en: 'Germany', ru: 'Германия' } },
  { code: 'AD', name: { fr: 'Andorre', en: 'Andorra', ru: 'Андорра' } },
  { code: 'AO', name: { fr: 'Angola', en: 'Angola', ru: 'Ангола' } },
  { code: 'SA', name: { fr: 'Arabie Saoudite', en: 'Saudi Arabia', ru: 'Саудовская Аравия' } },
  { code: 'AR', name: { fr: 'Argentine', en: 'Argentina', ru: 'Аргентина' } },
  { code: 'AM', name: { fr: 'Arménie', en: 'Armenia', ru: 'Армения' } },
  { code: 'AU', name: { fr: 'Australie', en: 'Australia', ru: 'Австралия' } },
  { code: 'AT', name: { fr: 'Autriche', en: 'Austria', ru: 'Австрия' } },
  { code: 'AZ', name: { fr: 'Azerbaïdjan', en: 'Azerbaijan', ru: 'Азербайджан' } },
  { code: 'BH', name: { fr: 'Bahreïn', en: 'Bahrain', ru: 'Бахрейн' } },
  { code: 'BD', name: { fr: 'Bangladesh', en: 'Bangladesh', ru: 'Бангладеш' } },
  { code: 'BE', name: { fr: 'Belgique', en: 'Belgium', ru: 'Бельгия' } },
  { code: 'BJ', name: { fr: 'Bénin', en: 'Benin', ru: 'Бенин' } },
  { code: 'BY', name: { fr: 'Biélorussie', en: 'Belarus', ru: 'Беларусь' } },
  { code: 'BO', name: { fr: 'Bolivie', en: 'Bolivia', ru: 'Боливия' } },
  {
    code: 'BA',
    name: { fr: 'Bosnie-Herzégovine', en: 'Bosnia and Herzegovina', ru: 'Босния и Герцеговина' },
  },
  { code: 'BW', name: { fr: 'Botswana', en: 'Botswana', ru: 'Ботсвана' } },
  { code: 'BR', name: { fr: 'Brésil', en: 'Brazil', ru: 'Бразилия' } },
  { code: 'BG', name: { fr: 'Bulgarie', en: 'Bulgaria', ru: 'Болгария' } },
  { code: 'BF', name: { fr: 'Burkina Faso', en: 'Burkina Faso', ru: 'Буркина-Фасо' } },
  { code: 'BI', name: { fr: 'Burundi', en: 'Burundi', ru: 'Бурунди' } },
  { code: 'KH', name: { fr: 'Cambodge', en: 'Cambodia', ru: 'Камбоджа' } },
  { code: 'CM', name: { fr: 'Cameroun', en: 'Cameroon', ru: 'Камерун' } },
  { code: 'CA', name: { fr: 'Canada', en: 'Canada', ru: 'Канада' } },
  { code: 'CV', name: { fr: 'Cap-Vert', en: 'Cape Verde', ru: 'Кабо-Верде' } },
  { code: 'CF', name: { fr: 'Centrafrique', en: 'Central African Republic', ru: 'ЦАР' } },
  { code: 'CL', name: { fr: 'Chili', en: 'Chile', ru: 'Чили' } },
  { code: 'CN', name: { fr: 'Chine', en: 'China', ru: 'Китай' } },
  { code: 'CY', name: { fr: 'Chypre', en: 'Cyprus', ru: 'Кипр' } },
  { code: 'CO', name: { fr: 'Colombie', en: 'Colombia', ru: 'Колумбия' } },
  { code: 'KM', name: { fr: 'Comores', en: 'Comoros', ru: 'Коморы' } },
  { code: 'CG', name: { fr: 'Congo', en: 'Congo', ru: 'Конго' } },
  { code: 'CD', name: { fr: 'Congo (RDC)', en: 'DR Congo', ru: 'ДР Конго' } },
  { code: 'KR', name: { fr: 'Corée du Sud', en: 'South Korea', ru: 'Южная Корея' } },
  { code: 'CR', name: { fr: 'Costa Rica', en: 'Costa Rica', ru: 'Коста-Рика' } },
  { code: 'CI', name: { fr: "Côte d'Ivoire", en: 'Ivory Coast', ru: "Кот-д'Ивуар" } },
  { code: 'HR', name: { fr: 'Croatie', en: 'Croatia', ru: 'Хорватия' } },
  { code: 'CU', name: { fr: 'Cuba', en: 'Cuba', ru: 'Куба' } },
  { code: 'DK', name: { fr: 'Danemark', en: 'Denmark', ru: 'Дания' } },
  { code: 'DJ', name: { fr: 'Djibouti', en: 'Djibouti', ru: 'Джибути' } },
  { code: 'EG', name: { fr: 'Égypte', en: 'Egypt', ru: 'Египет' } },
  { code: 'AE', name: { fr: 'Émirats Arabes Unis', en: 'United Arab Emirates', ru: 'ОАЭ' } },
  { code: 'EC', name: { fr: 'Équateur', en: 'Ecuador', ru: 'Эквадор' } },
  { code: 'ER', name: { fr: 'Érythrée', en: 'Eritrea', ru: 'Эритрея' } },
  { code: 'ES', name: { fr: 'Espagne', en: 'Spain', ru: 'Испания' } },
  { code: 'EE', name: { fr: 'Estonie', en: 'Estonia', ru: 'Эстония' } },
  { code: 'US', name: { fr: 'États-Unis', en: 'United States', ru: 'США' } },
  { code: 'ET', name: { fr: 'Éthiopie', en: 'Ethiopia', ru: 'Эфиопия' } },
  { code: 'FI', name: { fr: 'Finlande', en: 'Finland', ru: 'Финляндия' } },
  { code: 'FR', name: { fr: 'France', en: 'France', ru: 'Франция' } },
  { code: 'GA', name: { fr: 'Gabon', en: 'Gabon', ru: 'Габон' } },
  { code: 'GM', name: { fr: 'Gambie', en: 'Gambia', ru: 'Гамбия' } },
  { code: 'GE', name: { fr: 'Géorgie', en: 'Georgia', ru: 'Грузия' } },
  { code: 'GH', name: { fr: 'Ghana', en: 'Ghana', ru: 'Гана' } },
  { code: 'GR', name: { fr: 'Grèce', en: 'Greece', ru: 'Греция' } },
  { code: 'GT', name: { fr: 'Guatemala', en: 'Guatemala', ru: 'Гватемала' } },
  { code: 'GN', name: { fr: 'Guinée', en: 'Guinea', ru: 'Гвинея' } },
  {
    code: 'GQ',
    name: { fr: 'Guinée Équatoriale', en: 'Equatorial Guinea', ru: 'Экваториальная Гвинея' },
  },
  { code: 'GW', name: { fr: 'Guinée-Bissau', en: 'Guinea-Bissau', ru: 'Гвинея-Бисау' } },
  { code: 'HT', name: { fr: 'Haïti', en: 'Haiti', ru: 'Гаити' } },
  { code: 'HN', name: { fr: 'Honduras', en: 'Honduras', ru: 'Гондурас' } },
  { code: 'HK', name: { fr: 'Hong Kong', en: 'Hong Kong', ru: 'Гонконг' } },
  { code: 'HU', name: { fr: 'Hongrie', en: 'Hungary', ru: 'Венгрия' } },
  { code: 'IN', name: { fr: 'Inde', en: 'India', ru: 'Индия' } },
  { code: 'ID', name: { fr: 'Indonésie', en: 'Indonesia', ru: 'Индонезия' } },
  { code: 'IQ', name: { fr: 'Irak', en: 'Iraq', ru: 'Ирак' } },
  { code: 'IR', name: { fr: 'Iran', en: 'Iran', ru: 'Иран' } },
  { code: 'IE', name: { fr: 'Irlande', en: 'Ireland', ru: 'Ирландия' } },
  { code: 'IS', name: { fr: 'Islande', en: 'Iceland', ru: 'Исландия' } },
  { code: 'IL', name: { fr: 'Israël', en: 'Israel', ru: 'Израиль' } },
  { code: 'IT', name: { fr: 'Italie', en: 'Italy', ru: 'Италия' } },
  { code: 'JM', name: { fr: 'Jamaïque', en: 'Jamaica', ru: 'Ямайка' } },
  { code: 'JP', name: { fr: 'Japon', en: 'Japan', ru: 'Япония' } },
  { code: 'JO', name: { fr: 'Jordanie', en: 'Jordan', ru: 'Иордания' } },
  { code: 'KZ', name: { fr: 'Kazakhstan', en: 'Kazakhstan', ru: 'Казахстан' } },
  { code: 'KE', name: { fr: 'Kenya', en: 'Kenya', ru: 'Кения' } },
  { code: 'KW', name: { fr: 'Koweït', en: 'Kuwait', ru: 'Кувейт' } },
  { code: 'LA', name: { fr: 'Laos', en: 'Laos', ru: 'Лаос' } },
  { code: 'LV', name: { fr: 'Lettonie', en: 'Latvia', ru: 'Латвия' } },
  { code: 'LB', name: { fr: 'Liban', en: 'Lebanon', ru: 'Ливан' } },
  { code: 'LR', name: { fr: 'Liberia', en: 'Liberia', ru: 'Либерия' } },
  { code: 'LY', name: { fr: 'Libye', en: 'Libya', ru: 'Ливия' } },
  { code: 'LT', name: { fr: 'Lituanie', en: 'Lithuania', ru: 'Литва' } },
  { code: 'LU', name: { fr: 'Luxembourg', en: 'Luxembourg', ru: 'Люксембург' } },
  {
    code: 'MK',
    name: { fr: 'Macédoine du Nord', en: 'North Macedonia', ru: 'Северная Македония' },
  },
  { code: 'MG', name: { fr: 'Madagascar', en: 'Madagascar', ru: 'Мадагаскар' } },
  { code: 'MY', name: { fr: 'Malaisie', en: 'Malaysia', ru: 'Малайзия' } },
  { code: 'MW', name: { fr: 'Malawi', en: 'Malawi', ru: 'Малави' } },
  { code: 'ML', name: { fr: 'Mali', en: 'Mali', ru: 'Мали' } },
  { code: 'MT', name: { fr: 'Malte', en: 'Malta', ru: 'Мальта' } },
  { code: 'MA', name: { fr: 'Maroc', en: 'Morocco', ru: 'Марокко' } },
  { code: 'MU', name: { fr: 'Maurice', en: 'Mauritius', ru: 'Маврикий' } },
  { code: 'MR', name: { fr: 'Mauritanie', en: 'Mauritania', ru: 'Мавритания' } },
  { code: 'MX', name: { fr: 'Mexique', en: 'Mexico', ru: 'Мексика' } },
  { code: 'MD', name: { fr: 'Moldavie', en: 'Moldova', ru: 'Молдова' } },
  { code: 'MC', name: { fr: 'Monaco', en: 'Monaco', ru: 'Монако' } },
  { code: 'MN', name: { fr: 'Mongolie', en: 'Mongolia', ru: 'Монголия' } },
  { code: 'ME', name: { fr: 'Monténégro', en: 'Montenegro', ru: 'Черногория' } },
  { code: 'MZ', name: { fr: 'Mozambique', en: 'Mozambique', ru: 'Мозамбик' } },
  { code: 'MM', name: { fr: 'Myanmar', en: 'Myanmar', ru: 'Мьянма' } },
  { code: 'NA', name: { fr: 'Namibie', en: 'Namibia', ru: 'Намибия' } },
  { code: 'NP', name: { fr: 'Népal', en: 'Nepal', ru: 'Непал' } },
  { code: 'NI', name: { fr: 'Nicaragua', en: 'Nicaragua', ru: 'Никарагуа' } },
  { code: 'NE', name: { fr: 'Niger', en: 'Niger', ru: 'Нигер' } },
  { code: 'NG', name: { fr: 'Nigeria', en: 'Nigeria', ru: 'Нигерия' } },
  { code: 'NO', name: { fr: 'Norvège', en: 'Norway', ru: 'Норвегия' } },
  { code: 'NZ', name: { fr: 'Nouvelle-Zélande', en: 'New Zealand', ru: 'Новая Зеландия' } },
  { code: 'OM', name: { fr: 'Oman', en: 'Oman', ru: 'Оман' } },
  { code: 'UG', name: { fr: 'Ouganda', en: 'Uganda', ru: 'Уганда' } },
  { code: 'UZ', name: { fr: 'Ouzbékistan', en: 'Uzbekistan', ru: 'Узбекистан' } },
  { code: 'PK', name: { fr: 'Pakistan', en: 'Pakistan', ru: 'Пакистан' } },
  { code: 'PA', name: { fr: 'Panama', en: 'Panama', ru: 'Панама' } },
  { code: 'PY', name: { fr: 'Paraguay', en: 'Paraguay', ru: 'Парагвай' } },
  { code: 'NL', name: { fr: 'Pays-Bas', en: 'Netherlands', ru: 'Нидерланды' } },
  { code: 'PE', name: { fr: 'Pérou', en: 'Peru', ru: 'Перу' } },
  { code: 'PH', name: { fr: 'Philippines', en: 'Philippines', ru: 'Филиппины' } },
  { code: 'PL', name: { fr: 'Pologne', en: 'Poland', ru: 'Польша' } },
  { code: 'PT', name: { fr: 'Portugal', en: 'Portugal', ru: 'Португалия' } },
  { code: 'QA', name: { fr: 'Qatar', en: 'Qatar', ru: 'Катар' } },
  { code: 'RO', name: { fr: 'Roumanie', en: 'Romania', ru: 'Румыния' } },
  { code: 'GB', name: { fr: 'Royaume-Uni', en: 'United Kingdom', ru: 'Великобритания' } },
  { code: 'RU', name: { fr: 'Russie', en: 'Russia', ru: 'Россия' } },
  { code: 'RW', name: { fr: 'Rwanda', en: 'Rwanda', ru: 'Руанда' } },
  { code: 'SN', name: { fr: 'Sénégal', en: 'Senegal', ru: 'Сенегал' } },
  { code: 'RS', name: { fr: 'Serbie', en: 'Serbia', ru: 'Сербия' } },
  { code: 'SL', name: { fr: 'Sierra Leone', en: 'Sierra Leone', ru: 'Сьерра-Леоне' } },
  { code: 'SG', name: { fr: 'Singapour', en: 'Singapore', ru: 'Сингапур' } },
  { code: 'SK', name: { fr: 'Slovaquie', en: 'Slovakia', ru: 'Словакия' } },
  { code: 'SI', name: { fr: 'Slovénie', en: 'Slovenia', ru: 'Словения' } },
  { code: 'SO', name: { fr: 'Somalie', en: 'Somalia', ru: 'Сомали' } },
  { code: 'SD', name: { fr: 'Soudan', en: 'Sudan', ru: 'Судан' } },
  { code: 'SS', name: { fr: 'Soudan du Sud', en: 'South Sudan', ru: 'Южный Судан' } },
  { code: 'LK', name: { fr: 'Sri Lanka', en: 'Sri Lanka', ru: 'Шри-Ланка' } },
  { code: 'SE', name: { fr: 'Suède', en: 'Sweden', ru: 'Швеция' } },
  { code: 'CH', name: { fr: 'Suisse', en: 'Switzerland', ru: 'Швейцария' } },
  { code: 'SY', name: { fr: 'Syrie', en: 'Syria', ru: 'Сирия' } },
  { code: 'TW', name: { fr: 'Taïwan', en: 'Taiwan', ru: 'Тайвань' } },
  { code: 'TZ', name: { fr: 'Tanzanie', en: 'Tanzania', ru: 'Танзания' } },
  { code: 'TD', name: { fr: 'Tchad', en: 'Chad', ru: 'Чад' } },
  { code: 'CZ', name: { fr: 'Tchéquie', en: 'Czech Republic', ru: 'Чехия' } },
  { code: 'TH', name: { fr: 'Thaïlande', en: 'Thailand', ru: 'Таиланд' } },
  { code: 'TG', name: { fr: 'Togo', en: 'Togo', ru: 'Того' } },
  { code: 'TN', name: { fr: 'Tunisie', en: 'Tunisia', ru: 'Тунис' } },
  { code: 'TR', name: { fr: 'Turquie', en: 'Turkey', ru: 'Турция' } },
  { code: 'UA', name: { fr: 'Ukraine', en: 'Ukraine', ru: 'Украина' } },
  { code: 'UY', name: { fr: 'Uruguay', en: 'Uruguay', ru: 'Уругвай' } },
  { code: 'VE', name: { fr: 'Venezuela', en: 'Venezuela', ru: 'Венесуэла' } },
  { code: 'VN', name: { fr: 'Vietnam', en: 'Vietnam', ru: 'Вьетнам' } },
  { code: 'YE', name: { fr: 'Yémen', en: 'Yemen', ru: 'Йемен' } },
  { code: 'ZM', name: { fr: 'Zambie', en: 'Zambia', ru: 'Замбия' } },
  { code: 'ZW', name: { fr: 'Zimbabwe', en: 'Zimbabwe', ru: 'Зимбабве' } },
];

/**
 * Get country name by code and locale
 */
export function getCountryName(countryCode: string, locale: 'fr' | 'en' | 'ru' = 'fr'): string {
  const country = ALL_COUNTRIES.find((c) => c.code === countryCode);
  return country ? country.name[locale] : countryCode;
}

/**
 * Get countries for select options
 * Priority countries first, then separator, then all others
 */
export function getCountryOptions(locale: 'fr' | 'en' | 'ru' = 'fr') {
  const priorityCodes = new Set(PRIORITY_COUNTRIES.map((c) => c.code));
  const otherCountries = ALL_COUNTRIES.filter((c) => !priorityCodes.has(c.code));

  return [
    // Priority countries
    ...PRIORITY_COUNTRIES.map((c) => ({
      value: c.code,
      label: c.name[locale],
    })),
    // Separator
    { value: '__separator__', label: '──────────', disabled: true },
    // Other countries
    ...otherCountries.map((c) => ({
      value: c.code,
      label: c.name[locale],
    })),
  ];
}

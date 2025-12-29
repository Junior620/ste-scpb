// Value Objects exports
export { Result, ValidationError } from './Result';
export { Email } from './Email';
export { Phone } from './Phone';
export {
  INCOTERMS,
  INCOTERM_DESCRIPTIONS,
  isValidIncoterm,
  parseIncoterm,
  type Incoterm,
} from './Incoterm';
export {
  Quantity,
  QUANTITY_UNITS,
  isValidQuantityUnit,
  type QuantityUnit,
} from './Quantity';
export {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  isValidLocale,
  type Locale,
  type LocalizedContent,
} from './Locale';

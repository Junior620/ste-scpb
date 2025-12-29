// Domain Entities exports

// Product
export {
  PRODUCT_CATEGORIES,
  CERTIFICATIONS,
  PACKAGING_OPTIONS,
  isValidProductCategory,
  isValidCertification,
  isValidPackagingOption,
  getLocalizedProductName,
  getLocalizedProductDescription,
  type Product,
  type ProductCategory,
  type Certification,
  type PackagingOption,
  type ProductImage,
  type ProductSelection,
  type ConstellationConfig,
  type ConstellationNode,
} from './Product';

// Contact
export {
  INQUIRY_TYPES,
  CONTACT_STATUSES,
  isValidInquiryType,
  isValidContactStatus,
  type Contact,
  type ContactFormInput,
  type InquiryType,
  type ContactStatus,
} from './Contact';

// RFQ Request
export {
  RFQ_STATUSES,
  isValidRFQStatus,
  isValidDeliveryPeriod,
  createDateRange,
  type RFQRequest,
  type RFQFormInput,
  type RFQStatus,
  type DateRange,
} from './RFQRequest';

// Article
export {
  getLocalizedArticleTitle,
  getLocalizedArticleExcerpt,
  getLocalizedArticleContent,
  formatArticleDate,
  type Article,
  type ArticleListItem,
  type ArticleCategory,
  type ArticleTag,
  type ArticleAuthor,
  type ArticleImage,
} from './Article';

// Team Member
export {
  getLocalizedRole,
  getLocalizedBio,
  sortTeamMembers,
  getCEO,
  type TeamMember,
  type TeamMemberPhoto,
} from './TeamMember';

/**
 * Backend enums are serialized as their PascalCase string names (not integers).
 * Mirror them as string-literal unions plus a values array (for <select> rendering).
 * Keep these in sync with FRONTEND_PDR.md Appendix B.
 */

export type PriceType = 'Fixed' | 'Negotiable' | 'ContactForPrice';
export const PRICE_TYPES: readonly PriceType[] = ['Fixed', 'Negotiable', 'ContactForPrice'];

export type ProductCondition = 'New' | 'Used' | 'Sealed';
export const PRODUCT_CONDITIONS: readonly ProductCondition[] = ['New', 'Used', 'Sealed'];

export type ListingStatus = 'Live' | 'Unavailable' | 'Archived' | 'Removed';

export type LeadStatus = 'New' | 'Viewed' | 'Closed';

export type ReviewStatus = 'Visible' | 'Hidden' | 'Removed';

export type ReportTargetType = 'Listing' | 'Vendor' | 'Review';

export type ReportReason =
  | 'Prohibited'
  | 'Counterfeit'
  | 'Scam'
  | 'Offensive'
  | 'Spam'
  | 'WrongCategory'
  | 'Other';
export const REPORT_REASONS: readonly ReportReason[] = [
  'Prohibited',
  'Counterfeit',
  'Scam',
  'Offensive',
  'Spam',
  'WrongCategory',
  'Other',
];

export type ReportStatus = 'Open' | 'Actioned' | 'Dismissed';

export type VerificationMethod = 'Nin' | 'Cac';

export type VerificationStatus = 'Pending' | 'Verified' | 'Failed';

export type RejectionReason =
  | 'NameMismatch'
  | 'UnreadableDocument'
  | 'IneligibleBusiness'
  | 'SuspectedFraud'
  | 'Other';
export const REJECTION_REASONS: readonly RejectionReason[] = [
  'NameMismatch',
  'UnreadableDocument',
  'IneligibleBusiness',
  'SuspectedFraud',
  'Other',
];

export type NotificationType =
  | 'VendorApproved'
  | 'VendorRejected'
  | 'ListingApproved'
  | 'ListingTakenDown'
  | 'NewReview'
  | 'NewLead'
  | 'ReviewNudge'
  | 'NewInCategory'
  | 'Security'
  | 'NewVendorRequest'
  | 'NewListingForReview';

export type ProductSort = 'recent' | 'price_asc' | 'price_desc' | 'rating';

/**
 * The 36 states + FCT, as accepted/returned by the API (string names).
 */
export type NigerianState = (typeof NIGERIAN_STATES)[number];
export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'AkwaIbom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'CrossRiver', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'Abuja',
] as const;

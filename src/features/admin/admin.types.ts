import type {
  ReportReason,
  ReportStatus,
  ReportTargetType,
  ReviewStatus,
  ListingStatus,
  VerificationMethod,
  VerificationStatus,
} from '@/shared/types/enums';
import type { VendorRequestStatus } from '@/features/vendor/vendor.types';

/** A named tally row (e.g. a category or location with its count). */
export interface NameCount {
  name: string;
  count: number;
}

/** Admin home dashboard read model (PDR §2.13). */
export interface DashboardResponse {
  registeredUsers: number;
  activeUsers30d: number;
  activeListings: number;
  otpSuccessRate: number;
  interactions30d: number;
  crossDiscoveryRate: number;
  topCategories: NameCount[];
  topLocations: NameCount[];
  pendingApprovals: number;
  openReports: number;
}

/** A row in the admin vendor moderation queue (PDR §2.14). */
export interface VendorRequestQueueItem {
  id: string;
  userId: string;
  businessName: string;
  method: VerificationMethod;
  verificationStatus: VerificationStatus;
  nameMatch: boolean;
  createdAtUtc: string;
  /** True when the applicant's account is currently suspended (drives Suspend vs Reinstate). */
  suspended: boolean;
}

/** A report in the admin moderation queue (PDR §2.7 / §2.16). */
export interface ReportResponse {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  note: string | null;
  status: ReportStatus;
  resolvedByUserId: string | null;
  resolvedAtUtc: string | null;
  createdAtUtc: string;
}

export type { VendorRequestStatus, ReviewStatus, ListingStatus };

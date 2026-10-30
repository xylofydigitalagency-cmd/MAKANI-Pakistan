export type ListingPurpose = 'sale' | 'rent';

export type PropertyCategory =
  | 'houses'
  | 'apartments'
  | 'residential_plots'
  | 'commercial_plots'
  | 'files'
  | 'shops'
  | 'offices'
  | 'buildings'
  | 'warehouses'
  | 'agricultural'
  | 'commercial'
  | 'other';

export type PropertyClassification = 'residential' | 'commercial';

export type AreaUnit = 'Marla' | 'Kanal' | 'Sq. Ft' | 'Sq. Yd';

export type PropertyStatus = 'pending' | 'approved' | 'rejected' | 'paused';

export interface LocationData {
  country: 'Pakistan';
  province: string;
  city: string;
  area: string;
  street?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface PropertyDetails {
  bedrooms?: number;
  bathrooms?: number;
  coveredArea: number;
  areaUnit: AreaUnit;
  floors?: number;
  parkingSpaces?: number;
  furnishing?: 'Unfurnished' | 'Semi-Furnished' | 'Furnished';
  amenities: string[];
  builtYear?: number;
}

export interface PropertyContact {
  ownerName: string;
  phone: string;
  whatsapp?: string;
  contactPreference: 'call' | 'whatsapp' | 'both';
  ownerEmail: string;
  ownerId: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number; // in PKR
  priceNegotiable: boolean;
  purpose: ListingPurpose;
  category: PropertyCategory;
  classification: PropertyClassification;
  location: LocationData;
  details: PropertyDetails;
  images: string[]; // Minimum 3 required
  contact: PropertyContact;
  status: PropertyStatus;
  rejectionReason?: string;
  viewsCount: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export type UserRole = 'user' | 'admin';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  phoneVerified: boolean;
  phoneNumber?: string;
  freeCreditsRemaining: number; // Defaults to 5
  paidCreditsRemaining: number; // From Rs 500 package (14 credits)
  isSuspended: boolean;
  suspensionReason?: string;
  createdAt: string;
}

export type PaymentStatus = 'awaiting_submission' | 'pending' | 'approved' | 'rejected';

export interface PaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  packageId: 'pkg_14_credits';
  packageName: string;
  amountPKR: number; // 500 PKR
  creditsCount: number; // 14
  paymentMethod: 'Meezan Bank' | 'JazzCash' | 'EasyPaisa' | 'Nayapay';
  transactionId: string;
  screenshotUrl: string;
  status: PaymentStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface WebsiteReview {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  city?: string;
  rating: number; // 1 to 5
  feedback: string;
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  performedBy: string;
  targetId: string;
  targetType: 'property' | 'user' | 'payment' | 'review' | 'settings';
  details: string;
  timestamp: string;
}

export interface SiteSettings {
  receivingAccounts: {
    meezanBank: {
      accountTitle: string;
      accountNumber: string;
      iban: string;
      branch: string;
    };
    jazzCash: {
      title: string;
      mobileNumber: string;
    };
    easyPaisa: {
      title: string;
      mobileNumber: string;
    };
    nayaPay: {
      title: string;
      id: string;
    };
  };
  contactHelpline: string;
  contactEmail: string;
  popularCities: string[];
}

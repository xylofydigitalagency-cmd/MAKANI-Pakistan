import {
  Property,
  AppUser,
  PaymentRequest,
  WebsiteReview,
  AdminAuditLog,
  SiteSettings,
  PropertyStatus,
} from '../types';
import { ADMIN_EMAIL, auth, db, googleProvider } from './firebase';
import { normalizePkMobile } from './formatters';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, type User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  type Query,
} from 'firebase/firestore';

const STORAGE_KEY_PROPERTIES = 'makani_properties_v1';
const STORAGE_KEY_USERS = 'makani_users_v1';
const STORAGE_KEY_CURRENT_USER = 'makani_current_user_v1';
const STORAGE_KEY_PAYMENTS = 'makani_payments_v1';
const STORAGE_KEY_REVIEWS = 'makani_reviews_v1';
const STORAGE_KEY_AUDIT_LOGS = 'makani_audit_logs_v1';
const STORAGE_KEY_SETTINGS = 'makani_settings_v1';
const STORAGE_KEY_FAVORITES = 'makani_favorites_v1';
const STORAGE_KEY_VIEWED = 'makani_viewed_properties_v1';

// Default (khali) site settings — real bank/wallet accounts Admin Panel > Settings se bharen
const INITIAL_SETTINGS: SiteSettings = {
  receivingAccounts: {
    meezanBank: { accountTitle: '', accountNumber: '', iban: '', branch: '' },
    jazzCash: { title: '', mobileNumber: '' },
    easyPaisa: { title: '', mobileNumber: '' },
    nayaPay: { title: '', id: '' },
  },
  contactHelpline: '',
  contactEmail: 'xylofydigitalagency@gmail.com',
  popularCities: ['Islamabad', 'Lahore', 'Karachi', 'Rawalpindi', 'Faisalabad', 'Peshawar', 'Multan'],
};

// Firestore collection paths
type Col = 'properties' | 'users' | 'payments' | 'reviews' | 'auditLogs';
const COL_PATH: Record<Col, string> = {
  properties: 'properties',
  users: 'users',
  payments: 'payments',
  reviews: 'reviews',
  auditLogs: 'adminAuditLogs',
};

// Firestore `undefined` accept nahi karta — JSON round-trip usay hata deta hai
const clean = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

// Data Store Class (Firebase Auth + Firestore)
export class DataStore {
  private properties: Property[] = [];
  private users: AppUser[] = [];
  private currentUser: AppUser | null = null;
  private payments: PaymentRequest[] = [];
  private reviews: WebsiteReview[] = [];
  private auditLogs: AdminAuditLog[] = [];
  private settings: SiteSettings = INITIAL_SETTINGS;
  private favorites: string[] = [];
  private listeners: (() => void)[] = [];

  private unsubs: Array<() => void> = [];
  private sources: Record<string, Record<string, any[]>> = {};
  private synced: Record<string, Map<string, string>> = {};
  private ensuring = new Map<string, Promise<AppUser>>();
  private authSeq = 0;

  constructor() {
    try {
      const savedFavs = localStorage.getItem(STORAGE_KEY_FAVORITES);
      if (savedFavs) this.favorites = JSON.parse(savedFavs);
    } catch (e) {
      console.warn('Error loading favorites:', e);
    }

    if (auth && db) {
      onAuthStateChanged(auth, (fbUser) => {
        void this.handleAuthChange(fbUser);
      });
    } else {
      console.error('Firebase configure nahi hai — src/lib/firebase.ts check karen.');
    }
  }

  // ---------- Auth state + live Firestore listeners ----------
  private async handleAuthChange(fbUser: User | null) {
    const seq = ++this.authSeq;
    this.detachListeners();
    this.currentUser = null;
    this.notify();

    if (fbUser && fbUser.email) {
      try {
        await this.ensureUserDoc(fbUser);
      } catch (e) {
        console.error('User profile load failed:', e);
      }
      if (seq !== this.authSeq) return;
    }
    this.attachListeners();
    this.notify();
  }

  private ensureUserDoc(fbUser: User): Promise<AppUser> {
    let p = this.ensuring.get(fbUser.uid);
    if (!p) {
      p = this.ensureUserDocInner(fbUser).finally(() => this.ensuring.delete(fbUser.uid));
      this.ensuring.set(fbUser.uid, p);
    }
    return p;
  }

  private async ensureUserDocInner(fbUser: User): Promise<AppUser> {
    const email = (fbUser.email || '').toLowerCase();
    const isAdmin = email === ADMIN_EMAIL.toLowerCase();
    const ref = doc(db!, 'users', fbUser.uid);
    const snap = await getDoc(ref);
    let user: AppUser;

    if (snap.exists()) {
      user = { ...(snap.data() as AppUser), uid: fbUser.uid };
      if (isAdmin && user.role !== 'admin') {
        user.role = 'admin';
        await setDoc(ref, clean(user));
      }
    } else {
      user = {
        uid: fbUser.uid,
        email,
        displayName: fbUser.displayName || email.split('@')[0],
        photoURL: fbUser.photoURL || undefined,
        role: 'user', // Firestore rules sirf 'user' role se create allow karte hain
        phoneVerified: false,
        freeCreditsRemaining: 5, // 5 free listings
        paidCreditsRemaining: 0,
        isSuspended: false,
        createdAt: new Date().toISOString(),
      };
      await setDoc(ref, clean(user));
      if (isAdmin) {
        user.role = 'admin'; // admin email token ki wajah se rules ye update allow karte hain
        await setDoc(ref, clean(user));
      }
    }
    this.currentUser = user;
    return user;
  }

  private detachListeners() {
    this.unsubs.forEach((u) => {
      try {
        u();
      } catch {
        /* ignore */
      }
    });
    this.unsubs = [];
    this.sources = {};
    this.synced = {};
    this.properties = [];
    this.users = [];
    this.payments = [];
    this.reviews = [];
    this.auditLogs = [];
  }

  private attachListeners() {
    if (!db) return;
    const u = this.currentUser;
    const isAdmin = u?.role === 'admin';

    const watch = (col: Col, key: string, q: Query, idField: 'id' | 'uid' = 'id') => {
      this.unsubs.push(
        onSnapshot(
          q,
          (snap) => {
            const items = snap.docs.map((d) => ({ ...(d.data() as any), [idField]: d.id }));
            this.setSource(col, key, items, idField);
          },
          (err) => console.warn(`Firestore listener (${col}/${key}):`, err.message)
        )
      );
    };

    // Public: sirf approved listings aur approved reviews
    watch('properties', 'approved', query(collection(db, 'properties'), where('status', '==', 'approved')));
    watch('reviews', 'approved', query(collection(db, 'reviews'), where('status', '==', 'approved')));
    this.unsubs.push(
      onSnapshot(
        doc(db, 'siteSettings', 'main'),
        (snap) => {
          if (snap.exists()) {
            this.settings = { ...INITIAL_SETTINGS, ...(snap.data() as Partial<SiteSettings>) };
            this.notify();
          }
        },
        (err) => console.warn('Firestore listener (settings):', err.message)
      )
    );

    if (!u) return;

    if (isAdmin) {
      watch('properties', 'all', query(collection(db, 'properties')));
      watch('users', 'all', query(collection(db, 'users')), 'uid');
      watch('payments', 'all', query(collection(db, 'payments')));
      watch('reviews', 'all', query(collection(db, 'reviews')));
      watch('auditLogs', 'all', query(collection(db, 'adminAuditLogs'), orderBy('timestamp', 'desc'), limit(300)));
    } else {
      watch('properties', 'own', query(collection(db, 'properties'), where('contact.ownerId', '==', u.uid)));
      watch('payments', 'own', query(collection(db, 'payments'), where('userId', '==', u.uid)));
      this.unsubs.push(
        onSnapshot(
          doc(db, 'users', u.uid),
          (snap) => {
            if (snap.exists()) {
              this.setSource('users', 'self', [{ ...(snap.data() as any), uid: snap.id }], 'uid');
            }
          },
          (err) => console.warn('Firestore listener (self):', err.message)
        )
      );
    }
  }

  private setSource(col: Col, key: string, items: any[], idField: 'id' | 'uid' = 'id') {
    this.sources[col] = { ...(this.sources[col] || {}), [key]: items };
    const map = new Map<string, any>();
    Object.values(this.sources[col]).forEach((arr) => arr.forEach((i) => map.set(i[idField], i)));
    const merged = Array.from(map.values());
    const dateOf = (i: any) => String(i.createdAt || i.submittedAt || i.timestamp || '');
    merged.sort((a, b) => dateOf(b).localeCompare(dateOf(a)));
    (this as any)[col] = merged;
    this.synced[col] = new Map(merged.map((i) => [i[idField], JSON.stringify(i)] as [string, string]));

    if (col === 'users' && this.currentUser) {
      const me = merged.find((x) => x.uid === this.currentUser!.uid);
      if (me) this.currentUser = me;
    }
    this.notify();
  }

  // Sirf badle hue documents Firestore mein likhta hai (aur removed ko delete karta hai)
  private pushDiff(col: Col, items: any[], idField: 'id' | 'uid' = 'id', allowDelete = true) {
    if (!db) return;
    const prev = this.synced[col] || new Map<string, string>();
    const next = new Map<string, string>();
    items.forEach((item) => {
      const id = item[idField];
      const json = JSON.stringify(item);
      next.set(id, json);
      if (prev.get(id) !== json) {
        setDoc(doc(db!, COL_PATH[col], id), JSON.parse(json)).catch((e) =>
          console.error(`Firestore write failed (${col}/${id}):`, e.message)
        );
      }
    });
    if (allowDelete) {
      prev.forEach((_, id) => {
        if (!next.has(id)) {
          deleteDoc(doc(db!, COL_PATH[col], id)).catch((e) =>
            console.error(`Firestore delete failed (${col}/${id}):`, e.message)
          );
        }
      });
    }
    this.synced[col] = next;
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private saveProperties() {
    this.pushDiff('properties', this.properties);
    this.notify();
  }

  private saveUsers() {
    this.pushDiff('users', this.users, 'uid');
    this.notify();
  }

  private saveCurrentUser() {
    this.notify();
  }

  private savePayments() {
    this.pushDiff('payments', this.payments);
    this.notify();
  }

  private saveReviews() {
    this.pushDiff('reviews', this.reviews);
    this.notify();
  }

  private saveAuditLogs() {
    this.pushDiff('auditLogs', this.auditLogs, 'id', false);
    this.notify();
  }

  private saveSettings() {
    if (db) {
      setDoc(doc(db, 'siteSettings', 'main'), clean(this.settings)).catch((e) =>
        console.error('Settings save failed:', e.message)
      );
    }
    this.notify();
  }

  private saveFavorites() {
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(this.favorites));
    this.notify();
  }

  // --- Auth & Users ---
  public getCurrentUser(): AppUser | null {
    return this.currentUser;
  }

  public getAllUsers(): AppUser[] {
    return this.users;
  }

  public async loginWithGoogle(): Promise<AppUser> {
    if (!auth || !db || !googleProvider) {
      throw new Error('Firebase configure nahi hai.');
    }
    const cred = await signInWithPopup(auth, googleProvider);
    const user = await this.ensureUserDoc(cred.user);
    this.logAudit({
      action: 'USER_LOGIN',
      performedBy: user.email,
      targetId: user.uid,
      targetType: 'user',
      details: `Google login: ${user.email} (${user.role})`,
    });
    this.notify();
    return user;
  }

  public signOut() {
    this.currentUser = null;
    this.detachListeners();
    if (auth) fbSignOut(auth).catch(() => {});
    this.notify();
  }

  // Phone number user profile mein save karta hai (OTP ab nahi hai)
  public saveUserPhone(phoneNumber: string): boolean {
    if (!this.currentUser || !db) return false;
    if (this.currentUser.phoneNumber === phoneNumber) return true;
    this.currentUser.phoneNumber = phoneNumber;
    updateDoc(doc(db, 'users', this.currentUser.uid), { phoneNumber }).catch((e) =>
      console.error('Phone save failed:', e.message)
    );
    this.notify();
    return true;
  }

  public suspendUser(userId: string, reason: string, adminEmail: string): boolean {
    const user = this.users.find((u) => u.uid === userId);
    if (!user) return false;
    user.isSuspended = true;
    user.suspensionReason = reason;
    this.saveUsers();

    if (this.currentUser?.uid === userId) {
      this.currentUser.isSuspended = true;
      this.currentUser.suspensionReason = reason;
      this.saveCurrentUser();
    }

    this.logAudit({
      action: 'USER_SUSPENDED',
      performedBy: adminEmail,
      targetId: userId,
      targetType: 'user',
      details: `User ${user.email} suspended. Reason: ${reason}`,
    });
    return true;
  }

  public reactivateUser(userId: string, adminEmail: string): boolean {
    const user = this.users.find((u) => u.uid === userId);
    if (!user) return false;
    user.isSuspended = false;
    delete user.suspensionReason;
    this.saveUsers();

    if (this.currentUser?.uid === userId) {
      this.currentUser.isSuspended = false;
      delete this.currentUser.suspensionReason;
      this.saveCurrentUser();
    }

    this.logAudit({
      action: 'USER_REACTIVATED',
      performedBy: adminEmail,
      targetId: userId,
      targetType: 'user',
      details: `User ${user.email} reactivated`,
    });
    return true;
  }

  public adjustUserCredits(
    userId: string,
    freeDelta: number,
    paidDelta: number,
    reason: string,
    adminEmail: string
  ): boolean {
    const user = this.users.find((u) => u.uid === userId);
    if (!user) return false;

    user.freeCreditsRemaining = Math.max(0, user.freeCreditsRemaining + freeDelta);
    user.paidCreditsRemaining = Math.max(0, user.paidCreditsRemaining + paidDelta);
    this.saveUsers();

    if (this.currentUser?.uid === userId) {
      this.currentUser.freeCreditsRemaining = user.freeCreditsRemaining;
      this.currentUser.paidCreditsRemaining = user.paidCreditsRemaining;
      this.saveCurrentUser();
    }

    this.logAudit({
      action: 'CREDITS_ADJUSTED',
      performedBy: adminEmail,
      targetId: userId,
      targetType: 'user',
      details: `Adjusted credits: Free ${freeDelta >= 0 ? '+' : ''}${freeDelta}, Paid ${paidDelta >= 0 ? '+' : ''}${paidDelta}. Reason: ${reason}`,
    });
    return true;
  }

  // --- Properties ---
  public getApprovedProperties(): Property[] {
    return this.properties.filter((p) => p.status === 'approved');
  }

  public getAllProperties(): Property[] {
    return this.properties;
  }

  public getPropertyById(id: string): Property | undefined {
    return this.properties.find((p) => p.id === id);
  }

  public getUserProperties(userId: string): Property[] {
    return this.properties.filter((p) => p.contact.ownerId === userId);
  }

  public recordPropertyView(propertyId: string): void {
    try {
      const viewedKey = `${STORAGE_KEY_VIEWED}_${propertyId}`;
      const hasViewedInSession = sessionStorage.getItem(viewedKey);
      if (!hasViewedInSession) {
        sessionStorage.setItem(viewedKey, 'true');
        if (db) {
          updateDoc(doc(db, 'properties', propertyId), { viewsCount: increment(1) }).catch(() => {});
        }
      }
    } catch {
      // ignore in restricted environments
    }
  }

  public submitProperty(propertyData: Omit<Property, 'id' | 'status' | 'viewsCount' | 'createdAt' | 'updatedAt'>): {
    success: boolean;
    property?: Property;
    error?: string;
  } {
    if (!this.currentUser) {
      return { success: false, error: 'Authentication required. Please sign in with Google.' };
    }
    if (this.currentUser.isSuspended) {
      return { success: false, error: 'Your account is suspended. Contact support.' };
    }
    if (!normalizePkMobile(propertyData.contact?.phone)) {
      return {
        success: false,
        error: 'Sahi Pakistani mobile number zaroori hai (e.g. 0300 1234567).',
      };
    }
    if (!propertyData.images || propertyData.images.length < 3) {
      return { success: false, error: 'At least 3 valid property photographs are required.' };
    }

    // Check quota: total available = free + paid
    const totalCredits = (this.currentUser.freeCreditsRemaining || 0) + (this.currentUser.paidCreditsRemaining || 0);
    if (totalCredits <= 0) {
      return {
        success: false,
        error: 'You have exhausted your listing credits. Please purchase a seller package (PKR 500 for 14 credits) to continue.',
      };
    }

    const newProperty: Property = {
      ...propertyData,
      id: `prop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'pending', // Rule 4: Always pending until admin approval
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.properties.unshift(newProperty);
    this.saveProperties();
    this.saveUserPhone(newProperty.contact.phone);

    this.logAudit({
      action: 'PROPERTY_SUBMITTED',
      performedBy: this.currentUser.email,
      targetId: newProperty.id,
      targetType: 'property',
      details: `New listing submitted: "${newProperty.title}" in ${newProperty.location.city}`,
    });

    return { success: true, property: newProperty };
  }

  public updateProperty(
    propertyId: string,
    updates: Partial<Property>,
    actorEmail: string
  ): boolean {
    const index = this.properties.findIndex((p) => p.id === propertyId);
    if (index === -1) return false;

    this.properties[index] = {
      ...this.properties[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveProperties();

    this.logAudit({
      action: 'PROPERTY_UPDATED',
      performedBy: actorEmail,
      targetId: propertyId,
      targetType: 'property',
      details: `Property ${propertyId} updated`,
    });
    return true;
  }

  public approveProperty(propertyId: string, adminEmail: string): { success: boolean; error?: string } {
    const prop = this.properties.find((p) => p.id === propertyId);
    if (!prop) return { success: false, error: 'Property not found.' };
    if (prop.status === 'approved') return { success: false, error: 'Property is already approved.' };

    const owner = this.users.find((u) => u.uid === prop.contact.ownerId);
    if (!owner) {
      // Still approve if owner record not found
      prop.status = 'approved';
      prop.approvedAt = new Date().toISOString();
      prop.approvedBy = adminEmail;
      this.saveProperties();
      return { success: true };
    }

    // Server-authoritative credit consumption:
    // Deduct from free credits first, then from paid credits
    if (owner.freeCreditsRemaining > 0) {
      owner.freeCreditsRemaining -= 1;
    } else if (owner.paidCreditsRemaining > 0) {
      owner.paidCreditsRemaining -= 1;
    } else {
      return {
        success: false,
        error: `Advertiser ${owner.displayName} has 0 remaining listing credits. They must purchase credits before approval.`,
      };
    }

    this.saveUsers();
    if (this.currentUser?.uid === owner.uid) {
      this.currentUser.freeCreditsRemaining = owner.freeCreditsRemaining;
      this.currentUser.paidCreditsRemaining = owner.paidCreditsRemaining;
      this.saveCurrentUser();
    }

    prop.status = 'approved';
    delete prop.rejectionReason;
    prop.approvedAt = new Date().toISOString();
    prop.approvedBy = adminEmail;
    this.saveProperties();

    this.logAudit({
      action: 'PROPERTY_APPROVED',
      performedBy: adminEmail,
      targetId: propertyId,
      targetType: 'property',
      details: `Listing "${prop.title}" approved. Deducted 1 credit from ${owner.email} (Remaining: Free ${owner.freeCreditsRemaining}, Paid ${owner.paidCreditsRemaining})`,
    });

    return { success: true };
  }

  public rejectProperty(propertyId: string, reason: string, adminEmail: string): boolean {
    const prop = this.properties.find((p) => p.id === propertyId);
    if (!prop) return false;

    prop.status = 'rejected';
    prop.rejectionReason = reason;
    prop.updatedAt = new Date().toISOString();
    this.saveProperties();

    this.logAudit({
      action: 'PROPERTY_REJECTED',
      performedBy: adminEmail,
      targetId: propertyId,
      targetType: 'property',
      details: `Listing "${prop.title}" rejected. Reason: ${reason}`,
    });
    return true;
  }

  public deleteProperty(propertyId: string, actorEmail: string): boolean {
    const index = this.properties.findIndex((p) => p.id === propertyId);
    if (index === -1) return false;
    const [deleted] = this.properties.splice(index, 1);
    this.saveProperties();

    this.logAudit({
      action: 'PROPERTY_DELETED',
      performedBy: actorEmail,
      targetId: propertyId,
      targetType: 'property',
      details: `Listing "${deleted.title}" deleted by ${actorEmail}`,
    });
    return true;
  }

  public toggleFeaturedProperty(propertyId: string, adminEmail: string): boolean {
    const prop = this.properties.find((p) => p.id === propertyId);
    if (!prop) return false;
    prop.featured = !prop.featured;
    this.saveProperties();

    this.logAudit({
      action: 'PROPERTY_FEATURED_TOGGLE',
      performedBy: adminEmail,
      targetId: propertyId,
      targetType: 'property',
      details: `Listing "${prop.title}" featured set to ${prop.featured}`,
    });
    return true;
  }

  // --- Payments & Credits ---
  public getAllPayments(): PaymentRequest[] {
    return this.payments;
  }

  public getUserPayments(userId: string): PaymentRequest[] {
    return this.payments.filter((p) => p.userId === userId);
  }

  public submitPayment(
    paymentMethod: 'Meezan Bank' | 'JazzCash' | 'EasyPaisa' | 'Nayapay',
    transactionId: string,
    screenshotUrl: string
  ): { success: boolean; payment?: PaymentRequest; error?: string } {
    if (!this.currentUser) {
      return { success: false, error: 'Please sign in to submit a payment.' };
    }

    const trimmedTx = transactionId.trim().toUpperCase();
    if (!trimmedTx) {
      return { success: false, error: 'Transaction ID is required.' };
    }
    if (!screenshotUrl) {
      return { success: false, error: 'Payment receipt screenshot upload karna zaroori hai.' };
    }

    // Check duplicate transaction ID across all existing payments
    const existing = this.payments.find(
      (p) => p.transactionId.trim().toUpperCase() === trimmedTx && p.status !== 'rejected'
    );
    if (existing) {
      return {
        success: false,
        error: `This transaction ID (${trimmedTx}) has already been submitted (Status: ${existing.status}). Please enter a unique transaction reference.`,
      };
    }

    const newPayment: PaymentRequest = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: this.currentUser.uid,
      userEmail: this.currentUser.email,
      userName: this.currentUser.displayName,
      packageId: 'pkg_14_credits',
      packageName: 'Standard Seller Package (14 Listing Credits)',
      amountPKR: 500,
      creditsCount: 14,
      paymentMethod,
      transactionId: trimmedTx,
      screenshotUrl,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    this.payments.unshift(newPayment);
    this.savePayments();

    this.logAudit({
      action: 'PAYMENT_SUBMITTED',
      performedBy: this.currentUser.email,
      targetId: newPayment.id,
      targetType: 'payment',
      details: `Payment submitted: PKR 500 via ${paymentMethod}, TxID: ${trimmedTx}`,
    });

    return { success: true, payment: newPayment };
  }

  public approvePayment(paymentId: string, adminEmail: string): { success: boolean; error?: string } {
    const payment = this.payments.find((p) => p.id === paymentId);
    if (!payment) return { success: false, error: 'Payment record not found.' };
    if (payment.status === 'approved') {
      return { success: false, error: 'Payment has already been approved and credits granted.' };
    }

    const user = this.users.find((u) => u.uid === payment.userId);
    if (!user) {
      return { success: false, error: 'Target user account not found.' };
    }

    // Grant exactly 14 credits safely
    user.paidCreditsRemaining = (user.paidCreditsRemaining || 0) + 14;
    this.saveUsers();

    if (this.currentUser?.uid === user.uid) {
      this.currentUser.paidCreditsRemaining = user.paidCreditsRemaining;
      this.saveCurrentUser();
    }

    payment.status = 'approved';
    delete payment.rejectionReason;
    payment.reviewedAt = new Date().toISOString();
    payment.reviewedBy = adminEmail;
    this.savePayments();

    this.logAudit({
      action: 'PAYMENT_APPROVED',
      performedBy: adminEmail,
      targetId: paymentId,
      targetType: 'payment',
      details: `Approved payment for ${user.email}. Granted exactly 14 paid credits. Total paid credits: ${user.paidCreditsRemaining}`,
    });

    return { success: true };
  }

  public rejectPayment(paymentId: string, reason: string, adminEmail: string): boolean {
    const payment = this.payments.find((p) => p.id === paymentId);
    if (!payment) return false;

    payment.status = 'rejected';
    payment.rejectionReason = reason;
    payment.reviewedAt = new Date().toISOString();
    payment.reviewedBy = adminEmail;
    this.savePayments();

    this.logAudit({
      action: 'PAYMENT_REJECTED',
      performedBy: adminEmail,
      targetId: paymentId,
      targetType: 'payment',
      details: `Payment ${paymentId} (TxID ${payment.transactionId}) rejected. Reason: ${reason}`,
    });
    return true;
  }

  // --- Reviews ---
  public getApprovedReviews(): WebsiteReview[] {
    return this.reviews.filter((r) => r.status === 'approved');
  }

  public getAllReviews(): WebsiteReview[] {
    return this.reviews;
  }

  public submitReview(rating: number, feedback: string, city?: string): { success: boolean; error?: string } {
    if (!this.currentUser) {
      return { success: false, error: 'Please sign in with Google to submit a review.' };
    }

    const newReview: WebsiteReview = {
      id: `rev-${Date.now()}`,
      userId: this.currentUser.uid,
      userName: this.currentUser.displayName,
      userEmail: this.currentUser.email,
      userPhoto: this.currentUser.photoURL,
      city: city || 'Pakistan',
      rating,
      feedback,
      status: 'pending', // Rule 11: Awaiting admin moderation
      featured: false,
      createdAt: new Date().toISOString(),
    };

    this.reviews.unshift(newReview);
    this.saveReviews();

    this.logAudit({
      action: 'REVIEW_SUBMITTED',
      performedBy: this.currentUser.email,
      targetId: newReview.id,
      targetType: 'review',
      details: `Website review submitted (${rating} stars) by ${this.currentUser.email}`,
    });

    return { success: true };
  }

  public moderateReview(reviewId: string, status: 'approved' | 'rejected', adminEmail: string): boolean {
    const review = this.reviews.find((r) => r.id === reviewId);
    if (!review) return false;
    review.status = status;
    this.saveReviews();

    this.logAudit({
      action: `REVIEW_${status.toUpperCase()}`,
      performedBy: adminEmail,
      targetId: reviewId,
      targetType: 'review',
      details: `Review ${reviewId} marked as ${status}`,
    });
    return true;
  }

  public toggleFeaturedReview(reviewId: string, adminEmail: string): boolean {
    const review = this.reviews.find((r) => r.id === reviewId);
    if (!review) return false;
    review.featured = !review.featured;
    this.saveReviews();

    this.logAudit({
      action: 'REVIEW_FEATURED_TOGGLE',
      performedBy: adminEmail,
      targetId: reviewId,
      targetType: 'review',
      details: `Review ${reviewId} featured: ${review.featured}`,
    });
    return true;
  }

  public deleteReview(reviewId: string, adminEmail: string): boolean {
    const index = this.reviews.findIndex((r) => r.id === reviewId);
    if (index === -1) return false;
    this.reviews.splice(index, 1);
    this.saveReviews();

    this.logAudit({
      action: 'REVIEW_DELETED',
      performedBy: adminEmail,
      targetId: reviewId,
      targetType: 'review',
      details: `Review ${reviewId} deleted`,
    });
    return true;
  }

  // --- Favorites ---
  public getFavorites(): string[] {
    return this.favorites;
  }

  public isFavorite(propertyId: string): boolean {
    return this.favorites.includes(propertyId);
  }

  public toggleFavorite(propertyId: string): boolean {
    const idx = this.favorites.indexOf(propertyId);
    if (idx >= 0) {
      this.favorites.splice(idx, 1);
    } else {
      this.favorites.push(propertyId);
    }
    this.saveFavorites();
    return this.favorites.includes(propertyId);
  }

  // --- Site Settings ---
  public getSettings(): SiteSettings {
    return this.settings;
  }

  public updateSettings(newSettings: Partial<SiteSettings>, adminEmail: string): boolean {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();

    this.logAudit({
      action: 'SETTINGS_UPDATED',
      performedBy: adminEmail,
      targetId: 'siteSettings',
      targetType: 'settings',
      details: 'Site configuration updated',
    });
    return true;
  }

  // --- Audit Logs ---
  public getAuditLogs(): AdminAuditLog[] {
    return this.auditLogs;
  }

  private logAudit(entry: Omit<AdminAuditLog, 'id' | 'timestamp'>) {
    const log: AdminAuditLog = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    // Keep last 300 logs
    if (this.auditLogs.length > 300) {
      this.auditLogs.pop();
    }
    this.saveAuditLogs();
  }

  
}

export const dataStore = new DataStore();

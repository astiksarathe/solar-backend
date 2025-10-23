// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document, Types } from 'mongoose';

// export type LeadDocument = Lead & Document;

// /**
//  * Lead Schema
//  * 
//  * This collection stores potential customers who have shown interest in solar installations.
//  * Leads are typically converted from consumer_data when there's genuine interest or 
//  * created directly through website inquiries, referrals, or cold calls.
//  * 
//  * The lead lifecycle: new -> contacted -> qualified -> proposal_sent -> negotiating -> won/lost
//  */
// @Schema({
//   timestamps: true,
//   collection: 'leads',
// })
// export class Lead {
//   // === REFERENCE TO ORIGINAL DATA ===

//   /** Reference to the original consumer data (if converted from scraped data) */
//   @Prop({
//     type: Types.ObjectId,
//     ref: 'ConsumerData',
//     index: true,
//     sparse: true, // Some leads might not come from scraped data
//   })
//   consumerDataId?: Types.ObjectId;

//   // === CUSTOMER INFORMATION ===

//   /** Complete customer information consolidated from various sources */
//   @Prop({
//     type: {
//       name: { type: String, required: true, trim: true },
//       consumerNumber: { type: String, trim: true, uppercase: true }, // May not exist for direct leads
//       phone: { type: String, required: true, trim: true },
//       email: { type: String, trim: true, lowercase: true },
//       address: {
//         type: {
//           full: { type: String, required: true, trim: true }, // Complete address string
//           division: { type: String, trim: true }, // Administrative division
//           parsed: {
//             type: {
//               village: { type: String, trim: true },
//               tehsil: { type: String, trim: true },
//               district: { type: String, trim: true },
//               state: { type: String, trim: true },
//               pincode: { type: String, trim: true },
//             },
//           },
//           coordinates: {
//             type: {
//               latitude: { type: Number, min: -90, max: 90 },
//               longitude: { type: Number, min: -180, max: 180 },
//             },
//           },
//         },
//         required: true,
//       },
//     },
//     required: true,
//   })
//   customerInfo: {
//     name: string;
//     consumerNumber?: string;
//     phone: string;
//     email?: string;
//     address: {
//       full: string;
//       division?: string;
//       parsed?: {
//         village?: string;
//         tehsil?: string;
//         district?: string;
//         state?: string;
//         pincode?: string;
//       };
//       coordinates?: {
//         latitude: number;
//         longitude: number;
//       };
//     };
//   };

//   // === INTEREST AND QUALIFICATION ===

//   /** Level of customer interest based on interactions */
//   @Prop({
//     enum: ['low', 'medium', 'high', 'very_high'],
//     required: true,
//     default: 'medium',
//     index: true,
//   })
//   interestLevel: string;

//   /** Customer's expressed budget range in rupees */
//   @Prop({ min: 0 })
//   budgetRange?: {
//     min: number;
//     max: number;
//   };

//   /** Timeline when customer wants to install (months from now) */
//   @Prop({
//     enum: ['immediate', '1-3_months', '3-6_months', '6-12_months', 'beyond_12_months'],
//     default: '3-6_months',
//   })
//   installationTimeline?: string;

//   // === CURRENT ELECTRICITY DETAILS ===

//   /** Customer's current electricity connection details */
//   @Prop({
//     type: {
//       currentLoad: { type: String, trim: true }, // e.g., "agricultural_pump", "domestic"
//       avgMonthlyUnits: { type: Number, min: 0 }, // Average monthly consumption
//       avgMonthlyBill: { type: Number, min: 0 }, // Average monthly bill amount
//       connectionType: {
//         type: String,
//         enum: ['flat_rate', 'metered', 'subsidized', 'commercial_rate'],
//       },
//       yearlyConsumption: { type: Number, min: 0 }, // Total yearly units
//       peakLoadHours: { type: String }, // When they use most electricity
//       powerCutIssues: { type: Boolean, default: false }, // Frequent power cuts?
//     },
//   })
//   connectionDetails?: {
//     currentLoad?: string;
//     avgMonthlyUnits?: number;
//     avgMonthlyBill?: number;
//     connectionType?: string;
//     yearlyConsumption?: number;
//     peakLoadHours?: string;
//     powerCutIssues?: boolean;
//   };

//   // === SOLAR SYSTEM ASSESSMENT ===

//   /** Technical and financial assessment for solar installation */
//   @Prop({
//     type: {
//       estimatedCapacity: { type: Number, min: 0 }, // Recommended system size in kW
//       estimatedCost: { type: Number, min: 0 }, // Total system cost
//       estimatedSavings: { type: Number, min: 0 }, // Monthly savings in rupees
//       paybackPeriod: { type: Number, min: 0 }, // Payback period in months
//       roiPercentage: { type: Number, min: 0 }, // Return on investment percentage
//       co2Savings: { type: Number, min: 0 }, // Annual CO2 savings in tons
//       roofSuitability: {
//         type: String,
//         enum: ['excellent', 'good', 'fair', 'poor', 'not_assessed'],
//         default: 'not_assessed',
//       },
//       shadingIssues: { type: Boolean, default: false }, // Any shading problems?
//       structuralAssessment: {
//         type: String,
//         enum: ['strong', 'adequate', 'needs_reinforcement', 'not_assessed'],
//         default: 'not_assessed',
//       },
//     },
//   })
//   solarAssessment?: {
//     estimatedCapacity?: number;
//     estimatedCost?: number;
//     estimatedSavings?: number;
//     paybackPeriod?: number;
//     roiPercentage?: number;
//     co2Savings?: number;
//     roofSuitability?: string;
//     shadingIssues?: boolean;
//     structuralAssessment?: string;
//   };

//   // === SALES PROCESS ===

//   /** Preferred method of communication */
//   @Prop({
//     enum: ['call', 'whatsapp', 'email', 'visit', 'video_call'],
//     default: 'call',
//   })
//   preferredContactMethod: string;

//   /** Sales representative assigned to this lead */
//   @Prop({ required: true, index: true })
//   assignedTo: string;

//   /** Current status in the sales pipeline */
//   @Prop({
//     enum: [
//       'new', // Just created
//       'contacted', // Initial contact made
//       'qualified', // Confirmed as genuine prospect
//       'site_visit_scheduled', // Site survey scheduled
//       'proposal_sent', // Proposal/quotation sent
//       'negotiating', // In price/terms negotiation
//       'won', // Deal closed successfully
//       'lost', // Deal lost
//       'on_hold', // Temporarily paused
//     ],
//     required: true,
//     default: 'new',
//     index: true,
//   })
//   status: string;

//   /** Reason for losing the lead (if status is 'lost') */
//   @Prop({
//     enum: [
//       'price_too_high',
//       'budget_constraints',
//       'roof_not_suitable',
//       'not_interested',
//       'chose_competitor',
//       'postponed_decision',
//       'technical_issues',
//       'other',
//     ],
//   })
//   lostReason?: string;

//   /** Sales rep's assessment of deal probability (0-100) */
//   @Prop({ min: 0, max: 100, default: 50 })
//   winProbability: number;

//   /** When the lead is expected to close */
//   @Prop({ index: true })
//   expectedCloseDate?: Date;

//   /** Date when lead was last contacted */
//   @Prop()
//   lastContactDate?: Date;

//   /** Next scheduled follow-up date */
//   @Prop({ index: true })
//   nextFollowUpDate?: Date;

//   // === LEAD SOURCE AND TRACKING ===

//   /** How this lead was generated */
//   @Prop({
//     enum: [
//       'scraped_data', // Converted from scraped consumer data
//       'website_inquiry', // Website contact form
//       'cold_call', // Outbound calling
//       'referral', // Customer referral
//       'social_media', // Facebook, Instagram etc.
//       'exhibition', // Trade shows, exhibitions
//       'google_ads', // Paid advertising
//       'seo', // Organic search
//       'partner', // Channel partner
//       'other',
//     ],
//     required: true,
//     default: 'scraped_data',
//     index: true,
//   })
//   leadSource: string;

//   /** Details about lead source */
//   @Prop({
//     type: {
//       referrerName: { type: String, trim: true }, // Who referred this customer?
//       referrerContact: { type: String, trim: true }, // Referrer's contact
//       campaignName: { type: String, trim: true }, // Marketing campaign name
//       adSource: { type: String, trim: true }, // Specific ad or source
//       partnerName: { type: String, trim: true }, // Channel partner name
//     },
//   })
//   sourceDetails?: {
//     referrerName?: string;
//     referrerContact?: string;
//     campaignName?: string;
//     adSource?: string;
//     partnerName?: string;
//   };

//   /** Lead priority for sales team */
//   @Prop({
//     enum: ['low', 'medium', 'high', 'urgent'],
//     required: true,
//     default: 'medium',
//     index: true,
//   })
//   priority: string;

//   /** Tags for categorization and filtering */
//   @Prop({ type: [String], default: [], index: true })
//   tags: string[];

//   /** Whether this lead has been converted to an order */
//   @Prop({ default: false, index: true })
//   isConverted: boolean;

//   /** Date when converted to order */
//   @Prop()
//   convertedDate?: Date;

//   /** Reference to the order if converted */
//   @Prop({ type: Types.ObjectId, ref: 'Order' })
//   orderId?: Types.ObjectId;

//   // === COMMUNICATION HISTORY ===

//   /** History of all interactions with this lead */
//   @Prop({
//     type: [
//       {
//         date: { type: Date, required: true, default: Date.now },
//         type: {
//           type: String,
//           enum: ['call', 'email', 'whatsapp', 'visit', 'proposal', 'follow_up'],
//           required: true,
//         },
//         direction: {
//           type: String,
//           enum: ['inbound', 'outbound'],
//           required: true,
//         },
//         duration: { type: Number }, // Duration in minutes for calls/visits
//         summary: { type: String, required: true, trim: true },
//         outcome: {
//           type: String,
//           enum: ['positive', 'neutral', 'negative', 'no_response'],
//         },
//         nextAction: { type: String, trim: true },
//         performedBy: { type: String, required: true },
//       },
//     ],
//     default: [],
//   })
//   communicationHistory: Array<{
//     date: Date;
//     type: string;
//     direction: string;
//     duration?: number;
//     summary: string;
//     outcome?: string;
//     nextAction?: string;
//     performedBy: string;
//   }>;

//   // === DOCUMENTS AND PROPOSALS ===

//   /** Documents related to this lead */
//   @Prop({
//     type: [
//       {
//         type: {
//           type: String,
//           enum: [
//             'proposal',
//             'quotation',
//             'site_photos',
//             'roof_analysis',
//             'electricity_bill',
//             'id_proof',
//             'address_proof',
//             'other',
//           ],
//           required: true,
//         },
//         fileName: { type: String, required: true, trim: true },
//         filePath: { type: String, required: true, trim: true },
//         uploadDate: { type: Date, required: true, default: Date.now },
//         uploadedBy: { type: String, required: true },
//         description: { type: String, trim: true },
//       },
//     ],
//     default: [],
//   })
//   documents: Array<{
//     type: string;
//     fileName: string;
//     filePath: string;
//     uploadDate: Date;
//     uploadedBy: string;
//     description?: string;
//   }>;

//   // === PROPOSAL DETAILS ===

//   /** Details of the latest proposal sent */
//   @Prop({
//     type: {
//       systemCapacity: { type: Number, min: 0 }, // Proposed system size in kW
//       totalCost: { type: Number, min: 0 }, // Total quoted amount
//       monthlyEMI: { type: Number, min: 0 }, // EMI if financing offered
//       warranty: { type: Number, min: 0 }, // Warranty period in years
//       proposalDate: { type: Date },
//       validUntil: { type: Date },
//       proposalVersion: { type: Number, default: 1 }, // Track proposal revisions
//       discountOffered: { type: Number, min: 0 }, // Discount amount
//       specialTerms: { type: String, trim: true }, // Any special conditions
//     },
//   })
//   latestProposal?: {
//     systemCapacity?: number;
//     totalCost?: number;
//     monthlyEMI?: number;
//     warranty?: number;
//     proposalDate?: Date;
//     validUntil?: Date;
//     proposalVersion?: number;
//     discountOffered?: number;
//     specialTerms?: string;
//   };

//   // === CUSTOMER PREFERENCES ===

//   /** Customer preferences and requirements */
//   @Prop({
//     type: {
//       preferredBrand: { type: String, trim: true }, // Preferred panel/inverter brand
//       colorPreference: { type: String, trim: true }, // Panel color preference
//       aestheticConcerns: { type: Boolean, default: false }, // Appearance important?
//       batteryBackup: { type: Boolean, default: false }, // Want battery backup?
//       smartFeatures: { type: Boolean, default: false }, // Want monitoring/smart features?
//       maintenanceService: { type: Boolean, default: true }, // Want maintenance service?
//       preferredLanguage: {
//         type: String,
//         enum: ['hindi', 'english', 'marathi', 'gujarati', 'punjabi', 'tamil', 'telugu', 'bengali'],
//         default: 'hindi',
//       },
//       bestTimeToCall: {
//         type: String,
//         enum: ['morning', 'afternoon', 'evening', 'any'],
//         default: 'any',
//       },
//     },
//   })
//   customerPreferences?: {
//     preferredBrand?: string;
//     colorPreference?: string;
//     aestheticConcerns?: boolean;
//     batteryBackup?: boolean;
//     smartFeatures?: boolean;
//     maintenanceService?: boolean;
//     preferredLanguage?: string;
//     bestTimeToCall?: string;
//   };

//   // === COMPETITION ANALYSIS ===

//   /** Information about competitors in consideration */
//   @Prop({
//     type: [
//       {
//         companyName: { type: String, required: true, trim: true },
//         quotedPrice: { type: Number, min: 0 },
//         systemSize: { type: Number, min: 0 },
//         advantages: { type: String, trim: true }, // Their advantages
//         disadvantages: { type: String, trim: true }, // Their disadvantages
//         customerFeedback: { type: String, trim: true }, // What customer thinks
//       },
//     ],
//     default: [],
//   })
//   competition?: Array<{
//     companyName: string;
//     quotedPrice?: number;
//     systemSize?: number;
//     advantages?: string;
//     disadvantages?: string;
//     customerFeedback?: string;
//   }>;

//   // === CUSTOM FIELDS ===

//   /** Flexible storage for custom business-specific fields */
//   @Prop({ type: Object, default: {} })
//   customFields?: Record<string, any>;

//   // === NOTES AND COMMENTS ===

//   /** General notes about the lead */
//   @Prop({ type: [String], default: [] })
//   notes: string[];

//   // === AUDIT FIELDS ===

//   /** Who created this lead */
//   @Prop({ required: true })
//   createdBy: string;

//   /** Who last updated this lead */
//   @Prop()
//   updatedBy?: string;

//   // Timestamps are automatically added by @Schema({ timestamps: true })
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// export const LeadSchema = SchemaFactory.createForClass(Lead);

// // Add indexes after schema creation for better performance
// LeadSchema.index({ consumerDataId: 1 });
// LeadSchema.index({ status: 1 });
// LeadSchema.index({ assignedTo: 1 });
// LeadSchema.index({ nextFollowUpDate: 1 });

// export type LeadDocument = Lead & Document;

// // === PRE-SAVE MIDDLEWARE ===
// // Calculate derived fields and perform validations

// LeadSchema.pre('save', function (next) {
//   // Calculate yearly consumption if monthly units are available
//   if (
//     this.connectionDetails?.avgMonthlyUnits &&
//     !this.connectionDetails?.yearlyConsumption
//   ) {
//     this.connectionDetails.yearlyConsumption =
//       this.connectionDetails.avgMonthlyUnits * 12;
//   }

//   // Auto-calculate solar assessment if basic info is available
//   if (
//     this.connectionDetails?.avgMonthlyUnits &&
//     this.connectionDetails?.avgMonthlyBill &&
//     !this.solarAssessment?.estimatedCapacity
//   ) {
//     const monthlyUnits = this.connectionDetails.avgMonthlyUnits;
//     const monthlyBill = this.connectionDetails.avgMonthlyBill;

//     // Rule of thumb calculations
//     const estimatedCapacity = Math.round((monthlyUnits / 150) * 10) / 10; // 1kW per 150 units
//     const estimatedCost = estimatedCapacity * 50000; // ₹50k per kW
//     const estimatedSavings = Math.round(monthlyBill * 0.85); // 85% savings
//     const paybackPeriod = Math.round(estimatedCost / estimatedSavings);
//     const roiPercentage = Math.round((12 / paybackPeriod) * 100 * 100) / 100;

//     if (!this.solarAssessment) this.solarAssessment = {};
//     this.solarAssessment.estimatedCapacity = estimatedCapacity;
//     this.solarAssessment.estimatedCost = estimatedCost;
//     this.solarAssessment.estimatedSavings = estimatedSavings;
//     this.solarAssessment.paybackPeriod = paybackPeriod;
//     this.solarAssessment.roiPercentage = roiPercentage;
//   }

//   // Set priority based on potential savings
//   if (this.solarAssessment?.estimatedSavings) {
//     const savings = this.solarAssessment.estimatedSavings;
//     if (savings > 5000) this.priority = 'high';
//     else if (savings > 3000) this.priority = 'medium';
//     else this.priority = 'low';
//   }

//   // Auto-set next follow-up date based on status
//   if (this.status === 'new' && !this.nextFollowUpDate) {
//     this.nextFollowUpDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
//   } else if (this.status === 'contacted' && !this.nextFollowUpDate) {
//     this.nextFollowUpDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
//   }

//   // Set appropriate tags
//   if (!this.tags) this.tags = [];

//   // Add tags based on assessment
//   if (
//     this.solarAssessment &&
//     this.solarAssessment.estimatedSavings > 5000 &&
//     !this.tags.includes('high-value')
//   ) {
//     this.tags.push('high-value');
//   }

//   if (
//     this.connectionDetails &&
//     this.connectionDetails.currentLoad &&
//     this.connectionDetails.currentLoad.includes('agricultural') &&
//     !this.tags.includes('agricultural')
//   ) {
//     this.tags.push('agricultural');
//   }

//   if (this.interestLevel === 'very_high' && !this.tags.includes('hot-lead')) {
//     this.tags.push('hot-lead');
//   }

//   next();
// });

// // === VIRTUAL FIELDS ===
// // Computed properties that don't get stored

// LeadSchema.virtual('isHighValue').get(function () {
//   return this.solarAssessment?.estimatedSavings > 5000;
// });

// LeadSchema.virtual('daysSinceCreated').get(function () {
//   return Math.floor((Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
// });

// LeadSchema.virtual('isOverdue').get(function () {
//   return this.nextFollowUpDate && this.nextFollowUpDate < new Date();
// });

// // === INSTANCE METHODS ===
// // Methods available on lead documents

// LeadSchema.methods.addCommunication = function (communication: any) {
//   this.communicationHistory.push({
//     ...communication,
//     date: communication.date || new Date(),
//   });
//   this.lastContactDate = new Date();
//   return this.save();
// };

// LeadSchema.methods.scheduleFollowUp = function (date: Date, reason?: string) {
//   this.nextFollowUpDate = date;
//   if (reason) {
//     this.notes.push(`Follow-up scheduled for ${date.toISOString()}: ${reason}`);
//   }
//   return this.save();
// };

// LeadSchema.methods.updateStatus = function (newStatus: string, reason?: string) {
//   const oldStatus = this.status;
//   this.status = newStatus;
  
//   if (reason) {
//     this.notes.push(`Status changed from ${oldStatus} to ${newStatus}: ${reason}`);
//   }

//   // Set lost reason if applicable
//   if (newStatus === 'lost' && reason) {
//     this.lostReason = reason;
//   }

//   return this.save();
// };
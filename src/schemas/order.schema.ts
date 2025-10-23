import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

/**
 * Order Schema
 *
 * This collection manages confirmed solar installation orders throughout their lifecycle.
 * Orders are created when leads are successfully converted and contain all details
 * needed for project execution, from initial confirmation to final commissioning.
 *
 * Lifecycle: confirmed -> site_survey -> permits -> installation -> commissioning -> completed
 */
@Schema({
  timestamps: true,
  collection: 'orders',
})
export class Order {
  // === REFERENCE LINKS ===

  /** Reference to the lead that generated this order */
  @Prop({
    type: Types.ObjectId,
    ref: 'Lead',
    required: true,
    index: true,
  })
  leadId: Types.ObjectId;

  /** Reference to original consumer data (if applicable) */
  @Prop({
    type: Types.ObjectId,
    ref: 'ConsumerData',
    index: true,
  })
  consumerDataId?: Types.ObjectId;

  // === ORDER IDENTIFICATION ===

  /** Unique order number for tracking and reference */
  @Prop({
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true,
  })
  orderNumber: string;

  /** Financial year for accounting purposes */
  @Prop({
    required: true,
    trim: true,
    index: true,
  })
  financialYear: string; // e.g., "2025-26"

  // === CUSTOMER INFORMATION ===

  /** Complete customer details for this order */
  @Prop({
    type: {
      name: { type: String, required: true, trim: true },
      consumerNumber: { type: String, trim: true, uppercase: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, trim: true, lowercase: true },
      alternatePhone: { type: String, trim: true },
      customerType: {
        type: String,
        enum: ['residential', 'commercial', 'agricultural', 'industrial'],
        required: true,
        index: true,
      },
    },
    required: true,
  })
  customer: {
    name: string;
    consumerNumber?: string;
    phone: string;
    email?: string;
    alternatePhone?: string;
    customerType: string;
  };

  // === ADDRESS INFORMATION ===

  /** Installation site address (where solar will be installed) */
  @Prop({
    type: {
      full: { type: String, required: true, trim: true },
      landmark: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true },
      coordinates: {
        type: {
          latitude: { type: Number, min: -90, max: 90 },
          longitude: { type: Number, min: -180, max: 180 },
        },
      },
    },
    required: true,
  })
  installationAddress: {
    full: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  /** Billing address (if different from installation address) */
  @Prop({
    type: {
      full: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
  })
  billingAddress?: {
    full?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };

  // === ORDER STATUS ===

  /** Current status of the order in the fulfillment pipeline */
  @Prop({
    enum: [
      'confirmed', // Order confirmed, waiting for site survey
      'site_survey_scheduled', // Site survey scheduled
      'site_survey_completed', // Site survey done, designing system
      'design_approved', // System design approved by customer
      'permits_applied', // Applied for necessary permits
      'permits_approved', // All permits received
      'material_ordered', // Materials ordered from suppliers
      'material_received', // Materials received at warehouse
      'installation_scheduled', // Installation team and date scheduled
      'installation_in_progress', // Installation work started
      'installation_completed', // Physical installation done
      'electrical_work_completed', // Electrical connections done
      'inspection_scheduled', // Government/utility inspection scheduled
      'inspection_passed', // Inspection completed successfully
      'commissioning', // System commissioning in progress
      'grid_connected', // Connected to electricity grid
      'completed', // Project fully completed
      'on_hold', // Temporarily paused
      'cancelled', // Order cancelled
    ],
    required: true,
    default: 'confirmed',
    index: true,
  })
  status: string;

  /** Reason for cancellation (if cancelled) */
  @Prop({
    trim: true,
    maxlength: 500,
  })
  cancellationReason?: string;

  /** Date when order was cancelled */
  @Prop()
  cancelledAt?: Date;

  // === CURRENT ELECTRICITY CONSUMPTION ===

  /** Customer's current electricity usage patterns */
  @Prop({
    type: {
      avgMonthlyUnits: { type: Number, min: 0 }, // Current monthly consumption
      avgMonthlyBill: { type: Number, min: 0 }, // Current monthly bill
      last12MonthsData: {
        type: [
          {
            month: { type: String, required: true }, // e.g., "2025-01"
            units: { type: Number, min: 0 },
            amount: { type: Number, min: 0 },
          },
        ],
      },
      connectionType: {
        type: String,
        enum: ['flat_rate', 'metered', 'subsidized', 'commercial_rate'],
      },
      sanctionedLoad: { type: Number, min: 0 }, // Sanctioned load in kW
      electricityProvider: { type: String, trim: true },
    },
  })
  currentConsumption?: {
    avgMonthlyUnits?: number;
    avgMonthlyBill?: number;
    last12MonthsData?: Array<{
      month: string;
      units: number;
      amount: number;
    }>;
    connectionType?: string;
    sanctionedLoad?: number;
    electricityProvider?: string;
  };

  // === SOLAR SYSTEM SPECIFICATIONS ===

  /** Complete technical specifications of the solar system */
  @Prop({
    type: {
      totalCapacity: { type: Number, required: true, min: 0 }, // Total system capacity in kW

      // Solar Panels
      panels: {
        type: {
          brand: { type: String, required: true, trim: true },
          model: { type: String, required: true, trim: true },
          wattage: { type: Number, required: true, min: 0 }, // Per panel wattage
          quantity: { type: Number, required: true, min: 1 },
          efficiency: { type: Number, min: 0, max: 100 }, // Panel efficiency %
          technology: {
            type: String,
            enum: ['monocrystalline', 'polycrystalline', 'thin_film'],
            required: true,
          },
          warranty: { type: Number, min: 0 }, // Warranty years
        },
        required: true,
      },

      // Inverter
      inverter: {
        type: {
          brand: { type: String, required: true, trim: true },
          model: { type: String, required: true, trim: true },
          capacity: { type: Number, required: true, min: 0 }, // Inverter capacity in kW
          type: {
            type: String,
            enum: ['string', 'power_optimizer', 'microinverter', 'hybrid'],
            required: true,
          },
          efficiency: { type: Number, min: 0, max: 100 },
          warranty: { type: Number, min: 0 },
        },
        required: true,
      },

      // Battery (if included)
      battery: {
        type: {
          included: { type: Boolean, default: false },
          brand: { type: String, trim: true },
          model: { type: String, trim: true },
          capacity: { type: Number, min: 0 }, // Battery capacity in kWh
          type: {
            type: String,
            enum: ['lithium_ion', 'lead_acid', 'saltwater'],
          },
          warranty: { type: Number, min: 0 },
          quantity: { type: Number, min: 1 },
        },
      },

      // Mounting Structure
      mounting: {
        type: {
          type: {
            type: String,
            enum: ['roof_mounted', 'ground_mounted', 'canopy', 'facade'],
            required: true,
          },
          material: {
            type: String,
            enum: ['aluminum', 'steel', 'stainless_steel'],
            required: true,
          },
          tiltAngle: { type: Number, min: 0, max: 90 },
          azimuthAngle: { type: Number, min: 0, max: 360 },
        },
        required: true,
      },

      // Performance Estimates
      performance: {
        type: {
          estimatedAnnualGeneration: { type: Number, min: 0 }, // kWh per year
          estimatedMonthlyGeneration: { type: Number, min: 0 }, // kWh per month
          performanceRatio: { type: Number, min: 0, max: 1 }, // System efficiency
          degradationRate: { type: Number, min: 0, max: 5 }, // % per year
          firstYearGeneration: { type: Number, min: 0 },
        },
      },
    },
    required: true,
  })
  systemDetails: {
    totalCapacity: number;
    panels: {
      brand: string;
      model: string;
      wattage: number;
      quantity: number;
      efficiency?: number;
      technology: string;
      warranty?: number;
    };
    inverter: {
      brand: string;
      model: string;
      capacity: number;
      type: string;
      efficiency?: number;
      warranty?: number;
    };
    battery?: {
      included?: boolean;
      brand?: string;
      model?: string;
      capacity?: number;
      type?: string;
      warranty?: number;
      quantity?: number;
    };
    mounting: {
      type: string;
      material: string;
      tiltAngle?: number;
      azimuthAngle?: number;
    };
    performance?: {
      estimatedAnnualGeneration?: number;
      estimatedMonthlyGeneration?: number;
      performanceRatio?: number;
      degradationRate?: number;
      firstYearGeneration?: number;
    };
  };

  // === COST BREAKDOWN ===

  /** Detailed financial breakdown of the order */
  @Prop({
    type: {
      // Component Costs
      panelsCost: { type: Number, required: true, min: 0 },
      inverterCost: { type: Number, required: true, min: 0 },
      batteryCost: { type: Number, default: 0, min: 0 },
      structureCost: { type: Number, required: true, min: 0 },
      electricalCost: { type: Number, required: true, min: 0 },
      installationCost: { type: Number, required: true, min: 0 },

      // Additional Costs
      permitsCost: { type: Number, default: 0, min: 0 },
      transportationCost: { type: Number, default: 0, min: 0 },
      commissioningCost: { type: Number, default: 0, min: 0 },
      designCost: { type: Number, default: 0, min: 0 },
      miscellaneousCost: { type: Number, default: 0, min: 0 },

      // Totals before tax
      subtotal: { type: Number, required: true, min: 0 },

      // Discounts
      discountAmount: { type: Number, default: 0, min: 0 },
      discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
      discountReason: { type: String, trim: true },

      // Taxes
      cgstRate: { type: Number, default: 9, min: 0, max: 30 }, // Central GST rate
      sgstRate: { type: Number, default: 9, min: 0, max: 30 }, // State GST rate
      igstRate: { type: Number, default: 0, min: 0, max: 30 }, // Integrated GST rate
      cgstAmount: { type: Number, default: 0, min: 0 },
      sgstAmount: { type: Number, default: 0, min: 0 },
      igstAmount: { type: Number, default: 0, min: 0 },
      totalTax: { type: Number, required: true, min: 0 },

      // Final amounts
      totalCost: { type: Number, required: true, min: 0 }, // After discount and tax
      roundOff: { type: Number, default: 0 }, // Rounding adjustment
      finalAmount: { type: Number, required: true, min: 0 }, // Amount customer pays
    },
    required: true,
  })
  costBreakdown: {
    panelsCost: number;
    inverterCost: number;
    batteryCost: number;
    structureCost: number;
    electricalCost: number;
    installationCost: number;
    permitsCost: number;
    transportationCost: number;
    commissioningCost: number;
    designCost: number;
    miscellaneousCost: number;
    subtotal: number;
    discountAmount: number;
    discountPercentage: number;
    discountReason?: string;
    cgstRate: number;
    sgstRate: number;
    igstRate: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    totalTax: number;
    totalCost: number;
    roundOff: number;
    finalAmount: number;
  };

  // === SUBSIDIES AND INCENTIVES ===

  /** Government subsidies and incentives applicable */
  @Prop({
    type: {
      centralSubsidy: {
        type: {
          applicable: { type: Boolean, default: false },
          scheme: { type: String, trim: true }, // e.g., "PM KUSUM", "Grid Connected Rooftop"
          amount: { type: Number, min: 0 },
          percentage: { type: Number, min: 0, max: 100 },
          status: {
            type: String,
            enum: [
              'not_applied',
              'applied',
              'approved',
              'disbursed',
              'rejected',
            ],
            default: 'not_applied',
          },
          applicationDate: { type: Date },
          approvalDate: { type: Date },
          disbursementDate: { type: Date },
        },
      },
      stateSubsidy: {
        type: {
          applicable: { type: Boolean, default: false },
          scheme: { type: String, trim: true },
          amount: { type: Number, min: 0 },
          percentage: { type: Number, min: 0, max: 100 },
          status: {
            type: String,
            enum: [
              'not_applied',
              'applied',
              'approved',
              'disbursed',
              'rejected',
            ],
            default: 'not_applied',
          },
          applicationDate: { type: Date },
          approvalDate: { type: Date },
          disbursementDate: { type: Date },
        },
      },
      netMetering: {
        type: {
          applicable: { type: Boolean, default: true },
          applicationSubmitted: { type: Boolean, default: false },
          approvalReceived: { type: Boolean, default: false },
          meterInstalled: { type: Boolean, default: false },
          connectionDate: { type: Date },
        },
      },
    },
  })
  subsidies?: {
    centralSubsidy?: {
      applicable?: boolean;
      scheme?: string;
      amount?: number;
      percentage?: number;
      status?: string;
      applicationDate?: Date;
      approvalDate?: Date;
      disbursementDate?: Date;
    };
    stateSubsidy?: {
      applicable?: boolean;
      scheme?: string;
      amount?: number;
      percentage?: number;
      status?: string;
      applicationDate?: Date;
      approvalDate?: Date;
      disbursementDate?: Date;
    };
    netMetering?: {
      applicable?: boolean;
      applicationSubmitted?: boolean;
      approvalReceived?: boolean;
      meterInstalled?: boolean;
      connectionDate?: Date;
    };
  };

  // === PAYMENT DETAILS ===

  /** Payment terms and tracking */
  @Prop({
    type: {
      paymentTerms: {
        type: String,
        enum: ['full_advance', 'milestone_based', 'custom'],
        required: true,
        default: 'milestone_based',
      },

      // Payment Schedule
      schedule: {
        type: [
          {
            milestone: { type: String, required: true, trim: true },
            percentage: { type: Number, required: true, min: 0, max: 100 },
            amount: { type: Number, required: true, min: 0 },
            dueDate: { type: Date },
            status: {
              type: String,
              enum: ['pending', 'paid', 'overdue', 'partial'],
              default: 'pending',
            },
            paidAmount: { type: Number, default: 0, min: 0 },
            paidDate: { type: Date },
            paymentMethod: {
              type: String,
              enum: [
                'cash',
                'bank_transfer',
                'cheque',
                'online',
                'card',
                'emi',
              ],
            },
            transactionId: { type: String, trim: true },
            notes: { type: String, trim: true },
          },
        ],
        required: true,
      },

      // Payment Summary
      totalAmount: { type: Number, required: true, min: 0 },
      paidAmount: { type: Number, default: 0, min: 0 },
      pendingAmount: { type: Number, required: true, min: 0 },

      // EMI Details (if applicable)
      emiDetails: {
        type: {
          isEMI: { type: Boolean, default: false },
          bankName: { type: String, trim: true },
          loanAmount: { type: Number, min: 0 },
          downPayment: { type: Number, min: 0 },
          interestRate: { type: Number, min: 0, max: 50 },
          tenure: { type: Number, min: 1, max: 360 }, // months
          monthlyEMI: { type: Number, min: 0 },
          processingFee: { type: Number, min: 0 },
          approvalStatus: {
            type: String,
            enum: [
              'not_applied',
              'applied',
              'approved',
              'disbursed',
              'rejected',
            ],
            default: 'not_applied',
          },
        },
      },
    },
    required: true,
  })
  payments: {
    paymentTerms: string;
    schedule: Array<{
      milestone: string;
      percentage: number;
      amount: number;
      dueDate?: Date;
      status: string;
      paidAmount: number;
      paidDate?: Date;
      paymentMethod?: string;
      transactionId?: string;
      notes?: string;
    }>;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    emiDetails?: {
      isEMI?: boolean;
      bankName?: string;
      loanAmount?: number;
      downPayment?: number;
      interestRate?: number;
      tenure?: number;
      monthlyEMI?: number;
      processingFee?: number;
      approvalStatus?: string;
    };
  };

  // === PROJECT TIMELINE ===

  /** Key dates and milestones for project execution */
  @Prop({
    type: {
      orderDate: { type: Date, required: true },
      estimatedStartDate: { type: Date },
      estimatedCompletionDate: { type: Date },
      actualStartDate: { type: Date },
      actualCompletionDate: { type: Date },

      // Milestone dates
      siteServeyDate: { type: Date },
      designApprovalDate: { type: Date },
      materialOrderDate: { type: Date },
      materialDeliveryDate: { type: Date },
      installationStartDate: { type: Date },
      installationEndDate: { type: Date },
      inspectionDate: { type: Date },
      commissioningDate: { type: Date },
      gridConnectionDate: { type: Date },
      handoverDate: { type: Date },

      // Delays tracking
      totalDelayDays: { type: Number, default: 0, min: 0 },
      delayReasons: { type: [String], default: [] },
    },
    required: true,
  })
  timeline: {
    orderDate: Date;
    estimatedStartDate?: Date;
    estimatedCompletionDate?: Date;
    actualStartDate?: Date;
    actualCompletionDate?: Date;
    siteServeyDate?: Date;
    designApprovalDate?: Date;
    materialOrderDate?: Date;
    materialDeliveryDate?: Date;
    installationStartDate?: Date;
    installationEndDate?: Date;
    inspectionDate?: Date;
    commissioningDate?: Date;
    gridConnectionDate?: Date;
    handoverDate?: Date;
    totalDelayDays: number;
    delayReasons: string[];
  };

  // === TEAM ASSIGNMENT ===

  /** Team members assigned to this project */
  @Prop({
    type: {
      projectManager: { type: String, required: true },
      salesExecutive: { type: String, required: true },
      designEngineer: { type: String },
      siteEngineer: { type: String },
      installationTeamLead: { type: String },
      installationTeam: { type: [String], default: [] },
      electrician: { type: String },
      qualityInspector: { type: String },
    },
    required: true,
  })
  team: {
    projectManager: string;
    salesExecutive: string;
    designEngineer?: string;
    siteEngineer?: string;
    installationTeamLead?: string;
    installationTeam: string[];
    electrician?: string;
    qualityInspector?: string;
  };

  // === DOCUMENTS ===

  /** All documents related to this order */
  @Prop({
    type: [
      {
        category: {
          type: String,
          enum: [
            'contract',
            'quotation',
            'work_order',
            'site_survey',
            'design_drawings',
            'permits',
            'material_specs',
            'installation_photos',
            'inspection_reports',
            'commissioning_report',
            'completion_certificate',
            'warranty_documents',
            'invoice',
            'payment_receipts',
            'other',
          ],
          required: true,
        },
        name: { type: String, required: true, trim: true },
        fileName: { type: String, required: true, trim: true },
        filePath: { type: String, required: true, trim: true },
        uploadDate: { type: Date, required: true, default: Date.now },
        uploadedBy: { type: String, required: true },
        description: { type: String, trim: true },
        version: { type: Number, default: 1, min: 1 },
        isActive: { type: Boolean, default: true },
      },
    ],
    default: [],
  })
  documents: Array<{
    category: string;
    name: string;
    fileName: string;
    filePath: string;
    uploadDate: Date;
    uploadedBy: string;
    description?: string;
    version: number;
    isActive: boolean;
  }>;

  // === QUALITY METRICS ===

  /** Quality assurance and performance metrics */
  @Prop({
    type: {
      preInstallationChecklist: {
        type: {
          siteAccessible: { type: Boolean, default: false },
          roofConditionGood: { type: Boolean, default: false },
          electricalPanelAccessible: { type: Boolean, default: false },
          permitsObtained: { type: Boolean, default: false },
          materialsDelivered: { type: Boolean, default: false },
          completedBy: { type: String },
          completedDate: { type: Date },
        },
      },
      postInstallationChecklist: {
        type: {
          systemGenerating: { type: Boolean, default: false },
          meterConnected: { type: Boolean, default: false },
          safetyTestsPassed: { type: Boolean, default: false },
          customerTrainingDone: { type: Boolean, default: false },
          documentationComplete: { type: Boolean, default: false },
          completedBy: { type: String },
          completedDate: { type: Date },
        },
      },
      customerSatisfactionRating: { type: Number, min: 1, max: 5 },
      customerFeedback: { type: String, trim: true },
      qualityScore: { type: Number, min: 0, max: 100 },
    },
  })
  quality?: {
    preInstallationChecklist?: {
      siteAccessible?: boolean;
      roofConditionGood?: boolean;
      electricalPanelAccessible?: boolean;
      permitsObtained?: boolean;
      materialsDelivered?: boolean;
      completedBy?: string;
      completedDate?: Date;
    };
    postInstallationChecklist?: {
      systemGenerating?: boolean;
      meterConnected?: boolean;
      safetyTestsPassed?: boolean;
      customerTrainingDone?: boolean;
      documentationComplete?: boolean;
      completedBy?: string;
      completedDate?: Date;
    };
    customerSatisfactionRating?: number;
    customerFeedback?: string;
    qualityScore?: number;
  };

  // === WARRANTY INFORMATION ===

  /** Warranty details for different components */
  @Prop({
    type: {
      systemWarranty: {
        type: {
          startDate: { type: Date },
          endDate: { type: Date },
          duration: { type: Number, min: 1 }, // years
          terms: { type: String, trim: true },
        },
      },
      panelWarranty: {
        type: {
          performance: { type: Number, min: 1 }, // years
          product: { type: Number, min: 1 }, // years
          startDate: { type: Date },
        },
      },
      inverterWarranty: {
        type: {
          duration: { type: Number, min: 1 }, // years
          startDate: { type: Date },
          extendedWarrantyAvailable: { type: Boolean, default: false },
        },
      },
      installationWarranty: {
        type: {
          duration: { type: Number, min: 1 }, // years
          coverage: { type: String, trim: true },
          startDate: { type: Date },
        },
      },
    },
  })
  warranty?: {
    systemWarranty?: {
      startDate?: Date;
      endDate?: Date;
      duration?: number;
      terms?: string;
    };
    panelWarranty?: {
      performance?: number;
      product?: number;
      startDate?: Date;
    };
    inverterWarranty?: {
      duration?: number;
      startDate?: Date;
      extendedWarrantyAvailable?: boolean;
    };
    installationWarranty?: {
      duration?: number;
      coverage?: string;
      startDate?: Date;
    };
  };

  // === MAINTENANCE PLAN ===

  /** Post-installation maintenance planning */
  @Prop({
    type: {
      plan: {
        type: String,
        enum: ['basic', 'standard', 'premium', 'none'],
        default: 'standard',
      },
      duration: { type: Number, min: 0 }, // years
      cost: { type: Number, min: 0 }, // annual cost
      includedServices: { type: [String], default: [] },
      nextServiceDate: { type: Date },
      serviceHistory: {
        type: [
          {
            date: { type: Date, required: true },
            type: { type: String, required: true },
            performedBy: { type: String, required: true },
            findings: { type: String, trim: true },
            actions: { type: String, trim: true },
            nextDueDate: { type: Date },
          },
        ],
        default: [],
      },
    },
  })
  maintenance?: {
    plan?: string;
    duration?: number;
    cost?: number;
    includedServices?: string[];
    nextServiceDate?: Date;
    serviceHistory?: Array<{
      date: Date;
      type: string;
      performedBy: string;
      findings?: string;
      actions?: string;
      nextDueDate?: Date;
    }>;
  };

  // === PERFORMANCE MONITORING ===

  /** System performance tracking */
  @Prop({
    type: {
      monitoringSystem: {
        type: {
          installed: { type: Boolean, default: false },
          brand: { type: String, trim: true },
          model: { type: String, trim: true },
          webPortalAccess: { type: Boolean, default: false },
          mobileAppAccess: { type: Boolean, default: false },
        },
      },
      expectedPerformance: {
        type: {
          dailyGeneration: { type: Number, min: 0 }, // kWh
          monthlyGeneration: { type: Number, min: 0 }, // kWh
          annualGeneration: { type: Number, min: 0 }, // kWh
        },
      },
    },
  })
  monitoring?: {
    monitoringSystem?: {
      installed?: boolean;
      brand?: string;
      model?: string;
      webPortalAccess?: boolean;
      mobileAppAccess?: boolean;
    };
    expectedPerformance?: {
      dailyGeneration?: number;
      monthlyGeneration?: number;
      annualGeneration?: number;
    };
  };

  // === ADDITIONAL INFORMATION ===

  /** Tags for categorization */
  @Prop({
    type: [String],
    default: [],
    index: true,
  })
  tags: string[];

  /** Special requirements or notes */
  @Prop({
    type: [String],
    default: [],
  })
  specialRequirements: string[];

  /** General notes and comments */
  @Prop({
    type: [String],
    default: [],
  })
  notes: string[];

  /** Custom fields for business-specific data */
  @Prop({
    type: Object,
    default: {},
  })
  customFields?: Record<string, any>;

  // === AUDIT FIELDS ===

  /** Who created this order */
  @Prop({
    required: true,
  })
  createdBy: string;

  /** Who last updated this order */
  @Prop()
  updatedBy?: string;

  // Timestamps are automatically added by @Schema({ timestamps: true })
  createdAt?: Date;
  updatedAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// === INDEXES FOR PERFORMANCE ===
OrderSchema.index({ orderNumber: 1 }); // Unique order lookup
OrderSchema.index({ 'customer.phone': 1 }); // Customer lookup
OrderSchema.index({ status: 1, 'timeline.orderDate': -1 }); // Status-based queries
OrderSchema.index({ 'team.projectManager': 1, status: 1 }); // Project manager workload
OrderSchema.index({ 'payments.pendingAmount': -1 }); // Payment follow-up
OrderSchema.index({ 'timeline.estimatedCompletionDate': 1 }); // Deadline tracking
OrderSchema.index({ 'systemDetails.totalCapacity': -1 }); // System size analysis
OrderSchema.index({ financialYear: 1, status: 1 }); // Financial reporting

// === PRE-SAVE MIDDLEWARE ===
OrderSchema.pre('save', function (next) {
  // Auto-generate order number if not provided
  if (!this.orderNumber) {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    this.orderNumber = `SOL-${year}-${random}`;
  }

  // Auto-set financial year based on order date
  if (!this.financialYear && this.timeline?.orderDate) {
    const orderYear = this.timeline.orderDate.getFullYear();
    const orderMonth = this.timeline.orderDate.getMonth();
    if (orderMonth >= 3) {
      // April onwards
      this.financialYear = `${orderYear}-${(orderYear + 1).toString().slice(2)}`;
    } else {
      // Jan-March
      this.financialYear = `${orderYear - 1}-${orderYear.toString().slice(2)}`;
    }
  }

  // Calculate cost totals
  if (this.costBreakdown) {
    const {
      panelsCost = 0,
      inverterCost = 0,
      batteryCost = 0,
      structureCost = 0,
      electricalCost = 0,
      installationCost = 0,
      permitsCost = 0,
      transportationCost = 0,
      commissioningCost = 0,
      designCost = 0,
      miscellaneousCost = 0,
      discountAmount = 0,
      cgstRate = 0,
      sgstRate = 0,
      igstRate = 0,
    } = this.costBreakdown;

    // Calculate subtotal
    const subtotal =
      panelsCost +
      inverterCost +
      batteryCost +
      structureCost +
      electricalCost +
      installationCost +
      permitsCost +
      transportationCost +
      commissioningCost +
      designCost +
      miscellaneousCost;

    this.costBreakdown.subtotal = subtotal;

    // Apply discount
    const discountedAmount = subtotal - discountAmount;

    // Calculate taxes
    this.costBreakdown.cgstAmount = (discountedAmount * cgstRate) / 100;
    this.costBreakdown.sgstAmount = (discountedAmount * sgstRate) / 100;
    this.costBreakdown.igstAmount = (discountedAmount * igstRate) / 100;

    this.costBreakdown.totalTax =
      this.costBreakdown.cgstAmount +
      this.costBreakdown.sgstAmount +
      this.costBreakdown.igstAmount;

    // Final amounts
    this.costBreakdown.totalCost =
      discountedAmount + this.costBreakdown.totalTax;
    this.costBreakdown.finalAmount =
      this.costBreakdown.totalCost + (this.costBreakdown.roundOff || 0);
  }

  // Update payment summary
  if (this.payments?.schedule) {
    this.payments.totalAmount = this.costBreakdown?.finalAmount || 0;

    const paidAmount = this.payments.schedule.reduce((sum, payment) => {
      return sum + (payment.paidAmount || 0);
    }, 0);

    this.payments.paidAmount = paidAmount;
    this.payments.pendingAmount = this.payments.totalAmount - paidAmount;
  }

  // Set appropriate tags
  if (!this.tags) this.tags = [];

  // Add customer type tag
  if (
    this.customer?.customerType &&
    !this.tags.includes(this.customer.customerType)
  ) {
    this.tags.push(this.customer.customerType);
  }

  // Add capacity range tag
  if (this.systemDetails?.totalCapacity) {
    const capacity = this.systemDetails.totalCapacity;
    let capacityTag = '';
    if (capacity <= 3) capacityTag = 'small_system';
    else if (capacity <= 10) capacityTag = 'medium_system';
    else capacityTag = 'large_system';

    if (!this.tags.includes(capacityTag)) {
      this.tags.push(capacityTag);
    }
  }

  // Add high-value tag for expensive systems
  if (
    this.costBreakdown?.finalAmount > 500000 &&
    !this.tags.includes('high_value')
  ) {
    this.tags.push('high_value');
  }

  next();
});

// === VIRTUAL FIELDS ===
OrderSchema.virtual('isOverdue').get(function () {
  return (
    this.timeline?.estimatedCompletionDate &&
    this.timeline.estimatedCompletionDate < new Date() &&
    this.status !== 'completed' &&
    this.status !== 'cancelled'
  );
});

OrderSchema.virtual('progressPercentage').get(function () {
  const statusOrder = [
    'confirmed',
    'site_survey_scheduled',
    'site_survey_completed',
    'design_approved',
    'permits_applied',
    'permits_approved',
    'material_ordered',
    'material_received',
    'installation_scheduled',
    'installation_in_progress',
    'installation_completed',
    'electrical_work_completed',
    'inspection_scheduled',
    'inspection_passed',
    'commissioning',
    'grid_connected',
    'completed',
  ];

  const currentIndex = statusOrder.indexOf(this.status);
  return currentIndex >= 0
    ? Math.round((currentIndex / (statusOrder.length - 1)) * 100)
    : 0;
});

// === INSTANCE METHODS ===
OrderSchema.methods.addPayment = function (paymentData: any) {
  const scheduleItem = this.payments.schedule.find(
    (item: any) => item.milestone === paymentData.milestone,
  );

  if (scheduleItem) {
    scheduleItem.paidAmount += paymentData.amount;
    scheduleItem.paidDate = paymentData.date || new Date();
    scheduleItem.paymentMethod = paymentData.method;
    scheduleItem.transactionId = paymentData.transactionId;

    if (scheduleItem.paidAmount >= scheduleItem.amount) {
      scheduleItem.status = 'paid';
    } else {
      scheduleItem.status = 'partial';
    }
  }

  return this.save();
};

OrderSchema.methods.updateStatus = function (
  newStatus: string,
  notes?: string,
) {
  this.status = newStatus;
  if (notes) {
    this.notes.push(`Status updated to ${newStatus}: ${notes}`);
  }
  return this.save();
};

OrderSchema.methods.addDocument = function (documentData: any) {
  this.documents.push({
    ...documentData,
    uploadDate: new Date(),
  });
  return this.save();
};

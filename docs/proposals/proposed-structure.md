# Proposed Data Structure (as provided)

USERS
    _id
    email
    password
    role
    status
    firstName
    lastName
    phoneNumber
    createdAt
    updatedAt

role
    role
    permissions

consumer_data 
    _id
    name
    consumerNumber
    address
    divisionName
    mobileNumber
    purpose
    unitshistory // last 12 month details of units
    avgMonthlyUnits
    amounthistory // last 12 month details of amount
    email
    propertyType // residential, commercial, industrial
    source // scrapped, manually provided etc
    status // new, etc
    notes // [array of string]
    createdAt
    updatedAt
    proposalDetails: {
        solarkw: Number,
        solarType: String, // on grid, off grid, hybrid
        batterykw: Number,
        inverterkw: Number,
        estimatedCost: Number,
        financingOption: String, // loan, cash, lease
        expectedInstallationDate: Date,
        proposalCost: Number
    }

---

Optional: DBML version to paste into dbdiagram.io

```dbml
Project solar_backend_proposed {
  database_type: "mongodb"
  note: "Proposed shape as provided by user"
}

Table users {
  _id string
  email string
  password string
  role string
  status string
  firstName string
  lastName string
  phoneNumber string
  createdAt datetime
  updatedAt datetime
}

Table roles {
  role string
  permissions json
}

Table consumer_data {
  _id string
  name string
  consumerNumber string
  address string
  divisionName string
  mobileNumber string
  purpose string
  unitshistory json // last 12 month details of units
  avgMonthlyUnits double
  amounthistory json // last 12 month details of amount
  email string
  propertyType string // residential, commercial, industrial
  source string // scrapped, manually provided etc
  status string // new, etc
  notes json // [array of string]
  createdAt datetime
  updatedAt datetime
  proposalDetails json // { solarkw, solarType, batterykw, inverterkw, estimatedCost, financingOption, expectedInstallationDate, proposalCost }
}
```

---

# Updated Data Structure (recommended)

This keeps your original depth, removes duplication, and adds minimal fields for ownership, lifecycle, and a robust timeline.

USERS
    _id
    email // unique, lowercase
    password // hashed, select:false
    role // or roles[] if you prefer multi-role
    permissions // optional per-user overrides
    status // active | inactive | suspended | pending
    firstName
    lastName
    phoneNumber
    createdAt
    updatedAt

ROLES (optional)
    _id
    role // unique e.g., admin, sales, technician
    permissions // [string]
    description
    createdAt
    updatedAt

consumer_data
    _id
    // Core (as-is)
    name
    consumerNumber // unique
    address
    divisionName
    mobileNumber
    purpose
    email
    propertyType // residential, commercial, industrial, agricultural
    source // scraped, manual, imported, api
    notes // [string]
    createdAt
    updatedAt

    // Usage history
    unitshistory // number[12] (latest first)
    amounthistory // number[12] (latest first)
    avgMonthlyUnits
    // New: normalized usage for charts/clarity
    usageHistory: [
      { month: String /* YYYY-MM */, units: Number, amount: Number }
    ]

    // Ownership & lifecycle (replace separate Lead)
    assignedTo // ObjectId<User>
    status // prospect | interested | not_interested | qualified | customer | inactive
    stageDates: {
      prospectAt?: Date,
      interestedAt?: Date,
      qualifiedAt?: Date,
      customerAt?: Date,
      inactiveAt?: Date
    }
    tags // [string]

    // Proposals (versioned; replaces single proposalDetails)
    proposals: [
      {
        version: Number,
        status: String, // draft | sent | accepted | rejected | expired
        proposalDate?: Date,
        validUntil?: Date,
        solarKw?: Number,
        solarType?: String, // on_grid | off_grid | hybrid
        batteryKw?: Number,
        inverterKw?: Number,
        estimatedCost?: Number,
        financingOption?: String, // loan | cash | lease
        proposalCost?: Number,
        notes?: String,
        attachments?: [{ name: String, url: String, uploadedAt?: Date }]
      }
    ]

// Keep your original single proposalDetails if needed for compatibility;
// treat it as proposals[0] going forward.

activities (new, unified timeline)
    _id
    subjectType // 'Consumer'
    subjectId // ObjectId<consumer_data._id>
    type // created | note | status_changed | call | email | proposal_sent | assignment | ...
    data // flexible payload per type (e.g., { from, to } for status change)
    actor // ObjectId<User>
    createdAt
    updatedAt

---

Updated DBML (paste into https://dbdiagram.io/d)

```dbml
Project solar_backend_updated {
  database_type: "mongodb"
  note: "Updated shape with ownership, lifecycle, proposals[], and activities"
}

Table users {
  _id string [pk]
  email string [note: "unique, lowercase"]
  password string [note: "hashed, select:false"]
  role string
  permissions json // string[] overrides
  status string // active|inactive|suspended|pending
  firstName string
  lastName string
  phoneNumber string
  createdAt datetime
  updatedAt datetime
}

Table roles {
  _id string [pk]
  role string [note: "unique"]
  permissions json // string[]
  description string
  createdAt datetime
  updatedAt datetime
}

Table consumer_data {
  _id string [pk]
  name string
  consumerNumber string [note: "unique"]
  address string
  divisionName string
  mobileNumber string
  purpose string
  email string
  propertyType string // residential|commercial|industrial|agricultural
  source string // scraped|manual|imported|api
  notes json // string[]
  createdAt datetime
  updatedAt datetime

  // Usage
  unitshistory json // number[12]
  amounthistory json // number[12]
  avgMonthlyUnits double
  usageHistory json // [{month,units,amount}]

  // Lifecycle
  assignedTo string [ref: > users._id]
  status string // prospect|interested|not_interested|qualified|customer|inactive
  stageDates json // {prospectAt, interestedAt, qualifiedAt, customerAt, inactiveAt}
  tags json // string[]

  // Proposals
  proposals json // [{version,status,proposalDate,validUntil,solarKw,solarType,batteryKw,inverterKw,estimatedCost,financingOption,proposalCost,notes,attachments[]}]
}

Table activities {
  _id string [pk]
  subjectType string // 'Consumer'
  subjectId string [ref: > consumer_data._id]
  type string // created|note|status_changed|call|email|proposal_sent|assignment|...
  data json
  actor string [ref: > users._id]
  createdAt datetime
  updatedAt datetime
}

Ref: consumer_data.assignedTo > users._id
Ref: activities.subjectId > consumer_data._id
Ref: activities.actor > users._id
```

Notes
- Keep unitshistory and amounthistory for backward compatibility; prefer usageHistory for analytics and clarity.
- Store multiple proposals in proposals[]; if you only have one, use version: 1.
- Use activities for the timeline instead of embedding large history arrays inside consumer_data.


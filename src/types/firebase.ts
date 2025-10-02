// Firebase collection names based on database schema
export const COLLECTIONS = {
  USER: 'user',
  SERVES: 'serves',
  COMMITTEE: 'committee',
  FUNDING: 'funding',
  VOLUNTEER: 'volunteer',
  VOLUNTEERED: 'volunteered',
  ATTENDED: 'attended',
  ATTENDANCE: 'attendance',
  REPORT: 'report'
} as const;

// Firestore document interfaces
export interface FirestoreDocument {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// SERVES - User committee membership
export interface Serves extends FirestoreDocument {
  UID: string;                    // FK to USER table
  COMM_ID: string;                // FK to COMMITTEE table
  SERVES_JOIN_DATE: Date;         // Date the user joined the committee
  SERVES_ROLE: string;            // The user's role in the committee
}

// COMMITTEE - Committee information
export interface Committee extends FirestoreDocument {
  COMM_ID: string;                // PK - Unique identifier for a committee
  COMM_NAME: string;              // The name of the committee
  COMM_DESCRIPTION: string;       // Detailed description of the committee
  CHAIR_ID: string | null;        // FK - ID of the user who chairs the committee (null for inactive committees)
  COMM_IS_ACTIVE: boolean;        // Indicates if the committee is active
  COMM_TIMESTAMP: Date;           // Timestamp of creation or update
}

// FUNDING - Funding records
export interface Funding extends FirestoreDocument {
  FUND_ID: string;                // PK - Unique identifier for funding record
  UID: string;                    // FK - User involved in funding
  COMM_ID: string;                // FK - Committee associated with funding
  FUND_NAME: string;              // Name of the funding activity
  FUND_DESC: string;              // Description of the funding activity
  FUND_AMT: number;               // Amount of funding
  FUND_TIMESTAMP: Date;           // Creation/update timestamp
  FUND_NEED_BY: Date;             // Date funds are needed by
}

// VOLUNTEER - Volunteer opportunities
export interface Volunteer extends FirestoreDocument {
  VOL_ID: string;                 // PK - Unique identifier for volunteer opportunity
  VOL_NAME: string;               // Name of the opportunity
  VOL_DESCRIPTION: string;        // Description of the opportunity
  VOL_NEEDED: number;             // Number of volunteers needed
  VOL_CONFIRMED: number;          // Number of volunteers confirmed
  VOL_DATE: Date;                 // Date of the opportunity
  VOL_TIME: string;               // Time of the opportunity
  VOL_LOCATION: string;           // Location of the opportunity
  VOL_TIMESTAMP: Date;            // Creation/update timestamp
}

// VOLUNTEERED - User volunteer participation
export interface Volunteered extends FirestoreDocument {
  UID: string;                    // FK - Links to the USER table
  VOL_ID: string;                 // FK - Links to the VOLUNTEER table
  VOL_DATE_REQUESTED: Date;       // Date user requested to volunteer
  VOL_IS_APPROVED: boolean;       // Indicates if request approved
  VOL_PROOF?: string;             // Reference to proof of completion
  VOL_TIMESTAMP: Date;            // Creation/update timestamp
}

// ATTENDED - User attendance records
export interface Attended extends FirestoreDocument {
  UID: string;                    // FK - Links to the USER table
  ATND_TIME: string;              // FK - Links to the ATTENDANCE table
  ATNDED_CODE: string;            // Code used to record attendance
  ATNDED_IS_VALID: boolean;       // Indicates if attendance record is valid
  ATNDED_TIMESTAMP: Date;         // Creation/update timestamp
}

// ATTENDANCE - Attendance events
export interface Attendance extends FirestoreDocument {
  ATND_TIMESTAMP: string;         // PK - Unique identifier for attendance event
  ATND_CODE: string;              // Unique attendance code
  ATND_IS_LIVE: boolean;          // Indicates if attendance period is open
}

// REPORT - Committee reports
export interface Report extends FirestoreDocument {
  REP_ID: string;                 // PK - Unique identifier for a report
  UID: string;                    // FK - ID of the user who authored the report
  COMM_ID: string;                // FK - ID of the committee the report is from
  REP_TITLE: string;              // Title of the report
  REP_DESCRIPTION: string;        // Description/content of the report
  REP_IS_PUBLIC: boolean;         // Indicates if report is public (visible to all club members) or committee-only
  REP_TIMESTAMP: Date;            // Timestamp of report creation or update
}

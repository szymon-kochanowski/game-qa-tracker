export type Priority = 'Critical' | 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest';

export type BugType =
  | 'Stability'
  | 'UI/UX'
  | 'Localization'
  | 'Audio'
  | 'Settings'
  | 'Achievements'
  | 'Visual'
  | 'Gameplay';

export type PlatformStatus =
  | 'To Test'
  | 'In Progress'
  | 'Fixed'
  | 'Occurs'
  | 'Blocked'
  | 'N/A'
  | 'Any Console'
  | 'PS5 or XSX'
  | 'Done'
  | 'Sent Back';

export type OverallStatus =
  | 'To Test'
  | 'In Progress'
  | 'To Be Reviewed'
  | 'Blocked'
  | 'Done'
  | 'Sent Back';

export type UserRole = 'lead' | 'deputy' | 'tester';

export interface UserAccount {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  password: string;
}

export interface BugTicket {
  id: string; // Internal unique ID
  bugId: string; // Jira key e.g. BUG-101
  summary: string;
  priority: Priority;
  bugType: BugType;
  blockedBy?: string; // Jira key e.g. BUG-88
  comment?: string;
  assignedTester?: string; // Tester assigned to verify
  // Platform statuses & builds
  pcStatus: PlatformStatus;
  pcBuild?: string;
  ps5Status: PlatformStatus;
  ps5Build?: string;
  xsxStatus: PlatformStatus;
  xsxBuild?: string;
  switch2Status: PlatformStatus;
  switch2Build?: string;
  status: OverallStatus;
  dateStamped?: string; // ISO or YYYY-MM-DD HH:mm
  sortHelper?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RegreTab {
  id: string;
  name: string; // e.g. "Regre Sprint 14", "Regre Beta"
  tickets: BugTicket[];
  createdAt: string;
}

export type GamingPlatform = 'PC' | 'PS5' | 'XSX' | 'XPA' | 'Switch 2';

export interface BranchBuild {
  id: string;
  platform: GamingPlatform;
  branchName: string;
  useDate: string; // YYYY-MM-DD
  receivedDate: string; // YYYY-MM-DD
  currentBuildName: string;
  buildPath: string;
  steamPassword?: string;
  inUseToday?: boolean;
  comment?: string;
}

export interface DailyAssignment {
  id: string;
  tester: string; // Refers to UserAccount.displayName or comma-separated names
  task: string;
  platform: GamingPlatform | 'Multi' | '';
  branch: string; // Refers to branchName in BranchBuild
  buildVersion?: string; // Resolved from branch
  buildLocation?: string; // Resolved from branch
  taskUrl?: string;
  notes?: string;
}

export type TesterAttendance = 'Active' | 'Absent' | 'Half-day' | 'Sick';

export type QAWorkCategory =
  | 'Test Plan'
  | 'Localization Testing'
  | 'PC Destructive testing'
  | 'Console Destructive testing'
  | 'QA Ready/Cross checks/NMIs'
  | 'Ticket creation/Investigation'
  | 'Focused testing'
  | 'Regression Testing'
  | 'Performance Testing';

export interface TaskSlot {
  task: QAWorkCategory | '';
  hours: number;
}

export interface TesterEffortRow {
  id: string;
  testerName: string;
  status: TesterAttendance;
  slots: [TaskSlot, TaskSlot, TaskSlot, TaskSlot, TaskSlot];
}

export interface GoogleSheetsConfig {
  enabled: boolean;
  webAppUrl: string; // Google Apps Script web app endpoint URL
  spreadsheetId: string;
  sheetTabName: string;
  lastSyncedAt?: string;
  autoSyncMinutes: number; // 0 = manual, >0 = interval in minutes
}

export interface AppSettings {
  jiraBaseUrl: string; // e.g. "https://company.atlassian.net/browse/"
  studioName: string;
  projectName: string;
  googleSheets: GoogleSheetsConfig;
  users: UserAccount[];
}

export interface AppData {
  tabs: RegreTab[];
  activeTabId: string;
  builds: BranchBuild[];
  dailyTasks: DailyAssignment[];
  taskHours: TesterEffortRow[];
  settings: AppSettings;
}

export type SortField = 'priority' | 'status' | 'bugId' | 'date' | 'sortHelper';
export type SortDirection = 'asc' | 'desc';

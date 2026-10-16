import { AppData, BugTicket, BranchBuild, DailyAssignment, TesterEffortRow, RegreTab, UserAccount } from '../types';
import { calculatePlatformsLeft, calculateSortHelper } from './triage';

const STORAGE_KEY = 'game_qa_tracker_state_v1';
const AUTH_USER_KEY = 'game_qa_auth_user_v1';

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const todayStr = getTodayDateString();

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'u_lead',
    username: 'lead',
    displayName: 'Lead QA (Alex)',
    role: 'lead',
    password: 'lead123',
  },
  {
    id: 'u_deputy',
    username: 'deputy',
    displayName: 'Deputy Lead (Sam)',
    role: 'deputy',
    password: 'deputy123',
  },
  {
    id: 'u_t1',
    username: 'chris',
    displayName: 'Chris Morgan',
    role: 'tester',
    password: 'pass_chris',
  },
  {
    id: 'u_t2',
    username: 'jordan',
    displayName: 'Jordan Taylor',
    role: 'tester',
    password: 'pass_jordan',
  },
  {
    id: 'u_t3',
    username: 'morgan',
    displayName: 'Morgan Riley',
    role: 'tester',
    password: 'pass_morgan',
  },
  {
    id: 'u_t4',
    username: 'taylor',
    displayName: 'Taylor Casey',
    role: 'tester',
    password: 'pass_taylor',
  },
  {
    id: 'u_t5',
    username: 'casey',
    displayName: 'Casey Quinn',
    role: 'tester',
    password: 'pass_casey',
  },
  {
    id: 'u_t6',
    username: 'riley',
    displayName: 'Riley Avery',
    role: 'tester',
    password: 'pass_riley',
  },
];

const initialBuilds: BranchBuild[] = [
  {
    id: 'build_1',
    platform: 'PC',
    branchName: 'release/1.2.0-rc',
    useDate: todayStr,
    receivedDate: todayStr,
    currentBuildName: 'Build_1.2.0_b8492_D3D12',
    buildPath: '\\\\nas-qa\\builds\\pc\\release_1.2.0_b8492\\',
    steamPassword: 'playtest_branch_pass',
    inUseToday: true,
    comment: 'Gold candidate package with fixed memory leak on level streaming',
  },
  {
    id: 'build_2',
    platform: 'PS5',
    branchName: 'ps5-cert-final',
    useDate: todayStr,
    receivedDate: todayStr,
    currentBuildName: 'PS5_RC4_CL19203',
    buildPath: 'Neighborhood Content ID: EP0002-PPSA01928_00-GAMEQA0000000001',
    inUseToday: true,
    comment: 'Includes platform TRC patch for account switching during load',
  },
  {
    id: 'build_3',
    platform: 'XSX',
    branchName: 'xbox-release',
    useDate: todayStr,
    receivedDate: todayStr,
    currentBuildName: 'XSX_Build_1.2.0_v9_GDK',
    buildPath: 'Xbox One / Series Content Manager package 1.2.0.9',
    inUseToday: true,
    comment: 'Quick Resume memory optimization verified by engine team',
  },
  {
    id: 'build_4',
    platform: 'Switch 2',
    branchName: 'switch2-gold',
    useDate: todayStr,
    receivedDate: todayStr,
    currentBuildName: 'NX2_Gold_v1.0.8_Master',
    buildPath: 'Target Manager DevKit folder /NAND/prod/release_08/',
    inUseToday: true,
    comment: 'Target framerate 60fps in docked mode, 45-60fps handheld',
  },
  {
    id: 'build_5',
    platform: 'XPA',
    branchName: 'xpa-store-cert',
    useDate: '2026-10-08',
    receivedDate: '2026-10-07',
    currentBuildName: 'XPA_Package_v1.2.0.2',
    buildPath: '\\\\nas-qa\\builds\\xpa\\1.2.0.2\\',
    inUseToday: false,
    comment: 'Awaiting Store team cross-play sign-off',
  },
];

const sampleTicketsSprint14: BugTicket[] = [
  {
    id: 't_1',
    bugId: 'BUG-1024',
    summary: 'Crash when opening weapon wheel during boss phase 2 transformation',
    priority: 'Critical',
    bugType: 'Stability',
    assignedTester: 'Chris Morgan',
    pcStatus: 'Fixed',
    pcBuild: 'Build_1.2.0_b8492_D3D12',
    ps5Status: 'In Progress',
    ps5Build: 'PS5_RC4_CL19203',
    xsxStatus: 'N/A', // Console exclusivity auto-applied when PS5 entered In Progress!
    switch2Status: 'N/A',
    status: 'In Progress',
    comment: 'Engine team fixed heap allocation. Verify memory graph after 3 weapon swaps.',
    sortHelper: 10 + 1,
    createdAt: '2026-10-08T09:00:00Z',
    updatedAt: '2026-10-10T08:15:00Z',
  },
  {
    id: 't_2',
    bugId: 'BUG-1025',
    summary: 'French localization text overflows ammo counter HUD in 16:10 resolutions',
    priority: 'Medium',
    bugType: 'Localization',
    assignedTester: 'Morgan Riley',
    pcStatus: 'Fixed',
    pcBuild: 'Build_1.2.0_b8492_D3D12',
    ps5Status: 'Fixed',
    ps5Build: 'PS5_RC4_CL19203',
    xsxStatus: 'N/A',
    switch2Status: 'N/A',
    status: 'To Be Reviewed', // Auto-handoff applied because all required platforms are finished!
    comment: 'Shortened string used in stringtable_fr.json.',
    sortHelper: 30 + 4,
    createdAt: '2026-10-08T10:30:00Z',
    updatedAt: '2026-10-10T07:45:00Z',
  },
  {
    id: 't_3',
    bugId: 'BUG-1028',
    summary: 'Missing collision on ventilation shaft in Sector 4 causes player to fall out of bounds',
    priority: 'High',
    bugType: 'Gameplay',
    assignedTester: 'Taylor Casey',
    pcStatus: 'To Test',
    ps5Status: 'Any Console',
    xsxStatus: 'Any Console',
    switch2Status: 'Any Console',
    status: 'To Test',
    comment: 'Level designer added blocking volume. Crouch-jump into corner to verify.',
    sortHelper: 3,
    createdAt: '2026-10-09T11:00:00Z',
    updatedAt: '2026-10-09T11:00:00Z',
  },
  {
    id: 't_4',
    bugId: 'BUG-1031',
    summary: 'HDR brightness calibration slider resets to default 100 on game restart',
    priority: 'Medium',
    bugType: 'Settings',
    assignedTester: 'Casey Quinn',
    pcStatus: 'To Test',
    ps5Status: 'To Test',
    xsxStatus: 'To Test',
    switch2Status: 'To Test',
    status: 'To Test',
    comment: 'Config serializer was not persisting DisplayConfig_HDR to local profile.',
    sortHelper: 4,
    createdAt: '2026-10-09T14:20:00Z',
    updatedAt: '2026-10-09T14:20:00Z',
  },
  {
    id: 't_5',
    bugId: 'BUG-1035',
    summary: 'Achievement Sharpshooter does not unlock after 100 precision headshots',
    priority: 'Low',
    bugType: 'Achievements',
    assignedTester: 'Chris Morgan',
    pcStatus: 'To Test',
    ps5Status: 'To Test',
    xsxStatus: 'To Test',
    switch2Status: 'N/A', // Switch 2 has no native achievement system
    status: 'To Test',
    comment: 'Backend counter was checking body shots instead of bone_head tags.',
    sortHelper: 5,
    createdAt: '2026-10-09T15:00:00Z',
    updatedAt: '2026-10-09T15:00:00Z',
  },
  {
    id: 't_6',
    bugId: 'BUG-1042',
    summary: 'Z-fighting and flickering texture clipping on waterfall rocks in Canyon level',
    priority: 'High',
    bugType: 'Visual',
    assignedTester: 'Jordan Taylor',
    pcStatus: 'Occurs',
    pcBuild: 'Build_1.2.0_b8492_D3D12',
    ps5Status: 'PS5 or XSX',
    xsxStatus: 'PS5 or XSX',
    switch2Status: 'To Test',
    status: 'In Progress',
    comment: 'Still visible when distance camera LOD transitions at 45m.',
    sortHelper: 10 + 3,
    createdAt: '2026-10-08T16:00:00Z',
    updatedAt: '2026-10-10T08:00:00Z',
  },
  {
    id: 't_7',
    bugId: 'BUG-1049',
    summary: 'Dialogue audio voice volume cut out completely during train cinematic',
    priority: 'Highest',
    bugType: 'Audio',
    assignedTester: 'Riley Avery',
    blockedBy: 'BUG-990',
    pcStatus: 'Blocked',
    pcBuild: 'Build_1.2.0_b8492_D3D12',
    ps5Status: 'Blocked',
    xsxStatus: 'Blocked',
    switch2Status: 'Blocked',
    status: 'Blocked',
    comment: 'Audio event bank failed to mount due to asset bundle corruption in build.',
    sortHelper: 50 + 2,
    createdAt: '2026-10-07T12:00:00Z',
    updatedAt: '2026-10-09T17:00:00Z',
  },
  {
    id: 't_8',
    bugId: 'BUG-1011',
    summary: 'Inventory button tooltip remains stuck on screen after closing menu with ESC',
    priority: 'Medium',
    bugType: 'UI/UX',
    assignedTester: 'Jordan Taylor',
    pcStatus: 'Done',
    pcBuild: 'Build_1.2.0_b8492_D3D12',
    ps5Status: 'Done',
    ps5Build: 'PS5_RC4_CL19203',
    xsxStatus: 'N/A',
    switch2Status: 'N/A',
    status: 'Done',
    dateStamped: '2026-10-10 09:12',
    comment: 'Verified fixed on both PC and PS5.',
    sortHelper: 100 + 4,
    createdAt: '2026-10-05T08:00:00Z',
    updatedAt: '2026-10-10T09:12:00Z',
  },
  {
    id: 't_9',
    bugId: 'BUG-998',
    summary: 'Infinite load screen when accepting multiplayer invite while in singleplayer pause',
    priority: 'Critical',
    bugType: 'Stability',
    assignedTester: 'Chris Morgan',
    pcStatus: 'Occurs',
    pcBuild: 'Build_1.2.0_b8492_D3D12',
    ps5Status: 'Occurs',
    ps5Build: 'PS5_RC4_CL19203',
    xsxStatus: 'N/A',
    switch2Status: 'N/A',
    status: 'Sent Back',
    dateStamped: '2026-10-10 08:45',
    comment: 'Issue still reproducible on both platforms. Sent back to network engineer.',
    sortHelper: 90 + 1,
    createdAt: '2026-10-04T10:00:00Z',
    updatedAt: '2026-10-10T08:45:00Z',
  },
];

const sampleTicketsBeta: BugTicket[] = [
  {
    id: 'tb_1',
    bugId: 'BUG-850',
    summary: 'Softlock when pausing during dialogue selection in prologue tavern',
    priority: 'Highest',
    bugType: 'Stability',
    assignedTester: 'Casey Quinn',
    pcStatus: 'To Test',
    ps5Status: 'To Test',
    xsxStatus: 'To Test',
    switch2Status: 'To Test',
    status: 'To Test',
    comment: 'UI modal stack freeze investigation.',
    sortHelper: 2,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'tb_2',
    bugId: 'BUG-854',
    summary: 'Spanish subtitles missing in end credits crawl',
    priority: 'Low',
    bugType: 'Localization',
    assignedTester: 'Morgan Riley',
    pcStatus: 'To Test',
    ps5Status: 'Any Console',
    xsxStatus: 'Any Console',
    switch2Status: 'Any Console',
    status: 'To Test',
    comment: 'Credits roll loc table missing keys.',
    sortHelper: 5,
    createdAt: '2026-10-02T11:00:00Z',
    updatedAt: '2026-10-02T11:00:00Z',
  },
];

const initialTabs: RegreTab[] = [
  {
    id: 'tab_sprint_14',
    name: 'Regre Sprint 14',
    tickets: sampleTicketsSprint14,
    createdAt: '2026-10-08T08:00:00Z',
  },
  {
    id: 'tab_beta',
    name: 'Regre 1.2 Beta',
    tickets: sampleTicketsBeta,
    createdAt: '2026-10-01T08:00:00Z',
  },
];

const initialDailyTasks: DailyAssignment[] = [
  {
    id: 'dt_1',
    tester: 'Chris Morgan',
    task: 'Regression testing on Chapter 3 & Boss phase 2 memory leak verification',
    platform: 'PC',
    branch: 'release/1.2.0-rc',
    buildVersion: 'Build_1.2.0_b8492_D3D12',
    buildLocation: '\\\\nas-qa\\builds\\pc\\release_1.2.0_b8492\\',
    taskUrl: 'https://company.atlassian.net/browse/BUG-1024',
    notes: 'Focus on weapon wheel swapping during boss form change',
  },
  {
    id: 'dt_2',
    tester: 'Jordan Taylor',
    task: 'Console destructive testing & controller disconnect pass on PS5 and Xbox',
    platform: 'PS5',
    branch: 'ps5-cert-final',
    buildVersion: 'PS5_RC4_CL19203',
    buildLocation: 'Neighborhood Content ID: EP0002-PPSA01928_00-GAMEQA0000000001',
    taskUrl: '',
    notes: 'Verify platform error handling dialogs',
  },
  {
    id: 'dt_3',
    tester: 'Morgan Riley',
    task: 'Localization QA review: French & Spanish subtitle line length check',
    platform: 'Multi',
    branch: 'release/1.2.0-rc',
    buildVersion: 'Build_1.2.0_b8492_D3D12',
    buildLocation: '\\\\nas-qa\\builds\\pc\\release_1.2.0_b8492\\',
    taskUrl: 'https://company.atlassian.net/browse/BUG-1025',
    notes: 'Check 21:9 ultrawide and 16:10 aspect ratios',
  },
  {
    id: 'dt_4',
    tester: 'Casey Quinn',
    task: 'Switch 2 docked vs handheld framerate profiling & thermal check',
    platform: 'Switch 2',
    branch: 'switch2-gold',
    buildVersion: 'NX2_Gold_v1.0.8_Master',
    buildLocation: 'Target Manager DevKit folder /NAND/prod/release_08/',
    taskUrl: '',
    notes: 'Log any drops under 45fps in Dense Jungle segment',
  },
  {
    id: 'dt_5',
    tester: 'Taylor Casey',
    task: 'Collision & physics boundary exploration in Sector 4',
    platform: 'PC',
    branch: 'release/1.2.0-rc',
    buildVersion: 'Build_1.2.0_b8492_D3D12',
    buildLocation: '\\\\nas-qa\\builds\\pc\\release_1.2.0_b8492\\',
    taskUrl: 'https://company.atlassian.net/browse/BUG-1028',
    notes: 'Crouch jump test on ducts and elevator shafts',
  },
  {
    id: 'dt_6',
    tester: 'Unassigned',
    task: 'Audio occlusion & 3D spatial sound check with headphones',
    platform: 'PC',
    branch: 'release/1.2.0-rc',
    buildVersion: 'Build_1.2.0_b8492_D3D12',
    buildLocation: '\\\\nas-qa\\builds\\pc\\release_1.2.0_b8492\\',
    taskUrl: '',
  },
];

const initialTaskHours: TesterEffortRow[] = [
  {
    id: 'th_1',
    testerName: 'Chris Morgan',
    status: 'Active',
    slots: [
      { task: 'Regression Testing', hours: 4.5 },
      { task: 'Ticket creation/Investigation', hours: 2.0 },
      { task: 'QA Ready/Cross checks/NMIs', hours: 1.0 },
      { task: '', hours: 0 },
      { task: '', hours: 0 },
    ],
  },
  {
    id: 'th_2',
    testerName: 'Jordan Taylor',
    status: 'Active',
    slots: [
      { task: 'Console Destructive testing', hours: 4.0 },
      { task: 'Regression Testing', hours: 2.5 },
      { task: 'Ticket creation/Investigation', hours: 1.0 },
      { task: '', hours: 0 },
      { task: '', hours: 0 },
    ],
  },
  {
    id: 'th_3',
    testerName: 'Morgan Riley',
    status: 'Active',
    slots: [
      { task: 'Localization Testing', hours: 6.0 },
      { task: 'QA Ready/Cross checks/NMIs', hours: 1.5 },
      { task: '', hours: 0 },
      { task: '', hours: 0 },
      { task: '', hours: 0 },
    ],
  },
  {
    id: 'th_4',
    testerName: 'Taylor Casey',
    status: 'Active',
    slots: [
      { task: 'Regression Testing', hours: 5.0 },
      { task: 'Performance Testing', hours: 2.5 },
      { task: '', hours: 0 },
      { task: '', hours: 0 },
      { task: '', hours: 0 },
    ],
  },
  {
    id: 'th_5',
    testerName: 'Casey Quinn',
    status: 'Active',
    slots: [
      { task: 'Performance Testing', hours: 4.5 },
      { task: 'Focused testing', hours: 3.0 },
      { task: '', hours: 0 },
      { task: '', hours: 0 },
      { task: '', hours: 0 },
    ],
  },
  {
    id: 'th_6',
    testerName: 'Riley Avery',
    status: 'Absent',
    slots: [
      { task: '', hours: 0 },
      { task: '', hours: 0 },
      { task: '', hours: 0 },
      { task: '', hours: 0 },
      { task: '', hours: 0 },
    ],
  },
];

export function getInitialAppState(): AppData {
  return {
    tabs: initialTabs,
    activeTabId: 'tab_sprint_14',
    builds: initialBuilds,
    dailyTasks: initialDailyTasks,
    taskHours: initialTaskHours,
    settings: {
      jiraBaseUrl: 'https://company.atlassian.net/browse/',
      studioName: 'GAME STUDIO QA',
      projectName: 'QA Regression Tracker',
      googleSheets: {
        enabled: false,
        webAppUrl: '',
        spreadsheetId: '',
        sheetTabName: 'Regre Sprint 14',
        autoSyncMinutes: 0,
      },
      users: DEFAULT_USERS,
    },
  };
}

export function loadAppState(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialAppState();
      saveAppState(initial);
      return initial;
    }
    const parsed: AppData = JSON.parse(raw);
    if (!parsed.tabs || parsed.tabs.length === 0) {
      return getInitialAppState();
    }
    if (!parsed.settings?.users || parsed.settings.users.length === 0) {
      parsed.settings.users = DEFAULT_USERS;
    }
    if (!parsed.settings?.googleSheets) {
      parsed.settings.googleSheets = {
        enabled: false,
        webAppUrl: '',
        spreadsheetId: '',
        sheetTabName: 'Regre Sprint 14',
        autoSyncMinutes: 0,
      };
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load QA state from localStorage, falling back to defaults:', err);
    return getInitialAppState();
  }
}

export function saveAppState(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save QA state to localStorage:', err);
  }
}

export function getStoredAuthUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredAuthUser(user: UserAccount | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch (err) {
    console.error('Failed to save auth user:', err);
  }
}

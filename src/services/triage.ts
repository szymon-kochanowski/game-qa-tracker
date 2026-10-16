import { BugTicket, BugType, PlatformStatus, Priority, OverallStatus } from '../types';

/**
 * Categorizes a bug summary using ordered regex patterns from the Google Apps Script engine.
 */
export function guessBugTypeFromSummary(summary: string): BugType {
  if (!summary) return 'Gameplay';
  const text = summary.toLowerCase();

  if (text.match(/crash|freeze|fatal error|softlock|infinite load|exception|hang|black screen|bsod|unresponsive|force close|memory leak|not responding/)) {
    return 'Stability';
  }
  if (text.match(/translation|typo|string|language|unlocalized|spanish|french|german|loc bug|placeholder|debug text|grammar|spelling|untranslated|l10n/)) {
    return 'Localization';
  }
  if (text.match(/ui|menu|hud|button|icon|tooltip|prompt|cursor|interface|minimap|widget|overlay|cutoff|overlap|unreadable|crosshair|navigation|scroll/)) {
    return 'UI/UX';
  }
  if (text.match(/audio|sound|music|sfx|vo|voice|volume|mute|dialogue|bgm|noise|static|crackling|lip sync|deafening|cut out/)) {
    return 'Audio';
  }
  if (text.match(/option|resolution|keybind|mapping|sensitivity|slider|config|toggle|preferences|controls|fullscreen|windowed|v-sync|brightness/)) {
    return 'Settings';
  }
  if (text.match(/achievement|trophy|unlock|trigger|gamerscore|badge|100%|not tracking/)) {
    return 'Achievements';
  }
  if (text.match(/texture|clipping|animation|model|lighting|shadow|pop-in|render|t-pose|vfx|geometry|flicker|z-fighting|invisible|floating|lod|particle|shader|artifact|culling|checkerboard|missing mesh/)) {
    return 'Visual';
  }
  if (text.match(/collision|stuck|combat|ai|npc|physics|progression|logic|mechanic|spawn|weapon|health|damage|quest|mission|pathfinding|hitbox|hurtbox|invincible|out of bounds|oob|falling through|interact|exploit|aggro/)) {
    return 'Gameplay';
  }

  return 'Gameplay';
}

/**
 * Calculates initial target platform states based on BugType
 */
export function getInitialPlatformTargets(bugType: BugType): {
  pc: PlatformStatus;
  ps5: PlatformStatus;
  xsx: PlatformStatus;
  switch2: PlatformStatus;
} {
  // PC: To Test for all recognized types
  const pc: PlatformStatus = 'To Test';

  // PS5 & XSX
  let ps5: PlatformStatus = 'N/A';
  let xsx: PlatformStatus = 'N/A';
  let switch2: PlatformStatus = 'N/A';

  if (bugType === 'Gameplay' || bugType === 'Localization') {
    ps5 = 'Any Console';
    xsx = 'Any Console';
    switch2 = 'Any Console';
  } else if (bugType === 'Stability' || bugType === 'Audio' || bugType === 'Settings' || bugType === 'UI/UX') {
    ps5 = 'To Test';
    xsx = 'To Test';
    switch2 = 'To Test';
  } else if (bugType === 'Visual') {
    ps5 = 'PS5 or XSX';
    xsx = 'PS5 or XSX';
    switch2 = 'To Test';
  } else if (bugType === 'Achievements') {
    ps5 = 'To Test';
    xsx = 'To Test';
    switch2 = 'N/A'; // Switch has no native achievements system
  }

  return { pc, ps5, xsx, switch2 };
}

/**
 * Determines whether a single platform test is completed / finished.
 */
export function isPlatformFinished(status: PlatformStatus): boolean {
  return ['Fixed', 'N/A', 'Occurs', 'Blocked', 'Done'].includes(status);
}

/**
 * Checks if a status indicates a pending work obligation.
 */
export function isPlatformPending(status: PlatformStatus): boolean {
  return ['To Test', 'In Progress', 'Any Console', 'PS5 or XSX'].includes(status);
}

/**
 * Calculates the textual string of remaining platforms to test, mirroring Column H formula.
 */
export function calculatePlatformsLeft(ticket: Pick<BugTicket, 'pcStatus' | 'ps5Status' | 'xsxStatus' | 'switch2Status'>): string {
  const left: string[] = [];
  if (ticket.pcStatus === 'To Test' || ticket.pcStatus === 'In Progress') {
    left.push('PC');
  }
  if (['To Test', 'In Progress', 'Any Console', 'PS5 or XSX'].includes(ticket.ps5Status)) {
    left.push('PS5');
  }
  if (['To Test', 'In Progress', 'Any Console', 'PS5 or XSX'].includes(ticket.xsxStatus)) {
    left.push('XSX');
  }
  if (['To Test', 'In Progress', 'Any Console'].includes(ticket.switch2Status)) {
    left.push('Switch 2');
  }
  return left.join(', ');
}

/**
 * Console Mutual Exclusivity Automation (from Triggers.gs lines 78-95)
 * If one console is marked "In Progress", any other console marked "PS5 or XSX" or "Any Console" is converted to "N/A"
 */
export function applyConsoleExclusivity(
  platformEdited: 'ps5' | 'xsx' | 'switch2',
  newStatus: PlatformStatus,
  current: {
    ps5Status: PlatformStatus;
    xsxStatus: PlatformStatus;
    switch2Status: PlatformStatus;
  }
): {
  ps5Status: PlatformStatus;
  xsxStatus: PlatformStatus;
  switch2Status: PlatformStatus;
} {
  const res = { ...current };
  if (platformEdited === 'ps5') res.ps5Status = newStatus;
  if (platformEdited === 'xsx') res.xsxStatus = newStatus;
  if (platformEdited === 'switch2') res.switch2Status = newStatus;

  if (newStatus === 'In Progress') {
    const shouldOverwrite = (val: PlatformStatus) => val === 'PS5 or XSX' || val === 'Any Console';
    if (platformEdited === 'ps5') {
      if (shouldOverwrite(res.xsxStatus)) res.xsxStatus = 'N/A';
      if (shouldOverwrite(res.switch2Status)) res.switch2Status = 'N/A';
    } else if (platformEdited === 'xsx') {
      if (shouldOverwrite(res.ps5Status)) res.ps5Status = 'N/A';
      if (shouldOverwrite(res.switch2Status)) res.switch2Status = 'N/A';
    } else if (platformEdited === 'switch2') {
      if (shouldOverwrite(res.ps5Status)) res.ps5Status = 'N/A';
      if (shouldOverwrite(res.xsxStatus)) res.xsxStatus = 'N/A';
    }
  }

  return res;
}

/**
 * Auto-Handoff & Reverser Logic (from Triggers.gs lines 97-115)
 * When all platforms are resolved, status advances to 'To Be Reviewed'.
 * If any platform is changed back to in-progress or testing, reverts to 'In Progress'.
 */
export function evaluateAutoHandoff(
  currentOverall: OverallStatus,
  pc: PlatformStatus,
  ps5: PlatformStatus,
  xsx: PlatformStatus,
  switch2: PlatformStatus
): OverallStatus {
  const allFinished =
    isPlatformFinished(pc) &&
    isPlatformFinished(ps5) &&
    isPlatformFinished(xsx) &&
    isPlatformFinished(switch2);

  if (allFinished) {
    if (currentOverall !== 'To Be Reviewed' && currentOverall !== 'Done') {
      return 'To Be Reviewed';
    }
    return currentOverall;
  } else {
    if (currentOverall === 'To Be Reviewed') {
      return 'In Progress';
    }
    return currentOverall;
  }
}

/**
 * Numeric sort weighting from Google Sheets SWITCH formula:
 * Critical: 1, Highest: 2, High: 3, Medium: 4, Low: 5, Lowest: 6
 * Adjusted by status (Done/Sent Back pushed down)
 */
export function calculateSortHelper(priority: Priority, status: OverallStatus): number {
  const priorityWeights: Record<Priority, number> = {
    Critical: 1,
    Highest: 2,
    High: 3,
    Medium: 4,
    Low: 5,
    Lowest: 6,
  };

  const base = priorityWeights[priority] || 4;
  if (status === 'Done') return 100 + base;
  if (status === 'Sent Back') return 90 + base;
  if (status === 'Blocked') return 50 + base;
  if (status === 'To Be Reviewed') return 30 + base;
  if (status === 'In Progress') return 10 + base;
  return base; // 'To Test' has highest attention
}

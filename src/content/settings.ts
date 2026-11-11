import type { BackupErrorCode } from '../db/backup'

export const settingsCopy = {
  details: {
    heading: 'You',
    name: 'Your name',
    textSize: 'Text size',
  },
  notifications: {
    heading: 'Notifications',
    intro: 'Get time checks and nudges when the app is in the background.',
    turnOn: 'Turn on notifications',
    status: {
      granted: 'Notifications are on.',
      default: 'Notifications are off.',
      denied: 'Notifications are blocked. You can allow them in your browser’s site settings.',
      unsupported: 'This browser can’t show notifications. Alerts still show inside the app.',
    },
    webLimit:
      'On the web, alerts only arrive while the app is open, even in the background. The Android app will fix this.',
  },
  backup: {
    heading: 'Backup',
    intro: ['Your plans live only on this device.', 'Save a backup file now and then.'],
    download: 'Download backup',
    downloaded: 'Backup saved. Keep it somewhere safe, like cloud storage.',
    restoreHeading: 'Restore from a backup',
    chooseFile: 'Choose backup file',
    previewIntro: (date: string) =>
      date ? `This backup is from ${date}. It has:` : 'This backup has:',
    merge: 'Merge with this device',
    mergeHint: 'Keeps what’s here. Adds what’s in the file.',
    replace: 'Replace everything',
    replaceHint: 'Deletes what’s on this device first.',
    replaceConfirm: 'This deletes everything on this device, then loads the file. Go ahead?',
    replaceYes: 'Yes, replace',
    cancel: 'Cancel',
    restored: 'Restored. Everything from the file is loaded.',
    working: 'Working…',
    errors: {
      'not-json': 'That file can’t be read. Pick an Aloplanner backup file.',
      'not-backup': 'That file isn’t an Aloplanner backup.',
      'too-new': 'That backup is from a newer version of the app. Update the app, then try again.',
      'bad-data': 'That backup looks damaged. Nothing was changed.',
      unknown: 'Something went wrong. Nothing was changed.',
    } satisfies Record<BackupErrorCode | 'unknown', string>,
  },
  /** How to describe a table's row count in the import preview. */
  tableNames: {
    settings: ['settings record', 'settings records'],
    categories: ['category', 'categories'],
    blocks: ['block', 'blocks'],
    tasks: ['task', 'tasks'],
    brainDump: ['brain dump note', 'brain dump notes'],
    healthLogs: ['day of water and meals', 'days of water and meals'],
    messageLog: ['shown message', 'shown messages'],
    meta: ['app note', 'app notes'],
  } as Record<string, [string, string]>,
} as const

export function describeCount(table: string, count: number): string {
  const names = settingsCopy.tableNames[table] ?? [table, table]
  return `${count} ${count === 1 ? names[0] : names[1]}`
}

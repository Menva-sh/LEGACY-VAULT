/*
 * LEGACY VAULT EXECUTOR WORKFLOW SYSTEM
 * Protecting life beyond login.
 *
 * WORKFLOWS is consumed by executor-dashboard.html.
 */

const PLATFORM_DEFINITIONS = [
  ['Instagram', 'ti ti-brand-instagram', 'Social Media', '#E4405F', 'https://www.instagram.com'],
  ['Facebook', 'ti ti-brand-facebook', 'Social Media', '#1877F2', 'https://www.facebook.com'],
  ['Twitter/X', 'ti ti-brand-x', 'Social Media', '#111111', 'https://x.com'],
  ['LinkedIn', 'ti ti-brand-linkedin', 'Social Media', '#0A66C2', 'https://www.linkedin.com'],
  ['Snapchat', 'ti ti-brand-snapchat', 'Social Media', '#FFFC00', 'https://accounts.snapchat.com'],
  ['YouTube', 'ti ti-brand-youtube', 'Social Media', '#FF0000', 'https://www.youtube.com'],
  ['Gmail', 'ti ti-mail', 'Email', '#EA4335', 'https://mail.google.com'],
  ['Outlook', 'ti ti-mail', 'Email', '#0078D4', 'https://outlook.live.com'],
  ['Yahoo Mail', 'ti ti-mail', 'Email', '#6001D2', 'https://mail.yahoo.com'],
  ['PayPal', 'ti ti-brand-paypal', 'Finance', '#003087', 'https://www.paypal.com'],
  ['Google Pay', 'ti ti-wallet', 'Finance', '#4285F4', 'https://pay.google.com'],
  ['PhonePe', 'ti ti-wallet', 'Finance', '#5F259F', 'https://www.phonepe.com'],
  ['Paytm', 'ti ti-wallet', 'Finance', '#00BAF2', 'https://paytm.com'],
  ['BHIM', 'ti ti-building-bank', 'Finance', '#F58220', 'https://www.bhimupi.org.in'],
  ['Google Drive', 'ti ti-brand-google-drive', 'Cloud Storage', '#4285F4', 'https://drive.google.com'],
  ['iCloud', 'ti ti-cloud', 'Cloud Storage', '#3693F3', 'https://www.icloud.com'],
  ['Dropbox', 'ti ti-brand-drops', 'Cloud Storage', '#0061FF', 'https://www.dropbox.com'],
  ['OneDrive', 'ti ti-cloud', 'Cloud Storage', '#0078D4', 'https://onedrive.live.com'],
  ['Netflix', 'ti ti-device-tv', 'Streaming', '#E50914', 'https://www.netflix.com'],
  ['Disney+', 'ti ti-device-tv', 'Streaming', '#113CCF', 'https://www.disneyplus.com'],
  ['Spotify', 'ti ti-brand-spotify', 'Streaming', '#1DB954', 'https://open.spotify.com'],
  ['Amazon Prime', 'ti ti-device-tv', 'Streaming', '#00A8E1', 'https://www.primevideo.com'],
  ['WhatsApp', 'ti ti-brand-whatsapp', 'Messaging', '#25D366', 'https://web.whatsapp.com'],
  ['Telegram', 'ti ti-brand-telegram', 'Messaging', '#26A5E4', 'https://web.telegram.org'],
  ['Google Photos', 'ti ti-photo', 'Photos', '#4285F4', 'https://photos.google.com'],
  ['iCloud Photos', 'ti ti-photo', 'Photos', '#3693F3', 'https://www.icloud.com/photos'],
  ['Coinbase', 'ti ti-currency-bitcoin', 'Crypto', '#0052FF', 'https://www.coinbase.com'],
  ['WazirX', 'ti ti-currency-bitcoin', 'Crypto', '#3067F0', 'https://wazirx.com'],
  ['CoinDCX', 'ti ti-currency-bitcoin', 'Crypto', '#0B1B3A', 'https://coindcx.com'],
  ['Amazon', 'ti ti-brand-amazon', 'Shopping', '#FF9900', 'https://www.amazon.com'],
  ['Flipkart', 'ti ti-shopping-cart', 'Shopping', '#2874F0', 'https://www.flipkart.com']
];

const actionTitles = {
  delete: 'Permanently Delete Account',
  pass: 'Transfer Account Access',
  last_message: 'Post or Send Farewell Message',
  handoff: 'Create Read-Only Archive Handoff'
};

function sharedTips(platform) {
  return [
    `Use the official ${platform.appName} website listed in this step. Avoid search ads or lookalike pages.`,
    'If a verification prompt appears, pause and use the recovery method already approved by the testator.'
  ];
}

function buildDeleteSteps(platform) {
  return [
    {
      stepNumber: 1,
      title: `Sign in to ${platform.appName}`,
      description: 'Open the official account page and confirm you are in the right account.',
      action: `Go to ${platform.url}. Sign in with the account value shown here and the saved password.\nAfter login, confirm the profile name, email, or phone number matches the testator before making changes.`,
      credentials: ['account', 'password'],
      tips: sharedTips(platform),
      showFarewellMessage: false
    },
    {
      stepNumber: 2,
      title: 'Open account settings',
      description: 'Find the privacy, security, or account ownership area.',
      action: `In ${platform.appName}, open the profile menu or settings menu. Look for buttons named "Settings", "Account", "Privacy", "Security", "Account ownership", or "Manage account".\nStay inside official settings and do not click promotional prompts.`,
      credentials: null,
      tips: [
        'Many platforms move delete controls under privacy or account ownership rather than billing.',
        'If you cannot find the option, use the platform help search for "delete account" while still signed in.'
      ],
      showFarewellMessage: false
    },
    {
      stepNumber: 3,
      title: 'Choose permanent deletion',
      description: 'Select deletion, not temporary deactivation.',
      action: `Choose the option named "Delete account", "Close account", "Permanently delete", or "Request account deletion".\nIf ${platform.appName} offers both deactivate and delete, choose delete only if the testator requested permanent closure.`,
      credentials: null,
      tips: [
        'Deactivation usually hides an account but keeps it recoverable.',
        'Read the review screen carefully; it may list data that will be lost permanently.'
      ],
      showFarewellMessage: false
    },
    {
      stepNumber: 4,
      title: 'Confirm and record completion',
      description: 'Submit the final confirmation and save any reference number.',
      action: `When ${platform.appName} asks for confirmation, enter the password if requested and click the final button named "Delete", "Close account", "Confirm", or "Submit request".\nIf a confirmation email or reference number appears, save it before closing the page.`,
      credentials: ['password'],
      tips: [
        'Some platforms keep accounts recoverable for 14 to 30 days before final deletion.',
        'Do not sign back in after requesting deletion unless you intentionally want to cancel it.'
      ],
      showFarewellMessage: false
    }
  ];
}

function buildPassSteps(platform) {
  return [
    {
      stepNumber: 1,
      title: `Sign in to ${platform.appName}`,
      description: 'Access the account and verify the identity details.',
      action: `Go to ${platform.url}. Sign in using the testator's account value and saved password.\nConfirm the account belongs to the testator before changing ownership, recovery, or billing settings.`,
      credentials: ['account', 'password'],
      tips: sharedTips(platform),
      showFarewellMessage: false
    },
    {
      stepNumber: 2,
      title: 'Review recovery and security',
      description: 'Check recovery email, phone, and two-step verification before transfer.',
      action: `Open "Settings" or "Security" in ${platform.appName}. Review recovery email, phone number, backup codes, trusted devices, and two-factor authentication.\nDo not remove any recovery method until you have confirmed a replacement with the executor.`,
      credentials: ['email', '2fa_backup'],
      tips: [
        'Changing recovery information can trigger a security hold.',
        'Keep one working recovery method active until the transfer is fully complete.'
      ],
      showFarewellMessage: false
    },
    {
      stepNumber: 3,
      title: 'Transfer access carefully',
      description: 'Update access details only where the platform permits it.',
      action: `If ${platform.appName} supports ownership transfer, invite the executor using the button named "Invite", "Add user", "Transfer", "Delegate access", or "Family access".\nIf ownership transfer is not supported, update the password and store the new credential in the executor's secure vault.`,
      credentials: ['password'],
      tips: [
        'Some financial, crypto, and payment platforms require legal estate documents before transfer.',
        'Never change tax, bank, or identity details unless the platform explicitly permits executor action.'
      ],
      showFarewellMessage: false
    },
    {
      stepNumber: 4,
      title: 'Confirm executor access',
      description: 'Make sure the executor can access what they need.',
      action: `Sign out of ${platform.appName}, then confirm the executor can sign in or accept the invitation.\nRecord any pending review period, support case number, or confirmation email before marking this workflow complete.`,
      credentials: null,
      tips: [
        'If a support review is pending, keep the workflow open until the platform confirms the change.',
        'Store the confirmation in Legacy Vault notes or the estate records.'
      ],
      showFarewellMessage: false
    }
  ];
}

function buildLastMessageSteps(platform) {
  return [
    {
      stepNumber: 1,
      title: `Sign in to ${platform.appName}`,
      description: 'Open the account where the farewell message will be posted or sent.',
      action: `Go to ${platform.url}. Sign in with the saved account value and password.\nConfirm you are in the correct account before preparing the farewell message.`,
      credentials: ['account', 'password'],
      tips: sharedTips(platform),
      showFarewellMessage: false
    },
    {
      stepNumber: 2,
      title: 'Open the compose or posting area',
      description: 'Find where messages, posts, statuses, or emails are created.',
      action: `In ${platform.appName}, click the button named "Create", "Post", "Compose", "New message", "Status", or "Send message".\nChoose the audience carefully before adding the farewell message.`,
      credentials: null,
      tips: [
        'For public social accounts, check whether the audience is Public, Friends, Followers, or Private.',
        'For email or messaging accounts, confirm recipient names before sending.'
      ],
      showFarewellMessage: false
    },
    {
      stepNumber: 3,
      title: 'Paste and review the farewell message',
      description: 'Use the exact message prepared by the testator.',
      action: `Paste the farewell message into ${platform.appName}. Read it once from start to finish.\nDo not rewrite the message unless the estate instructions explicitly authorize changes.`,
      credentials: null,
      tips: [
        'A calm final review prevents accidental edits or missing names.',
        'If the platform supports drafts, save a draft before posting or sending.'
      ],
      showFarewellMessage: true
    },
    {
      stepNumber: 4,
      title: 'Publish or send the message',
      description: 'Send the message, then confirm it is visible or delivered.',
      action: `Click the final button named "Post", "Share", "Send", or "Publish".\nAfter sending, wait for ${platform.appName} to show the message in the feed, sent folder, chat, or confirmation screen.`,
      credentials: null,
      tips: [
        'Take a screenshot of the posted or sent message for the estate record.',
        'If sending fails, do not retry repeatedly; check the account connection and recipient first.'
      ],
      showFarewellMessage: true
    }
  ];
}

function buildHandoffSteps(platform) {
  return [
    {
      stepNumber: 1,
      title: `Sign in to ${platform.appName}`,
      description: 'Open the account that will be preserved for review.',
      action: `Go to ${platform.url}. Sign in with the saved account value and password.\nConfirm the account belongs to the testator and leave the session open while you prepare the archive.`,
      credentials: ['account', 'password'],
      tips: sharedTips(platform),
      showFarewellMessage: false
    },
    {
      stepNumber: 2,
      title: 'Download or organize important records',
      description: 'Preserve photos, files, statements, receipts, or messages as appropriate.',
      action: `Look for buttons named "Download your data", "Export", "Archive", "Statements", "Receipts", "Photos", or "Files".\nDownload the available archive from ${platform.appName} and store it in the estate folder.`,
      credentials: null,
      tips: [
        'Large archives can take hours or days to prepare; watch for a confirmation email.',
        'Keep folder names plain and dated so family members can understand them later.'
      ],
      showFarewellMessage: false
    },
    {
      stepNumber: 3,
      title: 'Reduce account risk',
      description: 'Remove payment methods or active sharing where appropriate.',
      action: `Open billing, subscriptions, connected apps, devices, and sharing settings in ${platform.appName}.\nCancel renewals, remove unneeded devices, and turn off public sharing unless the will says otherwise.`,
      credentials: ['password', 'pin'],
      tips: [
        'For financial or crypto accounts, do not move funds unless legal authority is confirmed.',
        'For family photo and cloud accounts, preserve first and delete only when instructed.'
      ],
      showFarewellMessage: false
    },
    {
      stepNumber: 4,
      title: 'Hand off the preserved record',
      description: 'Give the executor the archive location and any remaining access notes.',
      action: `Record where the ${platform.appName} archive is stored, what it contains, and whether any account access remains active.\nShare the archive location with the executor using the estate's approved secure channel.`,
      credentials: null,
      tips: [
        'Do not place raw passwords in email or plain text notes.',
        'A short summary helps the executor understand what was preserved and what still needs attention.'
      ],
      showFarewellMessage: false
    }
  ];
}

function makeWorkflow(platformDefinition) {
  const [appName, icon, category, color, url] = platformDefinition;
  const platform = { appName, icon, category, color, url };

  return [
    appName,
    {
      appName,
      icon,
      category,
      color,
      actions: {
        delete: {
          title: `${actionTitles.delete} - ${appName}`,
          steps: buildDeleteSteps(platform)
        },
        pass: {
          title: `${actionTitles.pass} - ${appName}`,
          steps: buildPassSteps(platform)
        },
        last_message: {
          title: `${actionTitles.last_message} - ${appName}`,
          steps: buildLastMessageSteps(platform)
        },
        handoff: {
          title: `${actionTitles.handoff} - ${appName}`,
          steps: buildHandoffSteps(platform)
        }
      }
    }
  ];
}

const WORKFLOWS = Object.fromEntries(PLATFORM_DEFINITIONS.map(makeWorkflow));

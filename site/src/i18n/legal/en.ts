// Copy of the privacy policy and the terms of service. A block is a paragraph,
// a list, or { owner: true } for the owner's details from lib/legal. In the text,
// [label](key) links to a page (see LegalPage) and {email} to the owner's email.
export type LegalBlock = string | { list: string[] } | { owner: true }

export interface LegalSection {
  id: string
  title: string
  blocks: LegalBlock[]
}

export interface LegalDocument {
  meta: { title: string; description: string }
  title: string
  intro: string
  sections: LegalSection[]
}

export interface LegalCopy {
  back: string
  updated: string
  contents: string
  owner: { name: string; nif: string; email: string; address: string }
  privacy: LegalDocument
  terms: LegalDocument
}

export const legal: LegalCopy = {
  back: 'Back to Trama',
  updated: 'Last updated: {date}',
  contents: 'Contents',
  owner: { name: 'Owner', nif: 'Tax ID (NIF)', email: 'Email', address: 'Address' },
  privacy: {
    meta: {
      title: 'Privacy policy — Trama',
      description:
        'What personal data Trama handles, why, which providers help us and how to exercise your rights. No advertising or analytics cookies.',
    },
    title: 'Privacy policy',
    intro:
      'What personal data Trama handles, why, who else handles it and how you control it. We only collect what the service needs to work.',
    sections: [
      {
        id: 'controller',
        title: 'Who is responsible',
        blocks: [
          'Trama (trama.app) is run by the person below, who is the controller of the personal data described in this policy:',
          { owner: true },
          'For anything about your data, write to {email}.',
        ],
      },
      {
        id: 'data',
        title: 'What data we handle',
        blocks: [
          {
            list: [
              'Account: your email, your user name and your password, which we store hashed and never in plain text. If you sign in with Google, Google shares your name, your email and your profile picture with us.',
              'Your stories: everything you write in the editor and the images you upload.',
              'Subscription: your plan, its status and the date of the next payment. You enter your card details on Stripe, and they never reach us.',
              'Technical data: the IP address, the browser and the access logs that our providers record to run and protect the service.',
              'Data of the people who play your stories, only if you turn on tracking (see [section 4](players)).',
            ],
          },
        ],
      },
      {
        id: 'purposes',
        title: 'Why we use it and on what basis',
        blocks: [
          {
            list: [
              'To create your account and provide the editor, the playground and story sharing. It is necessary to perform our contract with you (GDPR art. 6.1.b).',
              'To charge the subscription and keep the invoices, to perform the contract and to comply with tax law (art. 6.1.b and 6.1.c).',
              'To send the emails the service needs: confirming your account, resetting your password, and notices about your subscription or about changes to these texts (art. 6.1.b).',
              'To keep the service secure and prevent abuse, which is our legitimate interest (art. 6.1.f).',
            ],
          },
          'We do not sell your data, we do not use it for advertising and we do not make automated decisions about you. Trama has no newsletter; if we ever add one, it will ask for your consent first.',
        ],
      },
      {
        id: 'players',
        title: 'Data of the people who play your stories',
        blocks: [
          'Playing a story does not need an account. If its author turns on tracking, each playthrough is saved and the author can see it: the name or identifier the story asks for (or “anonymous”), the answers chosen, the scenes visited and when, and the stats and conditions the playthrough ended with.',
          'For that data, the author is the controller and Trama is the processor acting on the author’s behalf (GDPR art. 28): we store it only to show it to the author and we do not use it for anything else. An author who turns on tracking must tell the players and have a legal basis to do so, with particular care if the players are minors.',
          'Players who want to exercise their rights should contact the author of the story. If they write to us, we will pass the request on to the author.',
        ],
      },
      {
        id: 'providers',
        title: 'Who else handles it',
        blocks: [
          'We rely on these providers, which handle the data only on our behalf and under a data processing agreement:',
          {
            list: [
              'Supabase: database, accounts, image storage and account emails. Servers in the European Union (Paris).',
              'Vercel: hosting of the website and the app.',
              'Stripe: payments and subscriptions.',
              'Amazon Web Services: resizing the images you upload. Servers in London.',
              'Google: only if you choose to sign in with your Google account.',
            ],
          },
          'We will also disclose data to the authorities when the law requires it.',
        ],
      },
      {
        id: 'transfers',
        title: 'Transfers outside the European Union',
        blocks: [
          'Vercel, Stripe and Google are based in the United States or may handle data there, and AWS resizes images in the United Kingdom. These transfers are covered by the EU–US Data Privacy Framework, by the European Commission’s standard contractual clauses or, for the United Kingdom, by an adequacy decision.',
        ],
      },
      {
        id: 'retention',
        title: 'How long we keep it',
        blocks: [
          {
            list: [
              'Account and stories: while your account is open. When you ask us to delete it, we erase them within 30 days; copies in backups disappear as those backups expire.',
              'Playthroughs: while the story exists, or until its author deletes it.',
              'Billing data: as long as tax and commercial law require, generally between four and six years.',
              'Technical logs: the short periods our providers set.',
            ],
          },
        ],
      },
      {
        id: 'rights',
        title: 'Your rights',
        blocks: [
          'You can ask to access your data, rectify it, erase it, restrict or object to its processing, and receive a copy in a reusable format (portability). You can change your user name in your profile; for anything else, including deleting your account, write to {email} from your account’s email. We will reply within one month.',
          'If you think we have not handled your data properly, you can complain to the Spanish Data Protection Agency ([aepd.es](aepd)) or to the authority of your country.',
        ],
      },
      {
        id: 'cookies',
        title: 'Cookies and local storage',
        blocks: [
          'Trama uses no advertising or analytics cookies and no third-party tracking. It only stores in your browser (localStorage) what it needs to work:',
          {
            list: [
              'Your session, so you stay signed in.',
              'Your language and your light or dark theme.',
              'The last story you opened and how you left its board.',
            ],
          },
          'All of it is strictly necessary or remembers a choice you made, so it does not need consent. When you pay, Stripe’s page sets its own cookies to process the payment and prevent fraud, as explained in [Stripe’s privacy policy](stripe). Signing in with Google does the same on Google’s page.',
        ],
      },
      {
        id: 'security',
        title: 'Security',
        blocks: [
          'Connections are encrypted (HTTPS), passwords are stored hashed and each author can only reach their own stories. No system is completely safe: if a breach affected your data, we would tell you and the authority as the law requires.',
        ],
      },
      {
        id: 'changes',
        title: 'Changes to this policy',
        blocks: [
          'If we change this policy in a way that matters, we will tell you by email or in the app before the change applies. The date at the top shows the current version.',
        ],
      },
    ],
  },
  terms: {
    meta: {
      title: 'Terms of service — Trama',
      description:
        'The terms for using Trama: accounts, subscriptions and cancellation, your rights over your stories, acceptable use and liability.',
    },
    title: 'Terms of service',
    intro:
      'The agreement between you and Trama when you use trama.app. By creating an account you accept these terms, so please read them.',
    sections: [
      {
        id: 'provider',
        title: 'Who provides the service',
        blocks: [
          'These terms govern the use of the website and the app at trama.app (“Trama” or “the service”), provided by:',
          { owner: true },
        ],
      },
      {
        id: 'service',
        title: 'The service',
        blocks: [
          'Trama is an online tool to write branching interactive stories on a board, test them and share them with a link so that others can play them. Playing a shared story is free and does not need an account. Writing stories needs an account and a subscription; the [pricing page](pricing) describes each plan and its price.',
        ],
      },
      {
        id: 'account',
        title: 'Your account',
        blocks: [
          {
            list: [
              'Give true details and keep your email up to date: it is how we reach you.',
              'Keep your password safe. You are responsible for what is done with your account; tell us if you think someone else is using it.',
              'If you are a minor, you need the permission of your parents or legal guardians.',
            ],
          },
        ],
      },
      {
        id: 'payment',
        title: 'Plans, prices and payment',
        blocks: [
          {
            list: [
              'Prices are shown in euros on the [pricing page](pricing), with VAT included.',
              'Subscriptions are monthly or yearly, and they are paid in advance by card through Stripe. They renew automatically at the end of each period, for the same length and at the price in force, until you cancel.',
              'You can cancel at any time from your profile. Cancelling stops the renewal: you keep the paid features until the end of the period you have already paid, and you will not be charged again. That period is not refunded, except as stated in the next section or where the law requires it.',
              'If we change a price, we will tell you at least 30 days in advance. The new price applies from your next renewal, and you can cancel before then.',
              'If a payment cannot be collected, we may suspend the paid features until it is settled.',
            ],
          },
        ],
      },
      {
        id: 'withdrawal',
        title: 'Right of withdrawal',
        blocks: [
          'If you are a consumer in the European Union, you can withdraw within 14 days of subscribing, without giving a reason, by writing to {email}. Because the service starts right away, by subscribing you ask us to provide it during those 14 days; if you withdraw, we will refund what you paid minus the part for the days you have already had the service.',
        ],
      },
      {
        id: 'content',
        title: 'Your stories',
        blocks: [
          {
            list: [
              'What you write is yours. Trama claims no ownership over your stories or your images.',
              'You give us a free, non-exclusive licence limited to what the service needs: to store your stories, process them (for example, resize your images) and show them to whoever you share them with. It ends when you delete them or your account, apart from the copies in backups until they expire.',
              'You are responsible for what you publish, and you guarantee that you have the rights to it: texts, images, characters and anything else you include.',
              'If you turn on tracking for a story, you ask us to record its playthroughs on your behalf. Section 4 of the [privacy policy](players) describes that processing, and it is our data processing agreement under GDPR article 28.',
              'We make backups, but we cannot rule out every loss: keep your own copy of anything important.',
            ],
          },
        ],
      },
      {
        id: 'use',
        title: 'Acceptable use',
        blocks: [
          'Do not use Trama to:',
          {
            list: [
              'publish illegal content or content that infringes the rights of others, such as intellectual property, privacy or a person’s image;',
              'harass or threaten anyone, incite hatred or violence, or publish sexual content involving minors;',
              'spread malware, spam or deceptive content such as phishing;',
              'attack or overload the service, access it or other people’s accounts without permission, or scrape it massively;',
              'resell access to the service.',
            ],
          },
          'To report content hosted on Trama, write to {email} explaining where it is and why. If we find content or behaviour like this, we may remove the content or suspend the account, telling you why when we can. In serious cases, we may close the account without notice.',
        ],
      },
      {
        id: 'property',
        title: 'Trama’s intellectual property',
        blocks: [
          'The app, its design, the Trama name and logo, and the example story new accounts start with belong to Trama’s owner. You may edit the example story and use it as the base for your own. The story engine (@trama-app/engine) is open source under the MIT licence. Using Trama gives you no other rights over it beyond using it as these terms describe.',
        ],
      },
      {
        id: 'availability',
        title: 'Availability and changes to the service',
        blocks: [
          'We work to keep Trama available and your stories safe, but we cannot promise that it will never fail: there may be interruptions for maintenance, errors or causes beyond our control. We may improve, change or remove features. If a change takes away something essential from your paid plan, we will tell you in advance and you may cancel with a refund of the unused part.',
        ],
      },
      {
        id: 'liability',
        title: 'Liability',
        blocks: [
          'Trama is provided as it is. We are liable for the damage we cause intentionally or through gross negligence, and for anything the law does not allow us to exclude. Otherwise, our liability is limited to what you paid in the 12 months before the incident, and we are not liable for indirect losses such as lost profits. Nothing in these terms limits your rights as a consumer.',
        ],
      },
      {
        id: 'termination',
        title: 'Closing your account',
        blocks: [
          'You can stop using Trama whenever you want: cancel your subscription from your profile and ask us to delete your account at {email}. We will delete your stories and data as the [privacy policy](privacy) describes. We may close accounts that seriously or repeatedly break these terms.',
        ],
      },
      {
        id: 'changes',
        title: 'Changes to these terms',
        blocks: [
          'If we change these terms, we will tell you by email or in the app at least 15 days before the change applies. If you do not agree, you can cancel before then; if you keep using Trama, you accept the new terms.',
        ],
      },
      {
        id: 'law',
        title: 'Applicable law and disputes',
        blocks: [
          'These terms are governed by Spanish law. If you are a consumer, you can go to the courts of the place where you live, and you keep the protection of the mandatory laws of your country. Before that, write to us at {email} and we will try to solve the problem. You can also turn to the consumer arbitration system or to the consumer office where you live.',
        ],
      },
    ],
  },
}

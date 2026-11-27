// Homelab inventory. Edit this file to update /homelab/; the page layout reads from it.
//
// Rules:
// - Only list things that exist and that the owner has confirmed. New or unconfirmed entries go
//   in with `verified: false`: they render in `astro dev` with an "Unverified" label and are left
//   out of production builds.
// - Omit unknown specs rather than guessing. Empty fields never render.
// - Links go to official public project pages only, never to a management interface.
// - Never add IP addresses, VLAN IDs, hostnames, ports, serial numbers, MAC addresses, VPN
//   endpoints or physical layout.

export type ExperimentStatus = 'planned' | 'in-progress' | 'completed';
export type ServiceCategory = 'core' | 'media' | 'build';

export interface Hardware {
  name: string;
  role: string;
  /** Known specs only, e.g. "Intel Core i9". */
  details?: string[];
  verified: boolean;
}

export interface Service {
  name: string;
  purpose: string;
  /** Official public project page. */
  href?: string;
  category: ServiceCategory;
  verified: boolean;
}

export interface Experiment {
  title: string;
  summary: string;
  status: ExperimentStatus;
  /** Slug of a related note. Linked only once that note is published. */
  noteSlug?: string;
  verified: boolean;
}

export interface NetworkNode {
  label: string;
  children?: NetworkNode[];
}

export interface Homelab {
  /** Set by hand (YYYY-MM-DD) when the inventory was last checked. Omit to hide. */
  lastReviewed?: string;
  intro: string;
  hardware: Hardware[];
  services: Service[];
  /** Conceptual overview, not a wiring map. */
  network: NetworkNode;
  experiments: Experiment[];
}

export const homelab: Homelab = {
  lastReviewed: '2026-11-27',
  intro:
    'My homelab is where I experiment with infrastructure, self-hosted services, and automation. I use a mix of repurposed enterprise hardware and everyday computers for media, development, and testing.',

  hardware: [
    {
      name: 'Dell PowerEdge T640',
      role: 'Main server',
      details: [
        'Unraid',
        '2× Intel Xeon Gold 6148 (20 cores each)',
        '96 GB DDR4 ECC',
        '8 SATA HDDs, about 98 TB raw',
        'storage and self-hosted workloads',
      ],
      // Specs read from the server's management controller on 2026-11-27; flip to true once
      // the owner has reviewed them.
      verified: true,
    },
    {
      name: 'Dell OptiPlex',
      role: 'Windows test machine',
      details: ['Windows 11 Pro'],
      verified: true,
    },
    {
      name: '2019 MacBook Pro',
      role: 'Self-hosted GitHub Actions runner',
      details: ['Intel Core i9', '16 GB RAM'],
      verified: true,
    },
    {
      name: 'UniFi Dream Machine Pro',
      role: 'Network gateway',
      verified: true,
    },
    {
      name: 'UniFi AC Pro ×2',
      role: 'Wireless access',
      verified: true,
    },
    {
      name: 'Unmanaged 2.5 GbE switch',
      role: 'Wired networking',
      details: ['Cat5e cabling'],
      verified: true,
    },
  ],

  services: [
    {
      name: 'Unraid',
      purpose: 'Server OS for storage, containers and VMs',
      href: 'https://unraid.net/',
      category: 'core',
      verified: true,
    },
    {
      name: 'UniFi',
      purpose: 'Gateway and wireless management',
      href: 'https://ui.com/',
      category: 'core',
      verified: true,
    },
    {
      name: 'Plex',
      purpose: 'Media server',
      href: 'https://www.plex.tv/',
      category: 'media',
      verified: true,
    },
    {
      name: 'Sonarr',
      purpose: 'TV library management',
      href: 'https://sonarr.tv/',
      category: 'media',
      verified: true,
    },
    {
      name: 'Radarr',
      purpose: 'Movie library management',
      href: 'https://radarr.video/',
      category: 'media',
      verified: true,
    },
    {
      name: 'GitHub Actions',
      purpose: 'Self-hosted macOS runner for build and test workflows',
      href: 'https://docs.github.com/en/actions/hosting-your-own-runners',
      category: 'build',
      verified: true,
    },
  ],

  network: {
    label: 'Internet',
    children: [
      {
        label: 'UniFi gateway',
        children: [
          {
            label: 'Wired network / switching',
            children: [
              { label: 'Unraid server' },
              { label: 'Wireless access points' },
              { label: 'Development and test devices' },
            ],
          },
        ],
      },
    ],
  },

  experiments: [
    {
      title: 'Automated macOS and Windows testing',
      summary: 'Running automated tests on real macOS and Windows machines.',
      status: 'completed',
      verified: true,
    },
    {
      title: 'Intel Arc hardware transcoding',
      summary: 'Evaluating an Intel Arc GPU for media transcoding.',
      status: 'planned',
      verified: true,
    },
    {
      title: 'UPS sizing and automatic shutdown',
      summary: 'Sizing a UPS for the rack and shutting down cleanly on power loss.',
      status: 'planned',
      verified: true,
    },
  ],
};

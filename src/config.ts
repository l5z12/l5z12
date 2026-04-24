export interface AvatarConfig {
  src: string;
  alt: string;
  attribution: { text: string; url: string };
}

export interface SocialLink {
  platform: string;
  handle: string;
  url: string;
  rel?: string;
}

export interface SectionItem {
  label: string;
  value: string;
  url?: string;
  rel?: string;
  mono?: boolean;
  type?: "link" | "email" | "text";
}

export interface Section {
  id: string;
  number: number | null;
  title: string;
  content?: string;
  items?: SectionItem[];
}

export interface SiteConfig {
  identity: {
    name: string;
    handle: string;
    avatar: AvatarConfig;
    socials: SocialLink[];
    gpgKey: { file: string; label: string };
  };
  document: {
    id: string;
    status: string;
    updated: string;
  };
  sections: Section[];
}

const config: SiteConfig = {
  identity: {
    name: "l5z12",
    handle: "l5z12",
    avatar: {
      src: "/l5z12.jpg",
      alt: "Avatar of l5z12",
      attribution: {
        text: "Pixiv #121880528",
        url: "https://www.pixiv.net/en/artworks/121880528#1",
      },
    },
    socials: [
      {
        platform: "GitHub",
        handle: "l5z12",
        url: "https://github.com/l5z12",
        rel: "me",
      },
      {
        platform: "GitLab",
        handle: "l5z12",
        url: "https://gitlab.com/l5z12",
        rel: "me",
      },
    ],
    gpgKey: {
      file: "/l5z12.asc",
      label: "l5z12.asc",
    },
  },

  document: {
    id: "L5Z12-PERSONAL-001",
    status: "Personal",
    updated: "April 2026",
  },

  sections: [
    {
      id: "abstract",
      number: null,
      title: "Abstract",
      content:
        "This document serves as the public profile of l5z12, including identity, contact links, and cryptographic material.",
    },
    {
      id: "identity",
      number: 1,
      title: "Identity",
      items: [
        {
          label: "GitHub",
          value: "github.com/l5z12",
          url: "https://github.com/l5z12",
          rel: "me",
          mono: true,
        },
        {
          label: "GitLab",
          value: "gitlab.com/l5z12",
          url: "https://gitlab.com/l5z12",
          rel: "me",
          mono: true,
        },
      ],
    },
    {
      id: "security",
      number: 2,
      title: "Security",
      content:
        "The following cryptographic key may be used to verify signatures or encrypt communications addressed to l5z12.",
      items: [
        {
          label: "PGP Key",
          value: "l5z12.asc",
          url: "/l5z12.asc",
          mono: true,
        },
      ],
    },
    {
      id: "contact",
      number: 3,
      title: "Contact",
      content: "Electronic mail is the preferred method of contact.",
      items: [
        {
          label: "Email",
          value: "",
          type: "email",
          mono: true,
        },
      ],
    },
  ],
};

export default config;

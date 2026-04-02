export const pageContentKeys = [
  "incentive::scheme",
  "guides::bar-raiser-meeting",
  "guides::time-off-policy",
  "guides::remote-policy",
  "guides::belt-system",
  "brand::bible",
  "culture::vision",
  "culture::readings",
  "culture::principles",
  "culture::masterplan",
  "culture::formulas",
  "culture::failures",
] as const;

export type PageContentKey = (typeof pageContentKeys)[number];

type Header = {
  title: string;
  description: {
    title: string;
    content?: string;
  };
};

export type GuideRichSegment =
  | { kind: "text"; value: string }
  | { kind: "emphasis"; value: string };

export type GuideIntroBlock = string | { segments: GuideRichSegment[] };

export type GuideLink = {
  label: string;
  href: string; // app route, e.g. /guides/belt-system#yellow-belt
};

export type GuideLabeledBlock = {
  label: string;
  body: string;
};

export type GuideSectionBase = {
  index: string;
  title: string;
};

export type BarRaiserStandardLink = {
  prefix: string;
  link: GuideLink;
};

export type BarRaiserSection = GuideSectionBase & {
  paragraphs: string[];
  callout?: string;
  labeled?: GuideLabeledBlock[];
  standardLinks?: BarRaiserStandardLink[];
  guaranteeQuote?: string;
};

export type GuidesBarRaiserMeeting = {
  title: string;
  intro: GuideIntroBlock[];
  sections: BarRaiserSection[];
  footer: string;
};

export type IncentiveViewCurrency = "HKD" | "USD";
export type IncentiveViewPeriod = "Yearly" | "Monthly";

export type IncentiveLabeledPoint = {
  label: string;
  text: string;
};

export type IncentiveEquityBullet = {
  label: string;
  text: string;
  criteria?: string[];
};

export type IncentiveSalaryIncludeLine = {
  label: string;
  trailing: string;
};

export type IncentiveGrowthLevel = {
  id: string;
  description: string;
};

export type IncentiveSalaryConfig = {
  baseJobCosts: Record<string, number>;
  experienceMultipliers: Record<string, number>;
  beltMultipliers: Record<string, number>;
  otherParameters: {
    foodDeduction: number;
    healthInsurance: number;
    mpfEmployerRate: number;
    mpfEmployerMax: number;
    mpfEmployeeRate: number;
    mpfEmployeeMax: number;
  };
};

export type IncentiveSchemeContent = {
  header: {
    title: string;
    subtitle: string;
  };
  viewControls: {
    currency: { hkd: string; usd: string };
    period: { monthly: string; yearly: string };
  };
  philosophy: {
    title: string;
    intro: string;
    points: IncentiveLabeledPoint[];
  };
  incentive: {
    title: string;
    banner: string;
    equity: {
      subtitle: string;
      intro: string;
      bullets: IncentiveEquityBullet[];
    };
    salary: {
      subtitle: string;
      formula: string;
      intro: string;
      includes: {
        mpf: IncentiveSalaryIncludeLine;
        food: IncentiveSalaryIncludeLine;
        healthInsurance: IncentiveSalaryIncludeLine;
        remainder: string;
      };
    };
  };
  roles: {
    title: string;
    table: {
      jobHeader: string;
      employerCostHeaderTemplate: string;
    };
    traineeNoteTemplate: string;
    traineeAnnualNetHkd: number;
  };
  growth: {
    title: string;
    intro: string;
    experience: {
      subtitle: string;
      intro: string;
      bonusLabelTemplate: string;
      levels: IncentiveGrowthLevel[];
    };
    belts: {
      subtitle: string;
      intro: string;
      multiplierLabelTemplate: string;
      items: IncentiveGrowthLevel[];
    };
  };
  calculator: {
    title: string;
    labels: {
      job: string;
      experience: string;
      belt: string;
      location: string;
      employmentType: string;
    };
    locations: string[];
    employmentTypes: string[];
    breakdownTitleTemplate: string;
    rows: {
      baseSalary: string;
      experienceAddon: string;
      ownershipMultiplier: string;
      totalEmployerCost: string;
      foodDeduction: string;
      healthInsurance: string;
      mpfContribution: string;
      netSalary: string;
      estimatedAlternateNetTemplate: string;
    };
  };
  defaultSalaryConfig: IncentiveSalaryConfig;
  fx: {
    hkdPerUsd: number;
  };
};

export type CultureVision = {
  header: Header;
  intro: {
    title: string;
    paragraphs: string[];
  };
  conviction: {
    label: string;
    title: string;
    statement: string;
    paragraphs: string[];
  };
  mission: {
    label: string;
    title: string;
    statement: string;
    paragraphs: string[];
  };
};

export type CultureReadings = {
  header: Header;
  readings: Array<{
    title: string;
    author: string;
    available: boolean;
    desc: string;
  }>;
};

export type CulturePrinciples = {
  header: Header;
  principles: Array<{
    title: string;
    desc: string;
  }>;
};

export type CultureMasterPlan = {
  header: Header;
  intro: {
    paragraphs: string[];
  };
  stages: Array<{
    stage: string;
    title: string;
    capacity: string;
    status?: string;
    goal?: string;
    target?: string;
    reality: string;
    completed: boolean;
    current?: boolean;
  }>;
};

export type CultureFormulas = {
  header: Header;
  formulas: Array<{
    name: string;
    formula: string;
  }>;
};

export type CultureFailures = {
  header: Header;
  intro: {
    title: string;
    footer: string;
    paragraphs: string[];
  };
  failures: Array<{
    title: string;
    lesson: string;
    betrayal: string;
    happened: string;
  }>;
};

export type BrandBibleHeader = {
  title: string;
  description: {
    title: string;
    content?: string;
  };
};

export type BrandBibleLabelBody = {
  label: string;
  body: string;
};

export type BrandBibleLabeledParagraph = {
  label: string;
  text: string;
};

export type BrandBibleStrictRule = {
  title: string;
  body: string;
};

export type BrandBiblePaletteColor = {
  name: string;
  hex: string;
  desc: string;
  accentBorder?: boolean;
};

export type BrandBibleTypographyStyle = {
  name: string;
  desc: string;
  sample: string;
};

export type BrandBibleHierarchyItem = {
  label: string;
  text: string;
};

export type BrandBiblePillar = {
  title: string;
  body: string;
};

export type BrandBiblePhotographyList = {
  title: string;
  items: string[];
};

export type BrandBible = {
  header: BrandBibleHeader;
  docRef: string;
  northStar: {
    id: string;
    title: string;
    mission: BrandBibleLabelBody;
    execution: BrandBibleLabelBody;
  };
  logos: {
    id: string;
    title: string;
    primaryLogo: {
      subtitle: string;
      imageUrl: string;
      imageAlt: string;
      paragraphs: BrandBibleLabeledParagraph[];
    };
    spark: {
      subtitle: string;
      symbolMaskUrl: string;
      symbolTitle: string;
      paragraphs: BrandBibleLabeledParagraph[];
    };
    strictRules: {
      title: string;
      rules: BrandBibleStrictRule[];
    };
  };
  palette: {
    id: string;
    title: string;
    intro: string;
    colors: BrandBiblePaletteColor[];
  };
  typography: {
    id: string;
    title: string;
    intro: string;
    styles: BrandBibleTypographyStyle[];
    hierarchy: {
      title: string;
      items: BrandBibleHierarchyItem[];
    };
  };
  digitalUx: {
    id: string;
    title: string;
    pillars: BrandBiblePillar[];
  };
  physical: {
    id: string;
    title: string;
    pillars: BrandBiblePillar[];
  };
  photography: {
    id: string;
    title: string;
    do: BrandBiblePhotographyList;
    dont: BrandBiblePhotographyList;
    example: {
      imageUrl: string;
      imageAlt: string;
      caption: string;
    };
  };
  serializedBrand: {
    id: string;
    title: string;
    pillars: BrandBiblePillar[];
  };
};

export type TimeOffNoticeItem = { text: string; strong: string };

export type TimeOffPolicySection = GuideSectionBase & {
  lead?: string;
  paragraphs?: string[];
  blocks?: GuideLabeledBlock[];
  callout?: { title: string; body: string };
  noticeRule?: { title: string; items: TimeOffNoticeItem[] };
  blocksTail?: GuideLabeledBlock[];
};

export type GuidesTimeOffPolicy = {
  title: string;
  intro: GuideIntroBlock[];
  sections: TimeOffPolicySection[];
  footer: string;
};

export type GuidesRemotePolicy = {
  title: string;
  hero: {
    line1: string;
    line2: string;
  };
};

export type BeltColorToken = "white" | "yellow" | "orange" | "green" | "black";

export type BeltDefinitionPanel = { label: string; body: string };

export type BeltDefinition = {
  anchorId: string;
  index: string;
  name: string;
  colorToken: BeltColorToken;
  standard: string;
  paragraphs: string[];
  panels: BeltDefinitionPanel[];
  readyLabel?: string;
  readyBody?: string;
};

export type GuidesBeltSystem = {
  title: string;
  intro: GuideIntroBlock[];
  belts: BeltDefinition[];
  footer: string;
};

export type PageContent = {
  "brand::bible": BrandBible;
  "culture::vision": CultureVision;
  "culture::readings": CultureReadings;
  "culture::principles": CulturePrinciples;
  "culture::masterplan": CultureMasterPlan;
  "culture::formulas": CultureFormulas;
  "culture::failures": CultureFailures;
  "incentive::scheme": IncentiveSchemeContent;
  "guides::bar-raiser-meeting": GuidesBarRaiserMeeting;
  "guides::time-off-policy": GuidesTimeOffPolicy;
  "guides::remote-policy": GuidesRemotePolicy;
  "guides::belt-system": GuidesBeltSystem;
};

export type PageByKey<K extends PageContentKey> = PageContent[K];

export const asPageByKey = <K extends PageContentKey>(
  _key: K,
  value: unknown
): PageByKey<K> => {
  return value as PageByKey<K>;
};

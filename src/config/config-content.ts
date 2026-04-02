export const configContentKeys = ["brand", "salary"] as const;

export type ConfigContentKey = (typeof configContentKeys)[number];

export type BrandAssetFormat = {
  src: string;
  format: string;
  size: number;
};

export type BrandLogo = {
  type: string;
  theme: string;
  formats: BrandAssetFormat[];
};

export type BrandColor = {
  hex: string;
  type: string;
  brightness: number;
};

export type BrandFont = {
  name: string;
  type: string;
  origin: string;
  originId: string;
};

export type BrandConfig = {
  name: string;
  domain: string;
  description?: string;
  longDescription?: string;
  links?: { name: string; url: string }[];
  logos: BrandLogo[];
  colors: BrandColor[];
  fonts: BrandFont[];
  updatedAt?: string;
};

export type SalaryConfig = {
  baseJobCosts: { [key: string]: number };
  experienceMultipliers: { [key: string]: number };
  beltMultipliers: { [key: string]: number };
  otherParameters: {
    foodDeduction: number;
    healthInsurance: number;
    mpfEmployerRate: number;
    mpfEmployerMax: number;
    mpfEmployeeRate: number;
    mpfEmployeeMax: number;
  };
};

export type ConfigContent = {
  brand: BrandConfig;
  salary: SalaryConfig;
};

export type ConfigByKey<K extends ConfigContentKey> = ConfigContent[K];

export const asConfigByKey = <K extends ConfigContentKey>(
  _key: K,
  value: unknown
): ConfigByKey<K> => {
  return value as ConfigByKey<K>;
};

import config from "@/config/not-found.json";

export interface NotFoundLink {
  label: string;
  url: string;
}

export interface NotFoundConfig {
  code: string;
  status: string;
  title: string;
  message: string;
  links: NotFoundLink[];
}

export const notFoundConfig: NotFoundConfig = config as NotFoundConfig;

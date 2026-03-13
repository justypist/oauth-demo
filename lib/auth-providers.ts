import type { Provider } from "next-auth/providers/index";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export type AuthProviderId = "github" | "google";

export type AuthProviderMeta = {
  enabled: boolean;
  id: AuthProviderId;
  name: string;
  requiredEnvNames: readonly string[];
};

type AuthProviderDefinition = AuthProviderMeta & {
  createProvider: () => Provider;
};

const providerDefinitions: AuthProviderDefinition[] = [
  {
    createProvider: () =>
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      }),
    enabled: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
    ),
    id: "google",
    name: "Google",
    requiredEnvNames: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  },
  {
    createProvider: () =>
      GitHubProvider({
        clientId: process.env.GITHUB_ID ?? "",
        clientSecret: process.env.GITHUB_SECRET ?? "",
      }),
    enabled: Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET),
    id: "github",
    name: "GitHub",
    requiredEnvNames: ["GITHUB_ID", "GITHUB_SECRET"],
  },
];

export const authBaseEnvNames = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
] as const;

export const supportedAuthProviders: AuthProviderMeta[] = providerDefinitions.map(
  (provider) => ({
    enabled: provider.enabled,
    id: provider.id,
    name: provider.name,
    requiredEnvNames: provider.requiredEnvNames,
  }),
);

export const enabledAuthProviders = supportedAuthProviders.filter(
  (provider) => provider.enabled,
);

export const oauthProviders = providerDefinitions
  .filter((provider) => provider.enabled)
  .map((provider) => provider.createProvider());

export const isAuthConfigured = Boolean(
  process.env.DATABASE_URL &&
    process.env.NEXTAUTH_SECRET &&
    process.env.NEXTAUTH_URL &&
    oauthProviders.length > 0,
);

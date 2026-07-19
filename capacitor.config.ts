import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl =
  process.env.HOMEVAULT_NATIVE_SERVER_URL ?? "https://homevault.grovekind.com";
const productionHost = new URL(productionUrl).hostname;

const config: CapacitorConfig = {
  appId: "au.com.homevault.app",
  appName: "HomeVault",
  webDir: "native-shell",
  server: {
    url: productionUrl,
    cleartext: false,
    allowNavigation: [productionHost],
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
  },
};

export default config;

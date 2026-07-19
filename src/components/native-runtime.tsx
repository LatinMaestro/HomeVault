"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

const productionHost = "homevault.grovekind.com";

function navigateFromAppUrl(value: string) {
  try {
    const url = new URL(value);
    const isTrustedHttps = url.protocol === "https:" && url.hostname === productionHost;
    const isHomeVaultScheme = url.protocol === "homevault:";
    if (!isTrustedHttps && !isHomeVaultScheme) return;

    const destination = `${url.pathname || "/"}${url.search}${url.hash}`;
    window.location.assign(destination);
  } catch {
    // Ignore malformed or untrusted deep links.
  }
}

export function NativeRuntime() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    document.documentElement.dataset.native = Capacitor.getPlatform();

    let active = true;
    const removers: Array<() => Promise<void>> = [];

    async function configureNativeRuntime() {
      const [{ App }, { Network }, { PrivacyScreen }, { StatusBar, Style }] =
        await Promise.all([
          import("@capacitor/app"),
          import("@capacitor/network"),
          import("@capacitor/privacy-screen"),
          import("@capacitor/status-bar"),
        ]);
      if (!active) return;

      await PrivacyScreen.enable({
        android: {
          dimBackground: true,
          preventScreenshots: true,
          privacyModeOnActivityHidden: "splash",
        },
        ios: { blurEffect: "dark" },
      });
      await StatusBar.setStyle({ style: Style.Light });
      if (Capacitor.getPlatform() === "android") {
        await StatusBar.setBackgroundColor({ color: "#0f766e" });
      }

      const urlListener = await App.addListener("appUrlOpen", ({ url }) => {
        navigateFromAppUrl(url);
      });
      removers.push(() => urlListener.remove());

      if (Capacitor.getPlatform() === "android") {
        const backListener = await App.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack) window.history.back();
          else void App.minimizeApp();
        });
        removers.push(() => backListener.remove());
      }

      const networkListener = await Network.addListener(
        "networkStatusChange",
        ({ connected }) => {
          if (!connected && window.location.pathname !== "/offline") {
            window.location.assign("/offline?source=native");
          }
          if (connected && window.location.pathname === "/offline") {
            window.location.assign("/");
          }
        },
      );
      removers.push(() => networkListener.remove());

      const status = await Network.getStatus();
      if (!status.connected && window.location.pathname !== "/offline") {
        window.location.assign("/offline?source=native");
      }
    }

    void configureNativeRuntime();

    return () => {
      active = false;
      for (const remove of removers) void remove();
      delete document.documentElement.dataset.native;
    };
  }, []);

  return null;
}

import { SafeArea } from "capacitor-plugin-safe-area";

export async function applySafeArea(): Promise<void> {
  try {
    const { insets } = await SafeArea.getSafeAreaInsets();
    document.body.style.setProperty('--ion-safe-area-top', `${insets.top}px`);
    document.body.style.setProperty('--ion-safe-area-bottom', `${insets.bottom}px`);
    document.body.style.setProperty('--ion-safe-area-left', `${insets.left}px`);
    document.body.style.setProperty('--ion-safe-area-right', `${insets.right}px`);
  } catch (err) {
    console.warn('SafeArea plugin not available or failed:', err);
  }
}
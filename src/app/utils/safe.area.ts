import { SafeArea } from "capacitor-plugin-safe-area";
import { CSS_VARIABLES, GENERAL } from "../constants/constants";

const SAFE_AREA_CHANGED = 'safeAreaChanged';

export async function applySafeArea(): Promise<void> {
  try {
    const { insets } = await SafeArea.getSafeAreaInsets();
    updateCssVariables(insets);

    SafeArea.addListener(SAFE_AREA_CHANGED, (info) => {
      updateCssVariables(info.insets);
    });
  } catch (err) {}
}

function updateCssVariables(insets: {
  top : number; bottom : number; left : number; right : number
}) : void {
  document.body.style.setProperty(CSS_VARIABLES.SAFE_AREA_TOP, `${insets.top}${GENERAL.PX}`);
  document.body.style.setProperty(CSS_VARIABLES.SAFE_AREA_BOTTOM, `${insets.bottom}${GENERAL.PX}`);
  document.body.style.setProperty(CSS_VARIABLES.SAFE_AREA_LEFT, `${insets.left}${GENERAL.PX}`);
  document.body.style.setProperty(CSS_VARIABLES.SAFE_AREA_RIGHT, `${insets.right}${GENERAL.PX}`);
}
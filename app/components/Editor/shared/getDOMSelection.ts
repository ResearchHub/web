import { CAN_USE_DOM } from "./canUseDOM";

export function getDOMSelection(targetWindow: null | Window): null | Selection {
    return !CAN_USE_DOM ? null : (targetWindow || window).getSelection();
  }
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { createContext, useContext } from 'react';

type SettingsContextShape = {
  isCollab: boolean;
  isRichText: boolean;
  isAutocomplete: boolean;
  isMaxLength: boolean;
  isCharLimit: boolean;
  isCharLimitUtf8: boolean;
  showTreeView: boolean;
  showTableOfContents: boolean;
  shouldUseLexicalContextMenu: boolean;
  shouldPreserveNewLinesInMarkdown: boolean;
  tableCellMerge: boolean;
  tableCellBackgroundColor: boolean;
  tableHorizontalScroll: boolean;
  hasLinkAttributes: boolean;
};

export const SettingsContext = createContext<SettingsContextShape | null>(null);

export function useSettings(): { settings: SettingsContextShape } {
  const context = useContext(SettingsContext);
  if (context == null) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return { settings: context };
}

import { theme as t } from "./theme.js";
import { sectionBlockHeight } from "./section-header.js";

export function languagesPanelHeight(langCount: number, withNote = false): number {
  if (langCount <= 0) return 0;
  const rows = Math.ceil(langCount / 2);
  const noteBlock = withNote ? t.langNoteGap + t.langNoteH : 0;
  return rows * t.langRowH + t.langPadBottom + noteBlock;
}

export function languagesSectionHeight(langCount: number, withNote = false): number {
  if (langCount <= 0) return 0;
  return sectionBlockHeight(languagesPanelHeight(langCount, withNote));
}

export interface CardLayout {
  statsSectionY: number;
  statsContentY: number;
  metricsY1: number;
  metricsY2: number;
  langSectionY: number;
  langContentY: number;
  yearlySectionY: number;
  tableY: number;
  height: number;
}

export function computeCardLayout(
  yearCount: number,
  langCount: number,
  withLangNote = false,
): CardLayout {
  const statsContentH = t.metricH + t.gap + t.metricH;
  const tableRows = Math.max(yearCount, 1);
  const tableHeight = t.tableHeaderH + tableRows * t.tableRowH;

  let y = t.profileBlockH + t.sectionGap;

  const statsSectionY = y;
  const statsContentY = statsSectionY + t.sectionTitleH + t.sectionTitleGap;
  const metricsY1 = statsContentY;
  const metricsY2 = metricsY1 + t.metricH + t.gap;
  y = statsContentY + statsContentH + t.sectionGap;

  const langSectionY = langCount > 0 ? y : 0;
  const langContentY = langCount > 0 ? langSectionY + t.sectionTitleH + t.sectionTitleGap : 0;
  if (langCount > 0) {
    y = langContentY + languagesPanelHeight(langCount, withLangNote) + t.sectionGap;
  }

  const yearlySectionY = y;
  const tableY = yearlySectionY + t.sectionTitleH + t.sectionTitleGap;

  return {
    statsSectionY,
    statsContentY,
    metricsY1,
    metricsY2,
    langSectionY,
    langContentY,
    yearlySectionY,
    tableY,
    height: tableY + tableHeight + t.pad,
  };
}

export function cardHeight(
  yearCount: number,
  langCount: number,
  withLangNote = false,
): number {
  return computeCardLayout(yearCount, langCount, withLangNote).height;
}

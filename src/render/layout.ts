import { theme as t } from "./theme.js";

export function languagesSectionHeight(langCount: number): number {
  if (langCount <= 0) return 0;
  const rows = Math.ceil(langCount / 2);
  return t.langTitleH + rows * t.langRowH + t.langPadBottom;
}

export interface CardLayout {
  metricsY1: number;
  metricsY2: number;
  langY: number;
  tableY: number;
  yearlyTitleCy: number;
  height: number;
}

export function computeCardLayout(yearCount: number, langCount: number): CardLayout {
  const metricsY1 = 108 + t.headerMetricGap;
  const metricsY2 = metricsY1 + t.metricH + t.gap;
  const metricsEndY = metricsY2 + t.metricH;
  const langY = metricsEndY + (langCount > 0 ? t.langSectionGap : 0);
  const langBottom = langY + languagesSectionHeight(langCount);
  const tableY = langBottom + t.tableGap + t.tableTitleH;
  const tableRows = Math.max(yearCount, 1);
  const tableHeight = t.tableHeaderH + tableRows * t.tableRowH;

  return {
    metricsY1,
    metricsY2,
    langY,
    tableY,
    yearlyTitleCy: tableY - 22,
    height: tableY + tableHeight + t.pad,
  };
}

export function cardHeight(yearCount: number, langCount: number): number {
  return computeCardLayout(yearCount, langCount).height;
}

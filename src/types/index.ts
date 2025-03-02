export interface CellData {
  value: string;
  formula: string;
  computed: string | number | null;
  style: CellStyle;
}

export interface CellStyle {
  bold: boolean;
  italic: boolean;
  fontSize: number;
  color: string;
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface SpreadsheetData {
  cells: Record<string, CellData>;
  columnWidths: Record<number, number>;
  rowHeights: Record<number, number>;
  selectedCell: string | null;
  selectedRange: string[] | null;
  activeFormula: string;
  clipboard: {
    cells: Record<string, CellData>;
    startCell: string | null;
  };
}

export interface CellPosition {
  row: number;
  col: number;
}

export interface CellRange {
  start: CellPosition;
  end: CellPosition;
}

export type FormulaFunction = (args: (string | number | null)[]) => string | number | null;
// Convert A1 notation to row/col indices (0-based)
export const cellToPosition = (cell) => {
  const match = cell.match(/([A-Z]+)(\d+)/);
  if (!match) {
    throw new Error(`Invalid cell reference: ${cell}`);
  }
  
  const col = columnToIndex(match[1]);
  const row = parseInt(match[2], 10) - 1;
  
  return { row, col };
};

// Convert row/col indices to A1 notation
export const positionToCell = (position) => {
  const { row, col } = position;
  const colStr = indexToColumn(col);
  return `${colStr}${row + 1}`;
};

// Convert column letter to index (0-based)
export const columnToIndex = (column) => {
  let index = 0;
  for (let i = 0; i < column.length; i++) {
    index = index * 26 + column.charCodeAt(i) - 64;
  }
  return index - 1;
};

// Convert index to column letter
export const indexToColumn = (index) => {
  let column = '';
  let temp = index + 1;
  
  while (temp > 0) {
    const remainder = (temp - 1) % 26;
    column = String.fromCharCode(65 + remainder) + column;
    temp = Math.floor((temp - remainder) / 26);
  }
  
  return column;
};

// Get all cells in a range (e.g., A1:B3)
export const getCellsInRange = (range) => {
  const [start, end] = range.split(':');
  const startPos = cellToPosition(start);
  const endPos = cellToPosition(end);
  
  const cells = [];
  
  for (let row = Math.min(startPos.row, endPos.row); row <= Math.max(startPos.row, endPos.row); row++) {
    for (let col = Math.min(startPos.col, endPos.col); col <= Math.max(startPos.col, endPos.col); col++) {
      cells.push(positionToCell({ row, col }));
    }
  }
  
  return cells;
};

// Get range from selected cells
export const getRangeFromCells = (cells) => {
  if (!cells.length) return null;
  
  const positions = cells.map(cellToPosition);
  
  const minRow = Math.min(...positions.map(p => p.row));
  const maxRow = Math.max(...positions.map(p => p.row));
  const minCol = Math.min(...positions.map(p => p.col));
  const maxCol = Math.max(...positions.map(p => p.col));
  
  return {
    start: { row: minRow, col: minCol },
    end: { row: maxRow, col: maxCol }
  };
};

// Create a default cell data object
export const createDefaultCell = () => ({
  value: '',
  formula: '',
  computed: null,
  style: {
    bold: false,
    italic: false,
    fontSize: 12,
    color: '#000000',
    backgroundColor: '#ffffff',
    textAlign: 'left'
  }
});

// Check if a value is numeric
export const isNumeric = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(Number(value));
};

// Parse a value to number if possible
export const parseNumeric = (value) => {
  if (isNumeric(value)) {
    return parseFloat(value);
  }
  return value;
};

// Get cell dependencies from a formula
export const getCellDependencies = (formula) => {
  // Match cell references like A1, B2, etc.
  const cellRefPattern = /[A-Z]+\d+/g;
  const matches = formula.match(cellRefPattern) || [];
  return [...new Set(matches)]; // Remove duplicates
};

// Check if a formula has circular references
export const hasCircularReference = (
  cellId,
  formula,
  cells,
  visited = new Set()
) => {
  if (visited.has(cellId)) {
    return true;
  }
  
  visited.add(cellId);
  
  const dependencies = getCellDependencies(formula);
  
  for (const dep of dependencies) {
    if (dep === cellId) {
      return true;
    }
    
    const depCell = cells[dep];
    if (depCell && depCell.formula) {
      if (hasCircularReference(cellId, depCell.formula, cells, new Set([...visited]))) {
        return true;
      }
    }
  }
  
  return false;
};
import { CellData, FormulaFunction } from '../types';
import { getCellDependencies, isNumeric } from './cellUtils';

// Formula evaluation functions
const formulaFunctions: Record<string, FormulaFunction> = {
  SUM: (args) => {
    const numbers = args.filter(arg => typeof arg === 'number') as number[];
    return numbers.reduce((sum, num) => sum + num, 0);
  },
  AVERAGE: (args) => {
    const numbers = args.filter(arg => typeof arg === 'number') as number[];
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  },
  MAX: (args) => {
    const numbers = args.filter(arg => typeof arg === 'number') as number[];
    if (numbers.length === 0) return null;
    return Math.max(...numbers);
  },
  MIN: (args) => {
    const numbers = args.filter(arg => typeof arg === 'number') as number[];
    if (numbers.length === 0) return null;
    return Math.min(...numbers);
  },
  COUNT: (args) => {
    return args.filter(arg => typeof arg === 'number').length;
  },
  TRIM: (args) => {
    if (args.length === 0 || args[0] === null) return '';
    return String(args[0]).trim();
  },
  UPPER: (args) => {
    if (args.length === 0 || args[0] === null) return '';
    return String(args[0]).toUpperCase();
  },
  LOWER: (args) => {
    if (args.length === 0 || args[0] === null) return '';
    return String(args[0]).toLowerCase();
  }
};

// Parse a formula and extract function name and arguments
export const parseFormula = (formula: string): { func: string; args: string[] } | null => {
  // Match function pattern: FUNCTION(arg1, arg2, ...)
  const match = formula.match(/^=([A-Z_]+)\((.*)\)$/);
  if (!match) return null;
  
  const func = match[1];
  const argsStr = match[2];
  
  // Split arguments by comma, but respect nested functions
  const args: string[] = [];
  let currentArg = '';
  let parenCount = 0;
  
  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i];
    
    if (char === '(' && parenCount === 0) {
      currentArg += char;
      parenCount++;
    } else if (char === '(' && parenCount > 0) {
      currentArg += char;
      parenCount++;
    } else if (char === ')' && parenCount > 1) {
      currentArg += char;
      parenCount--;
    } else if (char === ')' && parenCount === 1) {
      currentArg += char;
      parenCount--;
    } else if (char === ',' && parenCount === 0) {
      args.push(currentArg.trim());
      currentArg = '';
    } else {
      currentArg += char;
    }
  }
  
  if (currentArg) {
    args.push(currentArg.trim());
  }
  
  return { func, args };
};

// Evaluate a formula
export const evaluateFormula = (
  formula: string,
  cells: Record<string, CellData>
): string | number | null => {
  if (!formula.startsWith('=')) {
    return formula;
  }
  
  try {
    // Handle cell references directly (e.g., =A1)
    if (formula.match(/^=[A-Z]+\d+$/)) {
      const cellRef = formula.substring(1);
      const referencedCell = cells[cellRef];
      return referencedCell ? referencedCell.computed : null;
    }
    
    // Handle ranges (e.g., A1:B3)
    if (formula.match(/^=[A-Z]+\d+:[A-Z]+\d+$/)) {
      return formula; // Just return the range as is
    }
    
    // Parse function and arguments
    const parsed = parseFormula(formula);
    if (!parsed) {
      // Try to evaluate as a simple expression
      return evaluateExpression(formula.substring(1), cells);
    }
    
    const { func, args } = parsed;
    
    // Check if function exists
    if (!formulaFunctions[func]) {
      return `#ERROR: Unknown function ${func}`;
    }
    
    // Evaluate arguments
    const evaluatedArgs = args.map(arg => {
      // Check if arg is a range (e.g., A1:B3)
      if (arg.match(/^[A-Z]+\d+:[A-Z]+\d+$/)) {
        // Handle range by getting all cells in the range
        const [start, end] = arg.split(':');
        const startCol = start.match(/[A-Z]+/)?.[0] || '';
        const startRow = parseInt(start.match(/\d+/)?.[0] || '0', 10);
        const endCol = end.match(/[A-Z]+/)?.[0] || '';
        const endRow = parseInt(end.match(/\d+/)?.[0] || '0', 10);
        
        const values: (string | number | null)[] = [];
        
        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol.charCodeAt(0); c <= endCol.charCodeAt(0); c++) {
            const cellId = `${String.fromCharCode(c)}${r}`;
            const cell = cells[cellId];
            if (cell) {
              values.push(cell.computed);
            } else {
              values.push(null);
            }
          }
        }
        
        return values;
      }
      
      // Check if arg is a cell reference (e.g., A1)
      if (arg.match(/^[A-Z]+\d+$/)) {
        const cell = cells[arg];
        return cell ? cell.computed : null;
      }
      
      // Check if arg is a number
      if (isNumeric(arg)) {
        return parseFloat(arg);
      }
      
      // Check if arg is a string (with quotes)
      if (arg.startsWith('"') && arg.endsWith('"')) {
        return arg.substring(1, arg.length - 1);
      }
      
      // Otherwise, try to evaluate as an expression
      return arg;
    });
    
    // Flatten array arguments for functions that expect flat lists
    const flatArgs = evaluatedArgs.flat();
    
    // Call the function with evaluated arguments
    return formulaFunctions[func](flatArgs);
  } catch (error) {
    console.error('Formula evaluation error:', error);
    return '#ERROR';
  }
};

// Evaluate a simple expression (e.g., A1+B1)
export const evaluateExpression = (
  expression: string,
  cells: Record<string, CellData>
): string | number | null => {
  try {
    // Replace cell references with their values
    const cellRefs = getCellDependencies(expression);
    let evaluatedExpression = expression;
    
    for (const cellRef of cellRefs) {
      const cell = cells[cellRef];
      const value = cell ? cell.computed : null;
      
      if (value === null) {
        return '#REF!';
      }
      
      // Replace the cell reference with its value
      const regex = new RegExp(cellRef, 'g');
      evaluatedExpression = evaluatedExpression.replace(regex, typeof value === 'number' ? value.toString() : `"${value}"`);
    }
    
    // Evaluate the expression
    // Note: Using eval is generally not recommended, but for a spreadsheet calculator it's a common approach
    // In a production environment, you'd want to use a safer expression evaluator
    // eslint-disable-next-line no-eval
    const result = eval(evaluatedExpression);
    return result;
  } catch (error) {
    console.error('Expression evaluation error:', error);
    return '#ERROR';
  }
};

// Special functions that operate on the entire spreadsheet
export const removeDuplicates = (
  range: string[],
  cells: Record<string, CellData>
): Record<string, CellData> => {
  // Get all rows in the range
  const rowMap = new Map<number, string[]>();
  
  for (const cellId of range) {
    const match = cellId.match(/([A-Z]+)(\d+)/);
    if (!match) continue;
    
    const row = parseInt(match[2], 10);
    if (!rowMap.has(row)) {
      rowMap.set(row, []);
    }
    rowMap.get(row)?.push(cellId);
  }
  
  // Convert rows to string representations for comparison
  const rowStrings = new Map<number, string>();
  const uniqueRows = new Set<string>();
  const duplicateRows = new Set<number>();
  
  for (const [row, cells] of rowMap.entries()) {
    const rowValues = cells.map(cellId => {
      const cell = cells[cellId];
      return cell ? String(cell.value) : '';
    }).join('|');
    
    rowStrings.set(row, rowValues);
    
    if (uniqueRows.has(rowValues)) {
      duplicateRows.add(row);
    } else {
      uniqueRows.add(rowValues);
    }
  }
  
  // Create a new cells object without the duplicate rows
  const newCells = { ...cells };
  
  for (const row of duplicateRows) {
    const cellsInRow = rowMap.get(row) || [];
    for (const cellId of cellsInRow) {
      delete newCells[cellId];
    }
  }
  
  return newCells;
};

export const findAndReplace = (
  range: string[],
  findText: string,
  replaceText: string,
  cells: Record<string, CellData>
): Record<string, CellData> => {
  const newCells = { ...cells };
  
  for (const cellId of range) {
    const cell = cells[cellId];
    if (!cell) continue;
    
    if (cell.value.includes(findText)) {
      newCells[cellId] = {
        ...cell,
        value: cell.value.replace(new RegExp(findText, 'g'), replaceText),
        computed: cell.value.replace(new RegExp(findText, 'g'), replaceText)
      };
    }
  }
  
  return newCells;
};
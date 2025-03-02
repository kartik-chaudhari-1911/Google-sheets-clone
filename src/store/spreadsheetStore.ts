import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { SpreadsheetData, CellData, CellPosition } from '../types';
import { 
  cellToPosition, 
  positionToCell, 
  createDefaultCell, 
  getCellDependencies,
  hasCircularReference
} from '../utils/cellUtils';
import { evaluateFormula, removeDuplicates, findAndReplace } from '../utils/formulaUtils';

const DEFAULT_COLUMN_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 25;
const DEFAULT_NUM_ROWS = 100;
const DEFAULT_NUM_COLS = 26; // A to Z

// Initialize column widths
const initialColumnWidths: Record<number, number> = {};
for (let i = 0; i < DEFAULT_NUM_COLS; i++) {
  initialColumnWidths[i] = DEFAULT_COLUMN_WIDTH;
}

// Initialize row heights
const initialRowHeights: Record<number, number> = {};
for (let i = 0; i < DEFAULT_NUM_ROWS; i++) {
  initialRowHeights[i] = DEFAULT_ROW_HEIGHT;
}

const initialState: SpreadsheetData = {
  cells: {},
  columnWidths: initialColumnWidths,
  rowHeights: initialRowHeights,
  selectedCell: null,
  selectedRange: null,
  activeFormula: '',
  clipboard: {
    cells: {},
    startCell: null
  }
};

export const useSpreadsheetStore = create(
  immer<SpreadsheetData>((set, get) => ({
    ...initialState,
    
    // Cell selection
    selectCell: (cellId: string) => {
      set(state => {
        state.selectedCell = cellId;
        state.selectedRange = [cellId];
        
        // Update active formula
        const cell = state.cells[cellId];
        state.activeFormula = cell?.formula || '';
      });
    },
    
    selectRange: (startCellId: string, endCellId: string) => {
      set(state => {
        const startPos = cellToPosition(startCellId);
        const endPos = cellToPosition(endCellId);
        
        const minRow = Math.min(startPos.row, endPos.row);
        const maxRow = Math.max(startPos.row, endPos.row);
        const minCol = Math.min(startPos.col, endPos.col);
        const maxCol = Math.max(startPos.col, endPos.col);
        
        const selectedRange: string[] = [];
        
        for (let row = minRow; row <= maxRow; row++) {
          for (let col = minCol; col <= maxCol; col++) {
            const cellId = positionToCell({ row, col });
            selectedRange.push(cellId);
          }
        }
        
        state.selectedRange = selectedRange;
        state.selectedCell = startCellId;
      });
    },
    
    // Cell content
    updateCellValue: (cellId: string, value: string) => {
      set(state => {
        // Create cell if it doesn't exist
        if (!state.cells[cellId]) {
          state.cells[cellId] = createDefaultCell();
        }
        
        // Check if it's a formula
        const isFormula = value.startsWith('=');
        
        // Update cell value and formula
        state.cells[cellId].value = value;
        state.cells[cellId].formula = isFormula ? value : '';
        
        // Update computed value
        if (isFormula) {
          // Check for circular references
          if (hasCircularReference(cellId, value, state.cells)) {
            state.cells[cellId].computed = '#CIRCULAR!';
            return;
          }
          
          state.cells[cellId].computed = evaluateFormula(value, state.cells);
        } else {
          state.cells[cellId].computed = value;
        }
        
        // Update dependent cells
        updateDependentCells(state.cells, cellId);
      });
    },
    
    updateCellStyle: (cellId: string, style: Partial<CellData['style']>) => {
      set(state => {
        // Create cell if it doesn't exist
        if (!state.cells[cellId]) {
          state.cells[cellId] = createDefaultCell();
        }
        
        // Update cell style
        state.cells[cellId].style = {
          ...state.cells[cellId].style,
          ...style
        };
      });
    },
    
    // Column and row operations
    updateColumnWidth: (colIndex: number, width: number) => {
      set(state => {
        state.columnWidths[colIndex] = width;
      });
    },
    
    updateRowHeight: (rowIndex: number, height: number) => {
      set(state => {
        state.rowHeights[rowIndex] = height;
      });
    },
    
    insertRow: (rowIndex: number) => {
      set(state => {
        // Shift all rows down
        const newCells: Record<string, CellData> = {};
        
        Object.entries(state.cells).forEach(([cellId, cellData]) => {
          const pos = cellToPosition(cellId);
          
          if (pos.row >= rowIndex) {
            // Move cell down
            const newPos = { ...pos, row: pos.row + 1 };
            const newCellId = positionToCell(newPos);
            newCells[newCellId] = cellData;
          } else {
            // Keep cell as is
            newCells[cellId] = cellData;
          }
        });
        
        state.cells = newCells;
        
        // Shift row heights
        for (let i = DEFAULT_NUM_ROWS - 1; i >= rowIndex; i--) {
          state.rowHeights[i + 1] = state.rowHeights[i];
        }
        state.rowHeights[rowIndex] = DEFAULT_ROW_HEIGHT;
      });
    },
    
    deleteRow: (rowIndex: number) => {
      set(state => {
        // Remove cells in the row
        const newCells: Record<string, CellData> = {};
        
        Object.entries(state.cells).forEach(([cellId, cellData]) => {
          const pos = cellToPosition(cellId);
          
          if (pos.row === rowIndex) {
            // Skip this cell (delete it)
            return;
          } else if (pos.row > rowIndex) {
            // Move cell up
            const newPos = { ...pos, row: pos.row - 1 };
            const newCellId = positionToCell(newPos);
            newCells[newCellId] = cellData;
          } else {
            // Keep cell as is
            newCells[cellId] = cellData;
          }
        });
        
        state.cells = newCells;
        
        // Shift row heights
        for (let i = rowIndex; i < DEFAULT_NUM_ROWS - 1; i++) {
          state.rowHeights[i] = state.rowHeights[i + 1];
        }
      });
    },
    
    insertColumn: (colIndex: number) => {
      set(state => {
        // Shift all columns right
        const newCells: Record<string, CellData> = {};
        
        Object.entries(state.cells).forEach(([cellId, cellData]) => {
          const pos = cellToPosition(cellId);
          
          if (pos.col >= colIndex) {
            // Move cell right
            const newPos = { ...pos, col: pos.col + 1 };
            const newCellId = positionToCell(newPos);
            newCells[newCellId] = cellData;
          } else {
            // Keep cell as is
            newCells[cellId] = cellData;
          }
        });
        
        state.cells = newCells;
        
        // Shift column widths
        for (let i = DEFAULT_NUM_COLS - 1; i >= colIndex; i--) {
          state.columnWidths[i + 1] = state.columnWidths[i];
        }
        state.columnWidths[colIndex] = DEFAULT_COLUMN_WIDTH;
      });
    },
    
    deleteColumn: (colIndex: number) => {
      set(state => {
        // Remove cells in the column
        const newCells: Record<string, CellData> = {};
        
        Object.entries(state.cells).forEach(([cellId, cellData]) => {
          const pos = cellToPosition(cellId);
          
          if (pos.col === colIndex) {
            // Skip this cell (delete it)
            return;
          } else if (pos.col > colIndex) {
            // Move cell left
            const newPos = { ...pos, col: pos.col - 1 };
            const newCellId = positionToCell(newPos);
            newCells[newCellId] = cellData;
          } else {
            // Keep cell as is
            newCells[cellId] = cellData;
          }
        });
        
        state.cells = newCells;
        
        // Shift column widths
        for (let i = colIndex; i < DEFAULT_NUM_COLS - 1; i++) {
          state.columnWidths[i] = state.columnWidths[i + 1];
        }
      });
    },
    
    // Clipboard operations
    copySelection: () => {
      set(state => {
        if (!state.selectedRange) return;
        
        const clipboardCells: Record<string, CellData> = {};
        
        state.selectedRange.forEach(cellId => {
          if (state.cells[cellId]) {
            clipboardCells[cellId] = { ...state.cells[cellId] };
          }
        });
        
        state.clipboard = {
          cells: clipboardCells,
          startCell: state.selectedCell
        };
      });
    },
    
    cutSelection: () => {
      set(state => {
        if (!state.selectedRange) return;
        
        const clipboardCells: Record<string, CellData> = {};
        
        state.selectedRange.forEach(cellId => {
          if (state.cells[cellId]) {
            clipboardCells[cellId] = { ...state.cells[cellId] };
            delete state.cells[cellId];
          }
        });
        
        state.clipboard = {
          cells: clipboardCells,
          startCell: state.selectedCell
        };
      });
    },
    
    pasteSelection: (targetCellId: string) => {
      set(state => {
        const { clipboard } = state;
        if (!clipboard.startCell || Object.keys(clipboard.cells).length === 0) return;
        
        const startPos = cellToPosition(clipboard.startCell);
        const targetPos = cellToPosition(targetCellId);
        
        const rowOffset = targetPos.row - startPos.row;
        const colOffset = targetPos.col - startPos.col;
        
        Object.entries(clipboard.cells).forEach(([cellId, cellData]) => {
          const pos = cellToPosition(cellId);
          const newPos: CellPosition = {
            row: pos.row + rowOffset,
            col: pos.col + colOffset
          };
          
          const newCellId = positionToCell(newPos);
          state.cells[newCellId] = { ...cellData };
        });
      });
    },
    
    // Formula operations
    updateActiveFormula: (formula: string) => {
      set(state => {
        state.activeFormula = formula;
      });
    },
    
    applyActiveFormula: () => {
      set(state => {
        if (!state.selectedCell) return;
        
        const cellId = state.selectedCell;
        const formula = state.activeFormula;
        
        // Update cell with formula
        if (!state.cells[cellId]) {
          state.cells[cellId] = createDefaultCell();
        }
        
        state.cells[cellId].formula = formula;
        state.cells[cellId].value = formula;
        
        // Check for circular references
        if (hasCircularReference(cellId, formula, state.cells)) {
          state.cells[cellId].computed = '#CIRCULAR!';
          return;
        }
        
        // Compute formula
        state.cells[cellId].computed = evaluateFormula(formula, state.cells);
        
        // Update dependent cells
        updateDependentCells(state.cells, cellId);
      });
    },
    
    // Data quality functions
    removeDuplicates: () => {
      set(state => {
        if (!state.selectedRange) return;
        
        state.cells = removeDuplicates(state.selectedRange, state.cells);
      });
    },
    
    findAndReplace: (findText: string, replaceText: string) => {
      set(state => {
        if (!state.selectedRange) return;
        
        state.cells = findAndReplace(
          state.selectedRange,
          findText,
          replaceText,
          state.cells
        );
      });
    }
  }))
);

// Helper function to update all cells that depend on a changed cell
const updateDependentCells = (cells: Record<string, CellData>, changedCellId: string) => {
  const dependentCells: string[] = [];
  
  // Find all cells that reference the changed cell
  Object.entries(cells).forEach(([cellId, cellData]) => {
    if (cellData.formula && cellId !== changedCellId) {
      const dependencies = getCellDependencies(cellData.formula);
      if (dependencies.includes(changedCellId)) {
        dependentCells.push(cellId);
      }
    }
  });
  
  // Update dependent cells
  dependentCells.forEach(cellId => {
    const cell = cells[cellId];
    if (cell && cell.formula) {
      cell.computed = evaluateFormula(cell.formula, cells);
      
      // Recursively update cells that depend on this cell
      updateDependentCells(cells, cellId);
    }
  });
};
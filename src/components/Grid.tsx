import React, { useRef, useState, useEffect } from 'react';
import Cell from './Cell';
import { useSpreadsheetStore } from '../store/spreadsheetStore';
import { indexToColumn } from '../utils/cellUtils';

const NUM_ROWS = 100;
const NUM_COLS = 26; // A to Z

const Grid: React.FC = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ startRow: 0, endRow: 50, startCol: 0, endCol: 10 });
  const { columnWidths, rowHeights } = useSpreadsheetStore();
  
  // Handle scrolling to update visible range
  useEffect(() => {
    const handleScroll = () => {
      if (!gridRef.current) return;
      
      const scrollTop = gridRef.current.scrollTop;
      const scrollLeft = gridRef.current.scrollLeft;
      const clientHeight = gridRef.current.clientHeight;
      const clientWidth = gridRef.current.clientWidth;
      
      // Calculate visible rows
      let rowOffset = 0;
      let startRow = 0;
      while (rowOffset < scrollTop && startRow < NUM_ROWS) {
        rowOffset += rowHeights[startRow];
        startRow++;
      }
      
      let visibleHeight = 0;
      let endRow = startRow;
      while (visibleHeight < clientHeight + 200 && endRow < NUM_ROWS) {
        visibleHeight += rowHeights[endRow];
        endRow++;
      }
      
      // Calculate visible columns
      let colOffset = 0;
      let startCol = 0;
      while (colOffset < scrollLeft && startCol < NUM_COLS) {
        colOffset += columnWidths[startCol];
        startCol++;
      }
      
      let visibleWidth = 0;
      let endCol = startCol;
      while (visibleWidth < clientWidth + 200 && endCol < NUM_COLS) {
        visibleWidth += columnWidths[endCol];
        endCol++;
      }
      
      // Add buffer for smoother scrolling
      startRow = Math.max(0, startRow - 5);
      endRow = Math.min(NUM_ROWS, endRow + 5);
      startCol = Math.max(0, startCol - 2);
      endCol = Math.min(NUM_COLS, endCol + 2);
      
      setVisibleRange({ startRow, endRow, startCol, endCol });
    };
    
    const gridElement = gridRef.current;
    if (gridElement) {
      gridElement.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial calculation
    }
    
    return () => {
      if (gridElement) {
        gridElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [columnWidths, rowHeights]);
  
  // Calculate total grid dimensions
  const totalWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);
  const totalHeight = Object.values(rowHeights).reduce((sum, height) => sum + height, 0);
  
  // Render cells within visible range
  const renderCells = () => {
    const cells = [];
    
    // Add corner cell (empty)
    cells.push(
      <Cell
        key="corner"
        cellId="corner"
        rowIndex={0}
        colIndex={0}
        isHeader={true}
      />
    );
    
    // Add column headers (A, B, C, ...)
    for (let col = visibleRange.startCol; col <= visibleRange.endCol; col++) {
      if (col === 0) continue; // Skip first column (row headers)
      
      cells.push(
        <Cell
          key={`header-col-${col}`}
          cellId={`header-col-${col}`}
          rowIndex={0}
          colIndex={col}
          isHeader={true}
        />
      );
    }
    
    // Add row headers (1, 2, 3, ...)
    for (let row = visibleRange.startRow; row <= visibleRange.endRow; row++) {
      if (row === 0) continue; // Skip first row (column headers)
      
      cells.push(
        <Cell
          key={`header-row-${row}`}
          cellId={`header-row-${row}`}
          rowIndex={row}
          colIndex={0}
          isHeader={true}
        />
      );
    }
    
    // Add data cells
    for (let row = visibleRange.startRow; row <= visibleRange.endRow; row++) {
      if (row === 0) continue; // Skip first row (column headers)
      
      for (let col = visibleRange.startCol; col <= visibleRange.endCol; col++) {
        if (col === 0) continue; // Skip first column (row headers)
        
        const cellId = `${indexToColumn(col)}${row}`;
        
        cells.push(
          <Cell
            key={cellId}
            cellId={cellId}
            rowIndex={row}
            colIndex={col}
          />
        );
      }
    }
    
    return cells;
  };
  
  return (
    <div
      ref={gridRef}
      className="w-full h-full overflow-auto"
      style={{ position: 'relative' }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `40px ${Array.from({ length: visibleRange.endCol - visibleRange.startCol + 1 }, 
            (_, i) => `${columnWidths[visibleRange.startCol + i]}px`).join(' ')}`,
          gridTemplateRows: `25px ${Array.from({ length: visibleRange.endRow - visibleRange.startRow + 1 }, 
            (_, i) => `${rowHeights[visibleRange.startRow + i]}px`).join(' ')}`,
          width: totalWidth,
          height: totalHeight,
          position: 'relative'
        }}
      >
        {renderCells()}
      </div>
    </div>
  );
};

export default Grid;
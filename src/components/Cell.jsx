import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { useSpreadsheetStore } from '../store/spreadsheetStore';

const Cell = ({ cellId, rowIndex, colIndex, isHeader = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);
  
  const {
    cells,
    selectedCell,
    selectedRange,
    selectCell,
    updateCellValue,
    columnWidths,
    rowHeights
  } = useSpreadsheetStore();
  
  const cell = cells[cellId] || {
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
  };
  
  const isSelected = selectedCell === cellId;
  const isInRange = selectedRange?.includes(cellId);
  
  const width = columnWidths[colIndex];
  const height = rowHeights[rowIndex];
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  
  const handleClick = (e) => {
    if (isHeader) {
      // Handle header click (select entire row or column)
      return;
    }
    
    if (e.shiftKey && selectedCell) {
      // Extend selection
      useSpreadsheetStore.getState().selectRange(selectedCell, cellId);
    } else {
      // Select single cell
      selectCell(cellId);
      
      if (e.detail === 2) {
        // Double click to edit
        startEditing();
      }
    }
  };
  
  const startEditing = () => {
    setIsEditing(true);
    setEditValue(cell.formula || cell.value);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      finishEditing();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };
  
  const finishEditing = () => {
    updateCellValue(cellId, editValue);
    setIsEditing(false);
  };
  
  // Render header cell
  if (isHeader) {
    return (
      <div
        className={classNames(
          'bg-gray-100 border border-gray-300 flex items-center justify-center select-none',
          {
            'font-bold': true,
            'text-center': true
          }
        )}
        style={{
          width: width,
          height: height,
          position: 'sticky',
          top: rowIndex === 0 ? 0 : 'auto',
          left: colIndex === 0 ? 0 : 'auto',
          zIndex: rowIndex === 0 && colIndex === 0 ? 3 : (rowIndex === 0 || colIndex === 0 ? 2 : 1)
        }}
      >
        {isHeader && rowIndex === 0 && colIndex > 0 && String.fromCharCode(64 + colIndex)}
        {isHeader && colIndex === 0 && rowIndex > 0 && rowIndex}
      </div>
    );
  }
  
  // Render data cell
  return (
    <div
      className={classNames(
        'border border-gray-300 overflow-hidden',
        {
          'bg-blue-100': isSelected,
          'bg-blue-50': !isSelected && isInRange,
          'font-bold': cell.style.bold,
          'italic': cell.style.italic,
        }
      )}
      style={{
        width: width,
        height: height,
        color: cell.style.color,
        backgroundColor: isSelected || isInRange ? undefined : cell.style.backgroundColor,
        textAlign: cell.style.textAlign,
        fontSize: `${cell.style.fontSize}px`,
        position: 'relative'
      }}
      onClick={handleClick}
      onDoubleClick={() => startEditing()}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          className="w-full h-full p-1 border-none outline-none"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={finishEditing}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <div className="w-full h-full p-1 overflow-hidden text-ellipsis whitespace-nowrap">
          {cell.computed !== null ? cell.computed : ''}
        </div>
      )}
    </div>
  );
};

export default Cell;
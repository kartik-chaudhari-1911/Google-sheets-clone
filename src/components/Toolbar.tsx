import React, { useState } from 'react';
import { 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Plus,
  Trash2,
  Copy,
  Scissors,
  Clipboard,
  Search,
  FileSpreadsheet
} from 'lucide-react';
import { useSpreadsheetStore } from '../store/spreadsheetStore';
import { cellToPosition } from '../utils/cellUtils';

const Toolbar: React.FC = () => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showFindReplace, setShowFindReplace] = useState(false);
  
  const {
    selectedCell,
    selectedRange,
    cells,
    updateCellStyle,
    insertRow,
    deleteRow,
    insertColumn,
    deleteColumn,
    copySelection,
    cutSelection,
    pasteSelection,
    removeDuplicates,
    findAndReplace
  } = useSpreadsheetStore();
  
  const handleBoldClick = () => {
    if (!selectedCell) return;
    
    const cell = cells[selectedCell];
    const isBold = cell?.style.bold || false;
    
    if (selectedRange) {
      selectedRange.forEach(cellId => {
        updateCellStyle(cellId, { bold: !isBold });
      });
    }
  };
  
  const handleItalicClick = () => {
    if (!selectedCell) return;
    
    const cell = cells[selectedCell];
    const isItalic = cell?.style.italic || false;
    
    if (selectedRange) {
      selectedRange.forEach(cellId => {
        updateCellStyle(cellId, { italic: !isItalic });
      });
    }
  };
  
  const handleAlignClick = (align: 'left' | 'center' | 'right') => {
    if (!selectedRange) return;
    
    selectedRange.forEach(cellId => {
      updateCellStyle(cellId, { textAlign: align });
    });
  };
  
  const handleInsertRow = () => {
    if (!selectedCell) return;
    
    const { row } = cellToPosition(selectedCell);
    insertRow(row);
  };
  
  const handleDeleteRow = () => {
    if (!selectedCell) return;
    
    const { row } = cellToPosition(selectedCell);
    deleteRow(row);
  };
  
  const handleInsertColumn = () => {
    if (!selectedCell) return;
    
    const { col } = cellToPosition(selectedCell);
    insertColumn(col);
  };
  
  const handleDeleteColumn = () => {
    if (!selectedCell) return;
    
    const { col } = cellToPosition(selectedCell);
    deleteColumn(col);
  };
  
  const handlePaste = () => {
    if (!selectedCell) return;
    pasteSelection(selectedCell);
  };
  
  const handleFindReplace = () => {
    if (!selectedRange || !findText) return;
    findAndReplace(findText, replaceText);
    setShowFindReplace(false);
  };
  
  return (
    <div className="bg-gray-100 border-b border-gray-300 p-2 flex flex-col">
      <div className="flex items-center space-x-4 mb-2">
        <div className="font-bold text-blue-600 flex items-center">
          <FileSpreadsheet className="mr-2" size={20} />
          <span>Google Sheets Clone</span>
        </div>
        
        <div className="border-l border-gray-300 h-6 mx-2"></div>
        
        {/* Text formatting */}
        <button
          className={`p-1 rounded ${cells[selectedCell || '']?.style.bold ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          onClick={handleBoldClick}
          title="Bold"
        >
          <Bold size={18} />
        </button>
        
        <button
          className={`p-1 rounded ${cells[selectedCell || '']?.style.italic ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
          onClick={handleItalicClick}
          title="Italic"
        >
          <Italic size={18} />
        </button>
        
        <div className="border-l border-gray-300 h-6 mx-2"></div>
        
        {/* Alignment */}
        <button
          className="p-1 rounded hover:bg-gray-200"
          onClick={() => handleAlignClick('left')}
          title="Align Left"
        >
          <AlignLeft size={18} />
        </button>
        
        <button
          className="p-1 rounded hover:bg-gray-200"
          onClick={() => handleAlignClick('center')}
          title="Align Center"
        >
          <AlignCenter size={18} />
        </button>
        
        <button
          className="p-1 rounded hover:bg-gray-200"
          onClick={() => handleAlignClick('right')}
          title="Align Right"
        >
          <AlignRight size={18} />
        </button>
        
        <div className="border-l border-gray-300 h-6 mx-2"></div>
        
        {/* Row/Column operations */}
        <button
          className="p-1 rounded hover:bg-gray-200 flex items-center"
          onClick={handleInsertRow}
          title="Insert Row"
        >
          <Plus size={18} className="mr-1" />
          <span>Row</span>
        </button>
        
        <button
          className="p-1 rounded hover:bg-gray-200 flex items-center"
          onClick={handleDeleteRow}
          title="Delete Row"
        >
          <Trash2 size={18} className="mr-1" />
          <span>Row</span>
        </button>
        
        <button
          className="p-1 rounded hover:bg-gray-200 flex items-center"
          onClick={handleInsertColumn}
          title="Insert Column"
        >
          <Plus size={18} className="mr-1" />
          <span>Column</span>
        </button>
        
        <button
          className="p-1 rounded hover:bg-gray-200 flex items-center"
          onClick={handleDeleteColumn}
          title="Delete Column"
        >
          <Trash2 size={18} className="mr-1" />
          <span>Column</span>
        </button>
        
        <div className="border-l border-gray-300 h-6 mx-2"></div>
        
        {/* Clipboard operations */}
        <button
          className="p-1 rounded hover:bg-gray-200"
          onClick={copySelection}
          title="Copy"
        >
          <Copy size={18} />
        </button>
        
        <button
          className="p-1 rounded hover:bg-gray-200"
          onClick={cutSelection}
          title="Cut"
        >
          <Scissors size={18} />
        </button>
        
        <button
          className="p-1 rounded hover:bg-gray-200"
          onClick={handlePaste}
          title="Paste"
        >
          <Clipboard size={18} />
        </button>
        
        <div className="border-l border-gray-300 h-6 mx-2"></div>
        
        {/* Data operations */}
        <button
          className="p-1 rounded hover:bg-gray-200 flex items-center"
          onClick={() => setShowFindReplace(!showFindReplace)}
          title="Find and Replace"
        >
          <Search size={18} className="mr-1" />
          <span>Find & Replace</span>
        </button>
        
        <button
          className="p-1 rounded hover:bg-gray-200"
          onClick={removeDuplicates}
          title="Remove Duplicates"
        >
          <span>Remove Duplicates</span>
        </button>
      </div>
      
      {/* Find and Replace panel */}
      {showFindReplace && (
        <div className="bg-white p-2 border border-gray-300 rounded flex items-center space-x-2">
          <input
            type="text"
            placeholder="Find"
            className="border border-gray-300 rounded px-2 py-1"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
          />
          <input
            type="text"
            placeholder="Replace"
            className="border border-gray-300 rounded px-2 py-1"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded"
            onClick={handleFindReplace}
          >
            Replace
          </button>
          <button
            className="border border-gray-300 px-2 py-1 rounded"
            onClick={() => setShowFindReplace(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Toolbar;
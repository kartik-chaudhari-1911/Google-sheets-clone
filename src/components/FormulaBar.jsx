import React, { useState, useEffect } from 'react';
import { useSpreadsheetStore } from '../store/spreadsheetStore';

const FormulaBar = () => {
  const { selectedCell, activeFormula, updateActiveFormula, applyActiveFormula } = useSpreadsheetStore();
  const [localFormula, setLocalFormula] = useState('');
  
  // Update local formula when active formula changes
  useEffect(() => {
    setLocalFormula(activeFormula);
  }, [activeFormula]);
  
  const handleFormulaChange = (e) => {
    setLocalFormula(e.target.value);
    updateActiveFormula(e.target.value);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      applyActiveFormula();
    }
  };
  
  return (
    <div className="bg-white border-b border-gray-300 p-2 flex items-center">
      <div className="font-bold w-20 text-gray-600">
        {selectedCell || ''}
      </div>
      <div className="border-l border-gray-300 h-6 mx-2"></div>
      <div className="flex-1">
        <input
          type="text"
          className="w-full px-2 py-1 border border-gray-300 rounded"
          value={localFormula}
          onChange={handleFormulaChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter a value or formula (e.g., =SUM(A1:A5))"
        />
      </div>
    </div>
  );
};

export default FormulaBar;
import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FunctionInfo {
  name: string;
  description: string;
  syntax: string;
  example: string;
}

const functions: FunctionInfo[] = [
  {
    name: 'SUM',
    description: 'Adds all the numbers in a range of cells.',
    syntax: '=SUM(number1, [number2], ...)',
    example: '=SUM(A1:A5) or =SUM(A1, B1, C1)'
  },
  {
    name: 'AVERAGE',
    description: 'Returns the average (arithmetic mean) of the arguments.',
    syntax: '=AVERAGE(number1, [number2], ...)',
    example: '=AVERAGE(A1:A5) or =AVERAGE(A1, B1, C1)'
  },
  {
    name: 'MAX',
    description: 'Returns the maximum value in a list of arguments.',
    syntax: '=MAX(number1, [number2], ...)',
    example: '=MAX(A1:A5) or =MAX(A1, B1, C1)'
  },
  {
    name: 'MIN',
    description: 'Returns the minimum value in a list of arguments.',
    syntax: '=MIN(number1, [number2], ...)',
    example: '=MIN(A1:A5) or =MIN(A1, B1, C1)'
  },
  {
    name: 'COUNT',
    description: 'Counts the number of cells that contain numbers.',
    syntax: '=COUNT(value1, [value2], ...)',
    example: '=COUNT(A1:A5) or =COUNT(A1, B1, C1)'
  },
  {
    name: 'TRIM',
    description: 'Removes leading and trailing spaces from text.',
    syntax: '=TRIM(text)',
    example: '=TRIM(A1)'
  },
  {
    name: 'UPPER',
    description: 'Converts text to uppercase.',
    syntax: '=UPPER(text)',
    example: '=UPPER(A1)'
  },
  {
    name: 'LOWER',
    description: 'Converts text to lowercase.',
    syntax: '=LOWER(text)',
    example: '=LOWER(A1)'
  }
];

const FunctionHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="absolute right-4 bottom-4 z-10">
      <button
        className="bg-blue-500 text-white p-2 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        title="Function Help"
      >
        {isOpen ? <ChevronDown size={24} /> : <HelpCircle size={24} />}
      </button>
      
      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded shadow-lg p-4 w-80 max-h-96 overflow-y-auto">
          <h3 className="font-bold text-lg mb-2">Available Functions</h3>
          
          <div className="space-y-4">
            {functions.map((func) => (
              <div key={func.name} className="border-b border-gray-200 pb-2">
                <h4 className="font-bold text-blue-600">{func.name}</h4>
                <p className="text-sm text-gray-700">{func.description}</p>
                <p className="text-sm font-mono bg-gray-100 p-1 mt-1">{func.syntax}</p>
                <p className="text-sm mt-1">
                  <span className="font-bold">Example:</span> {func.example}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FunctionHelp;
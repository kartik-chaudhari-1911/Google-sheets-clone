import React from 'react';
import Toolbar from './components/Toolbar';
import FormulaBar from './components/FormulaBar';
import Grid from './components/Grid';
import FunctionHelp from './components/FunctionHelp';

function App() {
  return (
    <div className="flex flex-col h-screen bg-white">
      <Toolbar />
      <FormulaBar />
      <div className="flex-1 overflow-hidden">
        <Grid />
      </div>
      <FunctionHelp />
    </div>
  );
}

export default App;
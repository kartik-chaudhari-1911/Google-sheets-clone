# Google Sheets Clone

A web application that closely mimics the user interface and core functionalities of Google Sheets, with a focus on mathematical and data quality functions, data entry, and key UI interactions.

## Features

### Spreadsheet Interface
- Google Sheets-like UI with toolbar, formula bar, and cell structure
- Drag functionality for cell content and selections
- Cell dependencies with formula evaluation
- Support for basic cell formatting (bold, italics, alignment)
- Add, delete, and resize rows and columns

### Mathematical Functions
- SUM: Calculates the sum of a range of cells
- AVERAGE: Calculates the average of a range of cells
- MAX: Returns the maximum value from a range of cells
- MIN: Returns the minimum value from a range of cells
- COUNT: Counts the number of cells containing numerical values in a range

### Data Quality Functions
- TRIM: Removes leading and trailing whitespace from a cell
- UPPER: Converts the text in a cell to uppercase
- LOWER: Converts the text in a cell to lowercase
- REMOVE_DUPLICATES: Removes duplicate rows from a selected range
- FIND_AND_REPLACE: Allows users to find and replace specific text within a range of cells

### Data Entry and Validation
- Support for various data types (numbers, text)
- Basic data validation for numeric cells

## Tech Stack and Data Structures

### Tech Stack
- **React**: For building the user interface components
- **TypeScript**: For type safety and better developer experience
- **Zustand with Immer**: For state management with immutable updates
- **TailwindCSS**: For styling the application
- **Lucide React**: For icons

### Data Structures

#### Cell Data Model
The application uses a dictionary-based approach to store cell data, which is more memory-efficient than a traditional 2D array, especially for sparse spreadsheets:

```typescript
interface CellData {
  value: string;         // Raw input value
  formula: string;       // Formula if the cell contains one
  computed: string | number | null;  // Computed value after formula evaluation
  style: CellStyle;      // Styling information
}

// Store cells in a dictionary with cell IDs as keys (e.g., "A1", "B2")
cells: Record<string, CellData>
```

This approach allows for:
- Efficient storage for sparse spreadsheets (only populated cells are stored)
- Easy lookup by cell reference (O(1) time complexity)
- Simplified serialization for potential save/load functionality

#### Formula Evaluation
The application uses a dependency-based approach for formula evaluation:

1. Parse formulas to extract cell references and function calls
2. Build a dependency graph to track which cells depend on others
3. When a cell changes, recursively update all dependent cells
4. Detect and prevent circular references

This approach ensures that:
- Formulas are recalculated only when necessary
- Changes propagate correctly through the dependency chain
- Circular references are detected and prevented

#### Virtual Rendering
To handle large spreadsheets efficiently, the grid uses virtual rendering:

1. Only render cells that are currently visible in the viewport
2. Calculate visible range based on scroll position
3. Add buffer zones to ensure smooth scrolling
4. Dynamically adjust the rendered cells as the user scrolls

This approach significantly improves performance for large spreadsheets by minimizing DOM nodes.

## Getting Started

1. Clone the repository: `git clone "https://github.com/kartik-chaudhari-1911/Google-sheets-clone.git"`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Usage

- Double-click a cell to edit its content
- Start with `=` to enter a formula
- Use the toolbar for formatting and operations
- Click the help button in the bottom right for function reference

## Deployed Link:
Here is the deployed link for the application:
  - https://google-sheets01.netlify.app/

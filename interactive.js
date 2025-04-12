// Constants for easy configuration
const GRID_SIZE = 9;
const FONT_SIZE_LARGE = "24px";
const FONT_SIZE_SMALL = "12px";
const NOTE_GRID_TEMPLATE = "repeat(3, 1fr)";

// Get the grid element
const grid = document.getElementById("sudoku-grid");

// Function to create 81 cells
function createCells() {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.id = `cell-${row}${col}`;

            // Add thicker borders for 3x3 blocks
            if (col % 3 === 0 && col !== 0) cell.classList.add("bl");
            if (row % 3 === 2 && row !== 8) cell.classList.add("bb");

            grid.appendChild(cell);
        }
    }
}

// Initialize sudoku state
let sudokuState = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

// Function to handle click event on a cell
let activeCell = null;
let buffer = "";

grid.addEventListener("click", (e) => {
    let target = e.target;
    while (target && !target.classList.contains("cell")) {
        target = target.parentElement;
    }
    if (!target) return;

    if (activeCell) activeCell.classList.remove("focused");
    activeCell = target;
    activeCell.classList.add("focused");
    
    if (isNotes(activeCell.dataset.row, activeCell.dataset.col)) {
        buffer = getCell(activeCell.dataset.row, activeCell.dataset.col);
    } else {
        buffer = 0;
    }
});

// Handle key input (for number entry)
document.addEventListener("keydown", (e) => {
    if (!activeCell) return;
    if (activeCell.classList.contains("fix")) return;

    let num = e.key;
    if (!/^[1-9]$/.test(num)) return;

    num = parseInt(num);

    if (buffer === 0) {
        buffer = num;
    } else if (Array.isArray(buffer)) {
        buffer.includes(num) ? buffer.splice(buffer.indexOf(num), 1) : buffer.push(num);
        if (buffer.length === 1) buffer = buffer[0];
    } else {
        buffer = buffer !== num ? [buffer, num] : buffer = 0;
    }
    
    updateCell(activeCell.dataset.row, activeCell.dataset.col, buffer);
});

// Handle Backspace/Delete key to clear cell
document.addEventListener("keydown", (e) => {
    if (!activeCell) return;
    if (activeCell.classList.contains("fix")) return;

    if (e.key === "Backspace" || e.key === "Delete") {
        buffer = 0;
        updateCell(activeCell.dataset.row, activeCell.dataset.col, buffer);
    }
});

document.addEventListener("keydown", (e) => {
    if (!activeCell) return;

    if (e.key === "Tab") {
        e.preventDefault(); // Prevent default tab behavior to manage focus manually
        if (e.shiftKey) {
            moveFocus(-1); // Move focus backward for Shift+Tab
        } else {
            moveFocus(1);  // Move focus forward for Tab
        }
    }
});

// Move focus between cells
function moveFocus(direction) {
    if (!activeCell) return; // If no active cell, return

    let currentRow = parseInt(activeCell.dataset.row);
    let currentCol = parseInt(activeCell.dataset.col);

    // Move to the next cell in the row or the next row
    let nextCol = currentCol + direction;
    let nextRow = currentRow;

    if (nextCol >= GRID_SIZE) {
        nextCol = 0;
        nextRow++;
    } else if (nextCol < 0) {
        nextCol = GRID_SIZE - 1;
        nextRow--;
    }

    if (nextRow >= 0 && nextRow < GRID_SIZE && nextCol >= 0 && nextCol < GRID_SIZE) {
        const nextCell = document.getElementById(`cell-${nextRow}${nextCol}`);
        
        if (nextCell) {
            if (activeCell) activeCell.classList.remove("focused");
            nextCell.classList.add("focused");
            activeCell = nextCell;
            
            if (isNotes(activeCell.dataset.row, activeCell.dataset.col)) {
                buffer = getCell(activeCell.dataset.row, activeCell.dataset.col);
            } else {
                buffer = 0;
            }
        }
    }
}

// Update Sudoku grid based on a 2D array
function updateSudoku(sudoku) {
    sudokuState = sudoku.map(row => row.map(cell => cell));

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cell = document.getElementById(`cell-${row}${col}`);
            const value = sudoku[row][col];

            cell.innerHTML = "";
            cell.classList.remove("focused", "fix");

            if (Array.isArray(value)) {
                createNotes(cell, value);
            } else if (value !== 0) {
                displayLargeNumber(cell, value);
            }
        }
    }
}

// Update a specific cell
function updateCell(row, col, value) {
    sudokuState[row][col] = value;
    const cell = document.getElementById(`cell-${row}${col}`);
    cell.innerHTML = "";
    //cell.classList.remove("focused", "fix");

    if (Array.isArray(value)) {
        createNotes(cell, value);
    } else if (value !== 0) {
        displayLargeNumber(cell, value);
    }
}

function getCell(row, col) {
    return sudokuState[row][col];
}

// Create notes in a cell
function createNotes(cell, notes) {
    const notesDiv = document.createElement("div");
    notesDiv.classList.add("notes");
    notesDiv.style.display = "grid";
    notesDiv.style.gridTemplateColumns = NOTE_GRID_TEMPLATE;
    notesDiv.style.gridTemplateRows = NOTE_GRID_TEMPLATE;
    notesDiv.style.fontSize = FONT_SIZE_SMALL;

    for (let i = 1; i <= GRID_SIZE; i++) {
        const note = document.createElement("div");
        note.classList.add("note");
        note.textContent = notes.includes(i) ? i : "";
        notesDiv.appendChild(note);
    }
    cell.appendChild(notesDiv);
}

// Display a large number in a cell
function displayLargeNumber(cell, value) {
    cell.textContent = value;
    cell.style.fontSize = FONT_SIZE_LARGE;
}

// Display cell content based on the buffer
function displayCellContent(buffer) {
    if (buffer.length === 1) {
        activeCell.textContent = buffer;
        activeCell.style.fontSize = FONT_SIZE_LARGE;

        const notesDiv = activeCell.querySelector(".notes");
        if (notesDiv) notesDiv.remove();
    } else {
        createNotes(activeCell, buffer.split("").map(Number));
    }
}

// Check if the cell has notes
function isNotes(row, col) {
    const value = sudokuState[row][col];
    return Array.isArray(value) && value.length > 0;
}

// Mark all large numbers with the "fix" class
function markAllFix() {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cell = document.getElementById(`cell-${row}${col}`);
            const value = sudokuState[row][col];

            if (value !== 0 && !Array.isArray(value)) {
                cell.classList.add("fix");
            }
        }
    }
}

// Mark all cells as normal (remove "fix" class)
function markAllNormal() {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cell = document.getElementById(`cell-${row}${col}`);
            cell.classList.remove("fix");
        }
    }
}

// Mark a specific cell's large number with the "fix" class
function markCellFix(row, col) {
    const cell = document.getElementById(`cell-${row}${col}`);
    const value = sudokuState[row][col];

    if (value !== 0 && !Array.isArray(value)) {
        cell.classList.add("fix");
    }
}

// Remove the "fix" class from a specific cell
function markCellNormal(row, col) {
    const cell = document.getElementById(`cell-${row}${col}`);
    cell.classList.remove("fix");
}

// Get the current Sudoku grid in 2D array format
function getSudoku() {
    return sudokuState.map(row => row.map(cell => cell));
}

// Get the current Sudoku grid without notes (replaces notes with 0)
function getSudokuWithoutNotes() {
    return sudokuState.map(row => 
        row.map(cell => 
            Array.isArray(cell) ? 0 : cell // If the cell contains notes (array), replace it with 0
        )
    );
}

// Update only the empty cells in the current Sudoku grid
function updateEmptyCellsOnly(sudoku) {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const currentValue = sudokuState[row][col];
            const newValue = sudoku[row][col];

            // If the cell is empty in the current state and has a value in the new state, update it
            if ((currentValue === 0 || Array.isArray(currentValue)) && newValue !== 0) {
                updateCell(row, col, newValue);
            }
        }
    }
}

function updateMessage(msg) {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = msg;
}

function clearSudoku() {
    const emptySudoku = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
    updateSudoku(emptySudoku);    
}

// Initialize the grid by creating the cells
createCells();

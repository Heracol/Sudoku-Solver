
// Generate random numbers for Sudoku (without checking validity)
function randomNumbersSudoku(density = 0.5) {
    let sudoku = Array.from({ length: 9 }, () => 
        Array.from({ length: 9 }, () => {
            const randomChance = Math.random();
            if (randomChance > density) {
                return 0;
            } else {
                return Math.floor(Math.random() * 9) + 1;  // Random number between 1 and 9
            }
        })
    );

    return sudoku;
}


function isValidRow(sudoku, row) {
    const seen = new Set();

    for (let col = 0; col < 9; col++) {
        const num = sudoku[row][col];
    
        if (num !== 0 && !Array.isArray(num)) {
            if (seen.has(num)) {
                return false; // Duplicate found
            }
            seen.add(num);
        }
    }

    return true;
}

function isValidCol(sudoku, col) {
    const seen = new Set();

    for (let row = 0; row < 9; row++) {
        const num = sudoku[row][col];
    
        if (num !== 0 && !Array.isArray(num)) {
            if (seen.has(num)) {
                return false; // Duplicate found
            }
            seen.add(num);
        }
    }

    return true;
}

function isValidBox(sudoku, startRow, startCol) {
    const seen = new Set();

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const num = sudoku[startRow + row][startCol + col];
        
            if (num !== 0 && !Array.isArray(num)) {
                if (seen.has(num)) {
                    return false; // Duplicate found
                }
                seen.add(num);
            }
        }
    }

    return true;
}

// Check if the Sudoku is valid
function checkValidity(sudoku) {
    for (let i = 0; i < 9; i++) {
        if (!isValidRow(sudoku, i) || !isValidCol(sudoku, i)) {
            return false;
        }
    }

    for (let row = 0; row < 9; row += 3) {
        for (let col = 0; col < 9; col += 3) {
            if (!isValidBox(sudoku, row, col)) {
                return false;
            }
        }
    }

    return true;
}

// Check if any cell is empty (0) and has no notes (Array)
function anyCellEmptyWithoutNotes(sudoku) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (sudoku[row][col] === 0) {
                return true; // Found an empty cell without notes
            }
        }
    }
    return false; // No empty cells without notes found
}

function isCellEmpty(cell) {
    return cell === 0 || Array.isArray(cell);
}

// Find all empty cells in the Sudoku
function findEmptyCells(sudoku) {
    //console.log("-----", sudoku);
    
    let emptyCells = [];

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {            
            if (isCellEmpty(sudoku[row][col])) {
                emptyCells.push([row, col]);
            }
        }
    }
    //console.log("--end---", emptyCells);

    return emptyCells;
}

function removeNotes(sudoku) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (Array.isArray(sudoku[row][col])) {
                sudoku[row][col] = 0; // Remove notes
            }
        }
    }

    return sudoku;
}

// Solve the Sudoku using backtracking
async function solveSudokuUsingBacktracking(sudoku, onProgress, onComplete, onFailed) {
    if (!checkValidity(sudoku)) {
        onFailed();
        return;
    }

    // Remove notes from the Sudoku
    sudoku = removeNotes(sudoku);

    let emptyCells = findEmptyCells(sudoku);

    for (let i = 0; i < emptyCells.length; i++) {
        if (i < 0) {
            onFailed();
            return;
        }

        const row = emptyCells[i][0];
        const col = emptyCells[i][1];
        
        if (sudoku[row][col] === 9) {
            sudoku[row][col] = 0;
            i -= 2;
            
            await onProgress(sudoku, [row, col, 0]);
            
            continue;
        }

        sudoku[row][col] += 1;
            
        await onProgress(sudoku, [row, col, sudoku[row][col]]);

        if (checkValidity(sudoku)) {
            continue;
        } else {
            i -= 1;
        }
    }

    await onComplete(sudoku);
}

// Convert Sudoku to a matrix for Algorithm X
function sudokuToMatrix(sudoku) {
    // An object is used to represent the matrix for Algorithm X
    // instead of a 2D array, so that the key (index) can later be used to find the solution
    // Key is the number of the cell (0-80) and value is an array of constraints
    const matrix = {};

    // Helper to convert (row, col, value) to a matrix key (index)
    function toIndex(row, col, num) {
        return (row * 9 + col) * 9 + (num - 1);
    }

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (!isCellEmpty(sudoku[row][col])) {
                const idx = toIndex(row, col, sudoku[row][col]);

                if (!matrix[idx]) {
                    matrix[idx] = Array(9 * 9 * 4).fill(0);  // Initialize if not already present
                }

                // Set the constraints for a filled cell
                // Only one row out of 9 is added, since the value is known
                // Other 8 rows are not needed
                matrix[idx][row * 9 + col] = 1; // Cell constraint
                matrix[idx][(9 * 9) + (row * 9) + (sudoku[row][col] - 1)] = 1; // Row constraint
                matrix[idx][(9 * 9 * 2) + (col * 9) + (sudoku[row][col] - 1)] = 1; // Column constraint
                matrix[idx][(9 * 9 * 3) + (Math.floor(row / 3) * 3 + Math.floor(col / 3)) * 9 + (sudoku[row][col] - 1)] = 1; // Box constraint
            } else {
                // For empty cells, we need to add constraints for all numbers (1-9)
                for (let num = 1; num <= 9; num++) {
                    const idx = toIndex(row, col, num);

                    if (!matrix[idx]) {
                        matrix[idx] = Array(9 * 9 * 4).fill(0);  // Initialize if not already present
                    }

                    // Set the constraints for an empty cell (possibilities for each number)
                    matrix[idx][row * 9 + col] = 1; // Cell constraint
                    matrix[idx][(9 * 9) + (row * 9) + (num - 1)] = 1; // Row constraint
                    matrix[idx][(9 * 9 * 2) + (col * 9) + (num - 1)] = 1; // Column constraint
                    matrix[idx][(9 * 9 * 3) + (Math.floor(row / 3) * 3 + Math.floor(col / 3)) * 9 + (num - 1)] = 1; // Box constraint
                }
            }
        }
    }

    return matrix;
}

// Convert the solution from Algorithm X back to Sudoku format
// The solution is a list of keys (indices) from the matrix
// The solution must have exactly 81 elements (one for each cell in the Sudoku)
function algorithmXSolutionToSudoku(solution) {
    const sudoku = Array.from({ length: 9 }, () => Array(9).fill(0));

    for (let key of solution) {
        const row = Math.floor(key / (9 * 9));
        const col = Math.floor((key % (9 * 9)) / 9);
        const num = key % 9 + 1; // Convert to 1-9

        sudoku[row][col] = num;
    }

    return sudoku;
}

// Knuth's Algorithm X implementation
function algorithmX(matrix, solution = []) {
    // If the matrix is empty, we have found a solution
    if (Object.keys(matrix).length === 0) return [solution]; 

    // Choose the column with the least number of 1s
    let minColumn = -1;
    let minCount = Infinity;

    for (let col = 0; col < matrix[Object.keys(matrix)[0]].length; col++) {
        let count = 0;

        // Count the number of 1s in the column
        for (let row in matrix) {
            if (matrix[row][col] === 1) count++;
        }

        if (count < minCount) {
            minCount = count;
            minColumn = col;
        }
    }

    // If no column has 1s, return
    if (minColumn === -1 || minCount == 0) return []; // no solution

    const results = [];

    // Loop through the rows and find the rows with 1s in the chosen column
    for (let row in matrix) {
        if (matrix[row][minColumn] === 1) {
            // Get the columns to remove (those with 1s in the current row)
            const colsToRemove = matrix[row]
                .map((val, index) => (val === 1 ? index : -1))
                .filter(index => index !== -1);

            // Get rows which have 1s in the columns to remove
            let rowsToRemove = new Set();
            
            for (const col of colsToRemove) {
                for (let key in matrix) {
                    if (matrix[key][col] === 1) {
                        rowsToRemove.add(parseInt(key));
                    }
                }
            }

            // Remove rows
            let reducedMatrix = {};

            for (let key in matrix) {
                if (!rowsToRemove.has(parseInt(key))) {
                    reducedMatrix[key] = matrix[key];
                }
            }
            
            // Remove columns
            for (let key in reducedMatrix) {
                reducedMatrix[key] = reducedMatrix[key].filter((_, c) => !colsToRemove.includes(c));
            }

            // Add the current row to the solution and call recursively
            results.push(...algorithmX(reducedMatrix, [...solution, parseInt(row)]));
        }
    }

    // Result is an array of solutions
    // Each solution is an array of row indices
    return results;
}

// Solve Sudoku using Algorithm X
function solveSudokuUsingAlgorithmX(sudoku) {
    const matrix = sudokuToMatrix(sudoku);
    const solutions = algorithmX(matrix);

    if (solutions.length === 0) {
        return null; // No solution found
    }

    const solution = solutions[0]; // Take the first solution

    const solvedSudoku = algorithmXSolutionToSudoku(solution);

    return solvedSudoku;
}

function calculateConstraints(sudoku) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = sudoku[row][col];
            
            if (isCellEmpty(cell)) {
                let notes = [];

                for (let num = 1; num <= 9; num++) {
                    // Check if number is already in row
                    if (sudoku[row].includes(num)) {
                        continue;
                    }

                    // Check if number is already in column
                    if (sudoku.map(r => r[col]).includes(num)) {
                        continue;
                    }

                    // Check if number is already in box
                    const boxRow = Math.floor(row / 3) * 3;
                    const boxCol = Math.floor(col / 3) * 3;
                    
                    let inBox = false;

                    for (let r = boxRow; r < boxRow + 3; r++) {
                        for (let c = boxCol; c < boxCol + 3; c++) {
                            if (sudoku[r][c] === num) {
                                inBox = true;
                                break;
                            }
                        }
                        if (inBox) break;
                    }
                    if (inBox) continue;

                    notes.push(num);
                }
                
                // Update the cell with notes
                if (notes.length > 0) {
                    sudoku[row][col] = notes;
                } else {
                    sudoku[row][col] = 0; // No notes, cell is empty
                }
            }
        }
    }

    return sudoku;
}

// Only checks the notes
function fillNakedSingles(sudoku) {
    let changedCount = 0;

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = sudoku[row][col];
            
            if (Array.isArray(cell) && cell.length === 1) {
                sudoku[row][col] = cell[0]; // Fill the cell with the only note
                changedCount++;
            }
        }
    }

    return [sudoku, changedCount];
}

// Critical, needed because js changes the object reference
function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Calculate the constraints for the Sudoku
// Fill the naked singles
// Loop until no more naked singles can be filled
async function loopFillNakedSingles(sudoku, onProgress) {
    while (true) {
        sudoku = calculateConstraints(sudoku);
        
        await onProgress(sudoku, []); // Update progress

        // Early return if any cell is empty without notes
        // Empty cells without notes are not solvable
        if (anyCellEmptyWithoutNotes(sudoku)) {
            return sudoku;
        }

        const [newSudoku, changedCount] = fillNakedSingles(sudoku);
        sudoku = newSudoku;

        if (changedCount !== 0) {    
            await onProgress(sudoku, []); // Update progress
        }

        // Filling naked singles in an invalid sudoku will result in an invalid sudoku
        if (!checkValidity(sudoku)) {
            return sudoku;
        }
        
        // No more changes, exit loop
        if (changedCount === 0) {
            return sudoku;
        }
    }
}

// Solve Sudoku using backtracking with constraint propagation
async function solveSudokuUsingBacktrackingWithConstraintPropagation(sudoku, onProgress, onComplete, onFailed) {
    // Check if the Sudoku is valid before starting
    if (!checkValidity(sudoku)) {
        onFailed();
        return;
    }
    
    let visitedCells = [];
    let valid = true;

    // Make a new copy, as the original sudoku will be needed to revert changes later
    let newSudoku = calculateConstraints(deepCopy(sudoku));

    await onProgress(newSudoku, []); // Update progress

    // Check if any cell has no possible values
    if (anyCellEmptyWithoutNotes(newSudoku)) {
        onFailed();
        return;
    }

    while (true) {
        // If the last insert was valid, find the next empty cell
        if (valid) {
            const emptyCells = findEmptyCells(newSudoku);

            // If there are no empty cells, the Sudoku is solved
            if (emptyCells.length === 0) {
                onComplete(newSudoku);
                break;
            }
    
            // Take the first empty cell and add it to the visited cells
            // with the notes (possibile values)
            const row = emptyCells[0][0];
            const col = emptyCells[0][1];
    
            visitedCells.push({ row, col, value: deepCopy(newSudoku[row][col]), current: -1 });	
        }

        let lastCell = visitedCells[visitedCells.length - 1];

        // If last insert was invalid, revert the changes
        if (!valid) {
            // Revert the last cell to 0
            newSudoku[lastCell.row][lastCell.col] = 0; 

            await onProgress(newSudoku, []);
        }

        // Take the next possible value from the notes
        lastCell.current += 1;

        // If the next cell has no notes (no possible values) then revert (already checked with anyCellEmptyWithoutNotes)
        // Or all the possible values have been tried out
        if (lastCell.value === 0 || lastCell.current >= lastCell.value.length) {
            // Remove the last cell from the visited cells
            visitedCells.pop();

            // If this was the first cell, then all possible solutions have been tried out
            // and the Sudoku is unsolvable
            if (visitedCells.length === 0) {
                onFailed();
                break;
            }

            valid = false;
            
            // Continue so that that the value of the last cell is reverted
            continue;
        }
        
        // Set the value of the last cell to the next possible value
        newSudoku[lastCell.row][lastCell.col] = lastCell.value[lastCell.current];

        await onProgress(newSudoku, [lastCell.row, lastCell.col, newSudoku[lastCell.row][lastCell.col]]);

        // Check if the insertion is valid
        if (checkValidity(newSudoku)) {
            // Calculate the constraints again
            newSudoku = calculateConstraints(newSudoku);
            
            await onProgress(newSudoku, []); // Update progress

            // Check validity again
            valid = !anyCellEmptyWithoutNotes(newSudoku);
        } else {
            valid = false;
        }
    }
}

// Solve Sudoku using backtracking with constraint propagation
// Also uses naked singles to fill the inbetween
async function solveSudokuUsingBacktrackingWithConstraintPropagationAndNakedSingles(sudoku, onProgress, onComplete, onFailed) {
    // Check if the Sudoku is valid before starting
    if (!checkValidity(sudoku)) {
        onFailed();
        return;
    }
    
    let visitedCells = [];
    let valid = true;

    // Make a new copy, as the original sudoku will be needed to revert changes later
    let newSudoku = await loopFillNakedSingles(deepCopy(sudoku), onProgress);

    // Check validity again
    if (!checkValidity(newSudoku) || anyCellEmptyWithoutNotes(newSudoku)) {
        onFailed();
        return;
    }

    while (true) {
        // If the last insert was valid, find the next empty cell
        if (valid) {
            const emptyCells = findEmptyCells(newSudoku);

            // If there are no empty cells, the Sudoku is solved
            if (emptyCells.length === 0) {
                onComplete(newSudoku);
                break;
            }
    
            // Take the first empty cell and add it to the visited cells
            // with the notes (possibile values)
            const row = emptyCells[0][0];
            const col = emptyCells[0][1];
    
            visitedCells.push({ row, col, value: deepCopy(newSudoku[row][col]), current: -1 });	
        }

        let lastCell = visitedCells[visitedCells.length - 1];

        // If last insert was invalid, revert the changes
        if (!valid) {
            // Remove all the values aside from notes
            // And values that are in the original sudoku
            for (let r = 0; r < sudoku.length; r++) {
                for (let c = 0; c < sudoku[r].length; c++) {
                    if (!isCellEmpty(sudoku[r][c]) || (!isCellEmpty(newSudoku[r][c]) && sudoku[r][c] !== newSudoku[r][c])) {
                        newSudoku[r][c] = sudoku[r][c];
                    }
                }
            }

            // Reinsert the visited cells to restore the last state
            for (let i = 0; i < visitedCells.length; i++) {
                const cell = visitedCells[i];
                newSudoku[cell.row][cell.col] = cell.value[cell.current];
            }

            await onProgress(newSudoku, []);
        }

        // Take the next possible value from the notes
        lastCell.current += 1;

        // If the next cell has no notes (no possible values) then revert (already checked with anyCellEmptyWithoutNotes)
        // Or all the possible values have been tried out
        if (lastCell.value === 0 || lastCell.current >= lastCell.value.length) {
            // Remove the last cell from the visited cells
            visitedCells.pop();

            // If this was the first cell, then all possible solutions have been tried out
            // and the Sudoku is unsolvable
            if (visitedCells.length === 0) {
                onFailed();
                break;
            }

            valid = false;
            
            // Continue so that that the value of the last cell is reverted
            continue;
        }
        
        // Set the value of the last cell to the next possible value
        newSudoku[lastCell.row][lastCell.col] = lastCell.value[lastCell.current];

        await onProgress(newSudoku, [lastCell.row, lastCell.col, newSudoku[lastCell.row][lastCell.col]]);

        // Check if the insertion is valid
        if (checkValidity(newSudoku)) {
            // Fill the naked singles
            newSudoku = await loopFillNakedSingles(newSudoku, onProgress);

            // Check validity again
            valid = checkValidity(newSudoku) && !anyCellEmptyWithoutNotes(newSudoku);
        } else {
            valid = false;
        }
    }
}

// Check if a cell has a specific value
function hasCellValue(cell, value) {
    if (Array.isArray(cell)) {
        return cell.includes(value);
    }
    return cell === value;
}

// Fill hidden singles in the Sudoku
// Constraints must be calculated before calling this function
function fillHiddenSingles(sudoku) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = sudoku[row][col];
            
            // Only check possible values
            if (Array.isArray(cell)) {
                for (let value of cell) {
                    let found = false;

                    // Check if this value is the only one in the row
                    for (let c = 0; c < 9; c++) {
                        if (c !== col && hasCellValue(sudoku[row][c], value)) {
                            found = true;
                            break;
                        }
                    }

                    // If any other cell does not have this value, this cell must have it
                    if (!found) {
                        sudoku[row][col] = value;
                        break;
                    }

                    found = false;

                    // Check if this value is the only one in the column
                    for (let r = 0; r < 9; r++) {
                        if (r !== row && hasCellValue(sudoku[r][col], value)) {
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        sudoku[row][col] = value;
                        break;
                    }

                    found = false;

                    // Check if this value is the only one in the box
                    const boxRow = Math.floor(row / 3) * 3;
                    const boxCol = Math.floor(col / 3) * 3;

                    for (let r = boxRow; r < boxRow + 3; r++) {
                        for (let c = boxCol; c < boxCol + 3; c++) {
                            if ((r !== row || c !== col) && hasCellValue(sudoku[r][c], value)) {
                                found = true;
                                break;
                            }
                        }
                        if (found) break;
                    }

                    if (!found) {
                        sudoku[row][col] = value;
                        break;
                    }
                }
            }
        }
    }

    return sudoku;
}

// Eliminate locked candidates in the Sudoku
// Constraints must be calculated before calling this function
function eliminateLockedCandidates(sudoku) {
    // Loop through each 3x3 box
    for (let boxRow = 0; boxRow < 3; boxRow++) {
        for (let boxCol = 0; boxCol < 3; boxCol++) {
            // Get all the empty cells in the box
            const candidates = [];
            // Also count the occurrences of each value in the box
            const values = {}

            // Check each cell in the box
            for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
                for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
                    const cell = sudoku[r][c];

                    if (Array.isArray(cell)) {
                        for (let value of cell) {
                            candidates.push([r, c]);
                            
                            if (!values[value]) {
                                values[value] = 0
                            }

                            values[value]++;
                        }
                    }
                }
            }

            for (const key in values) {
                // If the value appears only once it is a hidden single
                // If it appears more than three times then it cannot be in only a row or column
                if (values[key] >= 2 && values[key] <= 3) {
                    const value = parseInt(key);
                    const rows = new Set();
                    const cols = new Set();

                    // Check if the value is locked in a row or column
                    for (const [r, c] of candidates) {
                        if (sudoku[r][c].includes(value)) {
                            rows.add(r);
                            cols.add(c);
                        }
                    }

                    // If the value is locked in a row or column, eliminate it from other cells in that row/column
                    if (rows.size === 1) {
                        const row = Array.from(rows)[0];

                        for (let c = 0; c < 9; c++) {
                            if (Math.floor(c / 3) !== boxCol && Array.isArray(sudoku[row][c]) && sudoku[row][c].includes(value)) {
                                sudoku[row][c] = sudoku[row][c].filter(v => v !== value);
                            }
                        }
                    }

                    if (cols.size === 1) {
                        const col = Array.from(cols)[0];

                        for (let r = 0; r < 9; r++) {
                            if (Math.floor(r / 3) !== boxRow && Array.isArray(sudoku[r][col]) && sudoku[r][col].includes(value)) {
                                sudoku[r][col] = sudoku[r][col].filter(v => v !== value);
                            }
                        }
                    }
                }
            }
        }
    }

    return sudoku;
}

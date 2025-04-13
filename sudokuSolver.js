
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

// Find all empty cells in the Sudoku
function findEmptyCells(sudoku) {
    //console.log("-----", sudoku);
    
    let emptyCells = [];

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {            
            if (sudoku[row][col] === 0 || Array.isArray(sudoku[row][col])) {
                emptyCells.push([row, col]);
            }
        }
    }
    //console.log("--end---", emptyCells);

    return emptyCells;
}

// Solve the Sudoku using backtracking
async function solveSudokuUsingBacktracking(sudoku, onProgress, onComplete, onFailed) {
    if (!checkValidity(sudoku)) {
        onFailed();
        return;
    }

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
            if (sudoku[row][col] != 0) {
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
            
            if (cell === 0 || Array.isArray(cell)) {
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

async function solveSudokuUsingBacktrackingWithConstraintPropagation(sudoku, onProgress, onComplete, onFailed) {
    async function loopFillNakedSingles(sudoku2, onProgress) {
        while (true) {
            sudoku2 = calculateConstraints(sudoku2);
    
            //console.log("1");
            
            await onProgress(sudoku2, []); // Update progress

            const [newSudoku2, changedCount] = fillNakedSingles(sudoku2);
    
            sudoku2 = newSudoku2;
    
            if (changedCount !== 0) {    
                await onProgress(sudoku2, []); // Update progress
            }

            if (!checkValidity(sudoku2)) {
                return sudoku2; // Invalid Sudoku, return as is
            }
            
            if (changedCount === 0) {
                break; // No more changes, exit loop
            }
        }

        return sudoku2;
    }

    let visitedCells = [];
    let valid = true;
    let newSudoku = await loopFillNakedSingles(JSON.parse(JSON.stringify(sudoku)), onProgress);

    while (true) {
        
        if (valid) {
            
            // newSudoku =  loopFillNakedSingles(newSudoku);

            // if (!checkValidity(newSudoku)) {
            //     visitedCells.pop();

            //     if (visitedCells.length === 0) {
            //         console.log("!!!!!!!!!!!! 22");
            //         break;
            //     }

            //     newSudoku = visitedCells[visitedCells.length - 1].state.map(row => row.map(cell => cell));
                
            //     valid = false;
            //     console.log("LASSSSSSST VALIDDD 33333");
                
            //     continue;
            // }
            
            let emptyCells = findEmptyCells(newSudoku);

            //console.log(newSudoku.map(x => x.map(y => y)), emptyCells.map(x => x), findEmptyCells(newSudoku).length);

            if (emptyCells.length === 0) {
                console.log("WHHATTT", checkValidity(newSudoku));
                onComplete(newSudoku);
                break;
            }
    
            const row = emptyCells[0][0];
            const col = emptyCells[0][1];
    
            visitedCells.push({row, col, value: newSudoku[row][col], current: -1, state: newSudoku.map(row => row.map(cell => cell))});	
        }

        let lastCell = visitedCells[visitedCells.length - 1];

        if (!valid) {
            for (let r = 0; r < sudoku.length; r++) {
                for (let c = 0; c < sudoku[r].length; c++) {
                    if ((sudoku[r][c] !== 0 && !Array.isArray(sudoku[r][c])) || (newSudoku[r][c] !== 0 && !Array.isArray(newSudoku[r][c]) && sudoku[r][c] !== newSudoku[r][c])) {
                        newSudoku[r][c] = sudoku[r][c];
                    }
                }
            }

            //console.log(JSON.parse(JSON.stringify(newSudoku)), JSON.parse(JSON.stringify(visitedCells)));

            for (let i = 0; i < visitedCells.length; i++) {
                const cell = visitedCells[i];
                newSudoku[cell.row][cell.col] = cell.value[cell.current];
            }

            //console.log(JSON.parse(JSON.stringify(newSudoku)));

            // newSudoku = await loopFillNakedSingles(newSudoku, () => {});
            

            // newSudoku = visitedCells[visitedCells.length - 1].state.map(row => row.map(cell => cell));

            //console.log("3");
            await onProgress(newSudoku, []);
        }

        lastCell.current += 1;

        if (lastCell.value === 0 || lastCell.current >= lastCell.value.length) {
            //console.log(lastCell);
            //console.log(visitedCells.map(cell => cell));
            //console.log("------");
            
            
            visitedCells.pop();

            if (visitedCells.length === 0) {
                console.log("!!!!!!!!!!!! 11");
                break;
            }

            // newSudoku[lastCell.row][lastCell.col] = 0;

            valid = false;
            
            // lastCell = visitedCells[visitedCells.length - 1];
            continue;
        }

        //console.log(JSON.parse(JSON.stringify(newSudoku)));
        
        newSudoku[lastCell.row][lastCell.col] = lastCell.value[lastCell.current];

        //console.log("4");
        await onProgress(newSudoku, [lastCell.row, lastCell.col, newSudoku[lastCell.row][lastCell.col]]);

        

        //console.log(lastCell.row, lastCell.col, newSudoku[lastCell.row][lastCell.col], checkValidity(newSudoku));
        

        if (checkValidity(newSudoku)) {
            newSudoku = await loopFillNakedSingles(newSudoku, onProgress);

            //await onProgress(newSudoku, [lastCell.row, lastCell.col, newSudoku[lastCell.row][lastCell.col]]);

            if (checkValidity(newSudoku)) {
                valid = true;
            } else {
                valid = false;
            }

        } else {
            //console.log("LASSSSSSST VALIDDD", lastCell.row, lastCell.col, lastCell.value[lastCell.current], newSudoku.map(x => x.map(y => y)));
            
            valid = false;
        }
    }

    return;

    sudoku = await loopFillNakedSingles(sudoku, onProgress);

    newSudoku = sudoku.map(row => row.map(cell => cell));

    if (!checkValidity(newSudoku)) {
        onFailed();
        return;
    }

    let emptyCells = findEmptyCells(newSudoku);

    for (let i = 0; i < emptyCells.length; i++) {
        if (i < 0) {
            onFailed();
            return;
        }

        const row = emptyCells[i][0];
        const col = emptyCells[i][1];
        
        if (newSudoku[row][col] === sudoku[row][col][sudoku[row][col].length - 1]) {
            newSudoku[row][col] = sudoku[row][col];
            i -= 2;
            
            await onProgress(newSudoku, [row, col, newSudoku[row][col]]);
            
            continue;
        }

        if (Array.isArray(newSudoku[row][col])) {
            newSudoku[row][col] = sudoku[row][col][0];
        } else {
            newSudoku[row][col] = sudoku[row][col][sudoku[row][col].indexOf(newSudoku[row][col]) + 1];
        }
            
        await onProgress(newSudoku, [row, col, newSudoku[row][col]]);

        if (checkValidity(newSudoku)) {
            continue;
        } else {
            i -= 1;
        }
    }

    await onComplete(newSudoku);
}

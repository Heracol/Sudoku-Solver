
// Generate random numbers for Sudoku (without checking validity)
function randomNumbersSudoku(density = 0.5) {
    let sudoku = Array.from({ length: 9 }, () => 
        Array.from({ length: 9 }, () => {
            const randomChance = Math.random();
            if (randomChance > density) {
                return null;
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
    
        if (num !== null) {
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
    
        if (num !== null) {
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
        
            if (num !== null) {
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
    let emptyCells = [];

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (sudoku[row][col] == null) {
                emptyCells.push([row, col]);
            }
        }
    }

    return emptyCells;
}

// Solve the Sudoku using backtracking
async function solveSudokuUsingBacktracking(sudoku, onProgress, onComplete, onFailed) {
    if (!checkValidity(sudoku)) {
        onFailed(sudoku);
        return;
    }

    let emptyCells = findEmptyCells(sudoku);

    for (let i = 0; i < emptyCells.length; i++) {
        if (i < 0) {
            onFailed(sudoku);
            return;
        }

        const row = emptyCells[i][0];
        const col = emptyCells[i][1];
        
        if (sudoku[row][col] === 9) {
            sudoku[row][col] = null;
            i -= 2;
            
            await onProgress(sudoku, [row, col, null]);
            
            continue;
        }

        sudoku[row][col] = sudoku[row][col] || 0; // Initialize with 0 if null
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

# Sudoku Solver

This is a program to solve Sudoku written in JavaScript. Diffrent alogrithms and approaches are used to solve it. To visualize the process a HTML document is provided.

## About the program
In the [sudokuSolver.js](sudokuSolver.js) file the diffents methods to solve Sudoku are implemented. Some helper functions are also written. 

All the functions work with the same format. The input is an 2D array of numbers. 0 represents a empty cell and 1-9 the value of the cell. 

Example:
```
[
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
]
```

This can be passed to the solving functions which then returns a solved Sudoku in the same format. 

The [interactive.html](interactive.html) file uses the solving functions to help visualize the process. 

## Methods used to solve Sudoku

### Backtracking
This is a brute-force method to solve the Sudoku. It is well explained in the [Wikipedia](https://en.wikipedia.org/wiki/Sudoku_solving_algorithms) or in this [paper](https://www.diva-portal.org/smash/get/diva2:811020/FULLTEXT01.pdf) under the heading 2.1.

In short, backtracking solves Sudoku by filling in empty cells one by one, moving from top to bottom and left to right. For each cell, it tries numbers 1 through 9 in order. If a number doesn’t break any Sudoku rules, it’s placed in the cell and the algorithm moves to the next one. If none of the numbers are valid, it backtracks to the previous cell and tries the next possible number there. This process repeats until the entire board is correctly filled.

### Knuth's Algorithm X
This algorithm is used to solve exact cover problems such as a Sudoku. In a matrix of 0s and 1s, the goal of this algorithm is to select a subset of the rows such that the digit 1 appears in each column exactly once.

To solve a Sudoku using this algorithm, the grid must be reduced to a matrix of 0s and 1s. This [paper](https://www.kth.se/social/files/58861771f276547fe1dbf8d1/HLaestanderMHarrysson_dkand14.pdf) clearly explains how this is done. Exactly the method showed in the paper is used. It can be hard to understand the concept at first, for that reason I have made and a [spreadsheet](<Algorithm X.xlsx>) and added the 1s for the first few cells. 

After converting the grid into a matrix the Algorithm X is used to find the solution. The steps as described in this [Wikipedia](https://en.wikipedia.org/wiki/Knuth%27s_Algorithm_X) are followed.

This algorithm finds all the possible solutions. If there are more than one solution to the Sudoku, all of them are returned. In the HTML only the first one is shown. 

## Results

I have added a few examples to test the algorithms. The time was measured for each algorithm with each example using the `getTime()` method. All the measurements were taken on the same computer. Only the time to find a solution was measured (no animations).

| Algorithm                 | Example 1     | Example 2     |
| - | - | - |
| **Backtracking**          | 70-90 ms      | too long      |
| **Knuth's Algorithm X**   | 170-190 ms    | 210-230 ms    |

The backtracking algorithm works very well with some Sudokus. But the second example is designed against backtracking, therefore it takes too long (I had no patience to measure it 😅). 

However, the Algorithm X is able to solve it in around the same time as the first example.  

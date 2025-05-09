# Sudoku Solver

This is a program to solve Sudoku written in JavaScript. Different algorithms and approaches are used to solve it. To visualize the process an HTML document is provided.

## About the program
In the [sudokuSolver.js](sudokuSolver.js) file the diffent methods to solve Sudoku are implemented. Some helper functions are also included. 

### Input
All the functions work with the same format. The input is a 2D array of numbers. 0 represents an empty cell and 1-9 the value of the cell. The value of a cell can also be an array, which then represents the notes. With notes, the cell is still considered empty.  

Example:
```
[
    [5, 3, [1, 2, 4], 0, 7, 0, 0, 0, 0],
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

### Interactive
The [interactive.html](interactive.html) file uses the solving functions to help visualize the process. The solving functions in JavaScript include callbacks to update the UI. The animation slows down the algorithm. Commenting out the lines where the callback is used will prevent the slowdown.

## Methods used to solve Sudoku

### Backtracking
This is a brute-force method to solve the Sudoku. It is well explained in the [Wikipedia](https://en.wikipedia.org/wiki/Sudoku_solving_algorithms) or in this [paper](https://www.diva-portal.org/smash/get/diva2:811020/FULLTEXT01.pdf) under the heading 2.1.

In short, backtracking solves Sudoku by filling in empty cells one by one, moving from top to bottom and left to right. For each cell, it tries numbers 1 through 9 in order. If a number doesn’t break any Sudoku rules, it’s placed in the cell and the algorithm moves to the next one. If none of the numbers are valid, it backtracks to the previous cell and tries the next possible number there. This process repeats until the entire board is correctly filled.

### Knuth's Algorithm X
This algorithm is used to solve exact cover problems such as a Sudoku. In a matrix of 0s and 1s, the goal of this algorithm is to select a subset of the rows such that the digit 1 appears in each column exactly once.

To solve a Sudoku using this algorithm, the grid must be reduced to a matrix of 0s and 1s. This [paper](https://www.kth.se/social/files/58861771f276547fe1dbf8d1/HLaestanderMHarrysson_dkand14.pdf) clearly explains how this is done. Exactly the method shown in the paper is used. It can be hard to understand the concept at first, for that reason I have made a [spreadsheet](<Algorithm X.xlsx>) and added the 1s for the first few cells. 

After converting the grid into a matrix the Algorithm X is used to find the solution. The steps as described in this [Wikipedia](https://en.wikipedia.org/wiki/Knuth%27s_Algorithm_X) are followed.

This algorithm finds all the possible solutions. If there are more than one solution to the Sudoku, all of them are returned. In the HTML only the first one is shown. 

### Backtracking with Constraint Propagation
This is the same as the backtracking method but it uses constraint propagation too. That means, it checks which possible values can go to each cell and only those are used. Unlike normal backtracking which tries out each value in each cell, this method only picks the valid ones. This results in fewer possibilities to brute-force, thus, it finds the solution faster. 

Constraint propagation is explained in both these papers: [Analysis and comparison of solving algorithms for sudoku](https://www.diva-portal.org/smash/get/diva2:811020/FULLTEXT01.pdf) and [Sudoku Solver: A Comparative Study of Different Algorithms and Image Processing Techniques](https://www.researchgate.net/publication/376566206_Sudoku_Solver_A_Comparative_Study_of_Different_Algorithms_and_Image_Processing_Techniques)

### Backtraking with Constraint Propagation and Naked Singles
This method also uses brute-force but with the help of constraint propagation and the rule-based method: naked singles (check the [rule-based methods](<###Rule-based Methods>)). 

In this method the possible values for each cell are calculated first. Then the naked singles are filled in. After that the constraints are calculated again, and this is looped until no more naked singles can be filled. In the next empty cell the first possible value is inserted and the whole process is done again, until there are no empty cells left. 

This method is faster than backtracking with only constraint propagation.

### Rule-based Methods
These are the rule-based methods or elimination-based approaches, similar to how humans would solve Sudoku. The methods below require the constraint propagation first, so that the possible values for each cell are known. Each method alone might not be able to solve the whole Sudoku but in combination with others it is possible. For instance, Example 1 Sudoku can be solved only using Naked Singles whereas Example 2 can't.

The following methods are thoroughly described in the paper [An Exhaustive Study of
different Sudoku Solving Techniques](https://www.ijcsi.org/papers/IJCSI-11-2-1-247-253.pdf). 

#### Naked Singles
Naked singles occur when a cell has only one possible candidate left based on existing numbers in its row, column, and box — so that number must be placed there.

#### Hidden Singles
Hidden singles happen when a candidate appears only once in a row, column, or box — even if that cell has other candidates, it must take that value.

#### Locked Candidates
This method is like an extension to constraint propagation. If a candidate number appears only in one row or column within a box, then it must go in that row/column inside the box. This means you can remove that candidate from the same row or column outside the box.

## Results

I have added a few examples to test the algorithms. The time was measured for each algorithm with each example using the `getTime()` method. All the measurements were taken on the same computer. Only the solving time was measured (excluding animations).

| Algorithm                 | Example 1     | Example 2     |
| - | - | - |
| **Backtracking**          | 70-90 ms      | too long      |
| **Knuth's Algorithm X**   | 170-190 ms    | 210-230 ms    |

The backtracking algorithm works very well with some Sudokus. But the second example is designed against backtracking, therefore it takes too long (I had no patience to measure it 😅). 

However, the Algorithm X is able to solve it in around the same time as the first example.  

## Improvements
I implemented the methods with a focus on simplicity, ensuring they are easy to understand while remaining as efficient as possible. I am sure that the implementation can be further optimized. 

Not all solving methods have been implemented yet. There are many techniques available, and this project currently includes only some of the most popular ones. For example, rule-based strategies such as twins, triplets, X-Wing, and others are not yet included.

Thanks for checking out the project 🙂!

// src/utils/ladderGenerator.js

const generateLadder = (cols, rows) => {
  const ladder = Array.from({ length: rows }, () => Array(cols).fill(false))
  for (let r = 1; r < rows - 1; r++) { // ✅ 1부터 rows-2까지만
    for (let c = 0; c < cols - 1; c++) {
      if (Math.random() < 0.3 && !ladder[r][c] && !ladder[r][c - 1]) {
        ladder[r][c] = true
      }
    }
  }
  return ladder
}

export default generateLadder


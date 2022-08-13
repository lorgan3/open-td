export const STRAIGHT_NEIGHBORS = [
  [0, -1],
  [-1, 0],
  [1, 0],
  [0, 1],
];

export const DIAGONAL_NEIGHBORS = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
];

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
const shuffle = (array: any[]) => {
  const copy = array.slice();
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }

  return copy;
};

const permutations: Array<typeof STRAIGHT_NEIGHBORS> = [];
const PERMUTATION_AMOUNT = 5;
for (let i = 0; i < PERMUTATION_AMOUNT; i++) {
  const result = shuffle(STRAIGHT_NEIGHBORS);
  result.push(...shuffle(DIAGONAL_NEIGHBORS));
  permutations.push(result);
}

export const getRandomNeighbors = () => {
  return permutations[Math.floor(Math.random() * PERMUTATION_AMOUNT)];
};

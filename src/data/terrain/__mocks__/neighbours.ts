const { STRAIGHT_NEIGHBORS, DIAGONAL_NEIGHBORS } =
  jest.requireActual("../neighbours");

export { STRAIGHT_NEIGHBORS, DIAGONAL_NEIGHBORS };

// Not actually random for the tests!
export const getRandomNeighbors = () => {
  return [...STRAIGHT_NEIGHBORS, ...DIAGONAL_NEIGHBORS];
};

export const laneSort = (a, b) => {
  // First, compare by finish position
  if (a.finish_position && b.finish_position) {
    return a.finish_position - b.finish_position;
  } else if (a.finish_position) {
    return -1;
  } else if (b.finish_position) {
    return 1;
  }

  // If finish positions are not available, compare by start position
  return a.id - b.id;
};

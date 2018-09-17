const deduplicateArray = resolvedDependencies =>
  resolvedDependencies.filter((item, i, ar) => ar.indexOf(item) === i);

module.exports = deduplicateArray;

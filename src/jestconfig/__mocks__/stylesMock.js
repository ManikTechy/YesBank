// __mocks__/stylesMock.js

const styleReducer = (acc, arg) => {
  if (typeof arg === "object") {
    return Object.keys(arg).reduce(styleReducer, acc);
  }
  return `${acc ? `${acc} ` : ""}${arg}`;
};

module.exports = new Proxy(() => "", {
  apply: (target, thisArg, argumentsList) =>
    argumentsList.reduce(styleReducer, ""),
  get: (target, key) => {
    if (key === "__esModule") {
      return false;
    }
    return key;
  },
});

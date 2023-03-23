import { getRandomNumber } from "./getRandomNumber.js";

// Uses 2 dependencies: getRandomNumber, characters array
// Generates string using characters in array provided and random index
export const generateRandomString = (arr, length) => {
  return new Array(length).fill(0).reduce((acc) => {
    const randomIndex = getRandomNumber(arr.length);
    return (acc += arr[randomIndex]);
  }, '');
};

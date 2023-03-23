export const urlsForUser = (userId, database) => {
  let result = {};

  for (const urlId in database) {
    if (userId === database[urlId].userId) {
      result[urlId] = database[urlId];
    }
  }

  return result;
};

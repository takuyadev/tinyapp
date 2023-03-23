export const getUserById = (userId, database) => {
  for (const id in database) {
    if (database[id].id === userId) {
      return database[id];
    }
  }
  return null;
};

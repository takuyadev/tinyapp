export const countUniqueVisits = (visits) => {
  
  // Modify array to only have id
  const idArray = visits.map((visit) => {
    return visit.id;
  });

  // New set removes duplicates
  return [...new Set(idArray)].length;
};

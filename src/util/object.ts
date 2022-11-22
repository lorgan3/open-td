// Returns the key of object for value.
export const getKey = <V, O extends { [key: string]: V }>(
  object: O,
  value: V,
  fallback?: keyof O
): keyof O | undefined => {
  return (
    Object.entries(object).find(([_, renderer]) => value === renderer)?.[0] ||
    fallback
  );
};

// Returns value if it's a valid value of object.
export const assertValue = <V, O extends { [key: string]: V }>(
  object: O,
  value: any,
  fallback?: O[string]
): V | undefined => {
  return (
    Object.values(object).find((objectValue) => objectValue === value) ||
    fallback
  );
};

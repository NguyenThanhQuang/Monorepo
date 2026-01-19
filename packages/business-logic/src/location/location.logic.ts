

export const escapeRegex = (value: string): string => {
  return value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

/**
 * Build Mongo search filter for locations
 */
export const buildLocationSearchFilter = (keyword: string) => {
  if (!keyword || keyword.trim().length < 2) {
    return null;
  }

  const decoded = decodeURIComponent(keyword);
  const escaped = escapeRegex(decoded.trim());
  const regex = new RegExp(escaped, 'i');

  return {
    $or: [
      { name: { $regex: regex } },
      { province: { $regex: regex } },
    ],
  };
};

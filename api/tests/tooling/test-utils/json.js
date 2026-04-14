/**
 * Parse Newline Delimiter JSON data
 * @param {string} data
 */
export function parseNDJSON(data) {
  return data
    .split('\n')
    .filter((row) => row !== '')
    .map((r) => JSON.parse(r));
}

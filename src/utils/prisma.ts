export const parseSort = (sortObject: Record<string, any>) => {
  for (const key in sortObject) {
    if (!key) continue;
    const splitted = key.split('_');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const init = { [splitted.pop()!]: sortObject[key] };
    return splitted.length > 0
      ? splitted.reduceRight((acc, k) => ({ [k]: acc }), init)
      : init;
  }
};

export function formatTemplate(template, params) {
  return String(template).replace(/\{(\w+)\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(params, key)) return params[key];
    return match;
  });
}

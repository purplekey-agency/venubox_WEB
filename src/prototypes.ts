/* tslint:disable */
export {};

declare global {
  interface String {
    toCamelCase(): string;
    toPascalCase(): string;
  }
}

String.prototype.toCamelCase = function() {
  return this.replace("'", "").replace(/^([A-Z])|\s(\w)/g, function(
    match,
    p1,
    p2,
    offset
  ) {
    if (p2) {
      return p2.replace("'", "").toUpperCase();
    }
    return p1.replace("'", "").toLowerCase();
  });
};

String.prototype.toPascalCase = function() {
  return `${this}`
    .replace(new RegExp(/[-_]+/, "g"), " ")
    .replace(new RegExp(/[^\w\s]/, "g"), "")
    .replace(
      new RegExp(/\s+(.)(\w+)/, "g"),
      ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
    )
    .replace(new RegExp(/\s/, "g"), "")
    .replace(new RegExp(/\w/), s => s.toUpperCase());
};

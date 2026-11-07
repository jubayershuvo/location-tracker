export const RESERVED_CODES = [
  "api",
  "link",
  "links",
  "signin",
  "signup",
  "location",
  "_next",
  "favicon.ico",
];

export const CODE_REGEX = /^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*$/;

export function isValidCode(code: string): boolean {
  return (
    code.length >= 1 &&
    code.length <= 80 &&
    CODE_REGEX.test(code) &&
    !RESERVED_CODES.includes(code.toLowerCase())
  );
}

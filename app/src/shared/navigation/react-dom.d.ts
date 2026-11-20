// O projeto não instala @types/react-dom; só `flushSync` é usado (web).
declare module "react-dom" {
  export function flushSync(callback: () => void): void;
}

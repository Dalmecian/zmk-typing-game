/// <reference types="vite/client" />

declare module "*.keymap?raw" {
  const content: string;
  export default content;
}

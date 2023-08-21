const log = (category: keyof typeof Log, message: string): void =>
  print(`[${category.upper()}]: ${message}`);

namespace Log {
  export function info(message: string): void {
    log("info", message);
  }

  export function transaction(message: string): void {
    log("transaction", message);
  }
}

export default Log;
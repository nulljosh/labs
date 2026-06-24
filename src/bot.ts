type Handler = (message: string) => string | null;

// Minimal rule-based bot: registered handlers are tried in order,
// first non-null response wins. TODO: swap for an LLM-backed handler.
export class Bot {
  private readonly handlers: Handler[] = [];

  on(handler: Handler): this {
    this.handlers.push(handler);
    return this;
  }

  respond(message: string): string {
    for (const handler of this.handlers) {
      const reply = handler(message);
      if (reply !== null) return reply;
    }
    return "Sorry, I don't understand.";
  }
}

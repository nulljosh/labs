import { createInterface } from "node:readline";
import { Bot } from "./bot.js";

const bot = new Bot()
  .on((msg) => (/^hello|hi$/i.test(msg.trim()) ? "Hello there!" : null))
  .on((msg) => (/bye/i.test(msg) ? "Goodbye!" : null));

const rl = createInterface({ input: process.stdin, output: process.stdout, prompt: "you> " });
rl.prompt();
rl.on("line", (line) => {
  console.log(`bot> ${bot.respond(line)}`);
  rl.prompt();
});

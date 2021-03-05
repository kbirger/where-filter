import { Token, Tokenizer } from "./lexer";
import { Evaluator, orderTokens, Parser } from './parser';

const tokenizer = new Tokenizer();
// const tokens = tokenizer.tokenize("cat = 1 or bar >= 2");
// const tokens = tokenize("cat = 1 or(bar >= 2)");

function test(input: string) {
  console.log(`Input: ${input}`);
  const tokens = tokenizer.tokenize(input);
  console.log(`Result:`);
  console.log(tokens.map(tokenString).join());
}

function tokenString(token: Token) {
  return `${token.type}(${token.value})`;
}

// test('foo in(1,2,3)');
// test('foo in (1,2,3)');
// test("cat = 1 or bar >= 2")
// test("cat    = 1 or bar >= 2")

// test("foo = 1 or cat.meow = 2 and fish = 5")

// test("(foo = 1 or cat.meow = 2) and fish = 5")

// test("cat = 'one' or bar >= 'two'")

// test("foo = 1 or cat.meow = 2 and fish = 5")

// test("(foo = 1 or cat.meow = 'mew') and fish = 5")


// const tokens = tokenizer.tokenize("cat = 'whiskers' or dog = 'rex' and fetch = 1");
// // const tokens = tokenizer.tokenize("cat = 'whiskers' or dog = 'rex'");
// const ordered = orderTokens(tokens);
// console.log(ordered);

// const tokens2 = tokenizer.tokenize("(cat = 'whiskers' or dog = 'rex') and fetch = 1")
// const ordered2 = orderTokens(tokens2);
// console.log(ordered2);

const tokens3 = tokenizer.tokenize("cat in('whiskers', 'snowball', 'fluffers') and fetch = 1");
// console.log(tokens3);
const ordered3 = orderTokens(tokens3);
// console.log(ordered3);
const exprs = new Parser().parse(ordered3);
// console.log(JSON.stringify(exprs, null, 2));

const result = new Evaluator().evaluate(exprs[0], { cat: 'fluffers', fetch: 0 });
console.log(result);
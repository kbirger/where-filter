import { Token, Tokenizer } from "./lexer";

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

test('foo in(1,2,3)');
test('foo in (1,2,3)');
test("cat = 1 or bar >= 2")
test("cat    = 1 or bar >= 2")

// test("foo = 1 or cat.meow = 2 and fish = 5")

// test("(foo = 1 or cat.meow = 2) and fish = 5")

test("cat = 'one' or bar >= 'two'")

test("foo = 1 or cat.meow = 2 and fish = 5")

test("(foo = 1 or cat.meow = 'mew') and fish = 5")

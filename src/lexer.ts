/*read 4 => numberBuffer
 read 5 => numberBuffer 
 read 6 => numberBuffer 
 read . => numberBuffer 
 read 7 => numberBuffer x is a letter, so put all the contents of numberbuffer together as a Literal 456.7 => result 
 read x => letterBuffer 
 read y => letterBuffer + is an Operator, so remove all the contents of letterbuffer separately as Variables x => result, y => result + => result 
 read 6 => numberBuffer s is a letter, so put all the contents of numberbuffer together as a Literal 6 => result 
 read s => letterBuffer 
 read i => letterBuffer 
 read n => letterBuffer ( is a Left Parenthesis, so put all the contents of letterbuffer together as a function sin => result 
  read 7 => numberBuffer
   read . => numberBuffer
    read 0 => numberBuffer 
    read 4 => numberBuffer x is a letter, so put all the contents of numberbuffer together as a Literal 7.04 => result read x => letterBuffer ) is a Right Parenthesis, so remove all the contents of letterbuffer separately as Variables x => result - is an Operator, but both buffers are empty, so there's nothing to remove 
    read m => letterBuffer
    read i => letterBuffer 
    read n => letterBuffer ( is a Left Parenthesis, so put all the contents of letterbuffer together as a function min => result 
      read a=> letterBuffer , is a comma, so put all the contents of letterbuffer together as a Variable a => result, then push , as a Function Arg Separator => result
       read 7=> numberBuffer ) is a Right Parenthesis, so put all the contents of numberbuffer together as a Literal 7 => resul
*/

const WORD_OPERATORS = ['and', 'or', 'in'];
enum TokenMode {
  None,
  Word,
  Literal,
  Operator,
  String
}
export class Tokenizer {
  private buffer: string[] = [];
  // private wordBuffer: string[] = [];
  // private literalBuffer: string[] = [];
  // private whitespaceBuffer: string[] = [];
  // private operatorBuffer: string[] = [];
  private tokens: Token[] = [];
  private mode: TokenMode = TokenMode.None;
  private tokenStart = 0;

  index: number = 0;
  ch: string = '';


  private hasStringLiteral() {
    return this.mode === TokenMode.String;
  }
  private hasWords() {
    return this.mode === TokenMode.Word;
  }

  private hasLiterals() {
    return this.mode === TokenMode.Literal || this.mode === TokenMode.String;
  }

  private isWordOperator() {
    return WORD_OPERATORS.includes(this.buffer.join(''));
  }
  // private hasWhitespace() {
  //   return this.whitespaceBuffer.length > 0;
  // }

  private hasOperators() {
    return this.mode === TokenMode.Operator || this.isWordOperator();
  }

  private addToBuffer(ch: string) {
    if (this.buffer.length === 0) {
      this.tokenStart = this.index;
    }
    this.buffer.push(ch);
  }

  private add(builder: (buffer: string[], location: number) => Token) {
    this.tokens.push(builder(this.buffer, this.tokenStart));
    this.buffer.length = 0;
    this.mode = TokenMode.None;
  }

  private addFunction() {
    this.add(func);
  }

  private addLiteral() {
    this.add(literal);

  }

  private addOperator() {
    //  todo validate operator
    if (this.isWordOperator()) {
      this.add(operator);
    } else {
      this.add(operator);
    }
  }

  private addField() {
    this.add(field);
  }

  private tokenizeWordChar(ch: string) {
    if (this.hasOperators()) {
      this.addOperator();
    } else if (this.hasLiterals()) {
      throw new Error(`Unexpected character ${ch} at ${this.index}`);
    }

    this.mode = TokenMode.Word;
    this.addToBuffer(ch);
  }

  private tokenizeLiteralChar(ch: string, isString: boolean = false) {
    if (this.hasOperators()) {
      this.addOperator();
    } else if (this.hasWords()) {
      throw new Error(`Unexpected character ${ch} at ${this.index}`);
    }

    this.mode = isString ? TokenMode.String : TokenMode.Literal;
    this.addToBuffer(ch);
  }

  private tokenizeOperator(ch: string) {
    if (this.hasWords()) {
      this.addField();
    } else if (this.hasLiterals()) {
      this.addLiteral();
    }

    this.mode = TokenMode.Operator;
    this.addToBuffer(ch);
  }

  private tokenizeComma(ch: string) {
    if (this.hasWords()) {
      this.addField();
    } else if (this.hasLiterals()) {
      this.addLiteral();
    } else if (this.hasOperators()) {
      throw new Error(`Unexpected whitespace at ${this.index}`);
    }

    // this.tokens.push(comma([ch], this.index));
  }

  private tokenizeLeftParenthesis(ch: string) {
    if (this.hasOperators()) {
      this.addOperator();
    } else if (this.hasWords()) {
      this.addFunction();
    } else if (this.hasLiterals()) {
      throw new Error(`Unexpected left parenthesis at ${this.index}`);
    } // todo: else? 

    this.tokens.push(leftParenthesis([ch], this.index)); // todo: should this be buffered?
  }

  private tokenizeRightParenthesis(ch: string) {
    if (this.hasWords()) {
      this.addField();
    } else if (this.hasLiterals()) {
      this.addLiteral();
    } else if (this.hasOperators() || this.tokens[this.tokens.length - 1].type === TokenType.Comma) { // todo: should comma be buffered?
      throw new Error(`Unexpected right parenthesis at ${this.index}`);
    }

    this.tokens.push(rightParenthesis([ch], this.index)); // todo: should this be buffered?

  }

  tokenize(input: string) {
    this.buffer = [];
    this.tokens = [];
    this.mode = TokenMode.None;
    let tokenEnded = false;

    for (let idx = 0; idx < input.length; idx++) {
      this.index = idx;
      const ch = input[idx];
      this.ch = ch;

      if (isWhitespace(ch)) {
        tokenEnded = true;
        continue;
      }

      if (isQuote(ch)) {
        if (tokenEnded) {
          tokenEnded = false;
          this.processBuffer();
        }
        this.tokenizeQuote(ch);
      }

      else if (!this.hasStringLiteral() && (isLetter(ch) || (this.hasWords() && isPeriod(ch)))) {
        if (tokenEnded) {
          tokenEnded = false;
          this.processBuffer();
        }

        this.tokenizeWordChar(ch);
      }

      else if (this.hasStringLiteral() || isDigit(ch) || (this.hasLiterals() && isPeriod(ch))) {
        if (tokenEnded) {
          tokenEnded = false;
          this.processBuffer();
        }

        this.tokenizeLiteralChar(ch, this.hasStringLiteral());
      }

      // handle leading . as in .5
      else if (isPeriod(ch)) {
        if (tokenEnded) {
          tokenEnded = false;
          this.processBuffer();
        }

        this.tokenizeLiteralChar(ch)
      }

      else if (isOperator(ch)) {
        if (tokenEnded) {
          tokenEnded = false;
          this.processBuffer();
        }

        this.tokenizeOperator(ch);
      }

      else if (isComma(ch)) {
        if (tokenEnded) {
          tokenEnded = false;
          this.processBuffer();
        }

        this.tokenizeComma(ch);
      }

      else if (isLeftParenthesis(ch)) {
        this.tokenizeLeftParenthesis(ch);
      }

      else if (isRightParenthesis(ch)) {
        this.tokenizeRightParenthesis(ch);
      }
    }

    this.processBuffer();
    return this.tokens;
  }

  private processBuffer() {
    if (this.hasLiterals()) {
      this.addLiteral();
    } else if (this.hasOperators()) {
      this.addOperator();
    } else if (this.hasWords()) {
      this.addField();
    }
  }

  tokenizeQuote(ch: string) {
    this.addToBuffer(ch);
    if (this.mode !== TokenMode.String) {
      this.mode = TokenMode.String;
    } else {
      this.addLiteral();
      // todo: set to none?
    }
  }
}
// export function tokenize(input: string) {
//   const chars = input.split('');
//   const tokens = [];



//   for (let idx = 0; idx < input.length; idx++) {
//     const ch = input[idx];

//     if (isLetter(ch)) {
//       this.wordBuffer.push(ch);
//     }

//     if (isLeftParenthesis(ch)) {
//       if (wordBuffer.length > 0) {
//         tokens.push(func(wordBuffer));
//         wordBuffer = []
//       }
//     }

//     if (isPeriod(ch)) {
//       if (wordBuffer.length > 0) {
//         wordBuffer.push(ch);
//       } else if (literalBuffer.length > 0) {
//         literalBuffer.push(ch);
//       } else {
//         throw new Error(`Unexpected PERIOD at location ${idx}`);
//       }
//     }


//   }


//   return tokens;
// }

function isQuote(ch: string) { return ch === '\''; }
function isComma(ch: string) { return (ch === ","); }
function isDigit(ch: string) { return /\d/.test(ch); }
function isPeriod(ch: string) { return (ch === '.'); }
function isLetter(ch: string) { return /[a-z_\-]/i.test(ch); }
function isOperator(ch: string) { return /\<|\>|=|~/.test(ch); }
function isLeftParenthesis(ch: string) { return (ch === "("); }
function isRightParenthesis(ch: string) { return (ch == ")"); }
function isWhitespace(ch: string) { return /\s/.test(ch); }

export enum TokenType {
  Whitespace = 'Whitespace',
  Literal = 'Literal',
  Field = 'Field',
  Operator = 'Operator',
  Function = 'Function',
  LeftParenthesis = 'LeftParenthesis',
  RightParenthesis = 'RightParenthesis',
  Comma = 'Comma'
}
export interface Token {
  type: TokenType;
  value: number | string | boolean;
  start: number;
  length: number;
}


function whitespace(value: string[], start: number): Token {
  return {
    type: TokenType.Whitespace,
    value: value.join(''),
    start,
    length: value.length
  }
}

function literal(value: string[], start: number): Token {
  let actualValue = null;
  if (value[0] === '\'') {
    actualValue = value.filter(c => c !== '\'').join('')
  } else {
    actualValue = value.join('');
    // bool
    if (actualValue === 'true') {
      actualValue = true;
    } else if (actualValue === 'false') {
      actualValue = false;
    }
    // number
    else if (!isNaN(actualValue = parseFloat(actualValue))) {

    } else {
      throw new Error(`Invalid literal value: ${value.join('')}`);
    }
  }
  return {
    type: TokenType.Literal,
    value: actualValue,
    start,
    length: value.length
  }
}

function operator(value: string[], start: number): Token {
  return {
    type: TokenType.Operator,
    value: value.join(''),
    start,
    length: value.length
  }
}

function func(value: string[], start: number): Token {
  return {
    type: TokenType.Function,
    value: value.join(''),
    start,
    length: value.length
  }
}

function field(value: string[], start: number): Token {
  return {
    type: TokenType.Field,
    value: value.join(''),
    start,
    length: value.length
  }
}

function leftParenthesis(value: string[], start: number): Token {
  return {
    type: TokenType.LeftParenthesis,
    value: value.join(''),
    start,
    length: value.length
  }
}

function rightParenthesis(value: string[], start: number): Token {
  return {
    type: TokenType.RightParenthesis,
    value: value.join(''),
    start,
    length: value.length
  }
}

function comma(value: string[], start: number): Token {
  return {
    type: TokenType.Comma,
    value: value.join(''),
    start,
    length: value.length
  }
}
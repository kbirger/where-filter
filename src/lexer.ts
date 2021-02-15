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

const WORD_OPERATORS = ['and', 'or'];

export class Tokenizer {
  private wordBuffer: string[] = [];
  private literalBuffer: string[] = [];
  private whitespaceBuffer: string[] = [];
  private operatorBuffer: string[] = [];
  private tokens: Token[] = [];
  private inString = false;

  index: number = 0;
  ch: string = '';

  private hasWords() {
    return this.wordBuffer.length > 0;
  }

  private hasLiterals() {
    return this.literalBuffer.length > 0;
  }

  private isWordOperator() {
    return WORD_OPERATORS.includes(this.wordBuffer.join(''));
  }
  private hasWhitespace() {
    return this.whitespaceBuffer.length > 0;
  }

  private hasOperators() {
    return this.operatorBuffer.length > 0 || this.isWordOperator();
  }

  private add(buffer: string[], builder: (buffer: string[]) => Token) {
    this.tokens.push(builder(buffer));
    buffer.length = 0;
  }

  private addFunction() {
    this.add(this.wordBuffer, func);
  }

  private addLiteral() {
    this.add(this.literalBuffer, literal);

  }

  private addWhitespace() {
    this.add(this.whitespaceBuffer, whitespace);
  }

  private addOperator() {
    //  todo validate operator
    if (this.isWordOperator()) {
      this.add(this.wordBuffer, operator);
    } else {
      this.add(this.operatorBuffer, operator);
    }
  }

  private addField() {
    this.add(this.wordBuffer, field);
  }

  private tokenizeWordChar(ch: string) {
    if (this.hasOperators()) {
      this.addOperator();
    } else if (this.hasWhitespace()) {
      this.addWhitespace();
    } else if (this.hasLiterals()) {
      throw new Error(`Unexpected character ${ch} at ${this.index}`);
    }

    this.wordBuffer.push(ch);
  }

  private tokenizeLiteralChar(ch: string) {
    if (this.hasOperators()) {
      this.addOperator();
    } else if (this.hasWhitespace()) {
      this.addWhitespace();
    } else if (this.hasWords()) {
      throw new Error(`Unexpected character ${ch} at ${this.index}`);
    }

    this.literalBuffer.push(ch);
  }

  private tokenizeWhitespaceChar(ch: string) {
    if (this.hasOperators()) {
      this.addOperator();
    } else if (this.hasLiterals()) {
      this.addLiteral();
    } else if (this.hasWords()) {
      this.addField();
    }

    this.whitespaceBuffer.push(ch);
  }

  private tokenizeOperator(ch: string) {
    if (this.hasWords()) {
      this.addField();
    } else if (this.hasLiterals()) {
      this.addLiteral();
    } else if (this.hasWhitespace()) {
      this.addWhitespace();
    }

    this.operatorBuffer.push(ch);
  }

  private tokenizeComma(ch: string) {
    if (this.hasWords()) {
      this.addField();
    } else if (this.hasLiterals()) {
      this.addLiteral();
    } else if (this.hasWhitespace()) {
      this.addWhitespace();
    } else if (this.hasOperators()) {
      throw new Error(`Unexpected whitespace at ${this.index}`);
    }

    this.tokens.push(comma([ch]));
  }

  private tokenizeLeftParenthesis(ch: string) {
    if (this.hasOperators()) {
      this.addOperator();
    } else if (this.hasWords()) {
      this.addFunction();
    } else if (this.hasWhitespace()) {
      this.addWhitespace();
    } else if (this.hasLiterals()) {
      throw new Error(`Unexpected left parenthesis at ${this.index}`);
    } // todo: else? 

    this.tokens.push(leftParenthesis([ch])); // todo: should this be buffered?
  }

  private tokenizeRightParenthesis(ch: string) {
    if (this.hasWords()) {
      this.addField();
    } else if (this.hasLiterals()) {
      this.addLiteral();
    } else if (this.hasWhitespace()) {
      this.addWhitespace();
    } else if (this.hasOperators() || this.tokens[this.tokens.length - 1].type === TokenType.Comma) { // todo: should comma be buffered?
      throw new Error(`Unexpected right parenthesis at ${this.index}`);
    }

    this.tokens.push(rightParenthesis([ch])); // todo: should this be buffered?

  }

  tokenize(input: string) {
    this.wordBuffer = [];
    this.literalBuffer = [];
    this.whitespaceBuffer = [];
    this.operatorBuffer = [];
    this.tokens = [];
    this.inString = false;

    for (let idx = 0; idx < input.length; idx++) {
      this.index = idx;
      const ch = input[idx];
      this.ch = ch;

      if (isQuote(ch)) {
        this.tokenizeQuote(ch);
      }

      else if (!this.inString && (isLetter(ch) || (this.hasWords() && isPeriod(ch)))) {
        this.tokenizeWordChar(ch);
      }


      else if (this.inString || isDigit(ch) || (this.hasLiterals() && isPeriod(ch))) {
        this.tokenizeLiteralChar(ch);
      }

      // handle leading . as in .5
      else if (isPeriod(ch)) {
        this.tokenizeLiteralChar(ch)
      }


      else if (isWhitespace(ch)) {
        this.tokenizeWhitespaceChar(ch);
      }

      else if (isOperator(ch)) {
        this.tokenizeOperator(ch);
      }

      else if (isComma(ch)) {
        this.tokenizeComma(ch);
      }

      else if (isLeftParenthesis(ch)) {
        this.tokenizeLeftParenthesis(ch);
      }

      else if (isRightParenthesis(ch)) {
        this.tokenizeRightParenthesis(ch);
      }
    }

    if (this.hasLiterals()) {
      this.addLiteral();
    } else if (this.hasOperators()) {
      this.addOperator();
    } else if (this.hasWhitespace()) {
      this.addWhitespace();
    } else if (this.hasWords()) {
      this.addField();
    }
    return this.tokens;
  }
  tokenizeQuote(ch: string) {
    if (!this.inString) {
      this.literalBuffer.push(ch);
      this.inString = true;
    } else {
      this.literalBuffer.push(ch);
      this.addLiteral();
      this.inString = false;
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
  value: string;
}


function whitespace(value: string[]): Token {
  return {
    type: TokenType.Whitespace,
    value: value.join('')
  }
}

function literal(value: string[]): Token {
  return {
    type: TokenType.Literal,
    value: value.join('')
  }
}

function operator(value: string[]): Token {
  return {
    type: TokenType.Operator,
    value: value.join('')
  }
}

function func(value: string[]): Token {
  return {
    type: TokenType.Function,
    value: value.join('')
  }
}

function field(value: string[]): Token {
  return {
    type: TokenType.Field,
    value: value.join('')
  }
}

function leftParenthesis(value: string[]): Token {
  return {
    type: TokenType.LeftParenthesis,
    value: value.join('')
  }
}

function rightParenthesis(value: string[]): Token {
  return {
    type: TokenType.RightParenthesis,
    value: value.join('')
  }
}

function comma(value: string[]): Token {
  return {
    type: TokenType.Comma,
    value: value.join('')
  }
}
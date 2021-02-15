import { Token, TokenType } from './lexer';

export class Parser {
  parse(tokens: Token[]) {
    let token: Token | undefined;
    while (token = tokens.shift()) {
      switch (token.type) {
        case TokenType.Comma:
          break;
        case TokenType.Field:
          break;
        case TokenType.Function:
          break;
        case TokenType.Literal:
          break;
        case TokenType.Operator:
          break;
        case TokenType.Whitespace:
          break;
        case TokenType.LeftParenthesis:
          break;
        case TokenType.RightParenthesis:
          break;
      }
    }
  }
}

enum Operator {
  Resolve = 'Resolve',
  Literal = 'Literal',
  GreaterThan = 'GreaterThan',
  GreaterThanOrEqual = 'GreaterOrEqual',
  LessThan = 'LessThan',
  LessThanOrEqual = 'LessThanOrEqual',
  Equals = 'Equal',
  Matches = 'Matches',
  Or = 'Or',
  And = 'And',

}

interface Expression {

}

interface UnaryExpression extends Expression {
  operator: Operator;
  operand: string;
}

interface BinaryExpression extends Expression {
  operator: Operator;
  operand1: string;
  operand2: string;
}


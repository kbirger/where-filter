import { Token, TokenType } from './lexer';
import { get } from 'lodash';

enum ParserState {
  None,
  InList
}

const precedenceMap: Record<string, number> = {
  '(': 11,
  ')': 11,
  'in': 10,
  '>': 9,
  '>=': 9,
  '<': 9,
  '<=': 9,
  '=': 9,
  '~': 9,
  'and': 8,
  'or': 7,
};

export function orderTokens(tokens: Token[]) {
  const output: Token[] = [];
  const operators: Token[] = [];
  for (const token of tokens) {
    switch (token.type) {
      case TokenType.LeftParenthesis:
        operators.push(token);
        output.unshift(token);
        break;
      case TokenType.RightParenthesis:
        while (operators.length > 0 && operators[operators.length - 1].type !== TokenType.LeftParenthesis) {
          const next = operators.pop()!;
          output.unshift(next);
        }

        if (operators.length > 0 && operators[operators.length - 1].type === TokenType.LeftParenthesis) {
          operators.pop();
        } else {
          throw new Error('Mismatched Parentheses');
        }

        if (operators.length > 0 && operators[operators.length - 1].type === TokenType.Function) {
          output.unshift(operators.pop()!);
        }

        output.unshift(token);
        break;
      case TokenType.Operator:
        // case TokenType.Comma:
        const precedence = precedenceMap[token.value as string];
        const isLeftAssociative = ![TokenType.LeftParenthesis, TokenType.RightParenthesis].includes(token.type);
        while ((operators.length > 0)) {
          const next = operators[operators.length - 1];
          const nextPrecedence = precedenceMap[next!.value as string];
          if (((nextPrecedence > precedence) || (nextPrecedence === precedence && isLeftAssociative)) &&
            next.type !== TokenType.LeftParenthesis) {
            output.unshift(next);
            operators.pop();
          } else {
            break;
          }
        }
        operators.push(token);
        break;
      case TokenType.Function:
        operators.push(token);
        break;
      default:
        output.unshift(token);
        break;
    }
  }

  while (operators.length > 0) {
    output.unshift(operators.pop()!);
  }

  return output;

}

export class Parser {
  parse(tokens: Token[]): Expression[] {
    let state: ParserState = ParserState.None;
    let token: Token | undefined;
    const expressions = [];
    let listBuffer = [];
    while (token = tokens.pop()) {
      switch (token.type) {
        case TokenType.Comma:
          break;
        case TokenType.Field:
          const fexpr = { type: 'Field', path: token.value, meta: token } as FieldExpression;
          if (state === ParserState.InList) {
            listBuffer.push(fexpr)
          } else {
            expressions.push(fexpr);
          }
          break;
        case TokenType.Function:
          if (expressions[expressions.length - 1].type !== 'List') {
            throw new Error(`Unexpected function at ${token.start}`);
          }

          const list = expressions.pop()! as ListExpression;
          expressions.push({
            type: 'Function',
            operands: list
          } as FunctionExpression);

          break;
        case TokenType.Literal:
          const lexpr = { type: 'Literal', value: token.value, meta: token } as LiteralExpression;
          if (state === ParserState.InList) {
            listBuffer.push(lexpr)
          } else {
            expressions.push(lexpr);
          }
          break;
        case TokenType.Operator:
          const left: Expression = expressions.pop()!;
          const right: Expression = expressions.pop()!;
          expressions.push({
            type: 'Binary',
            operand1: left,
            operand2: right,
            operator: token.value
          } as BinaryExpression)
          break;
        case TokenType.Whitespace:
          break;
        case TokenType.LeftParenthesis:
          if (state === ParserState.InList) {
            throw Error('Unexpected ( at ' + token.start);
          }

          const nextOperator = [...tokens].reverse().find(t => t.type === 'Operator');
          if (nextOperator && nextOperator.value === 'in') {
            state = ParserState.InList;
          }
          break;
        case TokenType.RightParenthesis:
          if (state !== ParserState.InList) {
            break;
          }
          expressions.push({
            type: 'List',
            operands: listBuffer
          } as ListExpression);
          listBuffer = [];
          state = ParserState.None;
          break;
      }
    }

    return expressions;
  }
}

export enum Operator {
  // Resolve = 'Resolve',
  // Literal = '',
  GreaterThan = '>',
  GreaterThanOrEqual = '>=',
  LessThan = '<',
  LessThanOrEqual = '<=',
  Equals = '=',
  Matches = '~',
  Or = 'or',
  And = 'and',
  In = 'in'

}

export interface Expression {
  type: string;
}

export interface ListExpression {
  type: 'List'
  operands: ValueExpression[];
}

export interface FunctionExpression {
  type: 'Function';
  operands: ListExpression;
}

export interface UnaryExpression extends Expression {
  operator: Operator;
  operand: string;
}

export interface BinaryExpression extends Expression {
  type: 'Binary'
  operator: Operator;
  operand1: BinaryExpression | ValueExpression;
  operand2: BinaryExpression | ValueExpression;
}

export interface LiteralExpression {
  type: 'Literal';
  value: string | number | boolean;
}

export interface FieldExpression {
  type: 'Field';
  path: string;
}

export type BooleanExpression = BinaryExpression;
export type ValueExpression = FieldExpression | LiteralExpression | ListExpression | FunctionExpression;



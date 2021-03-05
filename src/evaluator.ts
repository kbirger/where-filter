import { get } from 'lodash';
import { Expression, ListExpression, FieldExpression, LiteralExpression, BinaryExpression, Operator } from './parser';

export class Evaluator {
  evaluate(expr: Expression, ctx: any): Primitive {
    if (isField(expr)) {
      return get(ctx, expr.path) as Primitive;
    } else if (isLiteral(expr)) {
      return expr.value as Primitive;
    } else if (isBinary(expr)) {
      return this.operEval(expr.operator, this.evaluate(expr.operand1, ctx), this.evaluate(expr.operand2, ctx));
    } else if (isList(expr)) {
      return this.listEval(expr, ctx) as any;
    }

    throw Error('Could not handle ' + expr.type);
  }

  listEval(expr: ListExpression, ctx: any): Primitive[] {
    return expr.operands.map((operand) => this.evaluate(operand, ctx) as Primitive);
  }

  operEval(operator: Operator, left: Primitive, right: Primitive): Primitive {
    const map: Record<Operator, (a: Primitive, b: Primitive) => Primitive> = {
      [Operator.And]: (a: Primitive, b: Primitive) => a && b,
      [Operator.Or]: (a: Primitive, b: Primitive) => a || b,
      [Operator.GreaterThan]: (a: Primitive, b: Primitive) => a > b,
      [Operator.GreaterThanOrEqual]: (a: Primitive, b: Primitive) => a >= b,
      [Operator.LessThan]: (a: Primitive, b: Primitive) => a < b,
      [Operator.LessThanOrEqual]: (a: Primitive, b: Primitive) => a <= b,
      [Operator.Equals]: (a: Primitive, b: Primitive) => a == b,
      [Operator.Matches]: (a: Primitive, b: Primitive) => new RegExp(b as string).test(a as string),
      [Operator.In]: (a: any, b: any) => a.includes(b)
    };

    const fn = map[operator];

    return fn(left, right);

  }
}

type Primitive = number | string | boolean;

function isList(expr: Expression): expr is ListExpression {
  return expr.type === 'List';
}
function isField(expr: Expression): expr is FieldExpression {
  return expr.type === 'Field';
}

function isLiteral(expr: Expression): expr is LiteralExpression {
  return expr.type === 'Literal';
}

function isBinary(expr: Expression): expr is BinaryExpression {
  return expr.type === 'Binary';
}
import { Evaluator } from './evaluator';
import { Token, Tokenizer } from './lexer';
import { Expression, orderTokens, Parser } from './parser';

interface Where {
  input: string;
  tokens(): TokensResult;
  orderedTokens(): OrderedTokensResult;
  parse(): ExpressionResult;
  evaluate(context: any): boolean;
}

interface TokensResult {
  value: Token[];
  orderedTokens(): OrderedTokensResult;
  parse(): ExpressionResult;
  evaluate(context: any): boolean;
}

interface OrderedTokensResult {
  value: Token[];
  parse(): ExpressionResult;
  evaluate(context: any): boolean;
}

interface ExpressionResult {
  value: Expression[];
  evaluate(context: any): boolean;
}

interface Context {
  input: string;
  tokens?: Token[];
  ordered?: Token[];
  ast?: Expression[];
  resultValue?: boolean;
}

type StrongContext<K extends keyof Context> = Context & Required<Pick<Context, K>>;

class WhereImpl<K extends keyof Context> implements Where {
  constructor(protected readonly ctx: Context & Required<Pick<Context, K>>) {

  }

  get input(): string {
    return this.ctx.input;
  }
  tokens(): TokensResult {
    if (!this.ctx.tokens) {
      const result = new Tokenizer().tokenize(this.input);
      this.ctx.tokens = result;
    }

    return new TokensResultImpl(this.ctx as StrongContext<'tokens'>);
  }
  orderedTokens(): OrderedTokensResult {
    if (!this.ctx.ordered) {
      const tokens = this.tokens();
      this.ctx.ordered = orderTokens(tokens.value);
    }

    return new OrderedTokensResultImpl(this.ctx as StrongContext<'tokens' | 'ordered'>);
  }
  parse(): ExpressionResult {
    if (!this.ctx.ast) {
      const ordered = this.orderedTokens();
      const ast = new Parser().parse(ordered.value);
      this.ctx.ast = ast;
    }

    return new ExpressionResultImpl(this.ctx as StrongContext<'tokens' | 'ordered' | 'ast'>);
  }
  evaluate(context: any): boolean {
    if (!this.ctx.resultValue) {
      const ast = this.parse();
      const resultValue = new Evaluator().evaluate(ast.value[0], context);
      this.ctx.resultValue = resultValue as boolean;
    }

    return this.ctx.resultValue;
  }

}

class TokensResultImpl extends WhereImpl<'tokens'> implements TokensResult {
  constructor(ctx: StrongContext<'tokens'>) {
    super(ctx);
  }

  get value(): Token[] {
    return this.ctx.tokens;
  }
}

class OrderedTokensResultImpl extends WhereImpl<'tokens' | 'ordered'> implements OrderedTokensResult {
  constructor(ctx: StrongContext<'tokens' | 'ordered'>) {
    super(ctx);
  }
  get value(): Token[] {
    return this.ctx.ordered;
  }
}

class ExpressionResultImpl extends WhereImpl<'tokens' | 'ordered' | 'ast'> implements ExpressionResult {
  constructor(ctx: StrongContext<'tokens' | 'ordered' | 'ast'>) {
    super(ctx);
  }
  get value(): Expression[] {
    return this.ctx.ast;
  }
}

export function where(value: string) {
  return new WhereImpl({ input: value });
}
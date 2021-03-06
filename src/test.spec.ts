import { Expression } from './parser';
import { where } from './where';

interface Person {
  name: string;
  age: number;
  sex: string;
  canDrive: boolean;
}

interface TestCase {
  input: string;
  result: any;
  description?: string;
}

describe('AST', () => {
  let context!: Person;
  beforeEach(() => {
    context = {
      name: 'Kir',
      age: 34,
      sex: 'M',
      canDrive: true
    }
  });

  ([
    {
      input: "name = 'Kir'",
      description: 'simple string',
      result: {
        type: "Binary",
        operand1: {
          type: "Literal",
          value: "Kir"
        },
        operand2: {
          type: "Field",
          path: "name"
        },
        operator: "="
      }
    },
    {
      input: "name = ('Kir')",
      description: 'simple string with literal in parentheses',
      result: {
        type: "Binary",
        operand1: {
          type: "Literal",
          value: "Kir"
        },
        operand2: {
          type: "Field",
          path: "name"
        },
        operator: "="
      }
    },
    {
      input: "(name) = ('Kir')",
      description: 'simple string with field in parentheses',
      result: {
        type: "Binary",
        operand1: {
          type: "Literal",
          value: "Kir"
        },
        operand2: {
          type: "Field",
          path: "name"
        },
        operator: "="
      }
    },
    {
      input: "(name = 'Kir')",
      description: 'simple string in parentheses',
      result: {
        type: "Binary",
        operand1: {
          type: "Literal",
          value: "Kir",
        },
        operand2: {
          type: "Field",
          path: "name"
        },
        operator: "="
      }
    },
    {
      input: "name = 'Kir' and age = 34",
      description: 'single AND conjunction',
      result: {
        type: "Binary",
        operand1: {
          type: "Binary",
          operand1: {
            type: "Literal",
            value: 34
          },
          operand2: {
            type: "Field",
            path: "age"
          },
          operator: "="
        },
        operand2: {
          type: "Binary",
          operand1: {
            type: "Literal",
            value: "Kir"
          },
          operand2: {
            type: "Field",
            path: "name"
          },
          operator: "="
        },
        operator: "and"
      }
    },
    {
      input: "(name = 'Kir' and age = 34)",
      description: 'single AND conjunction in parentheses',
      result: {
        type: "Binary",
        operand1: {
          type: "Binary",
          operand1: {
            type: "Literal",
            value: 34
          },
          operand2: {
            type: "Field",
            path: "age"
          },
          operator: "="
        },
        operand2: {
          type: "Binary",
          operand1: {
            type: "Literal",
            value: "Kir"
          },
          operand2: {
            type: "Field",
            path: "name"
          },
          operator: "="
        },
        operator: "and"
      }
    },
    {
      input: "(name = 'Kir') and (age = 34)",
      description: 'single AND conjunction with each operand in parentheses',
      result: {
        type: "Binary",
        operand1: {
          type: "Binary",
          operand1: {
            type: "Literal",
            value: 34
          },
          operand2: {
            type: "Field",
            path: "age"
          },
          operator: "="
        },
        operand2: {
          type: "Binary",
          operand1: {
            type: "Literal",
            value: "Kir"
          },
          operand2: {
            type: "Field",
            path: "name"
          },
          operator: "="
        },
        operator: "and"
      }
    },
    {
      input: "name = 'Kir' and age = 34 and sex = 'M'",
      description: 'triple is left-associated',
      result: {
        type: "Binary",
        operand1: {
          type: "Binary",
          operand1: {
            type: "Literal",
            value: "M"
          },
          operand2: {
            type: "Field",
            path: "sex"
          },
          operator: "="
        },
        operand2: {
          type: "Binary",
          operand1: {
            type: "Binary",
            operand1: {
              type: "Literal",
              value: 34
            },
            operand2: {
              type: "Field",
              path: "age"
            },
            operator: "="
          },
          operand2: {
            type: "Binary",
            operand1: {
              type: "Literal",
              value: "Kir"
            },
            operand2: {
              type: "Field",
              path: "name"
            },
            operator: "="
          },
          operator: "and"
        },
        operator: "and"
      }
    }
  ] as TestCase[])
    .forEach(({ input, result, description }: TestCase) => {
      const fact = `${input}: ${description}`;
      it(fact, () => {
        const parsed = where(input).parse().value;

        expect(parsed.length).toEqual(1);

        if (result)
          expect(parsed[0]).toMatchObject(result);

        if (!result)
          console.log(JSON.stringify(parsed[0], (key, value) => key === 'meta' ? undefined : value, 2));
      });
    });
});

export interface CanisterMethodArgument {
  name: string
  value: any
}

export interface CanisterFunctionProps {
  id: number
  methodName: string
  callArguments: CanisterMethodArgument[]
  callResponse?: string
}

export interface CanisterTemplateProps {
  id: string
  name: string
  type: string // HELLO_WORLD
  functions: CanisterFunctionProps[]
}

export const CANISTER_HELLO_WORLD: CanisterTemplateProps = {
  id: '1',
  name: 'Hello World',
  type: 'HELLO_WORLD',
  functions: [
    {
      id: 1,
      methodName: 'greet',
      callArguments: [{ name: 'name', value: '' }],
    },
  ],
}

export const CANISTER_VECTOR_DATABASE: CanisterTemplateProps = {
  id: '3',
  name: 'Vector Database',
  type: 'VECTOR_DATABASE',
  functions: [
    {
      id: 1,
      methodName: 'getVectors',
      callArguments: [],
    },
    {
      id: 2,
      methodName: 'addVector',
      callArguments: [{ name: 'value', value: '' }],
    },
    {
      id: 3,
      methodName: 'removeVector',
      callArguments: [{ name: 'id', value: '' }],
    },
    {
      id: 4,
      methodName: 'searchEngine',
      callArguments: [
        { name: 'targetValue', value: '' },
        { name: 'threshold', value: '' },
      ],
    },
  ],
}

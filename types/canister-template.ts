export interface CanisterMethodArgument {
  name: string
  value: any
}

export interface CanisterFunctionProps {
  id: number
  methodName: string
  callArguments: CanisterMethodArgument[]
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

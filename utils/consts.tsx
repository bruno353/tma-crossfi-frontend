export const workflowOptions = [
  {
    name: 'Development Infrastructure',
    description:
      'Accelerate your development through a set of low-code features - blockchain wallet deployment, automated workflows, LLM interactions...',
    imgSource: '/images/sidebar/1.svg',
    imgStyle: 'w-[18px] 2xl:w-[20px]',
    imgStyleBoard: 'w-[11px] 2xl:w-[13px]',
    imgStyleTitle: 'w-[25px]',
    type: 'DEVELOPMENT',
    pathSegment: '',
  },
  {
    name: 'Credit management',
    description:
      'All-in-one space for managing financial features including loans, transactions, payments, and credit analysis.',
    imgSource: '/images/workflows/paper.svg',
    imgStyle: 'w-[18px] 2xl:w-[20px]',
    imgStyleBoard: 'w-[11px] 2xl:w-[13px]',
    imgStyleTitle: 'w-[28px]',
    type: 'FINANCIAL',
    pathSegment: '',
  },
]

export const workflowTypeToOptions = {
  DEVELOPMENT: workflowOptions[0],
  FINANCIAL: workflowOptions[1],
}

export const optionsStandardFinancial = [
  {
    name: 'Brazil',
    value: 'Brazil',
  },
]

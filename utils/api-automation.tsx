/* eslint-disable @typescript-eslint/prefer-as-const */
'use client'
import {
  EmailRecoverPassword,
  RecoverPassword,
  SigninForm,
  SignupForm,
} from '@/types/user'
import axios from 'axios'

export async function createAutomationWorkflow(
  data: any,
  userSessionToken: string,
) {
  const config = {
    method: 'post' as 'post',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/automation/functions/createWorkflow`,
    headers: {
      'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      'X-Parse-Session-Token': userSessionToken,
    },
    data,
  }

  let finalData

  await axios(config).then(function (response) {
    if (response.data) {
      finalData = response.data
      console.log('api response')
      console.log(finalData)
    }
  })

  return finalData
}

export async function editAutomationWorkflow(
  data: any,
  userSessionToken: string,
) {
  const config = {
    method: 'put' as 'put',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/automation/functions/editWorkflow`,
    headers: {
      'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      'X-Parse-Session-Token': userSessionToken,
    },
    data,
  }

  let finalData

  await axios(config).then(function (response) {
    if (response.data) {
      finalData = response.data
      console.log('api response')
      console.log(finalData)
    }
  })

  return finalData
}

export async function deleteAutomationWorkflow(
  data: any,
  userSessionToken: string,
) {
  const config = {
    method: 'delete' as 'delete',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/automation/functions/deleteWorkflow`,
    headers: {
      'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      'X-Parse-Session-Token': userSessionToken,
    },
    data,
  }

  let finalData

  await axios(config).then(function (response) {
    if (response.data) {
      finalData = response.data
      console.log('api response')
      console.log(finalData)
    }
  })

  return finalData
}

export async function getAutomationWorkflows(
  data: any,
  userSessionToken: string,
) {
  const config = {
    method: 'post' as 'post',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/automation/functions/getWorkspaceWorkflows`,
    headers: {
      'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      'X-Parse-Session-Token': userSessionToken,
    },
    data,
  }

  let finalData

  await axios(config).then(function (response) {
    if (response.data) {
      finalData = response.data
      console.log('api response')
      console.log(finalData)
    }
  })

  return finalData
}

export async function getAutomationWorkflow(
  data: any,
  userSessionToken: string,
) {
  const config = {
    method: 'post' as 'post',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/automation/functions/getWorkflow`,
    headers: {
      'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      'X-Parse-Session-Token': userSessionToken,
    },
    data,
  }

  let finalData

  await axios(config).then(function (response) {
    if (response.data) {
      finalData = response.data
      console.log('api response')
      console.log(finalData)
    }
  })

  return finalData
}

export async function createWorkflowActionNode(
  data: any,
  userSessionToken: string,
) {
  const config = {
    method: 'post' as 'post',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/automation/functions/createNodeAction`,
    headers: {
      'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      'X-Parse-Session-Token': userSessionToken,
    },
    data,
  }

  let finalData

  await axios(config).then(function (response) {
    if (response.data) {
      finalData = response.data
      console.log('api response')
      console.log(finalData)
    }
  })

  return finalData
}

export async function createWorkflowTrigger(
  data: any,
  userSessionToken: string,
) {
  const config = {
    method: 'post' as 'post',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/automation/functions/createNodeTrigger`,
    headers: {
      'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      'X-Parse-Session-Token': userSessionToken,
    },
    data,
  }

  let finalData

  await axios(config).then(function (response) {
    if (response.data) {
      finalData = response.data
      console.log('api response')
      console.log(finalData)
    }
  })

  return finalData
}

export async function editWorkflowTrigger(data: any, userSessionToken: string) {
  const config = {
    method: 'put' as 'put',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/automation/functions/updateNodeTrigger`,
    headers: {
      'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      'X-Parse-Session-Token': userSessionToken,
    },
    data,
  }

  let finalData

  await axios(config).then(function (response) {
    if (response.data) {
      finalData = response.data
      console.log('api response')
      console.log(finalData)
    }
  })

  return finalData
}

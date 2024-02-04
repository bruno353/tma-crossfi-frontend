/* eslint-disable @typescript-eslint/prefer-as-const */
'use client'
import {
  EmailRecoverPassword,
  RecoverPassword,
  SigninForm,
  SignupForm,
} from '@/types/user'
import axios from 'axios'

export async function getKanbanData(data: any, userSessionToken: string) {
  const config = {
    method: 'post' as 'post',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/kanban/functions/getKanbanData`,
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

export async function updateKanban(data: any, userSessionToken: string) {
  const config = {
    method: 'put' as 'put',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/kanban/functions/updateKanban`,
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

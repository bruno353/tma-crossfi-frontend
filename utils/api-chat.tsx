/* eslint-disable @typescript-eslint/prefer-as-const */
'use client'
import {
  EmailRecoverPassword,
  RecoverPassword,
  SigninForm,
  SignupForm,
} from '@/types/user'
import axios from 'axios'

export async function getUserChannels(userSessionToken: string) {
  const config = {
    method: 'get' as 'get',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/chat/functions/getUserChannels`,
    headers: {
      'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      'X-Parse-Session-Token': userSessionToken,
    },
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

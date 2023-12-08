/* eslint-disable @typescript-eslint/prefer-as-const */
'use client'
import {
  EmailRecoverPassword,
  RecoverPassword,
  SigninForm,
  SignupForm,
} from '@/types/user'
import axios from 'axios'

export async function createUser(data: SignupForm) {
  const config = {
    method: 'post' as 'post',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/user/functions/createUser`,
    headers: {
      'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
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

export async function confirmEmailUser(data: any) {
  const config = {
    method: 'post' as 'post',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/user/functions/confirmEmail`,
    headers: {
      'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
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

export async function emailRecoverPassword(data: EmailRecoverPassword) {
  const config = {
    method: 'post' as 'post',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/user/functions/emailRecoverPassword`,
    headers: {
      'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
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

export async function recoverPassword(data: RecoverPassword) {
  const config = {
    method: 'post' as 'post',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/user/functions/recoverPassword`,
    headers: {
      'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
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

export async function recoverPasswordIdIsValid(data: any) {
  const config = {
    method: 'post' as 'post',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/user/functions/recoverPasswordIdIsValid`,
    headers: {
      'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
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

export async function loginUser(data: SigninForm) {
  const config = {
    method: 'post' as 'post',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/user/functions/login`,
    headers: {
      'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
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

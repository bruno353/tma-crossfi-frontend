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
    method: 'put' as 'put',
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

export async function googleRedirect(url: string) {
  const config = {
    method: 'get' as 'get',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/user/functions/google/redirect${url}`,
    headers: {
      'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
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

export async function getCurrentUser(userSessionToken: string) {
  const config = {
    method: 'get' as 'get',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/user/functions/getCurrentUser`,
    headers: {
      'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      'X-Parse-Session-Token': userSessionToken,
      'Content-Type': 'application/json',
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

export async function createWorkspace(data: any, userSessionToken: string) {
  const config = {
    method: 'post' as 'post',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/workspace/functions/createWorkspace`,
    headers: {
      'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
      'X-Parse-Session-Token': userSessionToken,
      'Content-Type': 'multipart/form-data',
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

export async function getUserWorkspace(userSessionToken: string) {
  const config = {
    method: 'get' as 'get',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/workspace/functions/getUserWorkspaces`,
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

export async function createChannel(data: any, userSessionToken: string) {
  const config = {
    method: 'post' as 'post',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/chat/functions/createChannel`,
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

export async function getWorkspace(data: any, userSessionToken: string) {
  const config = {
    method: 'post' as 'post',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/workspace/functions/getWorkspace`,
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

export async function inviteUserToWorkspace(
  data: any,
  userSessionToken: string,
) {
  const config = {
    method: 'post' as 'post',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/workspace/functions/inviteUserToWorkspace`,
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

export async function acceptInviteUserToWorkspace(
  data: any,
  userSessionToken: string,
) {
  const config = {
    method: 'post' as 'post',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/workspace/functions/acceptInviteUserToWorkspace`,
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

export async function setInviteUserToWorkspaceViewed(
  data: any,
  userSessionToken: string,
) {
  const config = {
    method: 'post' as 'post',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/workspace/functions/setInviteUserToWorkspaceViewed`,
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

export async function setInviteUserToWorkspaceArchived(
  data: any,
  userSessionToken: string,
) {
  const config = {
    method: 'post' as 'post',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/workspace/functions/setInviteUserToWorkspaceArchived`,
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

export async function updateWorkspace(data: any, userSessionToken: string) {
  const config = {
    method: 'put' as 'put',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/workspace/functions/updateWorkspace`,
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

export async function updateWorkspaceLogo(data: any, userSessionToken: string) {
  const config = {
    method: 'put' as 'put',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/workspace/functions/updateWorkspaceLogo`,
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

export async function changeUserWorkspaceRole(
  data: any,
  userSessionToken: string,
) {
  const config = {
    method: 'put' as 'put',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/workspace/functions/changeUserWorkspaceRole`,
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

export async function deleteUserWorkspace(data: any, userSessionToken: string) {
  const config = {
    method: 'delete' as 'delete',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/workspace/functions/deleteUserWorkspace`,
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

export async function deleteMessage(data: any, userSessionToken: string) {
  const config = {
    method: 'delete' as 'delete',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/chat/functions/deleteMessage`,
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

export async function deleteChannel(data: any, userSessionToken: string) {
  const config = {
    method: 'delete' as 'delete',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/chat/functions/deleteChannel`,
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

export async function deleteWorkspace(data: any, userSessionToken: string) {
  const config = {
    method: 'delete' as 'delete',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/workspace/functions/deleteWorkspace`,
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

export async function leaveWorkspace(data: any, userSessionToken: string) {
  const config = {
    method: 'delete' as 'delete',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/workspace/functions/leaveUserWorkspace`,
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

export async function getChannel(data: any, userSessionToken: string) {
  const config = {
    method: 'post' as 'post',
    url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/chat/functions/getChannel`,
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

export interface UserProps {
  firstName: string
  lastName: string
  email: string
  companyName?: string
  foundingYear?: number
  location: string
  website?: string
  personalBlog?: string
  githubLink?: string
  isCompany: boolean
  tags: string[]
  description: string
  password: string
  confirmPassword: string
  profilePictureHash: string
  calendly: string
  sessionToken: string
  createdAt: string
  updatedAt: string
}

export type SignupForm = {
  email: string
  password: string
  googleRecaptchaToken: string
  confirmPassword?: string
  name: string
}

export type SigninForm = {
  email: string
  password: string
}

export type EmailRecoverPassword = {
  email: string
  googleRecaptchaToken: string
}

export type RecoverPassword = {
  newPassword: string
  confirmPassword?: string
  objectId: string
}

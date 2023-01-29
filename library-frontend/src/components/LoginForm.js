import { useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../mutations'
import { useField } from '../hooks'

const LoginForm = ({ show, setToken }) => {
  const usernameInput = useField('text')
  const passwordInput = useField('password')

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {},
  })

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem('library-user-token', token)
    }
  }, [result.data]) // eslint-disable-line

  if (!show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    login({
      variables: {
        username: usernameInput.value,
        password: passwordInput.value,
      },
    })
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          username <input {...usernameInput.bindingAttrs} />
        </div>
        <div>
          password <input {...passwordInput.bindingAttrs} />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )
}

export default LoginForm

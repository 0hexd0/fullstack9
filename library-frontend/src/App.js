import { useEffect, useState } from 'react'
import { useApolloClient } from '@apollo/client'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import SetBirth from './components/SetBirth'
import LoginForm from './components/LoginForm'

const App = () => {
  const client = useApolloClient()
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    if (token) {
      setPage('authors')
    } else {
      setPage('login')
    }
  }, [token])

  const handleLoginOrOut = () => {
    if (token) {
      setToken(null)
      localStorage.clear()
      client.resetStore()
    } else {
      setPage('login')
    }
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('birth')}>set birthyear</button>
          </>
        ) : null}
        <button onClick={handleLoginOrOut}>{token ? 'logout' : 'login'}</button>
      </div>

      <Authors show={page === 'authors'} />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add' && token} />

      <SetBirth show={page === 'birth' && token} />

      <LoginForm
        show={page === 'login' && !token}
        setToken={setToken}
        setError={setErrorMessage}
      />
    </div>
  )
}

export default App

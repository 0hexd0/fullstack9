import { useEffect, useState } from 'react'
import { useApolloClient, useSubscription } from '@apollo/client'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import SetBirth from './components/SetBirth'
import LoginForm from './components/LoginForm'
import Recommend from './components/Recommend'
import { BOOK_ADDED, ALL_BOOKS, updateCachedBook } from './queries'

const App = () => {
  const client = useApolloClient()
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(
    localStorage.getItem('library-user-token') || null
  )

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded
      updateCachedBook(client.cache, { query: ALL_BOOKS }, addedBook)
      window.alert(`a book ${addedBook.title} has been added`)
    },
  })

  useEffect(() => {
    if (token) {
      setPage('authors')
    } else {
      setPage('login')
    }
  }, [token])

  const handleLoginOrOut = () => {
    if (token) {
      setPage('authors')
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
            <button onClick={() => setPage('recommend')}>recommend</button>
          </>
        ) : null}
        <button onClick={handleLoginOrOut}>{token ? 'logout' : 'login'}</button>
      </div>

      <Authors show={page === 'authors'} />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} />

      <SetBirth show={page === 'birth'} />

      <Recommend show={page === 'recommend'} />

      <LoginForm show={page === 'login'} setToken={setToken} />
    </div>
  )
}

export default App

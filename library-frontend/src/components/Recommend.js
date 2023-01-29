import { useLazyQuery } from '@apollo/client'
import { useEffect } from 'react'
import { CURRENT_USER, ALL_BOOKS } from '../queries'
import BookTable from './BookTable'

const Recommend = ({ show }) => {
  const [getUser, userResult] = useLazyQuery(CURRENT_USER)

  const getFavouriteGenre = () =>
    userResult.data && userResult.data.me
      ? userResult.data.me.favouriteGenre
      : undefined

  const [getBooks, bookResult] = useLazyQuery(ALL_BOOKS, {
    variables: {
      genre: getFavouriteGenre(),
    },
  })

  useEffect(() => {
    if (show) {
      getUser()
    }
  }, [show, getUser])

  useEffect(() => {
    if (userResult.data && userResult.data.me) {
      getBooks()
    }
  }, [userResult.data, getBooks])

  if (!show) {
    return null
  }

  if (!userResult.data || !userResult.data.me || !bookResult.data) {
    return <div>loading...</div>
  }

  return (
    <>
      <h2>recommendations</h2>
      <div>
        books in your favorite genre {userResult.data.me.favouriteGenre}
      </div>
      <BookTable books={bookResult.data.allBooks} />
    </>
  )
}

export default Recommend

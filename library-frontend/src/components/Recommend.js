import { useQuery } from '@apollo/client'
import { CURRENT_USER, ALL_BOOKS } from '../queries'
import BookTable from './BookTable'

const Recommend = ({ show }) => {
  const userResult = useQuery(CURRENT_USER)

  const bookResult = useQuery(ALL_BOOKS, {
    variables: {
      genre: userResult.data ? userResult.data.me.favouriteGenre : undefined,
    },
  })

  if (!show) {
    return null
  }

  if (userResult.loading || bookResult.loading) {
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

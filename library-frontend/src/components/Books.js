import { useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { ALL_BOOKS } from '../queries'

const Books = (props) => {
  const [genres, setGenres] = useState([])
  const [currentGenre, setCurrentGenre] = useState('')

  const result = useQuery(ALL_BOOKS, {
    variables: currentGenre
      ? {
          genre: currentGenre,
        }
      : undefined,
  })

  const resultForGenre = useQuery(ALL_BOOKS)

  useEffect(() => {
    if (resultForGenre.data) {
      const books = resultForGenre.data.allBooks
      const genres = books.reduce((prev, cur) => {
        return prev.concat(cur.genres)
      }, [])
      setGenres([...new Set(genres)])
    }
  }, [resultForGenre.data])

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {result.data.allBooks.map((book) => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {genres.map((genre) => (
          <button key={genre} onClick={() => setCurrentGenre(genre)}>
            {genre}
          </button>
        ))}
        <button onClick={() => setCurrentGenre('')}>all genres</button>
      </div>
    </div>
  )
}

export default Books

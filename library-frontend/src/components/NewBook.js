import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { ALL_AUTHORS } from '../queries'
import { CREATE_BOOK } from '../mutations'
import { useField } from '../hooks'

const NewBook = (props) => {
  const titleInput = useField('text')
  const authorInput = useField('text')
  const publishedInput = useField('number')
  const genreInput = useField('text')
  const [genres, setGenres] = useState([])

  const [createBook] = useMutation(CREATE_BOOK, {
    refetchQueries: ['Books', { query: ALL_AUTHORS }],
  })

  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    createBook({
      variables: {
        title: titleInput.value,
        published: Number(publishedInput.value),
        author: authorInput.value,
        genres,
      },
    })
    titleInput.reset()
    publishedInput.reset()
    authorInput.reset()
    setGenres([])
    genreInput.reset()
  }

  const addGenre = () => {
    setGenres(genres.concat(genreInput.value))
    genreInput.reset()
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input {...titleInput.bindingAttrs} />
        </div>
        <div>
          author
          <input {...authorInput.bindingAttrs} />
        </div>
        <div>
          published
          <input {...publishedInput.bindingAttrs} />
        </div>
        <div>
          <input {...genreInput.bindingAttrs} />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook

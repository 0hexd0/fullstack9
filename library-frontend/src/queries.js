import { gql } from '@apollo/client'

export const ALL_AUTHORS = gql`
  query Authors {
    allAuthors {
      name
      born
      bookCount
    }
  }
`
export const ALL_BOOKS = gql`
  query Books($genre: String) {
    allBooks(genre: $genre) {
      title
      genres
      published
      author {
        name
        born
      }
    }
  }
`

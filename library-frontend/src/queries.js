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

export const CURRENT_USER = gql`
  query User {
    me {
      username
      favouriteGenre
    }
  }
`

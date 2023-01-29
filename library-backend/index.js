require('dotenv').config()
const { ApolloServer, UserInputError, gql } = require('apollo-server')
const Book = require('./models/book')
const Author = require('./models/author')
const MONGODB_URI = process.env.MONGODB_URI

const logger = require('./utils/logger')
const mongoose = require('mongoose')

logger.info('connecting to', MONGODB_URI)

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    id: ID!
    bookCount: Int!
  }

  type User {
    username: String!
    favouriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book

    editAuthor(name: String!, setBornTo: Int!): Author

    createUser(username: String!, favouriteGenre: String!): User

    login(username: String!, password: String!): Token
  }
`

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const filter = args.genre ? { genres: { $in: [args.genre] } } : null
      const books = await Book.find(filter).populate('author')
      return books
    },
    allAuthors: async (root, args) => {
      const authors = await Author.find({})
      const books = await Book.find({})
      authors.forEach((author) => {
        author.bookCount = books.filter(
          (book) => book.author.toString() === author.id
        ).length
      })
      return authors
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      const authorName = args.author
      let author = await Author.findOne({ name: authorName })
      if (!author) {
        const newAuthor = new Author({
          name: authorName,
          born: null,
        })
        try {
          author = await newAuthor.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        }
      }
      const book = new Book({ ...args, author: author._id })
      const savedBook = await book.save()
      savedBook.author = author
      return savedBook
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null
      }
      author.born = args.setBornTo
      let updatedAuthor = null
      try {
        updatedAuthor = await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return updatedAuthor
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})

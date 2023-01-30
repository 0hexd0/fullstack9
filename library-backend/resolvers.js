const { ApolloServerErrorCode } = require('@apollo/server/errors')
const { GraphQLError } = require('graphql')
const { JWT_SECRET } = require('./utils/config')
const jwt = require('jsonwebtoken')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
  Query: {
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const filter = args.genre ? { genres: { $in: [args.genre] } } : null
      const books = await Book.find(filter).populate('author')
      return books
    },
    allAuthors: async (root, args) => {
      const authors = await Author.find({})
      return authors
    },
    me: async (root, args, context) => {
      return context.currentUser
    },
  },
  Author: {
    bookCount: async (root, args, { loaders }) => {
      const books = await loaders.bookCountLoader.load(root.id)
      return books.length
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('invalid user', {
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        })
      }
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
          throw new GraphQLError(error.message, {
            extensions: {
              code: ApolloServerErrorCode.BAD_USER_INPUT,
              invalidArgs: args,
            },
          })
        }
      }
      const book = new Book({ ...args, author: author._id })
      const savedBook = await book.save()
      savedBook.author = author
      pubsub.publish('BOOK_ADDED', { bookAdded: savedBook })
      return savedBook
    },
    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('invalid user', {
          extensions: {
            code: 'UNAUTHENTICATED',
          },
        })
      }
      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null
      }
      author.born = args.setBornTo
      let updatedAuthor = null
      try {
        updatedAuthor = await author.save()
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: ApolloServerErrorCode.BAD_USER_INPUT,
            invalidArgs: args,
          },
        })
      }
      return updatedAuthor
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favouriteGenre: args.favouriteGenre,
      })

      return user.save().catch((error) => {
        throw new GraphQLError(error.message, {
          extensions: {
            code: ApolloServerErrorCode.BAD_USER_INPUT,
            invalidArgs: args,
          },
        })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: ApolloServerErrorCode.BAD_USER_INPUT,
          },
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED']),
    },
  },
}

module.exports = resolvers

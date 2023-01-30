const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const {
  ApolloServerPluginDrainHttpServer,
} = require('@apollo/server/plugin/drainHttpServer')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const express = require('express')
const http = require('http')
const cors = require('cors')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const { execute, subscribe } = require('graphql')
const { useServer } = require('graphql-ws/lib/use/ws')
const { WebSocketServer } = require('ws')

const User = require('./models/user')
const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const { MONGODB_URI, JWT_SECRET, PORT } = require('./utils/config')

const logger = require('./utils/logger')
const mongoose = require('mongoose')
mongoose.set('strictQuery', true)

logger.info('connecting to', MONGODB_URI)

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

// setup is now within a function
const start = async () => {
  const app = express()
  const httpServer = http.createServer(app)

  const schema = makeExecutableSchema({ typeDefs, resolvers })

  // create websocket server
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '',
  })

  // Save the returned server's info so we can shut down this server later
  const serverCleanup = useServer(
    {
      schema,
      execute,
      subscribe,
    },
    wsServer
  )

  const server = new ApolloServer({
    schema,
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),

      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              serverCleanup.close()
            },
          }
        },
      },
    ],
  })

  await server.start()

  app.use(
    '/',
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.toLowerCase().startsWith('bearer ')) {
          const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET)
          const currentUser = await User.findById(decodedToken.id)
          return { currentUser }
        }
      },
    })
  )

  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve))
  console.log(`🚀 Server ready at http://localhost:${PORT}`)
}

start()

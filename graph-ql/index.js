const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const mongoose = require('mongoose')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const User = require('./models/users')
const typeDefs = require('./schema')
const resolvers = require('./resolvers')
const cors = require('cors')

const express = require('express')
const http = require('http')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')
const {
    ApolloServerPluginDrainHttpServer,
} = require('@apollo/server/plugin/drainHttpServer')
const { expressMiddleware } = require('@apollo/server/express4')

mongoose.set('strictQuery')

const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to mongoDB')

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to mongoDB: ', error.message)
    })

const start = async () => {
    const app = express()
    const httpServer = http.createServer(app)

    const schema = makeExecutableSchema({ typeDefs, resolvers })

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/',
    })

    const serverCleanup = useServer({ schema }, wsServer)

    const server = new ApolloServer({
        schema,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose()
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
        express.json(),
        expressMiddleware(server, {
            context: async ({ req }) => {
                const auth = req ? req.headers.authorization : null

                if (auth && auth.startsWith('Bearer ')) {
                    const decodedToken = jwt.verify(
                        auth.substring(7),
                        process.env.JWT_SECRET
                    )
                    const currentUser = await User.findById(decodedToken.id)

                    return { currentUser }
                }
            },
        })
    )

    const PORT = 4000

    httpServer.listen(PORT, () => {
        console.log(`Server is now running on http:localhost:${PORT}`)
    })
}

start()

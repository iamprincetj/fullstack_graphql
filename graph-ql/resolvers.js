const Books = require('./models/books')
const Authors = require('./models/authors')
const { GraphQLError } = require('graphql')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const User = require('./models/users')
const { PubSub } = require('graphql-subscriptions')
const pubSub = new PubSub()

const resolvers = {
    Query: {
        bookCount: async () => Books.collection.countDocuments(),
        authorCount: () => Authors.collection.countDocuments(),
        allBooks: async (root, args) => {
            const books = await Books.find({}).populate('author')
            if (args.genre) {
                return books.filter((b) => b.genres.includes(args.genre))
            }
            return books
        },
        allAuthors: async () => {
            const authors = await Authors.find({})
            const books = await Books.find({})

            authors.map(
                (a) =>
                    (a.bookCount = books.filter(
                        (b) => b.author.toString() === a._id.toString()
                    ).length)
            )
            return authors
        },
        me: async (root, args, { currentUser }) => {
            return currentUser
        },
    },
    Mutation: {
        addBook: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new GraphQLError('not authenticated', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                })
            }

            if (args.author.length < 3) {
                throw new GraphQLError('author name less than minimum 3', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args.author,
                    },
                })
            }
            if (args.title.length < 5) {
                throw new GraphQLError('title less than minimum 5', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args.title,
                    },
                })
            }

            const genres = args.genres.map((g) => g.toLowerCase())

            const author = await Authors.findOne({ name: args.author })
            let newBook = author
                ? { ...args, author: author._id, genres: genres }
                : null

            if (!author) {
                const author = new Authors({ name: args.author })
                await author.save()
                newBook = { ...args, author: author._id, genres: genres }
            }

            const book = await new Books({
                ...newBook,
            }).populate('author', { name: 1, bookCount: 1 })

            await book.save()

            pubSub.publish('BOOK_ADDED', { bookAdded: book })

            return book
        },

        editAuthor: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new GraphQLError('not authenticated', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                })
            }
            const author = await Authors.findOne({ name: args.name })
            if (!author) {
                return null
            }

            author.born = args.setBornTo
            return author.save()
        },

        createUser: async (root, args) => {
            const newUser = new User({ ...args })
            const savedUser = await newUser.save()
            return savedUser
        },

        login: async (root, args) => {
            const user = await User.findOne({ username: args.username })

            if (!user || args.password !== 'secret') {
                throw new GraphQLError('wrong credentials', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                })
            }

            const userForToken = {
                id: user._id,
                username: user.username,
            }

            return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
        },
    },

    Subscription: {
        bookAdded: {
            subscribe: () => {
                return pubSub.asyncIterator('BOOK_ADDED')
            },
        },
    },
}
module.exports = resolvers

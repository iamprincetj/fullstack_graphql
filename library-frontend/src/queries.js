import { gql } from '@apollo/client'

const BOOK_DETAIL = gql`
    fragment BookDetails on Book {
        title
        published
        id
        genres
        author {
            name
            born
            id
        }
    }
`

//QUERIES

export const ALL_AUTHORS = gql`
    query {
        allAuthors {
            name
            born
            id
            bookCount
        }
    }
`

export const ALL_BOOKS = gql`
    query Query($genre: String) {
        allBooks(genre: $genre) {
            ...BookDetails
        }
    }

    ${BOOK_DETAIL}
`

export const CURRENT_USER = gql`
    query {
        me {
            username
            id
            favoriteGenre
        }
    }
`

// MUTATIONS

export const ADD_NEW_BOOKS = gql`
    mutation addBooks(
        $title: String!
        $author: String!
        $published: Int!
        $genres: [String!]!
    ) {
        addBook(
            title: $title
            author: $author
            published: $published
            genres: $genres
        ) {
            ...BookDetails
        }
    }

    ${BOOK_DETAIL}
`

export const UPDATE_BORN = gql`
    mutation changeBorn($name: String!, $setBornTo: Int!) {
        editAuthor(name: $name, setBornTo: $setBornTo) {
            name
            born
            id
        }
    }
`

export const LOGIN_USER = gql`
    mutation login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            value
        }
    }
`

// SUBSCRIPTION

export const ADDED_BOOK = gql`
    subscription {
        bookAdded {
            ...BookDetails
        }
    }

    ${BOOK_DETAIL}
`

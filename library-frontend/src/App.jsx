import { useEffect, useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { Link, Route, Routes } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import { useApolloClient, useQuery, useSubscription } from '@apollo/client'
import Recommend from './components/Recommend'
import { ADDED_BOOK, ALL_BOOKS } from './queries'
import { updateCache } from './helper_function'

const App = () => {
    const [token, setToken] = useState(null)
    const [notification, setNotification] = useState('')
    const [status, setStatus] = useState('')
    const result = useQuery(ALL_BOOKS)

    const padding = {
        padding: 5,
        color: 'blue',
    }
    const userClient = useApolloClient()

    useEffect(() => {
        const storedToken = window.localStorage.getItem('currentUserToken')
        if (storedToken) {
            setToken(storedToken)
        }
    }, [])

    useSubscription(ADDED_BOOK, {
        onData: ({ data, client }) => {
            const newBook = data.data.bookAdded
            window.alert(`${newBook.title} added`)

            updateCache(client.cache, { query: ALL_BOOKS }, newBook)
        },
    })

    if (result.loading) {
        return null
    }

    const books = result.data.allBooks

    let genres = []
    books.map((b) =>
        b.genres.forEach((val) => {
            if (!genres.includes(val)) {
                genres = [...genres, val]
            }
        })
    )
    const notify = (message, status) => {
        setNotification(message)
        setStatus(status)
        setTimeout(() => {
            setNotification('')
        }, 5000)
    }

    const color = {
        color: status === 'error' ? 'red' : 'green',
    }

    if (!token) {
        return (
            <div>
                <div style={color}> {notification && notification} </div>
                <div style={{ marginBottom: 20 }}>
                    <Link style={padding} to="/">
                        <button>Authors</button>
                    </Link>
                    <Link style={padding} to="/books">
                        <button>Books</button>
                    </Link>
                    <Link style={padding} to="/login">
                        <button>login</button>
                    </Link>
                </div>

                <Routes>
                    <Route path="/" element={<Authors />} />
                    <Route
                        path="/books"
                        element={<Books genres={genres} books={books} />}
                    />
                    <Route
                        path="/login"
                        element={
                            <LoginForm
                                setToken={setToken}
                                setNotification={notify}
                            />
                        }
                    />
                </Routes>
            </div>
        )
    }

    const logout = () => {
        setToken(null)
        window.localStorage.clear()
        userClient.resetStore()
    }

    return (
        <div>
            <div> {notification && notification} </div>
            <div style={{ marginBottom: 20 }}>
                <Link style={padding} to="/">
                    <button>Authors</button>
                </Link>
                <Link style={padding} to="/books">
                    <button>Books</button>
                </Link>
                <Link style={padding} to="/add-books">
                    <button>add books</button>
                </Link>
                <Link style={padding} to="/recommendations">
                    <button>recommend</button>
                </Link>
                <Link to="/login" style={padding} onClick={logout}>
                    <button>logout</button>
                </Link>
            </div>
            <Routes>
                <Route
                    path="/"
                    element={<Authors setNotification={notify} />}
                />

                <Route
                    path="/books"
                    element={<Books books={books} genres={genres} />}
                />

                <Route
                    path="/add-books"
                    element={<NewBook setNotification={notify} />}
                />

                <Route path="/recommendations" element={<Recommend />} />
            </Routes>
        </div>
    )
}

export default App

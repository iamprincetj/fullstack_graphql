import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { ADD_NEW_BOOKS, ALL_AUTHORS, ALL_BOOKS } from '../queries'
import { useNavigate } from 'react-router-dom'
import { updateCache } from '../helper_function'

const NewBook = ({ setNotification }) => {
    const [title, setTitle] = useState('')
    const [author, setAuthor] = useState('')
    let [published, setPublished] = useState('')
    const [genre, setGenre] = useState('')
    const [genres, setGenres] = useState([])
    const navigate = useNavigate()

    const [createBooks, result] = useMutation(ADD_NEW_BOOKS, {
        onError: (error) => {
            setNotification(error.message, 'error')
        },
        update: (cache, response) => {
            updateCache(cache, { query: ALL_BOOKS }, response.data.addBook)
        },
        refetchQueries: [{ query: ALL_AUTHORS }],
    })

    useEffect(() => {
        if (result.data) {
            setNotification('successfully created', 'success')
            navigate('/books')
        }
    }, [navigate, result.data, setNotification])

    const submit = async (event) => {
        event.preventDefault()

        published = Number(published)

        createBooks({
            variables: {
                title,
                author,
                published,
                genres: genres.length > 0 ? genres : null,
            },
        })

        setTitle('')
        setPublished('')
        setAuthor('')
        setGenres([])
        setGenre('')
    }

    const addGenre = () => {
        setGenres(genres.concat(genre))
        setGenre('')
    }

    return (
        <div style={{ marginTop: 10 }}>
            <form onSubmit={submit}>
                <div>
                    title
                    <input
                        value={title}
                        onChange={({ target }) => setTitle(target.value)}
                    />
                </div>
                <div>
                    author
                    <input
                        value={author}
                        onChange={({ target }) => setAuthor(target.value)}
                    />
                </div>
                <div>
                    published
                    <input
                        type="number"
                        value={published}
                        onChange={({ target }) => setPublished(target.value)}
                    />
                </div>
                <div>
                    <input
                        value={genre}
                        onChange={({ target }) => setGenre(target.value)}
                    />
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

import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'
import { useState } from 'react'

const Books = ({ genres, books }) => {
    const [genre, setGenre] = useState(null)
    const result = useQuery(ALL_BOOKS, {
        variables: { genre: genre },
    })

    if (result.loading) {
        return <div>loading...</div>
    }

    const showedBooks = genre ? result.data.allBooks : books
    return (
        <div>
            <h2>books</h2>

            <p> in genre {genre ? genre : 'all genre'} </p>

            <table>
                <tbody>
                    <tr>
                        <th></th>
                        <th>author</th>
                        <th>published</th>
                    </tr>
                    {showedBooks.map((a) => (
                        <tr key={a.title}>
                            <td>{a.title}</td>
                            <td>{a.author.name}</td>
                            <td>{a.published}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {genres.map((g, idx) => (
                <button key={idx} onClick={() => setGenre(g.toLowerCase())}>
                    {g.toLowerCase()}
                </button>
            ))}
            <button onClick={() => setGenre(null)}>all genre</button>
        </div>
    )
}

export default Books

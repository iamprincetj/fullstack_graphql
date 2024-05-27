import { useQuery } from '@apollo/client'
import { ALL_BOOKS, CURRENT_USER } from '../queries'
import { useState } from 'react'

const Recommend = () => {
    const [givenGenre, setGivenGenre] = useState('')
    const allGenre = useQuery(ALL_BOOKS)
    const resultGenre = useQuery(ALL_BOOKS, {
        variables: { genre: givenGenre.toLowerCase() },
        skip: !givenGenre,
    })

    const resultUser = useQuery(CURRENT_USER, {
        onCompleted: (data) => {
            setGivenGenre(data.me.favoriteGenre)
        },
    })

    if (resultUser.loading) {
        return null
    }

    if (resultGenre.loading || allGenre.loading) {
        return <div>loading...</div>
    }

    const books = resultGenre.data ? resultGenre.data.allBooks : null

    if (!books) {
        return <div> No books with your given favorite genre </div>
    }
    return (
        <div>
            <h2>recommendations</h2>
            <p>books in your favorite genre ` {givenGenre.toLowerCase()} `</p>
            <table>
                <tbody>
                    <tr>
                        <th></th>
                        <th>author</th>
                        <th>published</th>
                    </tr>
                    {books.map((b) => (
                        <tr key={b.id}>
                            <td>{b.title}</td>
                            <td>{b.author.name}</td>
                            <td>{b.published}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Recommend

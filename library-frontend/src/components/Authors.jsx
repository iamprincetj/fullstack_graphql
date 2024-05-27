import { useMutation, useQuery } from '@apollo/client'
import { ALL_AUTHORS, UPDATE_BORN } from '../queries'
import { useState } from 'react'

const Authors = ({ setNotification }) => {
    const result = useQuery(ALL_AUTHORS)
    const [name, setName] = useState('')
    const [born, setBorn] = useState('')
    const token = window.localStorage.getItem('currentUserToken')

    const [updateBorn] = useMutation(UPDATE_BORN, {
        onError: (error) => {
            setNotification(error.message, 'error')
        },
    })

    if (result.loading) {
        return <div>loading...</div>
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        const setBornTo = Number(born)
        updateBorn({ variables: { name, setBornTo } })
        setName('')
        setBorn('')
    }

    const authors = result.data.allAuthors

    return (
        <div>
            <h2>authors</h2>
            <table>
                <tbody>
                    <tr>
                        <th></th>
                        <th>born</th>
                        <th>books</th>
                    </tr>
                    {authors.map((a) => (
                        <tr key={a.name}>
                            <td>{a.name}</td>
                            <td>{a.born}</td>
                            <td>{a.bookCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {token && (
                <div>
                    <h2>Set birthyear</h2>
                    <form onSubmit={handleSubmit}>
                        <div>
                            name{' '}
                            <select
                                value={name}
                                onChange={({ target }) => setName(target.value)}
                            >
                                <option> </option>
                                {authors.map((a) => (
                                    <option key={a.name}>{a.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            born{' '}
                            <input
                                value={born}
                                onChange={({ target }) => setBorn(target.value)}
                            />
                        </div>
                        <button type="submit">update author</button>
                    </form>
                </div>
            )}
        </div>
    )
}

export default Authors

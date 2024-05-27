import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { LOGIN_USER } from '../queries'
import { useNavigate } from 'react-router-dom'

const LoginForm = ({ setToken, setNotification }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const [loginUser, result] = useMutation(LOGIN_USER, {
        onError: (error) => {
            setNotification(error.message, 'error')
        },
        fetchPolicy: 'network-only',
    })

    useEffect(() => {
        if (result.data) {
            const token = result.data.login.value
            setToken(token)
            window.localStorage.setItem('currentUserToken', token)
            navigate('/')
            setNotification('login successfully', 'success')
        }
    }, [result.data])

    const handleSubmit = (event) => {
        event.preventDefault()

        loginUser({ variables: { username, password } })
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    username{' '}
                    <input
                        type="text"
                        value={username}
                        onChange={({ target }) => setUsername(target.value)}
                    />
                </div>
                <div>
                    password{' '}
                    <input
                        type="password"
                        value={password}
                        onChange={({ target }) => setPassword(target.value)}
                    />
                </div>
                <button type="submit">login</button>
            </form>
        </div>
    )
}

export default LoginForm

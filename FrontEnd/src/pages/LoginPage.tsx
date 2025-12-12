import { useState } from 'react';
import { TextInput, PasswordInput, Button, Paper, Title, Container, Text } from '@mantine/core';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });

            // Guardar token (en LocalStorage para MVP, Cookies es mejor para Prod)
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            alert('Login Exitoso: ' + response.data.user.email);
            navigate('/dashboard'); // Redirigir (aún no creamos dashboard)

        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        }
    };

    return (
        <Container size={420} my={40}>
            <Title>Bienvenido</Title>
            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <form onSubmit={handleLogin}>
                    <TextInput
                        label="Email"
                        placeholder="tu@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.currentTarget.value)}
                    />
                    <PasswordInput
                        label="Contraseña"
                        placeholder="Tu contraseña secreta"
                        required
                        mt="md"
                        value={password}
                        onChange={(e) => setPassword(e.currentTarget.value)}
                    />

                    {error && <Text color="red" size="sm" mt="sm">{error}</Text>}

                    <Button fullWidth mt="xl" type="submit">
                        Iniciar Sesión
                    </Button>
                </form>
            </Paper>
        </Container>
    );
}
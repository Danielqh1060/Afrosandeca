import { useEffect, useState } from 'react';
import { 
  AppShell, 
  Header, 
  Text, 
  Container, 
  Button, 
  Card, 
  Group, 
  Badge, 
  Title, 
  Modal, 
  TextInput, 
  Textarea, 
  MultiSelect,
  Loader
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { postsApi } from '../api/posts';
import { Post } from '../types';

export function DashboardPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Estado del formulario
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // Datos del usuario (Logout simple)
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await postsApi.getAll();
      setPosts(data);
    } catch (error) {
      console.error("Error cargando posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    try {
      // Hardcodeamos sectionIds por ahora [1] (Noticias) para probar rápido
      // Tarea pendiente: Hacer endpoint GET /sections y llenar un select real
      await postsApi.create({ title, content, sectionIds: [1] });
      
      setModalOpen(false);
      setTitle('');
      setContent('');
      fetchPosts(); // Recargar lista
    } catch (error) {
      alert('Error creando post');
    }
  };

  return (
    <AppShell
      padding="md"
      header={
        <Header height={60} p="xs">
          <Group position="apart">
            <Text weight={700}>Afrosandeca Forum</Text>
            <Button variant="light" color="red" onClick={handleLogout}>Salir</Button>
          </Group>
        </Header>
      }
    >
      <Container size="md">
        <Group position="apart" mb="xl">
          <Title order={2}>Últimas Publicaciones</Title>
          <Button onClick={() => setModalOpen(true)}>+ Nuevo Post</Button>
        </Group>

        {loading ? (
          <Loader />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {posts.map((post) => (
              <Card key={post.id} shadow="sm" p="lg" radius="md" withBorder>
                <Group position="apart" mt="md" mb="xs">
                  <Text weight={500}>{post.title}</Text>
                  <Badge color="blue" variant="light">
                    {post.sections.map(s => s.name).join(', ')}
                  </Badge>
                </Group>

                <Text size="sm" color="dimmed" mb="md">
                  Por: {post.author.fullName} | {new Date(post.createdAt).toLocaleDateString()}
                </Text>

                <Text size="sm">
                  {post.content}
                </Text>
              </Card>
            ))}
          </div>
        )}
      </Container>

      {/* Modal de Creación */}
      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Crear Publicación">
        <TextInput 
          label="Título" 
          placeholder="¿Qué está pasando?" 
          mb="sm"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
        />
        <Textarea 
          label="Contenido" 
          placeholder="Escribe aquí..." 
          minRows={4}
          mb="md"
          value={content}
          onChange={(e) => setContent(e.currentTarget.value)}
        />
        {/* Aquí falta el Select de Secciones real, usamos hardcode [1] */}
        <Button fullWidth onClick={handleCreatePost}>Publicar</Button>
      </Modal>

    </AppShell>
  );
}
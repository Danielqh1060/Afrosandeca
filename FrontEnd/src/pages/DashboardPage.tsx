import { useEffect, useState } from 'react';
import {
  AppShell,
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
  Loader,
  FileInput,
  Image,
  Divider,
  Box,
  ActionIcon
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { postsApi } from '../api/posts';
import type { Post } from '../types';
import { IconHeart, IconTrash, IconHeartFilled } from '@tabler/icons-react';
import { HeaderContent } from '../components/Header';
import { CommentItem } from '../components/CommentItem';

export function DashboardPage() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);


  // Estados del formulario
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);

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
    if (!title || !content) return alert("Faltan datos");

    try {
      let uploadedUrl = null;
      // Subir imagen si existe
      if (file) {
        uploadedUrl = await postsApi.uploadImage(file);
      }
      // El backend nos devuelve el post creado
      const newPost = await postsApi.create({
        title,
        content,
        sectionIds: [1],
        imageUrls: uploadedUrl ? [uploadedUrl] : []
      });
      // ACTUALIZACIÓN LOCAL: Lo pegamos al principio de la lista actual
      setPosts(prev => [newPost, ...prev]);
      // Limpiar formulario
      setModalOpen(false);
      setTitle('');
      setContent('');
      setFile(null);
    } catch (error) {
      console.error(error);
      alert('Error creando post');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('¿Borrar este post?')) return;

    // UI Optimista: Lo borramos visualmente INMEDIATAMENTE
    setPosts(prev => prev.filter(p => p.id !== postId));

    try {
      await postsApi.deletePost(postId);
    } catch (error) {
      alert("Error al borrar");
      fetchPosts(); // Solo si falla, recargamos para corregir
    }
  };

  const handleToggleLike = async (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const myId = currentUser.id || currentUser.userId;
        const hasLiked = post.reactions.some(r => r.userId === myId);

        const newReactions = hasLiked
          ? post.reactions.filter(r => r.userId !== myId)
          : [
            ...post.reactions,
            {
              id: 'temp-id',
              userId: myId,
              createdAt: new Date().toISOString(),
              type: 'LIKE'
            }
          ];

        // TypeScript necesita saber que esto sigue siendo un Post válido
        return { ...post, reactions: newReactions } as Post;
      }
      return post;
    }));
    try {
      await postsApi.toggleLike(postId);
    } catch (error) {
      console.error("Error like", error);
      fetchPosts();
    }
  };

  const handleAddComment = async (postId: string, content: string, parentId?: string) => {
    if (!content.trim()) return;

    try {
      // 1. Llamada a la API
      const newComment = await postsApi.addComment(postId, content, parentId);

      // 2. BLINDAJE ANTI-CRASH:
      // Si el backend no devuelve el autor populado, lo rellenamos nosotros temporalmente
      // para que React no explote con "Cannot read property fullName of undefined"
      const commentSafe = {
        ...newComment,
        author: newComment.author || {
          id: currentUser.id || currentUser.userId,
          fullName: currentUser.fullName || 'Yo',
          role: currentUser.role
        },
        reactions: [],
        _count: { reactions: 0 }
      };

      // 3. Actualización Optimista
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          // Si post.comments es undefined (a veces pasa en arrays vacíos), lo iniciamos
          const currentComments = post.comments || [];
          return { ...post, comments: [...currentComments, commentSafe] };
        }
        return post;
      }));

    } catch (error) {
      console.error("Error al comentar:", error);
      alert("No se pudo enviar el comentario.");
    }
  };

  const handleToggleCommentLike = async (commentId: string) => {
    // Actualización Optimista
    setPosts(prev => prev.map(post => {
      // Buscamos si el comentario está en este post
      const commentIndex = post.comments?.findIndex(c => c.id === commentId);

      if (commentIndex !== undefined && commentIndex !== -1) {
        const updatedComments = [...post.comments];
        const targetComment = updatedComments[commentIndex];

        const myId = currentUser.id || currentUser.userId;
        const hasLiked = targetComment.reactions.some(r => r.userId === myId);

        let newReactions;
        if (hasLiked) {
          // Quitar Like
          newReactions = targetComment.reactions.filter(r => r.userId !== myId);
        } else {
          // Poner Like (Mockeado para TS)
          newReactions = [...targetComment.reactions, { userId: myId, id: 'temp', createdAt: new Date().toISOString() } as any];
        }

        updatedComments[commentIndex] = {
          ...targetComment,
          reactions: newReactions,
          _count: { reactions: newReactions.length } // Actualizamos contador visual también
        };

        return { ...post, comments: updatedComments };
      }
      return post;
    }));

    try {
      await postsApi.toggleCommentLike(commentId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('¿Borrar comentario?')) return;

    // 1. Borrado Visual Inmediato
    setPosts(prev => prev.map(post => {
      // Verificamos si este post tiene el comentario a borrar
      if (post.comments?.some(c => c.id === commentId)) {
        return {
          ...post,
          comments: post.comments.filter(c => c.id !== commentId) // Adiós comentario
        };
      }
      return post;
    }));

    // 2. Llamada API
    try {
      await postsApi.deleteComment(commentId);
    } catch (error) {
      alert("Error al borrar");
      fetchPosts(); // Solo recargamos si falló
    }
  };

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      {/* HEADER */}
      <AppShell.Header>
        <Container size="md" h="100%">
          <HeaderContent />
        </Container>
      </AppShell.Header>

      {/* MAIN CONTENT */}
      <AppShell.Main bg="gray.0">
        <Container size="sm" py="xl">
          <Group justify="space-between" mb="xl">
            <Title order={2}>Últimas Publicaciones</Title>

            <Button onClick={() => {
              const token = localStorage.getItem('token');
              if (token) {
                setModalOpen(true); // Si hay token, abre el modal
              } else {
                navigate('/login'); // Si no, manda a loguearse
              }
            }}>
              + Nuevo Post
            </Button>
          </Group>

          {loading ? (
            <Loader />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {posts.map((post) => (
                <Card
                  key={post.id}
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  mb="lg"
                  style={{ overflow: 'visible' }}
                >
                  <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={500}>{post.title}</Text>
                    <Badge color="blue" variant="light">
                      {post.sections.map(s => s.name).join(', ')}
                    </Badge>
                  </Group>

                  <Text size="sm" c="dimmed" mb="md">
                    Por: {post.author.fullName} | {new Date(post.createdAt).toLocaleDateString()}
                  </Text>

                  <Text size="sm" mb="md">
                    {post.content}
                  </Text>

                  {/* Imagen del Post */}
                  {post.attachments && post.attachments.length > 0 && (
                    <Card.Section mt="sm">
                      <Image
                        src={post.attachments[0].url}
                        w="100%"
                        fit="contain" // Muestra la foto entera, sin recortar
                        radius="md" // Bordes redondeados suaves
                        style={{
                          maxHeight: '500px', // Límite para que no ocupe toda la pantalla
                          backgroundColor: '#f8f9fa' // Fondo gris muy sutil para rellenar espacios
                        }}
                        alt={post.title}
                      />
                    </Card.Section>
                  )}

                  {/* BARRA DE ACCIONES */}
                  <Group mt="md" mb="xs">
                    {/* Botón de Like */}
                    <Group gap={5}>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleToggleLike(post.id)}
                      >
                        {post.reactions?.some(r => r.userId === currentUser.userId) ? ( // OJO: Asegúrate que currentUser tenga userId o id
                          <IconHeartFilled size={20} />
                        ) : (
                          <IconHeart size={20} />
                        )}
                      </ActionIcon>
                      <Text size="sm" c="dimmed">{post.reactions?.length || 0}</Text>
                    </Group>

                    {/* 1. Definir permisos para este post específico */}
                    {(() => {
                      // Aseguramos que currentUser tenga datos, si no, objeto vacío
                      const user = currentUser || {};

                      // Validamos propiedad 'id' (lo estándar en Prisma) o 'userId' (por si acaso)
                      const myId = user.id || user.userId;

                      // Condición: Soy el dueño O soy Admin/SuperAdmin
                      const isOwner = post.author.id === myId;
                      const isAdmin = user.role === 'ADMIN' || user.role === 'SUPERADMIN';
                      const canDelete = isOwner || isAdmin;

                      return (
                        canDelete && (
                          <ActionIcon
                            color="gray"
                            variant="subtle"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        )
                      );
                    })()}
                  </Group>

                  <Divider my="sm" />
                  {/* Lista de Comentarios */}
                  <Box mb="md">
                    <Text size="sm" fw={700} mb="xs">Comentarios</Text>

                    {/* Filtramos solo los comentarios raíz (sin padre) para empezar el árbol */}
                    {post.comments?.filter(c => !c.parentId).map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        allComments={post.comments} // Pasamos TODOS los del post
                        currentUser={JSON.parse(localStorage.getItem('user') || '{}')} // Asegúrate de leerlo bien

                        onDelete={(id) => handleDeleteComment(id)} // Usa la nueva función sin recarga

                        onReply={(content, parentId) => handleAddComment(post.id, content, parentId)} // Reusa la lógica blindada

                        onLike={(id) => handleToggleCommentLike(id)} // Usa la lógica anidada
                      />
                    ))}

                    {post.comments?.length === 0 && <Text size="xs" c="dimmed">Sin comentarios.</Text>}
                  </Box>

                  {/* Input principal (Comentario Raíz) */}
                  <Group>
                    <TextInput
                      placeholder="Escribe un comentario..."
                      style={{ flex: 1 }}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          const target = e.currentTarget;
                          await handleAddComment(post.id, target.value);
                          target.value = '';
                        }
                      }}
                    />
                  </Group>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </AppShell.Main>

      {/* MODAL (Fuera del Main) */}
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
        <FileInput
          label="Adjuntar imagen"
          placeholder="Selecciona una foto"
          accept="image/png,image/jpeg"
          mb="md"
          value={file}
          onChange={setFile}
        />
        <Button fullWidth onClick={handleCreatePost}>Publicar</Button>
      </Modal>

    </AppShell>
  );
};
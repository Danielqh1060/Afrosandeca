import { useState } from 'react';
import { Group, Text, ActionIcon, Avatar, Box, TextInput, Button } from '@mantine/core';
import { IconHeart, IconHeartFilled, IconTrash, IconMessageCircle } from '@tabler/icons-react';
import type { Comment } from '../types';

interface CommentItemProps {
  comment: Comment;
  allComments: Comment[]; // Pasamos todos para buscar los hijos
  currentUser: any;
  onDelete: (id: string) => void;
  onReply: (content: string, parentId: string) => void;
  onLike: (id: string) => void;
  depth?: number; // Para indentación
}

export function CommentItem({ comment, allComments, currentUser, onDelete, onReply, onLike, depth = 0 }: CommentItemProps) {
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  // Buscamos los hijos de este comentario (Recursividad Manual)
  const children = allComments.filter(c => c.parentId === comment.id);

  // Permisos
  const isOwner = currentUser?.id === comment.author.id;
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERADMIN';
  const hasLiked = comment.reactions.some(r => r.userId === currentUser?.id);

  // Límite de anidación visual para que no se rompa el diseño
  const indentation = depth * 20; 

  return (
    <Box mt="xs">
      <Group align="flex-start" wrap="nowrap" style={{ marginLeft: indentation }}>
        <Avatar size="sm" radius="xl" color="blue">
          {comment.author.fullName[0]}
        </Avatar>
        
        <Box style={{ flex: 1 }}>
          {/* Cabecera del Comentario */}
          <Group justify="space-between">
            <Text size="sm" fw={700}>{comment.author.fullName}</Text>
            <Text size="xs" c="dimmed">{new Date(comment.createdAt).toLocaleDateString()}</Text>
          </Group>

          {/* Contenido */}
          <Text size="sm">{comment.content}</Text>

          {/* Acciones: Like, Reply, Delete */}
          <Group gap="xs" mt={4}>
            {/* LIKE */}
            <ActionIcon variant="transparent" size="sm" onClick={() => onLike(comment.id)}>
              {hasLiked ? <IconHeartFilled size={14} color="red" /> : <IconHeart size={14} />}
            </ActionIcon>
            <Text size="xs" c="dimmed">{comment._count?.reactions || comment.reactions.length || 0}</Text>

            {/* REPLY */}
            <ActionIcon variant="transparent" size="sm" onClick={() => setReplying(!replying)}>
              <IconMessageCircle size={14} />
            </ActionIcon>
            
            {/* DELETE */}
            {(isOwner || isAdmin) && (
              <ActionIcon variant="transparent" size="sm" color="red" onClick={() => onDelete(comment.id)}>
                <IconTrash size={14} />
              </ActionIcon>
            )}
          </Group>

          {/* Formulario de Respuesta */}
          {replying && (
            <Group mt="xs">
              <TextInput 
                placeholder="Escribe tu respuesta..." 
                size="xs" 
                style={{ flex: 1 }}
                value={replyContent}
                onChange={(e) => setReplyContent(e.currentTarget.value)}
              />
              <Button 
                size="xs" 
                onClick={() => {
                  onReply(replyContent, comment.id);
                  setReplying(false);
                  setReplyContent('');
                }}
              >
                Responder
              </Button>
            </Group>
          )}
        </Box>
      </Group>

      {/* RENDERIZAR HIJOS (RECURSIVIDAD) */}
      {children.map(child => (
        <CommentItem 
          key={child.id} 
          comment={child} 
          allComments={allComments} // Pasamos la lista completa hacia abajo
          currentUser={currentUser}
          onDelete={onDelete}
          onReply={onReply}
          onLike={onLike}
          depth={depth + 1}
        />
      ))}
    </Box>
  );
}
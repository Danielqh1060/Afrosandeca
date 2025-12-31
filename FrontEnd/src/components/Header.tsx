import { Group, Button, Text, Avatar, Menu, UnstyledButton, rem } from '@mantine/core';
import { IconLogout, IconSettings, IconChevronDown } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export function HeaderContent() {
  const navigate = useNavigate();
  // Leemos usuario del storage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <Group justify="space-between" h="100%">
      <Text fw={900} size="lg" c="blue">Afrosandeca</Text>

      {user ? (
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <UnstyledButton>
              <Group gap={7}>
                <Avatar src={null} alt={user.fullName} radius="xl" color="blue">
                  {user.fullName.charAt(0).toUpperCase()}
                </Avatar>
                <div style={{ flex: 1 }}>
                  <Text size="sm" fw={500}>{user.fullName}</Text>
                  <Text size="xs" c="dimmed">{user.role}</Text>
                </div>
                <IconChevronDown style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
              </Group>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item leftSection={<IconSettings size={14} />}>Mi Perfil</Menu.Item>
            <Menu.Divider />
            <Menu.Item 
              color="red" 
              leftSection={<IconLogout size={14} />}
              onClick={handleLogout}
            >
              Cerrar Sesión
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ) : (
        <Button onClick={() => navigate('/login')}>Iniciar Sesión</Button>
      )}
    </Group>
  );
}
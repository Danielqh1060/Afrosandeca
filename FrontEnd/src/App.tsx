import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  return (
    <MantineProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. La raíz AHORA es el Dashboard (Público) */}
          <Route path="/" element={<DashboardPage />} />
          
          {/* 2. Login explícito */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* 3. Si alguien intenta ir a /dashboard, lo mandamos a la raíz para no duplicar */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          
          {/* 4. Cualquier ruta desconocida -> Raíz */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
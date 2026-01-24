import { RouterProvider } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './routes';
import { InitDemo } from './components/InitDemo';

export default function App() {
  return (
    <AuthProvider>
      <InitDemo />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
import Home from './pages/Home';
import Login from './pages/Login';
import FarmerUpload from './pages/FarmerUpload';
import ClassificationResult from './pages/ClassificationResult';
import CreateProduct from './pages/CreateProduct';
import Marketplace from './pages/Marketplace';
import ProductDetails from './pages/ProductDetails';
import AdminDashboard from './pages/AdminDashboard';
import Feedback from './pages/Feedback';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <Home />
  },
  {
    name: 'Login',
    path: '/login',
    element: <Login />,
    visible: false
  },
  {
    name: 'Farmer Upload',
    path: '/farmer/upload',
    element: <FarmerUpload />,
    visible: false
  },
  {
    name: 'Classification Result',
    path: '/farmer/classification-result',
    element: <ClassificationResult />,
    visible: false
  },
  {
    name: 'Create Product',
    path: '/farmer/create-product',
    element: <CreateProduct />,
    visible: false
  },
  {
    name: 'Marketplace',
    path: '/marketplace',
    element: <Marketplace />
  },
  {
    name: 'Product Details',
    path: '/product/:id',
    element: <ProductDetails />,
    visible: false
  },
  {
    name: 'Admin Dashboard',
    path: '/admin',
    element: <AdminDashboard />,
    visible: false
  },
  {
    name: 'Feedback',
    path: '/feedback',
    element: <Feedback />
  }
];

export default routes;
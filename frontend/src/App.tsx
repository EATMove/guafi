import { ConnectButton } from '@mysten/dapp-kit';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RumorList from './pages/RumorList';
import CreateRumor from './pages/CreateRumor';
import RumorDetail from './pages/RumorDetail';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
        <nav className="bg-white shadow p-4 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">GuaFi 🍉</Link>
            <div className="flex items-center space-x-4">
              <Link to="/" className="hover:text-blue-500">Home</Link>
              <Link to="/profile" className="hover:text-blue-500">Profile</Link>
              <ConnectButton />
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto mt-6">
          <Routes>
            <Route path="/" element={<RumorList />} />
            <Route path="/create" element={<CreateRumor />} />
            <Route path="/rumor/:id" element={<RumorDetail />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

import { ConnectButton } from '@mysten/dapp-kit';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RumorList from './pages/RumorList';
import CreateRumor from './pages/CreateRumor';
import RumorDetail from './pages/RumorDetail';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-pop-yellow/10">
        <nav className="sticky top-4 z-50 px-4 mb-8">
          <div className="max-w-4xl mx-auto bg-white border-4 border-pop-black shadow-hard-lg rounded-xl p-4 flex justify-between items-center relative overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#1A1A1A 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
            </div>

            <Link to="/" className="relative z-10 group flex items-center gap-2">
              <div className="bg-pop-pink border-2 border-pop-black p-2 rounded-lg shadow-hard group-hover:translate-y-1 group-hover:shadow-none transition-all">
                <span className="text-2xl block">🍉</span>
              </div>
              <span className="text-3xl font-black text-pop-black tracking-tight group-hover:text-pop-blue transition-colors">
                GuaFi
              </span>
            </Link>

            <div className="relative z-10 flex items-center gap-6">
              <div className="flex gap-2">
                <Link to="/" className="px-4 py-2 font-bold text-pop-black hover:bg-pop-yellow hover:border-2 hover:border-pop-black hover:shadow-hard rounded-lg transition-all border-2 border-transparent">
                  Home
                </Link>
                <Link to="/profile" className="px-4 py-2 font-bold text-pop-black hover:bg-pop-green hover:border-2 hover:border-pop-black hover:shadow-hard rounded-lg transition-all border-2 border-transparent">
                  Profile
                </Link>
              </div>

              <div className="h-8 w-0.5 bg-pop-black/20 rounded-full"></div>

              <div className="border-2 border-pop-black shadow-hard hover:shadow-none hover:translate-y-1 transition-all bg-pop-blue rounded-lg overflow-hidden">
                <div className="[&>button]:bg-pop-blue [&>button]:text-white [&>button]:font-bold [&>button]:px-4 [&>button]:py-2 [&>button]:border-none">
                  <ConnectButton />
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Background Assets */}
        <img
          src="/yaoming.png"
          alt="Background Asset"
          className="fixed bottom-0 left-0 w-64 pointer-events-none z-0 mix-blend-multiply contrast-125 brightness-110 [animation:slide-up-left_1s_ease-out_forwards]"
        />
        <img
          src="/wangnima.png"
          alt="Background Asset"
          className="fixed bottom-0 right-0 w-64 pointer-events-none z-0 mix-blend-multiply contrast-125 brightness-110 [animation:slide-up-right_1s_ease-out_forwards]"
        />

        <main className="max-w-4xl mx-auto mt-8 px-4 pb-12 relative z-10">
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

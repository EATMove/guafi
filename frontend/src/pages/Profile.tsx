import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const Profile: React.FC = () => {
    // Mock data
    const myRumors = [
        { id: 1, title: "Secret of the Sui Foundation", status: 'Pending', reward: 0 },
        { id: 2, title: "Next Big Airdrop Alpha", status: 'Unlocked', reward: 0.15 },
    ];

    return (
        <div className="max-w-4xl mx-auto animate-bounce-in">
            <Card className="mb-8 bg-white">
                <div className="flex items-center space-x-6">
                    <div className="h-20 w-20 bg-pop-blue text-white rounded-full flex items-center justify-center text-4xl border-4 border-pop-black shadow-hard">
                        🍉
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-pop-black">My Profile</h1>
                        <p className="text-gray-500 font-bold font-mono">0x1234...5678</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-pop-blue/10 p-6 rounded-xl border-2 border-pop-blue shadow-[4px_4px_0px_0px_#4D96FF]">
                        <p className="text-sm text-pop-blue font-bold uppercase tracking-wider">Total Spent</p>
                        <p className="text-3xl font-black text-pop-black">1.5 SUI</p>
                    </div>
                    <div className="bg-pop-green/10 p-6 rounded-xl border-2 border-pop-green shadow-[4px_4px_0px_0px_#6BCB77]">
                        <p className="text-sm text-pop-green font-bold uppercase tracking-wider">Total Earned</p>
                        <p className="text-3xl font-black text-pop-black">0.15 SUI</p>
                    </div>
                    <div className="bg-pop-pink/10 p-6 rounded-xl border-2 border-pop-pink shadow-[4px_4px_0px_0px_#FF6B6B]">
                        <p className="text-sm text-pop-pink font-bold uppercase tracking-wider">Rumors Joined</p>
                        <p className="text-3xl font-black text-pop-black">2</p>
                    </div>
                </div>
            </Card>

            <h2 className="text-2xl font-black text-pop-black mb-6 pl-2 border-l-8 border-pop-yellow">Participated Rumors</h2>
            <div className="space-y-4">
                {myRumors.map((rumor, index) => (
                    <div key={rumor.id} className="animate-bounce-in" style={{ animationDelay: `${index * 100}ms` }}>
                        <Card className="flex flex-col md:flex-row justify-between items-center p-6 hover:-translate-y-1 transition-transform">
                            <div className="mb-4 md:mb-0">
                                <div className="flex items-center space-x-3 mb-2">
                                    <span className={`px-2 py-0.5 border-2 border-pop-black font-bold uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${rumor.status === 'Unlocked' ? 'bg-pop-green text-white' : 'bg-pop-yellow text-pop-black'
                                        }`}>
                                        {rumor.status}
                                    </span>
                                    <span className="text-gray-500 font-mono font-bold">#{rumor.id}</span>
                                </div>
                                <h3 className="text-xl font-black text-pop-black">{rumor.title}</h3>
                            </div>

                            <div className="flex items-center space-x-6 w-full md:w-auto justify-between md:justify-end">
                                {rumor.reward > 0 && (
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-500 uppercase">Claimable Reward</p>
                                        <p className="text-xl font-black text-pop-green">{rumor.reward} SUI</p>
                                    </div>
                                )}

                                {rumor.reward > 0 ? (
                                    <Button variant="primary" size="sm" className="bg-pop-green hover:bg-green-400">
                                        Claim
                                    </Button>
                                ) : (
                                    <Link to={`/rumor/${rumor.id}`}>
                                        <Button variant="outline" size="sm">
                                            View
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Profile;

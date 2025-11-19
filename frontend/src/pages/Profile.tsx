import React from 'react';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
    // Mock data
    const myRumors = [
        { id: 1, title: "Secret of the Sui Foundation", status: 'Pending', reward: 0 },
        { id: 2, title: "Next Big Airdrop Alpha", status: 'Unlocked', reward: 0.15 },
    ];

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                        🍉
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                        <p className="text-gray-500">0x1234...5678</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Total Spent</p>
                        <p className="text-2xl font-bold text-blue-900">1.5 SUI</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Total Earned</p>
                        <p className="text-2xl font-bold text-green-900">0.15 SUI</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-600 font-medium">Rumors Joined</p>
                        <p className="text-2xl font-bold text-purple-900">2</p>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-4">Participated Rumors</h2>
            <div className="space-y-4">
                {myRumors.map((rumor) => (
                    <div key={rumor.id} className="bg-white border rounded-xl p-4 flex flex-col md:flex-row justify-between items-center shadow-sm hover:shadow transition">
                        <div className="mb-4 md:mb-0">
                            <div className="flex items-center space-x-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${rumor.status === 'Unlocked' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {rumor.status}
                                </span>
                                <span className="text-gray-500 text-sm">#{rumor.id}</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{rumor.title}</h3>
                        </div>

                        <div className="flex items-center space-x-4">
                            {rumor.reward > 0 && (
                                <div className="text-right mr-4">
                                    <p className="text-xs text-gray-500">Claimable Reward</p>
                                    <p className="text-lg font-bold text-green-600">{rumor.reward} SUI</p>
                                </div>
                            )}

                            {rumor.reward > 0 ? (
                                <button className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition">
                                    Claim
                                </button>
                            ) : (
                                <Link to={`/rumor/${rumor.id}`} className="text-blue-600 hover:text-blue-800 font-medium px-4 py-2">
                                    View
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Profile;

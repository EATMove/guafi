import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const RumorDetail: React.FC = () => {
    const { id } = useParams();
    // Mock data based on ID
    const isUnlocked = id === '2';
    const isFailed = id === '3';

    const [joined, setJoined] = useState(false);

    const handleJoin = () => {
        setJoined(true);
    };

    return (
        <div className="p-4 max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gray-50 p-6 border-b">
                    <div className="flex justify-between items-center mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${isUnlocked ? 'bg-green-100 text-green-800' :
                                isFailed ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                            }`}>
                            {isUnlocked ? 'Unlocked' : isFailed ? 'Failed' : 'Pending'}
                        </span>
                        <span className="text-gray-500">ID: #{id}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {id === '1' ? "Secret of the Sui Foundation" :
                            id === '2' ? "Next Big Airdrop Alpha" :
                                "Lost Private Key Story"}
                    </h1>
                </div>

                <div className="p-8 space-y-8">
                    {/* Progress Section */}
                    <div>
                        <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                            <span>Progress</span>
                            <span>{isUnlocked ? '25/20' : isFailed ? '2/100' : '8/10'} Participants</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div
                                className={`h-4 rounded-full transition-all duration-500 ${isUnlocked ? 'bg-green-500' : 'bg-blue-500'
                                    }`}
                                style={{ width: isUnlocked ? '100%' : isFailed ? '2%' : '80%' }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2 text-right">
                            {isUnlocked ? 'Target reached! Content unlocked.' : '2 more needed to unlock.'}
                        </p>
                    </div>

                    {/* Content Section */}
                    <div className="border rounded-lg p-6 bg-gray-50">
                        <h3 className="text-lg font-semibold mb-4">Rumor Content</h3>

                        {isUnlocked ? (
                            <div className="prose max-w-none text-gray-800">
                                <p>This is the decrypted content! The alpha is that SUI is going to the moon 🚀.</p>
                                <img src="https://placehold.co/600x400?text=Decrypted+Image" alt="Evidence" className="mt-4 rounded-lg shadow-sm" />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                                <p className="text-lg font-medium">Content is Encrypted</p>
                                <p className="text-sm">Join this rumor to help unlock it.</p>
                            </div>
                        )}
                    </div>

                    {/* Action Section */}
                    {!isUnlocked && !isFailed && (
                        <div className="border-t pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm text-gray-500">Entry Price</p>
                                    <p className="text-2xl font-bold text-gray-900">0.5 SUI</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Potential Reward</p>
                                    <p className="text-xl font-semibold text-green-600">~0.05 SUI / new user</p>
                                </div>
                            </div>

                            {joined ? (
                                <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center font-medium">
                                    You have joined! Waiting for others...
                                </div>
                            ) : (
                                <button
                                    onClick={handleJoin}
                                    className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold text-lg shadow hover:bg-blue-700 transition transform hover:-translate-y-0.5"
                                >
                                    Pay 0.5 SUI to Join
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RumorDetail;

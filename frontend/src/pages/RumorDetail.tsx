import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

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
        <div className="max-w-3xl mx-auto animate-bounce-in">
            <Card className="overflow-hidden p-0">
                <div className="bg-pop-yellow/20 p-8 border-b-4 border-pop-black">
                    <div className="flex justify-between items-center mb-4">
                        <span className={`px-4 py-1 border-2 border-pop-black font-bold uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${isUnlocked ? 'bg-pop-green text-white' :
                                isFailed ? 'bg-pop-pink text-white' :
                                    'bg-pop-yellow text-pop-black'
                            }`}>
                            {isUnlocked ? 'Unlocked' : isFailed ? 'Failed' : 'Pending'}
                        </span>
                        <span className="text-pop-black font-mono font-bold text-lg">ID: #{id}</span>
                    </div>
                    <h1 className="text-4xl font-black text-pop-black leading-tight">
                        {id === '1' ? "Secret of the Sui Foundation" :
                            id === '2' ? "Next Big Airdrop Alpha" :
                                "Lost Private Key Story"}
                    </h1>
                </div>

                <div className="p-8 space-y-8">
                    {/* Progress Section */}
                    <div className="bg-white p-6 border-2 border-pop-black shadow-hard rounded-xl">
                        <div className="flex justify-between text-lg font-bold text-pop-black mb-4">
                            <span>Progress</span>
                            <span>{isUnlocked ? '25/20' : isFailed ? '2/100' : '8/10'} Participants</span>
                        </div>
                        <div className="w-full bg-gray-100 border-2 border-pop-black rounded-full h-6 p-0.5">
                            <div
                                className={`h-full rounded-full border border-pop-black transition-all duration-500 ${isUnlocked ? 'bg-pop-green' : 'bg-pop-blue'
                                    }`}
                                style={{ width: isUnlocked ? '100%' : isFailed ? '2%' : '80%' }}
                            ></div>
                        </div>
                        <p className="text-base font-bold text-gray-500 mt-3 text-right">
                            {isUnlocked ? 'Target reached! Content unlocked.' : '2 more needed to unlock.'}
                        </p>
                    </div>

                    {/* Content Section */}
                    <div className="border-2 border-pop-black rounded-xl p-8 bg-gray-50 shadow-hard">
                        <h3 className="text-2xl font-black mb-6 border-b-2 border-pop-black pb-2 inline-block">Rumor Content</h3>

                        {isUnlocked ? (
                            <div className="prose max-w-none text-lg font-medium text-pop-black">
                                <p>This is the decrypted content! The alpha is that SUI is going to the moon 🚀.</p>
                                <img src="https://placehold.co/600x400?text=Decrypted+Image" alt="Evidence" className="mt-6 rounded-xl border-2 border-pop-black shadow-hard" />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <div className="bg-gray-200 p-6 rounded-full mb-6 border-2 border-gray-300">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                    </svg>
                                </div>
                                <p className="text-xl font-bold text-pop-black mb-2">Content is Encrypted</p>
                                <p className="text-base font-medium">Join this rumor to help unlock it.</p>
                            </div>
                        )}
                    </div>

                    {/* Action Section */}
                    {!isUnlocked && !isFailed && (
                        <div className="border-t-4 border-pop-black pt-8">
                            <div className="flex items-center justify-between mb-6 bg-pop-blue/10 p-4 rounded-xl border-2 border-pop-blue">
                                <div>
                                    <p className="text-sm font-bold text-pop-blue uppercase tracking-wider">Entry Price</p>
                                    <p className="text-3xl font-black text-pop-black">0.5 SUI</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-pop-blue uppercase tracking-wider">Potential Reward</p>
                                    <p className="text-xl font-black text-pop-green">~0.05 SUI / new user</p>
                                </div>
                            </div>

                            {joined ? (
                                <div className="bg-pop-green text-white p-4 rounded-xl text-center font-bold text-xl border-2 border-pop-black shadow-hard animate-bounce-in">
                                    You have joined! Waiting for others...
                                </div>
                            ) : (
                                <Button
                                    onClick={handleJoin}
                                    size="lg"
                                    className="w-full text-xl py-4"
                                >
                                    Pay 0.5 SUI to Join
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default RumorDetail;

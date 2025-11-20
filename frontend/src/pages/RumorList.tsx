import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const MOCK_RUMORS = [
    { id: 1, title: "Secret of the Sui Foundation", price: 0.5, participants: 8, min: 10, status: 'Pending' },
    { id: 2, title: "Next Big Airdrop Alpha", price: 1.0, participants: 25, min: 20, status: 'Unlocked' },
    { id: 3, title: "Lost Private Key Story", price: 0.1, participants: 2, min: 100, status: 'Failed' },
];

const RumorList: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-black text-pop-black drop-shadow-md">Latest Rumors</h1>
                <Link to="/create">
                    <Button variant="primary" size="lg" className="animate-bounce-in">
                        + Post New Rumor
                    </Button>
                </Link>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {MOCK_RUMORS.map((rumor, index) => (
                    <div key={rumor.id} className="animate-bounce-in" style={{ animationDelay: `${index * 100}ms` }}>
                        <Card className="h-full flex flex-col hover:-translate-y-2 transition-transform duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 border-2 border-pop-black font-bold uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${rumor.status === 'Unlocked' ? 'bg-pop-green text-white' :
                                        rumor.status === 'Failed' ? 'bg-pop-pink text-white' :
                                            'bg-pop-yellow text-pop-black'
                                    }`}>
                                    {rumor.status}
                                </span>
                                <span className="text-pop-black font-mono font-bold">#{rumor.id}</span>
                            </div>

                            <h2 className="text-2xl font-black mb-4 text-pop-black leading-tight">{rumor.title}</h2>

                            <div className="mt-auto space-y-4">
                                <div className="space-y-2 font-bold">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Price:</span>
                                        <span className="bg-pop-blue text-white px-2 border border-pop-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{rumor.price} SUI</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Participants:</span>
                                        <span>{rumor.participants} / {rumor.min}</span>
                                    </div>
                                </div>

                                <div className="w-full bg-white border-2 border-pop-black h-4 rounded-full overflow-hidden p-0.5">
                                    <div
                                        className={`h-full rounded-full border border-pop-black ${rumor.status === 'Unlocked' ? 'bg-pop-green' : 'bg-pop-blue'
                                            }`}
                                        style={{ width: `${Math.min((rumor.participants / rumor.min) * 100, 100)}%` }}
                                    ></div>
                                </div>

                                <Link to={`/rumor/${rumor.id}`} className="block">
                                    <Button variant="outline" className="w-full">
                                        View Details
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RumorList;

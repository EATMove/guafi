import React from 'react';
import { Link } from 'react-router-dom';

const MOCK_RUMORS = [
    { id: 1, title: "Secret of the Sui Foundation", price: 0.5, participants: 8, min: 10, status: 'Pending' },
    { id: 2, title: "Next Big Airdrop Alpha", price: 1.0, participants: 25, min: 20, status: 'Unlocked' },
    { id: 3, title: "Lost Private Key Story", price: 0.1, participants: 2, min: 100, status: 'Failed' },
];

const RumorList: React.FC = () => {
    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Latest Rumors</h1>
                <Link to="/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">
                    + Post New Rumor
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {MOCK_RUMORS.map((rumor) => (
                    <div key={rumor.id} className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-6 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${rumor.status === 'Unlocked' ? 'bg-green-100 text-green-800' :
                                    rumor.status === 'Failed' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                }`}>
                                {rumor.status}
                            </span>
                            <span className="text-gray-500 text-sm">#{rumor.id}</span>
                        </div>

                        <h2 className="text-xl font-bold mb-2 text-gray-900">{rumor.title}</h2>

                        <div className="mt-auto pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Price:</span>
                                <span className="font-medium">{rumor.price} SUI</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Participants:</span>
                                <span className="font-medium">{rumor.participants} / {rumor.min}</span>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                <div
                                    className={`h-2.5 rounded-full ${rumor.status === 'Unlocked' ? 'bg-green-500' : 'bg-blue-500'
                                        }`}
                                    style={{ width: `${Math.min((rumor.participants / rumor.min) * 100, 100)}%` }}
                                ></div>
                            </div>

                            <Link
                                to={`/rumor/${rumor.id}`}
                                className="block text-center w-full mt-4 bg-gray-50 text-blue-600 font-semibold py-2 rounded border hover:bg-blue-50 transition"
                            >
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RumorList;

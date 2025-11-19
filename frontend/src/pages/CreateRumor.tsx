import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateRumor: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Mock delay for encryption and transaction
        setTimeout(() => {
            setLoading(false);
            navigate('/');
        }, 2000);
    };

    return (
        <div className="p-4 max-w-lg mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Rumor</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rumor Title</label>
                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="e.g., The Secret of..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content (File/Text)</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer">
                            <input type="file" className="hidden" id="file-upload" />
                            <label htmlFor="file-upload" className="cursor-pointer text-blue-600 font-medium">
                                Upload a file
                            </label>
                            <p className="text-xs text-gray-500 mt-1">Supports TXT, JPG, PNG, PDF</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (SUI)</label>
                            <input
                                type="number"
                                step="0.1"
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="0.1"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Min Participants</label>
                            <input
                                type="number"
                                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="10"
                                required
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                        <p><strong>Note:</strong> Content will be encrypted locally using Seal SDK before uploading to Walrus.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-blue-600 text-white p-4 rounded-lg font-bold shadow hover:bg-blue-700 transition flex justify-center items-center ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Encrypting & Creating...
                            </>
                        ) : 'Create Rumor'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateRumor;

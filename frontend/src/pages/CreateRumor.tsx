import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { buildCreateRumorTx } from '../lib/rumorClient';
import { guafiConfig } from '../lib/config';

const CreateRumor: React.FC = () => {
    const navigate = useNavigate();
    const account = useCurrentAccount();
    const { mutateAsync, isPending } = useSignAndExecuteTransaction();
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState<number>(0.1);
    const [minParticipants, setMinParticipants] = useState<number>(10);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!guafiConfig.packageId) {
            setError('Missing VITE_PACKAGE_ID; cannot submit on-chain transaction');
            return;
        }
        if (!account) {
            setError('Please connect your wallet first');
            return;
        }

        // blob_id 先留空，Seal/Walrus 集成后再填真实值
        const tx = buildCreateRumorTx({
            title,
            blobId: '',
            price,
            minParticipants,
            deadlineMs: 0,
        });

        mutateAsync(
            { transaction: tx },
            {
                onSuccess: () => navigate('/'),
                onError: (err) => setError((err as Error).message),
            },
        );
    };

    return (
        <div className="max-w-lg mx-auto animate-bounce-in">
            <Card title="Create New Rumor">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Rumor Title"
                        placeholder="e.g., The Secret of..."
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <div>
                        <label className="block font-bold mb-2 text-pop-black">Content (File/Text)</label>
                        <div className="border-2 border-dashed border-pop-black rounded-lg p-6 text-center hover:bg-pop-yellow/20 transition cursor-pointer group bg-white">
                            <input type="file" className="hidden" id="file-upload" />
                            <label htmlFor="file-upload" className="cursor-pointer text-pop-blue font-black text-lg group-hover:scale-110 inline-block transition-transform">
                                Upload a file
                            </label>
                            <p className="text-xs font-bold text-gray-500 mt-2">Supports TXT, JPG, PNG, PDF</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Price (SUI)"
                            type="number"
                            step="0.1"
                            placeholder="0.1"
                            required
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                        />
                        <Input
                            label="Min Participants"
                            type="number"
                            placeholder="10"
                            required
                            value={minParticipants}
                            onChange={(e) => setMinParticipants(Number(e.target.value))}
                        />
                    </div>

                    <div className="bg-pop-blue/10 border-2 border-pop-blue p-4 text-sm font-bold text-pop-blue shadow-[4px_4px_0px_0px_#4D96FF]">
                        <p>Note: Content will be encrypted locally using Seal SDK before uploading to Walrus.</p>
                    </div>

                    {error && (
                        <div className="bg-pop-pink/10 border-2 border-pop-pink p-3 font-bold text-pop-black">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full flex justify-center items-center"
                        size="lg"
                    >
                        {isPending ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Encrypting & Creating...
                            </>
                        ) : 'Create Rumor'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default CreateRumor;

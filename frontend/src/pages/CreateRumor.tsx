import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { buildCreateRumorTx } from '../lib/rumorClient';
import { guafiConfig } from '../lib/config';
import { uploadBlob } from '../lib/walrus/uploadHTTP';
import { encryptRumorContent } from '../lib/seal';

const CreateRumor: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const client = useSuiClient();
    const account = useCurrentAccount();
    const { mutateAsync, isPending: isTxPending } = useSignAndExecuteTransaction();
    
    // Form State
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState<number>(0.1);
    const [minParticipants, setMinParticipants] = useState<number>(10);
    const [file, setFile] = useState<File | null>(null);
    
    // Status State
    const [error, setError] = useState<string | null>(null);
    const [statusMsg, setStatusMsg] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
                setError('Only PDF files are allowed.');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsProcessing(true);

        try {
            // 1. Pre-checks
            if (!guafiConfig.packageId) throw new Error('Missing Package ID');
            if (!account) throw new Error('Please connect your wallet first');
            if (!file) throw new Error('Please select a file to upload');

            // 2. Read File Content (Skipped for encryption, file object is passed directly)
            setStatusMsg('Encrypting content with Seal...');
            
            // 3. Encrypt Content (Seal)
            const { encryptedBytes, backupKey } = await encryptRumorContent(file);
            
            console.log('Encrypted, Backup Key:', backupKey); // 实际生产应提示用户下载保存

            // 4. Upload to Walrus
            setStatusMsg('Uploading to Walrus...');
            // 将加密后的 Uint8Array 转为 Blob 上传
            const encryptedBlob = new Blob([encryptedBytes], { type: 'application/octet-stream' });
            const blobId = await uploadBlob(encryptedBlob);
            console.log('Walrus Blob ID:', blobId);

            // 5. Submit Transaction (Sui)
            setStatusMsg('Minting Rumor on Sui...');
            const tx = buildCreateRumorTx({
                title,
                blobId,
                price,
                minParticipants,
                deadlineMs: 0, 
            });

            await mutateAsync(
                { transaction: tx },
                {
                    onSuccess: async (result) => {
                        setStatusMsg('Waiting for blockchain confirmation...');
                        
                        await client.waitForTransaction({
                            digest: result.digest,
                        });

                        setStatusMsg('Success!');
                        await queryClient.invalidateQueries({ queryKey: ['rumors'] });
                        navigate('/');
                    },
                },
            );
        } catch (err) {
            console.error(err);
            setError((err as Error).message);
        } finally {
            setIsProcessing(false);
            setStatusMsg('');
        }
    };

    const isLoading = isProcessing || isTxPending;

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
                        <label className="block font-bold mb-2 text-pop-black">Content (PDF File)</label>
                        <div className="border-2 border-dashed border-pop-black rounded-lg p-6 text-center hover:bg-pop-yellow/20 transition cursor-pointer group bg-white relative">
                            <input 
                                type="file" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                id="file-upload"
                                onChange={handleFileChange}
                                accept="application/pdf,.pdf" 
                            />
                            <div className="pointer-events-none">
                                {file ? (
                                    <div className="text-pop-green font-bold text-lg break-all">
                                        ✅ {file.name}
                                    </div>
                                ) : (
                                    <>
                                        <span className="text-pop-blue font-black text-lg group-hover:scale-110 inline-block transition-transform">
                                            Click to Upload PDF
                                        </span>
                                        <p className="text-xs font-bold text-gray-500 mt-2">Only PDF files supported (Encrypted)</p>
                                    </>
                                )}
                            </div>
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
                        <div className="bg-pop-pink/10 border-2 border-pop-pink p-3 font-bold text-pop-black break-words">
                            Error: {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center"
                        size="lg"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {statusMsg || 'Processing...'}
                            </>
                        ) : 'Create Rumor'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default CreateRumor;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { buildCreateRumorTx } from '../lib/rumorParse';
import { guafiConfig } from '../lib/config';
import { uploadBlob } from '../lib/walrus/uploadHTTP';
import { encryptRumorContent } from '../lib/seal';

const CreateRumor: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const client = useSuiClient();
    const account = useCurrentAccount();
    const { mutateAsync, isPending: isTxPending } = useSignAndExecuteTransaction();

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
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
                setError(t('create.error_pdf_only'));
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
            if (!account) throw new Error(t('profile.connect_wallet'));
            if (!file) throw new Error(t('create.upload_placeholder'));

            // 2. Read File Content (Skipped for encryption, file object is passed directly)
            setStatusMsg(t('create.status_encrypting'));

            // 3. Encrypt Content (Seal)
            const { encryptedBytes, backupKey } = await encryptRumorContent(file);

            console.log('Encrypted, Backup Key:', backupKey); // 实际生产应提示用户下载保存

            // 4. Upload to Walrus
            setStatusMsg(t('create.status_uploading'));
            // 将加密后的 Uint8Array 转为 Blob 上传
            const encryptedBlob = new Blob([encryptedBytes], { type: 'application/octet-stream' });
            const blobId = await uploadBlob(encryptedBlob);
            console.log('Walrus Blob ID:', blobId);

            // 5. Submit Transaction (Sui)
            setStatusMsg(t('create.status_minting'));
            const tx = buildCreateRumorTx({
                title,
                description,
                blobId,
                price,
                minParticipants,
                deadlineMs: 0,
            });

            await mutateAsync(
                { transaction: tx },
                {
                    onSuccess: async (result) => {
                        setStatusMsg(t('create.status_confirming'));

                        await client.waitForTransaction({
                            digest: result.digest,
                        });

                        setStatusMsg(t('common.success'));
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
            <Card title={t('create.title')}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label={t('create.rumor_title')}
                        placeholder="e.g., The Secret of..."
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-pop-black uppercase tracking-wider">{t('create.description')}</label>
                        <textarea
                            className="w-full p-4 bg-white border-2 border-pop-black rounded-lg font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] transition-all resize-none h-24"
                            placeholder="Tell us more about this rumor..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block font-bold mb-2 text-pop-black">{t('create.content')}</label>
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
                                            {t('create.upload_placeholder')}
                                        </span>
                                        <p className="text-xs font-bold text-gray-500 mt-2">{t('create.upload_note')}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label={t('create.price_label')}
                            type="number"
                            step="0.1"
                            placeholder="0.1"
                            required
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                        />
                        <Input
                            label={t('create.min_participants_label')}
                            type="number"
                            placeholder="10"
                            required
                            value={minParticipants}
                            onChange={(e) => setMinParticipants(Number(e.target.value))}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 font-bold">
                        <p>ℹ️ {t('create.price_help')}</p>
                        <p>ℹ️ {t('create.min_participants_help')}</p>
                    </div>

                    <div className="bg-pop-blue/10 border-2 border-pop-blue p-4 text-sm font-bold text-pop-blue shadow-[4px_4px_0px_0px_#4D96FF]">
                        <p>{t('create.note')}</p>
                    </div>

                    {error && (
                        <div className="bg-pop-pink/10 border-2 border-pop-pink p-3 font-bold text-pop-black break-words">
                            {t('common.error')}: {error}
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
                                {statusMsg || t('common.processing')}
                            </>
                        ) : t('create.submit')}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default CreateRumor;

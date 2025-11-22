import React from 'react';
import { Button } from '../ui/Button';

interface Props {
    status: 'locked' | 'access_granted' | 'decrypted';
    contentUrl?: string | null;
    error?: string | null;
    isDecrypting: boolean;
    onDecrypt: () => void;
}

export const SecretContent: React.FC<Props> = ({ 
    status, 
    contentUrl, 
    error, 
    isDecrypting, 
    onDecrypt 
}) => {
    return (
        <div className="border-2 border-pop-black rounded-xl p-8 bg-gray-50 shadow-hard min-h-[300px] flex flex-col">
            <h3 className="text-2xl font-black mb-6 border-b-2 border-pop-black pb-2 inline-block">
                The Secret Content
            </h3>

            {status === 'decrypted' && contentUrl ? (
                <div className="flex-1 animate-fade-in">
                    <div className="bg-white p-4 border-2 border-pop-black rounded mb-4">
                        <p className="font-bold text-green-600 mb-2">✅ Decrypted Successfully!</p>
                        <div className="flex gap-2">
                            <a href={contentUrl} download="secret.pdf" className="text-blue-600 underline font-bold hover:text-blue-800">Download</a>
                            <span className="text-gray-400">|</span>
                            <a href={contentUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold hover:text-blue-800">Open New Tab</a>
                        </div>
                    </div>
                    <iframe 
                        src={contentUrl} 
                        className="w-full h-[500px] border-2 border-gray-200 rounded bg-white"
                        title="Decrypted Content"
                    >
                        <p>Your browser does not support PDF iframes.</p>
                    </iframe>
                </div>
            ) : status === 'access_granted' ? (
                <div className="flex flex-col items-center justify-center flex-1 py-10">
                    <div className="mb-6 text-6xl">🔓</div>
                    <h4 className="text-2xl font-bold mb-2">You have access!</h4>
                    <p className="text-gray-500 mb-6 text-center max-w-md text-xl">
                        Content is encrypted on Walrus. Use your Ticket to decrypt via Seal.
                    </p>
                    {error && <div className="mb-4 p-2 bg-red-100 text-red-600 text-sm font-bold border border-red-200 rounded">{error}</div>}
                    <Button onClick={onDecrypt} disabled={isDecrypting} size="lg" className="px-8">
                        {isDecrypting ? 'Decrypting...' : 'Reveal Content'}
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center flex-1 py-10 text-gray-400">
                    <div className="mb-6 text-6xl">🔒</div>
                    <h4 className="text-2xl font-bold text-gray-500 mb-2">Content Encrypted</h4>
                    <p className="text-xl">Purchase a ticket or wait for unlock.</p>
                </div>
            )}
        </div>
    );
};


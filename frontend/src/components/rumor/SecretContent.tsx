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
    const canReveal = status === 'access_granted';
    const isRevealed = status === 'decrypted';

    return (
        <div className={`relative overflow-hidden rounded-xl border-4 transition-all duration-500 ${
            isRevealed ? 'border-pop-green bg-white shadow-none' : 'border-pop-black bg-gray-100 shadow-hard'
        }`}>
            
            {/* Status Bar */}
            <div className={`p-4 border-b-4 border-pop-black flex justify-between items-center ${
                isRevealed ? 'bg-pop-green text-white' : 'bg-pop-black text-white'
            }`}>
                <h3 className="font-black uppercase tracking-widest text-lg flex items-center gap-2">
                    {isRevealed ? '🔓 Decrypted Payload' : '🔒 Encrypted Payload'}
                </h3>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-white/50"></div>
                    <div className="w-3 h-3 rounded-full bg-white/50"></div>
                    <div className="w-3 h-3 rounded-full bg-white/50"></div>
                </div>
            </div>

            <div className="p-8 min-h-[400px] flex flex-col relative">
                
                {/* Case 1: Decrypted Content */}
                {isRevealed && contentUrl ? (
                    <div className="flex-1 animate-fade-in flex flex-col">
                        <div className="mb-4 flex gap-4 text-sm font-bold bg-gray-50 p-2 rounded border-2 border-gray-200 inline-flex self-start">
                            <a href={contentUrl} download="secret.pdf" className="text-pop-blue hover:underline flex items-center gap-1">
                                <span>⬇</span> Download PDF
                            </a>
                            <span className="text-gray-300">|</span>
                            <a href={contentUrl} target="_blank" rel="noreferrer" className="text-pop-blue hover:underline flex items-center gap-1">
                                <span>↗</span> Open in New Tab
                            </a>
                        </div>
                        <iframe 
                            src={contentUrl} 
                            className="w-full flex-1 border-4 border-pop-black rounded bg-white min-h-[600px] shadow-inner"
                            title="Decrypted Content"
                        />
                    </div>
                ) : (
                    // Case 2 & 3: Locked or Ready to Reveal
                    <div className="flex-1 flex flex-col items-center justify-center text-center z-10 py-12">
                        
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none" 
                             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                        </div>
                        
                        <div className="mb-6 transform scale-150 animate-bounce-in">
                            {canReveal ? '🔐' : '🚫'}
                        </div>

                        <h4 className="text-4xl font-black text-pop-black mb-4 uppercase tracking-tight">
                            {canReveal ? 'Access Granted' : 'Top Secret'}
                        </h4>
                        
                        <p className="text-lg font-bold text-gray-500 max-w-md mb-8 leading-relaxed">
                            {canReveal 
                                ? "You have the key! Click below to decrypt the secret content from Walrus."
                                : "This content is encrypted. Join the rumor and wait for the unlock threshold to view it."}
                        </p>

                        {error && (
                            <div className="mb-8 p-4 bg-pop-pink text-white font-bold border-2 border-pop-black shadow-hard-sm -rotate-1 max-w-md">
                                ⚠️ Error: {error}
                            </div>
                        )}

                        {canReveal && (
                            <Button 
                                onClick={onDecrypt} 
                                disabled={isDecrypting} 
                                size="lg" 
                                className="px-12 py-6 text-xl shadow-hard hover:shadow-none hover:translate-y-1 transition-all bg-pop-green text-white border-2 border-pop-black"
                            >
                                {isDecrypting ? 'Decrypting...' : 'REVEAL CONTENT'}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

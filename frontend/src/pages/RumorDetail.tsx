import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card'; 
import { Button } from '../components/ui/Button';
import { RumorDashboard } from '../components/rumor/RumorDashboard';
import { SecretContent } from '../components/rumor/SecretContent';
import { JoinPanel } from '../components/rumor/JoinPanel';
import { useRumorDetail } from '../hooks/useRumorDetail';
import { useJoinRumor } from '../hooks/useJoinRumor';
import { useDecryptRumor } from '../hooks/useDecryptRumor';

const RumorDetail: React.FC = () => {
    const { id } = useParams();
    const { rumor, ticket, isLoading, isCreator, canDecrypt, refetch } = useRumorDetail(id);
    
    const { join, isJoining, error: joinError } = useJoinRumor(refetch);
    const { decrypt, contentUrl, isDecrypting, error: decryptError, setContentUrl } = useDecryptRumor();

    if (isLoading) return <div className="text-center p-10 font-bold">Loading...</div>;
    if (!rumor) return <div className="text-center p-10 font-bold text-red-500">Rumor not found</div>;

    // Determine content status
    let contentStatus: 'locked' | 'access_granted' | 'decrypted' = 'locked';
    if (contentUrl) contentStatus = 'decrypted';
    else if (canDecrypt) contentStatus = 'access_granted';

    const isDecrypted = contentStatus === 'decrypted';

    return (
        <div className={`mx-auto animate-bounce-in pb-20 transition-all duration-500 ${
            isDecrypted ? 'max-w-6xl' : 'max-w-3xl'
        }`}>
            <Card className="overflow-hidden p-0">
                {/* Header Switching Logic */}
                {!isDecrypted ? (
                    <RumorDashboard rumor={rumor} />
                ) : (
                    <div className="bg-pop-yellow/20 p-6 border-b-4 border-pop-black flex justify-between items-center sticky top-0 z-20 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <span className="text-2xl mr-2">🔓</span>
                            <h1 className="text-2xl font-black text-pop-black truncate max-w-md">{rumor.title}</h1>
                        </div>
                        <Button size="sm" onClick={() => setContentUrl(null)} className="border-2 border-pop-black shadow-sm">
                            ✕ Close Viewer
                        </Button>
                    </div>
                )}

                <div className="p-8 space-y-8">
                    
                    {/* Content takes center stage when decrypted */}
                    <SecretContent 
                        status={contentStatus}
                        contentUrl={contentUrl}
                        isDecrypting={isDecrypting}
                        onDecrypt={() => decrypt(rumor, ticket)}
                        error={decryptError}
                    />

                    {/* Hide distractions when reading */}
                    {!isDecrypted && (
                        <>
                            <JoinPanel 
                                rumor={rumor}
                                hasTicket={!!ticket}
                                isCreator={isCreator}
                                isPending={isJoining}
                                onJoin={() => join(rumor)}
                                error={joinError}
                            />
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default RumorDetail;

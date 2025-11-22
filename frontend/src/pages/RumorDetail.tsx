import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card'; 
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
    const { decrypt, contentUrl, isDecrypting, error: decryptError } = useDecryptRumor();

    if (isLoading) return <div className="text-center p-10 font-bold">Loading...</div>;
    if (!rumor) return <div className="text-center p-10 font-bold text-red-500">Rumor not found</div>;

    // Determine content status
    let contentStatus: 'locked' | 'access_granted' | 'decrypted' = 'locked';
    if (contentUrl) contentStatus = 'decrypted';
    else if (canDecrypt) contentStatus = 'access_granted';

    return (
        <div className="max-w-3xl mx-auto animate-bounce-in pb-20">
            <Card className="overflow-hidden p-0">
                <RumorDashboard rumor={rumor} />
                <div className="p-8 space-y-8">
                    <SecretContent 
                        status={contentStatus}
                        contentUrl={contentUrl}
                        isDecrypting={isDecrypting}
                        onDecrypt={() => decrypt(rumor, ticket)}
                        error={decryptError}
                    />

                    <JoinPanel 
                        rumor={rumor}
                        hasTicket={!!ticket}
                        isCreator={isCreator}
                        isPending={isJoining}
                        onJoin={() => join(rumor)}
                        error={joinError}
                    />
                </div>
            </Card>
        </div>
    );
};

export default RumorDetail;

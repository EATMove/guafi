import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { RumorCard } from '../components/rumor/RumorCard';
import { useRumors } from '../hooks/useRumors';

const RumorList: React.FC = () => {
    const { data: rumors, isLoading, error } = useRumors();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-pop-black border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-pop-pink/10 border-4 border-pop-pink p-8 rounded-xl text-center">
                <h3 className="text-2xl font-black text-pop-black mb-2">Oops!</h3>
                <p className="font-bold text-gray-600">{(error as Error).message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex justify-end items-center">
                <Link to="/create">
                    <Button size="lg" className="px-8 py-3 text-lg font-bold shadow-hard hover:shadow-none hover:translate-y-1 transition-all">
                        Add Rumor
                    </Button>
                </Link>
            </div>

            {/* List Section */}
            {rumors && rumors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rumors.map((rumor) => (
                        <RumorCard key={rumor.id} rumor={rumor} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 border-4 border-dashed border-gray-300 rounded-2xl">
                    <p className="text-2xl font-bold text-gray-400">No rumors yet. Be the first!</p>
                </div>
            )}
        </div>
    );
};

export default RumorList;

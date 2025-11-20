import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
    return (
        <div className={`bg-white border-2 border-pop-black shadow-hard p-6 ${className}`}>
            {title && (
                <h2 className="text-2xl font-black mb-4 border-b-2 border-pop-black pb-2">
                    {title}
                </h2>
            )}
            {children}
        </div>
    );
};

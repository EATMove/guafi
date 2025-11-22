import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    label?: string;
    error?: string;
    multiline?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    className = '',
    multiline = false,
    ...props
}) => {
    const baseStyles = "w-full border-2 border-pop-black p-3 font-medium focus:outline-none focus:ring-2 focus:ring-pop-yellow focus:border-pop-black transition-all shadow-sm";

    return (
        <div className="mb-4">
            {label && (
                <label className="block font-bold mb-2 text-pop-black">
                    {label}
                </label>
            )}
            {multiline ? (
                <textarea
                    className={`${baseStyles} min-h-[100px] ${className}`}
                    {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
                />
            ) : (
                <input
                    className={`${baseStyles} ${className}`}
                    {...props as React.InputHTMLAttributes<HTMLInputElement>}
                />
            )}
            {error && (
                <p className="text-pop-pink font-bold mt-1 text-sm animate-shake">
                    {error}
                </p>
            )}
        </div>
    );
};

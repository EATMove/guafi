import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) => {
    const baseStyles = "font-bold border-2 border-pop-black shadow-hard transition-all active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-pop-blue text-white hover:bg-blue-400",
        secondary: "bg-pop-yellow text-pop-black hover:bg-yellow-300",
        outline: "bg-white text-pop-black hover:bg-gray-50",
        danger: "bg-pop-pink text-white hover:bg-red-400"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-6 py-2 text-base",
        lg: "px-8 py-3 text-lg"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

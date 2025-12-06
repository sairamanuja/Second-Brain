import { ReactElement } from "react";

interface ButtonProps {
 variant: 'primary' | 'secondary';
 text:string;
 startIcon?: ReactElement;
 onClick: () => void;
 fullWidth?: boolean;
 loading?: boolean;
}

const variantClasses = {
    "primary": "bg-gradient-to-r from-purple-600 to-pink-600 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all", 
    "secondary": "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 cursor-pointer shadow-md hover:shadow-lg transition-all", 
};

const defaultStyles = "px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium flex items-center justify-center text-sm md:text-base";

export function Button({ variant, text, startIcon, onClick, fullWidth, loading }: ButtonProps) {
    return (
        <button onClick={onClick} className={variantClasses[variant] + " " + defaultStyles + `${fullWidth ? " w-full flex justify-center items-center" : ""} ${loading ? "opacity-45" : ""}` } disabled={loading} >
            <div className="pr-2">
                {startIcon}
            </div>
            {text}
        </button>
    );
}
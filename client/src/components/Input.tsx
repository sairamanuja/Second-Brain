interface InputProps {
    placeholder: string;
    reference?: any;
}

export function Input({placeholder, reference}: InputProps) {
    return (
    <div className="">
        <input
          ref={reference}
          placeholder={placeholder}
            type="text"

          className="px-4 w-full py-2 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
        />
    </div>
    );
}
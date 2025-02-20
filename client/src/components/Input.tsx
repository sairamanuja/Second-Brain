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

          className=" px-4 w-full py-2 rounded-md border"
        />
    </div>
    );
}
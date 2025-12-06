import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

export const Signup = () => {

  const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage('');

        if (!agreeToTerms) {
            toast.error('Please agree to the Terms of Service and Privacy Policy');
            return; 
        }

        try {
            const response = await axios.post("https://second-brain-0z65.onrender.com/api/v1/signup", {
                username: username,
                password: password
            });
            
            if (response.data.success) {
                toast.success('Signup successful! Redirecting...');
                setTimeout(() => navigate("/signin"), 1500);
            } else {
                toast.error(response.data.message || "Signup failed");
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || "Signup failed. Please try again.";
            toast.error(errorMsg);
            console.error("Signup error:", error);
        }
    };

    return (
        <>
        <Toaster position="top-center" reverseOrder={false} toastOptions={{
            success: { duration: 3000, iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { duration: 4000, iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }} />
        <div className="min-h-screen w-screen flex flex-col justify-center items-center lg:flex-row overflow-x-hidden bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
           
            <div className="flex lg:w-[35%] w-full max-w-[300px] lg:max-w-none h-full justify-center items-center mb-6 lg:mb-0">
            
                <img
                    src="/brain.png"
                    className="w-full max-w-[250px] lg:max-w-[400px] h-auto rounded-lg object-contain"
                    alt="Signup illustration"
                />
            </div>

          
            <div className="w-full lg:w-[50%] min-h-screen flex justify-center items-center px-4 py-8">
                <div className="w-full max-w-[500px] rounded-xl shadow-2xl bg-white border-2 border-purple-200 p-6 md:p-8">
                    <div className="flex flex-col items-center justify-center mb-6">
                        <h1 className='text-3xl md:text-5xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>SECOND BRAIN</h1>
                        <p className='text-base md:text-lg text-center mt-3'>Get Started!</p>
                    </div>
                    <p className="text-sm text-center text-gray-500 mb-6">
                        Already have an account?{' '}
                        <Link
  to="/signin"  
  className="text-purple-600 hover:underline font-medium"
>
  Sign in
</Link>
                    </p>
                    <form
                        className="flex flex-col gap-4 w-full"
                        onSubmit={handleSignup}
                    >
                            <label htmlFor="username" className="sr-only">Username</label>
                            <input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                type="text"
                                placeholder="Username"
                                className="p-2 rounded-lg w-full border border-gray-300"
                            />

                           

                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                placeholder="Password"
                                className="p-2 rounded-lg w-full border border-gray-300"
                            />

                            <div className="flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    id="agreeToTerms"
                                    checked={agreeToTerms}
                                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                                    className="mt-1"
                                />
                                <label htmlFor="agreeToTerms" className="text-sm text-gray-500">
                                    I Agree to the{' '}
                                    <span className="text-pt hover:underline">
                                        Terms of Service
                                    </span>{' '}
                                    and{' '}
                                    <span className="text-pt hover:underline">
                                        Privacy Policy
                                    </span>
                                </label>
                            </div>

                            {message && (
                                <div className={`p-3 rounded-lg text-sm font-medium ${
                                    message.includes('successful') || message.includes('Redirecting') 
                                        ? 'bg-green-100 text-green-700 border border-green-300' 
                                        : 'bg-red-100 text-red-700 border border-red-300'
                                }`}>
                                    {message}
                                </div>
                            )}

                            <button
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-lg w-full cursor-pointer shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                type="submit"

                            >
                                Sign Up
                            </button>
                        </form>
                </div>
            </div>
        </div>
        </>
    );
};


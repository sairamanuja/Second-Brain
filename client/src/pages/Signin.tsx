import React, { useState } from 'react';
import {  useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';


        
export const Signin = () => {
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
  
    const handleSignup = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await axios.post("https://second-brain-0z65.onrender.com/api/v1/signin", {
                username: email,
                password: password 
            });
            
            const token = response.data.token;
            if (token) {
                localStorage.setItem("token", `Bearer ${token}`);
                toast.success('Sign in successful! Redirecting...');
                setTimeout(() => navigate("/dashboard"), 1500);
            } else {
                toast.error(response.data.message || "Sign in failed");
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || "Sign in failed. Please check your credentials.";
            toast.error(errorMsg);
            console.error("Signin error:", error);
        }
    };

    return (
        <>
        <Toaster position="top-center" reverseOrder={false} toastOptions={{
            success: { duration: 3000, iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { duration: 4000, iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }} />
        <div className="min-h-screen w-screen flex flex-col justify-center items-center lg:flex-row overflow-x-hidden bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
            {/* Image Section */}
            <div className="flex lg:w-[35%] w-full max-w-[300px] lg:max-w-none h-full justify-center items-center mb-6 lg:mb-0">
            
                <img
                    src="/brain.png"
                    className="w-full max-w-[250px] lg:max-w-[400px] h-auto rounded-lg object-contain"
                    alt="Signup illustration"
                />
            </div>

            {/* Form Section */}
            <div className="w-full lg:w-[50%] min-h-screen flex justify-center items-center px-4 py-8">
                <div className="w-full max-w-[500px] rounded-xl shadow-2xl bg-white border-2 border-purple-200 p-6 md:p-8">
                    <div className="flex flex-col items-center justify-center mb-6">
                        <h1 className='text-3xl md:text-5xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>SIGN IN</h1>
                        <p className='text-base md:text-lg text-center mt-3'>Welcome Back!</p>
                    </div>
                    <p className="text-sm text-center text-gray-500 mb-6">
                        Don't have an account?{' '}
                        <Link
  to="/"
  className="text-purple-600 hover:underline font-medium"
>
  Sign Up
</Link>
                    </p>
                    <form
                        className="flex flex-col gap-4 w-full"
                        onSubmit={handleSignup}
                    >
                            <label htmlFor="Username" className="sr-only">Email</label>
                            <input
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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

                            {error && (
                                <div className="p-3 rounded-lg text-sm font-medium bg-red-100 text-red-700 border border-red-300">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="p-3 rounded-lg text-sm font-medium bg-green-100 text-green-700 border border-green-300">
                                    {success}
                                </div>
                            )}

                           
                            <button
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-lg w-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                type="submit"
                            >
                                Sign In
                            </button>
                        </form>
                </div>
            </div>
        </div>
        </>
    );
};


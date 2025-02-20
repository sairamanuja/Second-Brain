import React, { useState } from 'react';
import { navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config';
export const Signin = () => {
    // Ensure state variables are defined
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
  
   
    const handleSignup = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const response = await axios.post(BACKEND_URL+"/api/v1/signin",{
           username:email,
           password:password 
        }) 
        const token = response.data.token;
        console.log(token)
        if (token) {
            localStorage.setItem("token", `Bearer ${token}`);
        }
        if(token){
            alert("user Signin sucessfull")
            navigate("/dashboard");
        }
        console.log(response)
        console.log(email)
        console.log(password)
    
    };

    return (
        <div className="h-screen w-screen flex flex-col justify-center items-center lg:flex-row">
            {/* Image Section */}
            <div className="lg:flex w-[35%] h-[100%] justify-center items-center">
            
                <img
                    src="/brain.png"
                    className="w-[100%] h-[400px] rounded-lg object-contain"
                    alt="Signup illustration"
                />
            </div>

            {/* Form Section */}
            <div className="w-full lg:w-[50%] h-[100%] flex justify-center items-center">
                <div className="w-[90%] max-w-[500px] rounded-lg">
                    <div className="flex flex-col items-center justify-center bg-light-blue p-8">
                        <h1 className='text-5xl font-bold text-center'>SIGN IN</h1>
                        <p className='text-lg text-center mt-4'>Welcome Back!</p>
                    </div>
                    <p className="text-sm text-center lg:text-left text-gray-500">
                        Don't have an account?{' '}
                        <a
                            href="http://localhost:5173/signup"
                            className="text-pt hover:underline"
                        >
                            Sign Up
                        </a>
                    </p>
                    <div className="flex flex-col items-center lg:items-start pt-4 gap-4">
                        <form
                            className="flex flex-col gap-4 w-full"
                            onSubmit={handleSignup}
                        >
                            <label htmlFor="Username" className="sr-only">Email</label>
                            <input
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
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


                            {message && (
                                <p className={`text-sm ${message.includes('failed') ? 'text-red-500' : 'text-green-500'}`}>
                                    {message}
                                </p>
                            )}

                            <button
                                className="bg-[#f03794] text-white p-2 rounded-lg w-full"
                                type="submit"
                            >
                                Sign In
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};


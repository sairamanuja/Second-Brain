import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';

export const Signup = () => {

  const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        
        if (!agreeToTerms) {
            alert("Agree to the Terms of Service and Privacy Policy");
            return; 
        }

        const response = await axios.post("https://second-brain-0z65.onrender.com/api/v1/signup",{
          username:username,
          password:password
        });
    console.log(response)
        if (response.data.success) {
            setMessage("Signup successful!");
           if(message==="Signup successful!"){
            navigate("/signin")
           }

        } else {
            setMessage("Signup failed: " + response.data.message);
        }
        
        console.log(username);
        console.log(password);
      
    };

    return (
        <div className="h-screen w-screen flex flex-col justify-center items-center lg:flex-row">
           
            <div className="lg:flex w-[35%] h-[100%] justify-center items-center">
            
                <img
                    src="/brain.png"
                    className="w-[100%] h-[400px] rounded-lg object-contain"
                    alt="Signup illustration"
                />
            </div>

          
            <div className="w-full lg:w-[50%] h-[100%] flex justify-center items-center">
                <div className="w-[90%] max-w-[500px] rounded-lg">
                    <div className="flex flex-col items-center justify-center bg-light-blue p-8">
                        <h1 className='text-5xl font-bold text-center'>SECOND BRAIN</h1>
                        <p className='text-lg text-center mt-4'>Get Started!</p>
                    </div>
                    <p className="text-sm text-center lg:text-left text-gray-500">
                        Already have an account?{' '}
                        <Link
  to="/signin"  
  className="text-pt hover:underline"
>
  Sign Up
</Link>
                    </p>
                    <div className="flex flex-col items-center lg:items-start pt-4 gap-4">
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
                                <p className={`text-sm ${message.includes('failed') ? 'text-red-500' : 'text-green-500'}`}>
                                    {message}
                                </p>
                            )}

                            <button
                                className="bg-[#f03794] text-white p-2 rounded-lg w-full cursor-pointer"
                                type="submit"

                            >
                                Sign Up
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};


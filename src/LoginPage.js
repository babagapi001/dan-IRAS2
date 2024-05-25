import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPerson, MdLock } from 'react-icons/md'; // Import icons
import right from './assets/right.png';

const LoginPage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        // Replace these lines with your actual login logic
        const correctUsername = 'username';
        const correctPassword = 'password';

        if (username === correctUsername && password === correctPassword) {
            // Redirect to the main page
            navigate('/main');
        } else {
            alert('Incorrect username or password');
        }
    };

    return (
        <div className="flex h-screen">
            <div className="flex-1 flex justify-center items-center max-w-screen-xl mx-auto">
                {/* Left Panel - Login Form */}
                <div className="p-8 w-full max-w-md bg-white rounded-lg shadow-lg mr-5"> {/* Adjust width here */}
                    <h3 className="text-3xl font-semibold text-primary mb-6">Shelf status</h3>
                    <form>
                        <div className="mb-4 flex flex-col"> {/* Use flexbox to arrange items */}
                            <label htmlFor="username" className="block text-primary mb-1">
                                <MdPerson className="inline-block mr-2 mb-1" />Username
                            </label> {/* Added icon */}
                            <input 
                                type="text" 
                                id="username" 
                                className="mt-1 p-2 border w-full rounded" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                            />
                        </div>
                        <div className="mb-4 flex flex-col"> {/* Use flexbox to arrange items */}
                            <label htmlFor="password" className="block text-primary mb-1">
                                <MdLock className="inline-block mr-2 mb-1" />Password
                            </label> {/* Added icon */}
                            <input 
                                type="password" 
                                id="password" 
                                className="mt-1 p-2 border w-full rounded" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                        </div>
                        <button 
                            type="button" 
                            onClick={handleLogin} 
                            className="bg-primary text-white py-2 px-4 rounded hover:bg-blue-600"
                        >
                            Login
                        </button>
                    </form>
                </div>
                {/* Right Panel - Image */}
                <div className="flex-1 bg-gray-300 hidden md:flex justify-center items-center ml-8">
                    <img src={right} alt="Login Image" className="object-cover min-h-screen" />
                </div>
            </div>
        </div>
    );
}

export default LoginPage;

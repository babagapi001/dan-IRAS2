import React, {useState } from 'react';
import bg from './assets/bg.png';
import Compare from './components/compare'
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';


const ReferencePage = () => {
    const today = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString(undefined, dateOptions);
    const navigate = useNavigate();
    const backToHome = () => {
        navigate('/main');
    };


    return (
        <div className="min-h-screen relative">
            {/* Sidebar */}
            
            {/* Content */}
            <div className="absolute inset-0 z-10 flex flex-col">
                {/* Header */}
                <div className="bg-white rounded-b-lg rounded-t-none py-2 px-4 mb-8 flex justify-between items-center">
                    <button onClick={backToHome}>
                        <IoIosArrowBack size={24} className="text-primary" />
                    </button>
                    <h2 className="text-lg font-bold text-primary">Dashboard</h2>
                    <div className="flex items-center">
                        {/* Date */}
                        <p className="text-primary">{formattedDate}</p>
                    </div>
                </div>
                
                {/* Main Content */}
                
                <Compare/>
            </div>
            
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img src={bg} alt="Background" className="w-full h-full object-cover" />
            </div>

            {/* Show Alert */}

        </div>
    );
}

export default ReferencePage;

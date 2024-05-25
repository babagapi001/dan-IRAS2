import React, { useState, useEffect  } from 'react';
import bg from './assets/bg.png';
import Main from './components/main.js'; // Import the Detection component


const MainPage = () => {
    const today = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString(undefined, dateOptions);

    return (
        <div className="min-h-screen relative">
            {/* Sidebar */}
            
            {/* Content */}
            <div className="absolute inset-0 z-10 flex flex-col">
                {/* Header */}
                <div className="bg-white rounded-b-lg rounded-t-none py-2 px-4 mb-8 flex justify-between items-center">
                    <div></div>
                    <h2 className="text-lg font-bold text-primary">Dashboard</h2>
                    <div className="flex items-center">
                        {/* Date */}
                        <p className="text-primary">{formattedDate}</p>
                    </div>
                </div>
                
                {/* Main Content */}
                
                <Main />
            </div>
            
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img src={bg} alt="Background" className="w-full h-full object-cover" />
            </div>

            {/* Show Alert */}

        </div>
    );
}

export default MainPage;

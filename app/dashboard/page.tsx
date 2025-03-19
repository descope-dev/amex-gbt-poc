'use client'

export default function Page() {


    return (
        <div className="w-full min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col items-center justify-center p-6">
            <div className="bg-white text-blue-900 rounded-lg shadow-xl p-8 max-w-md w-full">
                <div className="flex justify-center mb-6">
                    {/* Amex GBT Logo placeholder - replace with actual logo if available */}
                    <div className="text-2xl font-bold text-blue-900">Amex GBT</div>
                </div>
                
                <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                        <h1 className="font-bold text-2xl mr-2">You are logged in</h1>
                        <span className="text-green-500 text-2xl">✅</span>
                    </div>
                    
                    <p className="mb-6 text-gray-600">
                        Welcome to your Amex GBT dashboard. Your session is active and secure.
                    </p>
                    
                    <p className="text-sm text-gray-500 mb-6">
                        Authentication tokens have been set in your browser cookies.
                    </p>
                    
                    <button 
                        className="bg-blue-900 hover:bg-blue-800 text-white rounded-md px-6 py-2 transition-colors duration-300 w-full"
                        onClick={() => {
                            window.location.href = 'api/auth/logout';
                        }}>
                        Log out
                    </button>
                </div>
            </div>
        </div>
    );
}
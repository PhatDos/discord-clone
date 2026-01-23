import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] animate-in fade-in duration-1000">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="relative animate-in slide-in-from-bottom-4 fade-in duration-700 delay-150">
                <div className="mb-8 text-center animate-in slide-in-from-top-4 fade-in duration-700">
                    <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-[#cc7070] to-[var(--primary-accent)] bg-clip-text text-transparent">
                        Welcome Back
                    </h1>
                    <p className="text-gray-400">Sign in to continue your journey</p>
                </div>
                <div className="transform transition-all duration-500 hover:scale-105">
                    <SignIn />
                </div>
            </div>
        </div>
    );
}
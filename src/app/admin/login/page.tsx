import { Home } from "lucide-react";
import LoginForm from "./Form";

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            <div className="flex flex-col items-center mb-4 text-blue-600">
                <Home className="w-12 h-12" />
                <h1 className="text-2xl font-bold mt-2">Cherry Field</h1>
                <p className="text-gray-500 mt-1">Housing Management</p>
            </div>
            <LoginForm />
        </div>
    )
}
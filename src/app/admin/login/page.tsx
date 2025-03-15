import { Home } from "lucide-react";
import LoginForm from "./Form";

export default function LoginPage() {
    return (
        <div className="flex-row content-center justify-items-center items-center min-h-screen">
            <div className="m-8 text-blue-500">
                <h1 className="flex items-center gap-3 text-h3-desktop font-bold">
                    <Home size={48}/>
                    Cherry Field
                </h1>
                <h2 className="text-body-desktop text-gray-600"> Housing Management </h2>
            </div>
            <LoginForm/>
        </div>
    )
}
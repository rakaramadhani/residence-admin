"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const loginSchema = z.object({
  email: z.string().email({ message: "- Alert: Your email is invalid" }),
  password: z.string(),
  remember: z.boolean(),
});

const LoginForm = () => {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      router.push("/admin/dashboard");
    }
  }, []);

  const Form = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });
  const [error, setError] = useState("");
  const handleLogin = async () => {
    const { email, password } = Form.getValues();
    try {
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("adminToken", data.token);
        router.push("/admin/dashboard");
      } else {
        setError(
          data.message || "Login gagal, periksa kembali kredensial Anda"
        );
      }
    } catch {
      setError("An error occurred during login.");
    }
  };

  return (
    <form
      onSubmit={Form.handleSubmit(handleLogin)}
      className="flex flex-col items-start shadow border gap-[24px] rounded-2xl w-fit p-[64px] h-[480px] justify-center border-gray-200 bg-light"
    >
      <h1 className="text-body-desktop font-bold">Welcome Back</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex flex-col gap-4 text-sm md:text-md items-start">
        <div className="flex flex-col gap-2">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            {...Form.register("email")}
            className="p-4 w-[360px] h-fit border border-gray-400 shadow-xs rounded-xl "
          />
          <span className="text-red-500 w-fit py-1 font-normal px-2 text-left rounded-xl">
            {" "}
            {Form.formState.errors.email?.message}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            {...Form.register("password")}
            className="p-4 w-[360px] h-fit border border-gray-400 shadow-xs rounded-xl "
          />
        </div>
        <div className="flex gap-2">
          <input type="checkbox" {...Form.register("remember")} className="" />
          <label htmlFor="remember">Remember Me</label>
        </div>
        <button
          type="submit"
          className="w-full px-12 py-2 rounded-xl text-white hover:cursor-pointer bg-blue-700 hover:bg-blue-300 "
        >
          Sign In
        </button>
        <a className="underline text-blue-500 cursor-pointer text-center">
          Lupa password ?
        </a>
      </div>
    </form>
  );
};

export default LoginForm;

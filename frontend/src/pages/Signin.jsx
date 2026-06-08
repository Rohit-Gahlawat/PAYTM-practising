import { useAtom } from "jotai"
import { BottomWarning } from "../components/BottomWarning"
import { Button } from "../components/Button"
import { Heading } from "../components/Heading"
import { InputBox } from "../components/InputBox"
import { SubHeading } from "../components/SubHeading"
import React from "react"
import { signinAtom } from "../atoms"
import { useNavigate } from "react-router-dom"
import axios from "axios"


export const Signin = () => {
    const [form, setForm] = useAtom(signinAtom)
    const navigate = useNavigate();
    return <div className="bg-slate-300 h-screen flex justify-center">
        <div className="flex flex-col justify-center">
            <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
                <Heading label={"Sign in"} />
                <SubHeading label={"Enter your credentials to access your account"} />
                <InputBox value={form.username} onChange={(e) => {
                    setForm({ ...form, username: e.target.value })
                }} placeholder="harkirat@gmail.com" label={"Email"} />
                <InputBox value={form.password} onChange={(e) => {
                    setForm({ ...form, password: e.target.value })
                }} placeholder="123456" label={"Password"} />
                <div className="pt-4">
                    <Button onClick={async () => {
                        try {
                            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/signin`, {
                                username: form.username,
                                password: form.password,

                            })
                            const token = response.data.token
                            if (!token) {
                                alert("Invalid credentials")
                                return
                            }
                            localStorage.setItem("token", token)
                            navigate("/dashboard", { state: { username: form.username } })


                        } catch (e) {
                            if (e.response.status === 411) {
                                alert("Email already exists! Please sign in instead.")
                            } else {
                                alert("Something went wrong. Please try again.")
                            }
                        }

                    }} label={"Sign in"} />
                </div>
                <BottomWarning label={"Don't have an account?"} buttonText={"Sign up"} to={"/signup"} />
            </div>
        </div>
    </div>
}

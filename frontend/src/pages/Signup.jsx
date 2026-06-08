import { useAtom } from "jotai"
import { BottomWarning } from "../components/BottomWarning"
import { Button } from "../components/Button"
import { Heading } from "../components/Heading"
import { InputBox } from "../components/InputBox"
import { SubHeading } from "../components/SubHeading"
import { signupAtom } from "../atoms"
import axios from "axios"
import { useNavigate } from "react-router-dom"


export const Signup = () => {
    const [form, setForm] = useAtom(signupAtom)
    const navigate = useNavigate()
    return <div className="bg-slate-300 h-screen flex justify-center">
        <div className="flex flex-col justify-center">
            <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
                <Heading label={"Sign up"} />
                <SubHeading label={"Enter your infromation to create an account"} />
                <InputBox value={form.firstName} onChange={(e) => {
                    setForm({ ...form, firstName: e.target.value })
                }} placeholder="John" label={"First Name"} />
                <InputBox value={form.lastName} onChange={(e) => {
                    setForm({ ...form, lastName: e.target.value })
                }} placeholder="watson" label={"Last Name"} />
                <InputBox value={form.username} onChange={(e) => {
                    setForm({ ...form, username: e.target.value })
                }} placeholder="example@gmail.com" label={"Email"} />
                <InputBox value={form.password} onChange={(e) => {
                    setForm({ ...form, password: e.target.value })
                }} placeholder="" label={"Password"} />
                <div className="pt-4">
                    <Button onClick={async () => {
                        try {
                            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/signup`, {
                                username: form.username,
                                password: form.password,
                                firstName: form.firstName,
                                lastName: form.lastName,
                            })
                            localStorage.setItem("token", response.data.jwt)
                            navigate("/dashboard", { state: { username: form.username } })
                        } catch (e) {
                            console.log(e.response)
                            if (e.response.status === 411) {
                                alert("Email already exists! Please sign in instead.")
                            } else {
                                alert("Something went wrong. Please try again.")
                            }
                        }

                    }} label={"Sign up"} />
                </div>
                <BottomWarning label={"Already have an account?"} buttonText={"Sign in"} to={"/signin"} />
            </div>
        </div>
    </div>
}
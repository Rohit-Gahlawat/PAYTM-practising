import axios from "axios";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";


export const SendMoney = () => {
    const location = useLocation();
    const data = location.state || {};
    const firstName = data.firstName || "unknown";
    const id = data.userId || "";
    const nameIcon = firstName.split("")[0]
    const [amount, setAmount] = useState("")
    const token = localStorage.getItem("token")
    const navigate = useNavigate();



    return <div className="flex justify-center h-screen bg-gray-100">
        <div className="h-full flex flex-col justify-center">
            <div className="border h-min text-card-foreground max-w-md p-4 space-y-8 w-96 bg-white shadow-lg rounded-lg">
                <div className="flex flex-col space-y-1.5 p-6">
                    <h2 className="text-3xl font-bold text-center">Send Money</h2>
                </div>
                <div className="p-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                            <span className="text-2xl text-white">{nameIcon}</span>
                        </div>
                        <h3 className="text-2xl font-semibold">{firstName}</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="amount">
                                Amount (in Rs)
                            </label>
                            <input value={amount} onChange={(e) => { setAmount(e.target.value) }}
                                type="number"
                                className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                id="amount"
                                placeholder="Enter amount"
                            />
                        </div>
                        <button onClick={async () => {
                            if (!amount || Number(amount) <= 0) {
                                alert("Please enter a valid amount")
                                return
                            }
                            try {
                                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/account/transfer`, {
                                    amount: Number(amount),
                                    to: id
                                }, {
                                    headers: {
                                        Authorization: "Bearer " + token
                                    }
                                })
                                alert("Transfer successful!")
                                navigate("/dashboard")
                            } catch (e) {
                                if (e.response?.status === 400) {
                                    alert(e.response.data.message)
                                } else {
                                    alert("Transfer failed. Try again.")
                                }
                            }
                        }} className="justify-center rounded-md text-sm font-medium h-10 px-4 py-2 w-full bg-green-500 text-white">
                            Initiate Transfer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
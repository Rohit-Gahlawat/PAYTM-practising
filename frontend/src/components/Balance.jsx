import axios from "axios"
import React, { useEffect, useState } from "react"

export const Balance = () => {

    const [amount, setAmount] = useState(null)
    useEffect(() => {
        const token = localStorage.getItem("token");
        const fetchBalance = () => {
            const response = axios.get(`${import.meta.env.VITE_BACKEND_URL}/account/balance`, {
                headers: {
                    Authorization: "Bearer " + token,
                }
            }).then((response) => setAmount(response.data.Balance))
        }
        fetchBalance();
        const interval = setInterval(fetchBalance, 100000);
        return () => clearInterval(interval);

    }, [])



    return <div className="flex">
        <div className="font-bold text-lg">
            Your balance
        </div>
        <div className="font-semibold ml-4 text-lg">
            Rs {amount}
        </div>
    </div>
}
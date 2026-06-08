import { useLocation } from "react-router-dom"
import { Appbar } from "../components/Appbar"
import { Balance } from "../components/Balance"
import { Users } from "../components/Users"

export const Dashboard = () => {
    const location = useLocation();
    const username = location.state?.username || ""
    return <div>
        <Appbar username={username} />
        <div className="m-8">
            <Balance />
            <Users />
        </div>
    </div>
}
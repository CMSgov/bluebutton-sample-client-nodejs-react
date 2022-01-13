import { Outlet } from "react-router-dom";
import Header from "./header";
import Navigation from "./navigation";

export function Layout() {
    return (
        <div>
            <Navigation />
            <Outlet />
        </div>
    )
}
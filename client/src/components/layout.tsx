import { Outlet } from "react-router-dom";
import Header from "./header";
import Navigation from "./navigation";

export function Layout() {
    return (
        <div className='ds-u-display--flex ds-u-flex-direction--row'>
            <Navigation />
            <div className='ds-u-justify-content--center ds-u-align-items--center ds-u-padding--1 ds-u-margin--1' style={{ width: '100%' }}>
                <Outlet />
            </div>
        </div>
    )
}
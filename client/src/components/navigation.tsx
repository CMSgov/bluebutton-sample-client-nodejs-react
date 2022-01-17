import { VerticalNav } from "@cmsgov/design-system";
import { Link } from "react-router-dom";

const ReactRouterLink = ({ ...props }) => (
    <Link to={props.href} {...props}>{props.children}</Link>
);

const navItems = [
    {
        label: 'Profile',
        id: 'profileNav',
        url: '/',
        component: ReactRouterLink
    },
    {
        label: 'Providers',
        id: 'providersNav',
        url: '/providers',
        component: ReactRouterLink
    },
    {
        label: 'Procedures',
        id: 'proceduresNav',
        url: '/procedures',
        component: ReactRouterLink
    },
    {
        label: 'Medications',
        id: 'medicationsNav',
        url: '/medications',
        component: ReactRouterLink
    },
    {
        label: 'Diagnoses',
        id: 'diagnosesNav',
        url: '/diagnoses',
        component: ReactRouterLink
    },
    {
        label: 'Expenses',
        id: 'expensesNav',
        url: '/expenses',
        component: ReactRouterLink
    }
]

export default function Navigation() {
    return (
        <VerticalNav items={navItems} />
    )
}
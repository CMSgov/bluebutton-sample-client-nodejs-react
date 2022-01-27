import { Button } from '@cmsgov/design-system';
import axios from 'axios';
import { useState } from 'react';
import avatar from '../images/patient.png';
import chart from '../images/who-charted.png';
import { SettingsType } from '../types/settings';

export default function Profile() {
    const [settingsState] = useState<SettingsType>({
        pkce: true,
        version: 'v2',
        env: 'sandbox'
    });

    async function goAuthorize() {
        const authUrlResponse = await axios.get(`/api/authorize/authurl`, { params: settingsState });
        window.location.href = authUrlResponse.data || '/';
    }

    return (
        <div className='ds-u-justify-content--center ds-u-align-items--center'>
            <h3 className='ds-u-text-align--center'>Profile</h3>
            <div className='full-width-card ds-u-display--flex ds-u-flex-direction--row ds-u-align-items--center ds-u-justify-content--center'>
                <img src={avatar} alt="Profile avatar" />
                <ul className="ds-c-list">
                    <li>John Doe</li>
                    <li>Springfield General Hospital</li>
                    <li>Dr. Hibbert</li>
                </ul>
            </div>
            <div>
                <div className='ds-u-display--flex ds-u-flex-direction--column ds-u-justify-content--center ds-u-align-items--center'>
                    <h4 className='ds-u-text-align--center'>Connect your medicare claims data</h4>
                    <Button variation="primary" onClick={goAuthorize}>Authorize</Button>
                </div>
            </div>
        </div>
    );
}
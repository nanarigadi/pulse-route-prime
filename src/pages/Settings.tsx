import React, { useState, useEffect } from 'react';

interface NotificationSettings {
    inApp: boolean;
    email: boolean;
    sms: boolean;
}

interface UnitSettings {
    speed: string;
    temperature: string;
    distance: string;
}

interface ProfileState {
    name: string;
    policeId: string;
    email: string;
    phone: string;
    notifications: NotificationSettings;
}

interface AppSettingsState {
    theme: string;
    units: UnitSettings;
}

const ToggleSwitch: React.FC<{ label: string; isChecked: boolean; onChange: () => void }> = ({ label, isChecked, onChange }) => (
    <div className="flex items-center justify-between py-2">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <label className="relative inline-block w-12 h-7 cursor-pointer">
            <input 
                type="checkbox" 
                checked={isChecked} 
                onChange={onChange} 
                className="opacity-0 w-0 h-0 peer"
            />
            <span className="absolute inset-0 rounded-full bg-gray-300 peer-checked:bg-blue-600 transition-colors duration-200"></span>
            <span className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 peer-checked:translate-x-5"></span>
        </label>
    </div>
);

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">{title}</h2>
);

const FieldGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        {children}
    </div>
);

const Input: React.FC<{ type: string; placeholder?: string; value: string; readOnly?: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; name: string }> = (props) => (
    <input
        type={props.type}
        className={`block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${props.readOnly ? 'bg-gray-200 dark:bg-gray-600 cursor-not-allowed' : ''}`}
        placeholder={props.placeholder}
        value={props.value}
        readOnly={props.readOnly}
        onChange={props.onChange}
        name={props.name}
    />
);

const Select: React.FC<{ label: string; options: { value: string; label: string }[]; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; name: string }> = (props) => (
    <FieldGroup label={props.label}>
        <select
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white p-3 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={props.value}
            onChange={props.onChange}
            name={props.name}
        >
            {props.options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    </FieldGroup>
);

const Button: React.FC<{ onClick: () => void; className?: string; children: React.ReactNode }> = ({ children, onClick, className = '' }) => (
    <button
        onClick={onClick}
        className={`inline-flex justify-center rounded-lg border border-transparent bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${className}`}
    >
        {children}
    </button>
);

const MessageBox: React.FC<{ message: string; type: 'success' | 'error' }> = ({ message, type }) => {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        if (message) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    if (!visible) return null;

    return (
        <div className={`fixed bottom-5 right-5 z-50 px-6 py-3 rounded-lg shadow-xl ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {message}
        </div>
    );
};

const Settings: React.FC = () => {
    const [profile, setProfile] = useState<ProfileState>({
        name: 'Jane Doe',
        policeId: 'P28490-SFO',
        email: 'jane.doe@cityflow.com',
        phone: '(555) 123-4567',
        notifications: {
            inApp: true,
            email: false,
            sms: true,
        },
    });

    const [appSettings, setAppSettings] = useState<AppSettingsState>({
        theme: 'light',
        units: {
            speed: 'mph',
            temperature: 'fahrenheit',
            distance: 'miles',
        },
    });

    const [message, setMessage] = useState<string>('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        const currentTheme = localStorage.getItem('theme') || 'light';
        setAppSettings(prev => ({ ...prev, theme: currentTheme }));
        document.documentElement.classList.toggle('dark', currentTheme === 'dark');
    }, []);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleNotificationToggle = (key: keyof NotificationSettings) => {
        setProfile(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: !prev.notifications[key],
            }
        }));
    };

    const handleProfileSave = () => {
        // Here you would implement your save logic, e.g., an API call.
        // For this example, we'll just show a message.
        console.log('Saving profile:', profile);
        setMessage('Profile updated successfully!');
        setMessageType('success');
    };

    const handleAppSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'theme') {
            setAppSettings(prev => ({ ...prev, theme: value }));
            localStorage.setItem('theme', value);
            document.documentElement.classList.toggle('dark', value === 'dark');
        } else {
            setAppSettings(prev => ({
                ...prev,
                units: {
                    ...prev.units,
                    [name as keyof UnitSettings]: value,
                }
            }));
        }
    };

    const handleAppSettingsSave = () => {
        console.log('Saving app settings:', appSettings);
        setMessage('App settings saved successfully!');
        setMessageType('success');
    };

    return (
        <div className="container max-w-4xl mx-auto p-8 lg:p-12">
            <h1 className="text-2xl lg:text-3xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h1>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
                <SectionTitle title="User Profile" />
                <div className="space-y-4">
                    <FieldGroup label="Name">
                        <Input type="text" name="name" placeholder="Enter your name" value={profile.name} onChange={handleProfileChange} />
                    </FieldGroup>
                    <FieldGroup label="Police ID">
                        <Input type="text" name="policeId" value={profile.policeId} readOnly onChange={() => {}} />
                    </FieldGroup>
                    <FieldGroup label="Email">
                        <Input type="email" name="email" placeholder="Enter your email" value={profile.email} onChange={handleProfileChange} />
                    </FieldGroup>
                    <FieldGroup label="Phone Number">
                        <Input type="tel" name="phone" placeholder="Enter your phone number" value={profile.phone} onChange={handleProfileChange} />
                    </FieldGroup>
                    <Button onClick={() => window.location.href = 'mailto:support@cityflow.com'}>Change Password</Button>
                </div>

                <div className="mt-8">
                    <SectionTitle title="Notification Preferences" />
                    <div className="space-y-2">
                        <ToggleSwitch
                            label="In-app notifications"
                            isChecked={profile.notifications.inApp}
                            onChange={() => handleNotificationToggle('inApp')}
                        />
                        <ToggleSwitch
                            label="Email alerts"
                            isChecked={profile.notifications.email}
                            onChange={() => handleNotificationToggle('email')}
                        />
                        <ToggleSwitch
                            label="SMS alerts"
                            isChecked={profile.notifications.sms}
                            onChange={() => handleNotificationToggle('sms')}
                        />
                    </div>
                </div>

                <div className="mt-8">
                    <Button className="w-full" onClick={handleProfileSave}>Save Profile Changes</Button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <SectionTitle title="Dashboard Customization" />
                
                <div className="mb-8">
                    <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Display Settings</h3>
                    <FieldGroup label="Theme">
                        <div className="flex items-center space-x-4">
                            <label className="inline-flex items-center">
                                <input type="radio" name="theme" value="light" className="form-radio text-blue-600" checked={appSettings.theme === 'light'} onChange={handleAppSettingsChange} />
                                <span className="ml-2 text-gray-700 dark:text-gray-300">Light Mode</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input type="radio" name="theme" value="dark" className="form-radio text-blue-600" checked={appSettings.theme === 'dark'} onChange={handleAppSettingsChange} />
                                <span className="ml-2 text-gray-700 dark:text-gray-300">Dark Mode</span>
                            </label>
                        </div>
                    </FieldGroup>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Unit Preferences</h3>
                    <Select
                        label="Speed Units"
                        name="speed"
                        value={appSettings.units.speed}
                        onChange={handleAppSettingsChange}
                        options={[{ value: 'mph', label: 'mph' }, { value: 'kmh', label: 'km/h' }]}
                    />
                    <Select
                        label="Temperature Units"
                        name="temperature"
                        value={appSettings.units.temperature}
                        onChange={handleAppSettingsChange}
                        options={[{ value: 'fahrenheit', label: 'Fahrenheit' }, { value: 'celsius', label: 'Celsius' }]}
                    />
                    <Select
                        label="Distance Units"
                        name="distance"
                        value={appSettings.units.distance}
                        onChange={handleAppSettingsChange}
                        options={[{ value: 'miles', label: 'miles' }, { value: 'kilometers', label: 'kilometers' }]}
                    />
                </div>

                <div className="mt-8">
                    <Button className="w-full" onClick={handleAppSettingsSave}>Save Customization Changes</Button>
                </div>
            </div>

            <MessageBox message={message} type={messageType} />
        </div>
    );
};

export default Settings;

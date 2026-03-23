import React, { createContext, useState, useEffect, useContext } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [currency, setCurrency] = useState(() => {
        return localStorage.getItem('mymart_currency') || '$';
    });

    useEffect(() => {
        localStorage.setItem('mymart_currency', currency);
    }, [currency]);

    const currencies = [
        { label: 'USD ($)', value: '$' },
        { label: 'EUR (€)', value: '€' },
        { label: 'GBP (£)', value: '£' },
        { label: 'INR (₹)', value: '₹' },
        { label: 'JPY (¥)', value: '¥' },
        { label: 'AUD (A$)', value: 'A$' },
        { label: 'CAD (C$)', value: 'C$' },
        { label: 'ZAR (R)', value: 'R' },
        { label: 'NGN (₦)', value: '₦' },
    ];

    return (
        <SettingsContext.Provider value={{ currency, setCurrency, currencies }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);

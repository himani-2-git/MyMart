import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail } from 'lucide-react';
import { BrandLogo } from './Logo';

const Footer = () => {
    const year = new Date().getFullYear();

    // Link arrays for cleaner mapping
    const quickLinks = [
        { name: 'Dashboard', path: '/' },
        { name: 'Inventory', path: '/inventory' },
        { name: 'Point of Sale', path: '/pos' },
        { name: 'Settings', path: '/settings' }
    ];
    const resources = [
        { name: 'Support', path: '/settings' },
        { name: 'FAQ', path: '/faq' },
        { name: 'Activity Log', path: '/activity' }
    ];

    return (
        <footer className="w-full mt-auto pt-16 pb-28 px-6 flex flex-col" style={{ backgroundColor: '#060c06', borderTop: '1px solid #3e3f3e' }}>
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                {/* Branding & Socials */}
                <div className="col-span-1 md:col-span-2 flex flex-col gap-5">
                    <BrandLogo />
                    <p className="text-sm max-w-sm" style={{ color: '#9ca3af' }}>
                        AI-Powered Retail Intelligence Platform. Streamline your operations, boost revenue, and delight customers with data-driven insights.
                    </p>
                    <div className="mt-2 text-sm text-gray-400 space-y-2">
                        <a href="mailto:himaniw21@gmail.com" className="flex items-center gap-2 hover:text-[#54c750] transition-colors" style={{ color: '#6b7280' }}>
                            <Mail size={16} /> himaniw21@gmail.com
                        </a>
                    </div>
                    <div className="flex gap-3 mt-2">
                        <a href="https://github.com/himani-2-git" target="_blank" rel="noopener noreferrer" 
                           className="p-2.5 rounded-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 group" 
                           style={{ backgroundColor: '#1e1e1e', color: '#6b7280' }}
                           onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#54c750'; e.currentTarget.style.color = '#000'; }}
                           onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1e1e1e'; e.currentTarget.style.color = '#6b7280'; }}>
                            <Github size={18} />
                        </a>
                        <a href="https://linkedin.com/in/himani-thakur-038b7b350" target="_blank" rel="noopener noreferrer" 
                           className="p-2.5 rounded-xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 group" 
                           style={{ backgroundColor: '#1e1e1e', color: '#6b7280' }}
                           onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#54c750'; e.currentTarget.style.color = '#000'; }}
                           onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1e1e1e'; e.currentTarget.style.color = '#6b7280'; }}>
                            <Linkedin size={18} />
                        </a>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-white font-bold tracking-wide">Quick Links</h4>
                    <div className="flex flex-col gap-3 text-sm" style={{ color: '#6b7280' }}>
                        {quickLinks.map(link => (
                            <Link key={link.name} to={link.path} className="hover:text-[#54c750] hover:translate-x-1 transition-all">
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Resources */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-white font-bold tracking-wide">Resources</h4>
                    <div className="flex flex-col gap-3 text-sm" style={{ color: '#6b7280' }}>
                        {resources.map(link => (
                            <Link key={link.name} to={link.path} className="hover:text-[#54c750] hover:translate-x-1 transition-all">
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* CTA Column */}
                <div className="flex flex-col gap-4">
                    <h4 className="text-white font-bold tracking-wide">Ready to grow?</h4>
                    <p className="text-sm" style={{ color: '#6b7280' }}>Join thousands of smart retailers today.</p>
                    <Link to="/" className="mt-2 w-max px-6 py-2.5 rounded-xl text-sm font-bold text-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#54c75033] inline-block text-center" 
                            style={{ backgroundColor: '#54c750' }}>
                        Get Started
                    </Link>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto w-full mt-16 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm" 
                 style={{ borderTop: '1px solid #1e1e1e', color: '#6b7280' }}>
                <p>&copy; {year} <span className="text-white font-semibold">MyMart</span>. All rights reserved.</p>
                <div className="flex gap-6 font-medium">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

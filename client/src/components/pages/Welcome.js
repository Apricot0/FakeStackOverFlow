import React, { useState } from 'react';

export default function Welcome() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVerification, setPasswordVerification] = useState('');
    const [selectedOption, setSelectedOption] = useState('');

    const handleRegister = () => {

    };

    const handleLogin = () => {

    };

    const handleOptionChange = (e) => {
        setSelectedOption(e.target.value);
    };
    return (
        <div className="welcome_page">
            <h1>Welcome to the FakeStackOverflow!</h1>
            <p>Please select an option:</p>

            <select value={selectedOption} onChange={handleOptionChange}>
                <option value="">Select an option</option>
                <option value="register">Register as a new user</option>
                <option value="login">Login as an existing user</option>
                <option value="guest">Continue as a guest user</option>
            </select>

            {selectedOption === 'register' && (
                <div className="form-container">
                    <h2>Register as a new user</h2>
                    <input className="input" type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
                    <input className="input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                    <input className="input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                    <input
                        className="input"
                        type="password"
                        placeholder="Confirm Password"
                        value={passwordVerification}
                        onChange={e => setPasswordVerification(e.target.value)}
                    />
                    <button className='botButton' onClick={handleRegister}>Sign Up</button>
                </div>
            )}

            {selectedOption === 'login' && (
                <div className="form-container">
                    <h2>Login as an existing user</h2>
                    <input className="input" type="email" placeholder="Email" />
                    <input className="input" type="password" placeholder="Password" />
                    <button className='botButton' onClick={handleLogin}>Login</button>
                </div>
            )}

            {selectedOption === 'guest' && (
                <div className="form-container">
                    <button className='botButton' onClick={handleLogin}>Continue to HomePage</button>
                </div>
            )}
        </div>
    );

}
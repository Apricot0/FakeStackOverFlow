import React, { useState } from 'react';
import axios from 'axios'
import FakeStackOverflow from '../fakestackoverflow.js'

axios.defaults.withCredentials = true;

export default function Welcome() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVerification, setPasswordVerification] = useState('');
    const [selectedOption, setSelectedOption] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);


    const handleRegister = async () => {
        console.log('Registering user...');
        console.log('Username:', username);
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Password Verification:', passwordVerification);

        if (password !== passwordVerification) {
            setErrorMessage('Password and Confirm Password do not match');
            return;
        }

        //Check if the email has a valid format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
             setErrorMessage('Invalid email format');
             // Show feedback to the user
            return;
         }
        try {
            const response = await axios.post('http://localhost:8000/register', {
                username,
                email,
                password,
            });

            // Assuming the server returns a success status
            if (response.status === 200) {
                // Store the login status in a cookie or local storage
                // Example: document.cookie = "isLoggedIn=true";
                setErrorMessage('Registration successful');
                // Redirect to the login page or home page
                setSelectedOption('login');
            }
        } catch (error) {
            // Handle error response from the server
            // Handle error response from the server
            console.error('Registration failed:', error);
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(`Registration failed: ${error.response.data.message}`);
            } else {
                setErrorMessage('Registration failed due to server error. Please try again.');
            }
        }
    };


    const handleLogin = async () => {
        console.log('Logging in user...');
        console.log('Email:', email);
        console.log('Password:', password);

        // Check if the email has a valid format
        // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // if (!emailRegex.test(email)) {
        //    setErrorMessage('Invalid email format');
            // Show feedback to the user
         //   return;
        //}
        try {
            const response = await axios.post('http://localhost:8000/login', {
                email,
                password,
            });

            // Assuming the server returns a success status
            if (response.status === 200) {
                console.log(response)
                document.cookie = "isLoggedIn=true";
                setIsLoggedIn(true);
                setErrorMessage('Login successful');
                // Redirect to the login page or home page
            }
        } catch (error) {
            // Handle error response from the server
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(`Login failed: ${error.response.data.message}`);
            } else {
                setErrorMessage('Login failed due to server error. Please try again.');
            }
        }
    };

    const handleOptionChange = (e) => {
        setSelectedOption(e.target.value);
        setErrorMessage('');
    };

    const handleGuest = () => {
        document.cookie = "isLoggedIn=false";
        setIsLoggedIn(true);
    };

    if (isLoggedIn) {
        // Render the home page component
        return <FakeStackOverflow />;
    } else {
        return (

            <div className="page_container">
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
                            <input className="input" type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
                            <input className="input" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
                            <button className='botButton' onClick={handleLogin}>Login</button>
                        </div>
                    )}

                    {selectedOption === 'guest' && (
                        <div className="form-container">
                            <button className='botButton' onClick={handleGuest}>Continue to HomePage</button>
                        </div>
                    )}
                    <p className='welcome_error'>{errorMessage}</p>
                </div>
            </div>
        );
    }

}
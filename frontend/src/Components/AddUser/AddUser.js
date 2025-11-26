import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../Nav/Nav';
import axios from 'axios';

function AddUser() {
    const history = useNavigate();
    const [inputs, setInputs] = useState({
        name: "",
        email: "",
        age: "",
        address: "",
    });

    const sendRequest = async () => {
        await axios.post("http://localhost:3000/users", {
            name: String(inputs.name),
            email: String(inputs.email),
            age: Number(inputs.age),
            address: String(inputs.address),
        });
    };

    const handleChange = (e) => {
        setInputs((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendRequest().then(() => history('/userdetails'));
        window.alert("User Added Successfully");
    };

    return (
        <div>
            <Nav />
            <h1>Add User</h1>
            <form onSubmit={handleSubmit}>
                <label>Name:</label>
                <input
                    type="text"
                    name="name"
                    value={inputs.name}
                    onChange={handleChange}
                    required
                />
                <br /><br />
                <label>Email:</label>
                <input
                    type="email"
                    name="email"
                    value={inputs.email}
                    onChange={handleChange}
                    required
                />
                <br /><br />
                <label>Age:</label>
                <input
                    type="number"
                    name="age"
                    value={inputs.age}
                    onChange={handleChange}
                    required
                />
                <br /><br />
                <label>Address:</label>
                <input
                    type="text"
                    name="address"
                    value={inputs.address}
                    onChange={handleChange}
                    required
                />
                <br /><br />
                <button type="submit">Add User</button>
            </form>
        </div>
    );
}

export default AddUser;


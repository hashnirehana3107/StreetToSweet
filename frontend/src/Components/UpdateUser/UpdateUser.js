import React, {useEffect, useState} from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'


function UpdateUser() {
    const [inputs, setInputs] = useState({});
    const history = useNavigate();
    const { id } = useParams();

    useEffect(() => {
      const fetchHandler = async () => {
        await axios.get(`http://localhost:3000/users/${id}`).then((res) => res.data)
        .then((data) => setInputs(data.user));
    };
    fetchHandler();
  }, [id]);

  const sendRequest = async () => {
    await axios.put(`http://localhost:3000/users/${id}`, {
      name: String(inputs.name),
      email: String(inputs.email),
      age: Number(inputs.age),
      address: String(inputs.address),
    })
    .then((res) => res.data);
  };

  const handleChange = (e) => {
        setInputs((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(inputs);
        sendRequest().then(() => history("/userdetails"));
    };


  return (
    <div>
      <h1> Update User</h1>
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
                <button type="submit">Update User</button>
            </form>
    </div>
  )
}

export default UpdateUser

import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function User(props) {
  const { _id, name, email, age, address } = props.user ?? {};
const history = useNavigate();

const deleteHandler = async () => {
  const userConfirmed = window.confirm("Are you sure you want to delete this user? This action cannot be undone.");

  if (userConfirmed) {
    try {
    await axios.delete(`http://localhost:3000/users/${_id}`);
    window.alert("User deleted successfully.");
    history("/userdetails");
    window.location.reload();


  } catch (error) {
    console.error("Error deleting user: " + error.message);
    alert("An error occurred while deleting the user. Please try again.");
  }
}
};

  if (!props.user) {
    return (
      <div>
        <h1>User Display</h1>
        <p>No user data provided.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>User Display</h1>
      <br />
      <h2>ID: {_id}</h2>
      <h2>Name: {name}</h2>
      <h2>Email: {email}</h2>
      <h2>Age: {age}</h2>
      <h2>Address: {address}</h2>
      <Link to={`/userdetails/${_id}`}>
      <button>Update</button>
      </Link>
      <button onClick={deleteHandler}>Delete</button>
    </div>
  );
}

export default User;

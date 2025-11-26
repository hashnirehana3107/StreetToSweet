import React, { useState, useEffect, useRef } from "react";
import Nav from "../Nav/Nav";
import axios from "axios";
import User from "../User/User";
import { useReactToPrint } from "react-to-print";

const URL = "http://localhost:3000/users"; // Use lowercase 'localhost'

const fetchHandler = async () => {
  try {
    const res = await axios.get(URL);
    return res.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return { users: [] };
  }
};

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchHandler().then((data) => setUsers(data.users));
  }, []);

  //download document
  const ComponentsRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => ComponentsRef.current,
    documentTitleTitle: "Users Report", //download pdf name
    onAfterPrint: () => alert("Users Report Successfully Downloaded!"),
  });

  //search bar
  const [searchQuery, setSearchQuery] = useState("");
  const [noResults, setNoResults] = useState(false);

  const handleSearch = () => {
    fetchHandler().then((data) => {
      const filteredUsers = data.users.filter((user) =>
        Object.values(user).some((field) =>
          field.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setUsers(filteredUsers);
      setNoResults(filteredUsers.length === 0);
    });
  };

  //whatsapp message
  const handleSendReport = () => {
    //create whatsapp chat URL
    const phoneNumber = "+94760366438"; //replace with the recipient's phone number
    const message = `Selected User Reports `;
    const whatsappURL = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
      message
    )}`;

    //open the whatsapp chat in new window
    window.open(whatsappURL, "_blank");
  };

  return (
    <div ref={ComponentsRef}>
      <Nav />
      <h1>User Details Display Page</h1>

      <input
        onChange={(e) => setSearchQuery(e.target.value)}
        type="text"
        name="Search"
        placeholder="Search Users Details"
      ></input>
      <button onClick={handleSearch}> Search </button>

      {noResults ? (
        <div>
          <p> No Users Found</p>
        </div>
      ) : (
        <div>
          {users &&
            users.map((user, i) => (
              <div key={i}>
                <User user={user} />
              </div>
            ))}
        </div>
      )}
      <button onClick={handlePrint}>Download Report</button>

      <br></br>
      <button onClick={handleSendReport}>Send WhatsApp Message</button>
    </div>
  );
}

export default Users;

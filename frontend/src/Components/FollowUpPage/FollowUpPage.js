import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import FollowUpReport from "../FollowUpReport/FollowUpReport";

function FollowUpPage() {
  const { id } = useParams(); // adoption request ID
  const [adoptionRequest, setAdoptionRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Replace with actual logged-in user ID if you have authentication
  const [user, setUser] = useState({ id: "currentUserId" });

  useEffect(() => {
    const fetchAdoptionRequest = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/adoption-requests/${id}`);
        
        if (!res.data || !res.data.dog) {
          throw new Error("Invalid adoption request data");
        }

        setAdoptionRequest({
          id: res.data._id,
          dog: {
            id: res.data.dog._id,
            name: res.data.dog.name,
            breed: res.data.dog.breed || "Unknown",
            age: res.data.dog.age || "Unknown",
          },
          adopter: {
            name: res.data.fullName,
            email: res.data.email,
          },
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching adoption request:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchAdoptionRequest();
  }, [id]);

  if (loading) return <p>Loading adoption request...</p>;
  if (error) return <p>Failed to load adoption request. Please try again later.</p>;

  return (
    <div>
      <FollowUpReport adoptionRequest={adoptionRequest} user={user} />
    </div>
  );
}

export default FollowUpPage;

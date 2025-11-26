import React, { useState, useEffect } from 'react';
import './AssignRescueTeam.css';

const AssignRescueTeam = ({ reportId, onAssign }) => {
  const [rescueTeams, setRescueTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRescueTeams();
  }, []);

  const fetchRescueTeams = async () => {
    try {
      // Mock data - replace with actual API call
      setRescueTeams([
        { id: 1, name: 'Team Alpha', status: 'available' },
        { id: 2, name: 'Team Beta', status: 'available' },
        { id: 3, name: 'Team Gamma', status: 'busy' }
      ]);
    } catch (error) {
      console.error('Error fetching rescue teams:', error);
    }
  };

  const handleAssign = async () => {
    if (!selectedTeam) return;
    
    setLoading(true);
    try {
      // API call to assign team
      onAssign?.(selectedTeam);
    } catch (error) {
      console.error('Error assigning team:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assign-rescue-team">
      <h3>Assign Rescue Team</h3>
      <select 
        value={selectedTeam} 
        onChange={(e) => setSelectedTeam(e.target.value)}
        disabled={loading}
      >
        <option value="">Select a team</option>
        {rescueTeams.map(team => (
          <option 
            key={team.id} 
            value={team.id} 
            disabled={team.status === 'busy'}
          >
            {team.name} ({team.status})
          </option>
        ))}
      </select>
      <button 
        onClick={handleAssign} 
        disabled={!selectedTeam || loading}
      >
        {loading ? 'Assigning...' : 'Assign Team'}
      </button>
    </div>
  );
};

export default AssignRescueTeam;
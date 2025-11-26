import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Calendar,
  Filter,
  Users,
  Share,
  Heart,
  ArrowUpDown,
  X
} from 'lucide-react';
import './EventListing.css';

const EventListing = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Vaccination Drive',
      date: '2023-10-20',
      time: '10:00 AM - 2:00 PM',
      location: 'Main Shelter, Downtown',
      type: 'Vaccination',
      description: 'Join us for a free vaccination drive for stray dogs in the community. We will be providing rabies, distemper, and parvovirus vaccinations. No appointment necessary. Dogs will also receive a basic health checkup.',
      fullDescription: 'Our vaccination drive aims to protect the street dog population from common diseases. Volunteers will assist with registration, dog handling, and post-vaccination monitoring. Veterinarians will be on-site to administer vaccines and provide basic medical care. This event is crucial for maintaining herd immunity in our community and preventing outbreaks.',
      image: 'https://dogstodaymagazine.co.uk/wp-content/uploads/2023/05/Mission-Rabies-volunteer-marks-dog-with-animal-friendly-paint-to-show-they-have-been-vaccinated.jpeg',
      rsvpCount: 24,
      volunteerSlots: 30,
      urgent: true,
      featured: true,
      requirements: 'Comfortable around dogs, no experience necessary'
    },
    {
      id: 2,
      title: 'Adoption Camp',
      date: '2023-10-28',
      time: '11:00 AM - 4:00 PM',
      location: 'City Park',
      type: 'Adoption',
      description: 'Find your new best friend at our adoption event featuring over 50 dogs.',
      fullDescription: 'Our adoption camp brings together dogs from multiple shelters looking for their forever homes. All dogs are vaccinated, microchipped, and spayed/neutered. Adoption counselors will be available to help you find the perfect match for your family. We\'ll have activities for children, information sessions on responsible pet ownership, and all necessary paperwork on-site.',
      image: 'https://s3.ap-southeast-1.amazonaws.com/images.asianage.com/images/aa-Cover-3jshgsdrj2nv9kg1tmma978bg4-20171129223259.Medi.jpeg',
      rsvpCount: 42,
      volunteerSlots: 20,
      urgent: false,
      featured: true,
      requirements: 'Experience with dogs preferred'
    },
    {
      id: 3,
      title: 'Awareness Walk',
      date: '2023-11-05',
      time: '9:00 AM - 12:00 PM',
      location: 'Riverside Promenade',
      type: 'Awareness',
      description: 'Join our awareness walk to promote responsible pet ownership in the community.',
      fullDescription: 'The annual awareness walk aims to educate the public about stray dog issues and promote responsible pet ownership. The 5km walk will be followed by informational booths, guest speakers from animal welfare organizations, and demonstrations of proper dog care. Participants are encouraged to bring their leashed dogs. All funds raised will support our spay/neuter program.',
      image: 'https://d253pvgap36xx8.cloudfront.net/blog/image/fa7fd322c38011e5bb0d22000a2946af.jpg',
      rsvpCount: 18,
      volunteerSlots: 15,
      urgent: false,
      featured: false,
      requirements: 'Good communication skills'
    },
    {
      id: 4,
      title: 'Puppy Training Workshop',
      date: '2023-11-12',
      time: '2:00 PM - 4:00 PM',
      location: 'Community Center',
      type: 'Workshop',
      description: 'Learn basic training techniques for puppies with our expert trainers.',
      fullDescription: 'This workshop covers essential puppy training techniques including house training, basic commands, leash training, and socialization. Our certified trainers will demonstrate methods and provide individual guidance. Attendees will receive a handbook with training tips and resources. This workshop is perfect for new adopters or foster families working with puppies.',
      image: 'https://campknine.com/wp-content/uploads/2024/10/AF4700B9-B6C1-4CCC-B80A-8F3AF7B7D943-web.jpg',
      rsvpCount: 32,
      volunteerSlots: 10,
      urgent: false,
      featured: false,
      requirements: 'Patience and love for puppies'
    },
    {
      id: 5,
      title: 'Emergency Rescue Operation',
      date: '2023-10-18',
      time: '8:00 AM - 6:00 PM',
      location: 'Western District',
      type: 'Rescue',
      description: 'Urgent help needed for rescue operations in the Western District after recent floods.',
      fullDescription: 'Recent flooding has displaced many street dogs in the Western District. We need volunteers to help with search and rescue efforts, temporary shelter setup, and providing emergency care. Experience with animal handling is preferred but not required as training will be provided on-site. Please wear appropriate clothing and footwear for wet conditions.',
      image: 'https://www.tauntongazette.com/gcdn/authoring/2017/02/01/NTDG/ghows-WL-b3d6dc51-c2fe-423f-93b4-64274777dfea-78d10d93.jpeg',
      rsvpCount: 15,
      volunteerSlots: 25,
      urgent: true,
      featured: true,
      requirements: 'Physical stamina, ability to work in difficult conditions'
    },
    {
      id: 6,
      title: 'Spay/Neuter Clinic',
      date: '2023-11-18',
      time: '9:00 AM - 5:00 PM',
      location: 'Main Shelter Clinic',
      type: 'Medical',
      description: 'Free spay and neuter services for community dogs to control population.',
      fullDescription: 'Our monthly spay/neuter clinic provides free sterilization services for street dogs and pets of low-income families. Veterinarians and trained technicians will perform surgeries while volunteers assist with pre-op preparation, recovery monitoring, and client education. This is our most effective program for controlling the street dog population humanely.',
      image: 'https://animalcare.sbcounty.gov/wp-content/uploads/sites/57/Owned-Pets-Partner-Thumbnail-Events-1024x576.png',
      rsvpCount: 28,
      volunteerSlots: 12,
      urgent: false,
      featured: false,
      requirements: 'Medical experience helpful but not required'
    },
    {
      id: 7,
      title: 'Foster Orientation Session',
      date: '2023-10-25',
      time: '6:00 PM - 7:30 PM',
      location: 'Shelter Education Room',
      type: 'Workshop',
      description: 'Learn how to become a foster parent for dogs awaiting adoption.',
      fullDescription: 'This orientation session covers everything you need to know about fostering dogs from our shelter. Topics include: preparing your home, basic care requirements, behavioral assessment, medical needs, and the adoption process. Current foster parents will share their experiences, and staff will be available to answer questions. Foster parents are essential to our mission of saving lives.',
      image: 'https://images.squarespace-cdn.com/content/v1/5538679ce4b07179e5b8a295/080bb7b8-f1c4-43be-8ee4-38a20ebf9b58/Foster.png',
      rsvpCount: 35,
      volunteerSlots: 40,
      urgent: false,
      featured: true,
      requirements: 'Love for animals, willingness to learn'
    },
    {
      id: 8,
      title: 'Fundraising Gala',
      date: '2023-12-02',
      time: '7:00 PM - 11:00 PM',
      location: 'Grand Hotel Ballroom',
      type: 'Fundraiser',
      description: 'Annual black-tie event to raise funds for our shelter programs.',
      fullDescription: 'Join us for our elegant annual gala featuring dinner, auctions, and entertainment. All proceeds support our life-saving programs including medical care, foster network, and community outreach. We\'ll honor our volunteers of the year and share success stories of dogs whose lives have been transformed. This is our largest fundraiser of the year and critical to our operations.',
      image: 'https://media.licdn.com/dms/image/v2/D4E12AQG82sWnaTAsVw/article-cover_image-shrink_720_1280/B4EZg9mS.4GcAI-/0/1753380111090?e=2147483647&v=beta&t=My_NfFgD_14_HM2A3eHxi4bKaM1k5yB2nYGhXZu4ozU',
      rsvpCount: 120,
      volunteerSlots: 15,
      urgent: false,
      featured: true,
      requirements: 'Professional appearance, customer service skills'
    }
  ]);

  const [filters, setFilters] = useState({
    eventType: 'all',
    dateRange: 'all',
    location: 'all',
    volunteerTasks: false
  });

  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const eventTypes = ['All', 'Adoption', 'Vaccination', 'Awareness', 'Workshop', 'Rescue', 'Medical', 'Fundraiser'];
  const dateRanges = ['All', 'Today', 'This Week', 'This Month'];
  const locations = ['All', 'Downtown', 'City Park', 'Riverside', 'Western District', 'Community Center', 'Main Shelter Clinic', 'Grand Hotel Ballroom'];

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleReadMore = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const filteredEvents = events
    .filter(event => {
      // Search filter
      if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !event.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Event type filter
      if (filters.eventType !== 'all' && event.type.toLowerCase() !== filters.eventType) {
        return false;
      }
      
      // Location filter
      if (filters.location !== 'all' && !event.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      // Volunteer tasks filter
      if (filters.volunteerTasks && event.volunteerSlots <= 0) {
        return false;
      }
      
      // Date filter would be implemented with actual date logic in a real app
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'urgent') {
        return (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0);
      }
      return 0;
    });

  return (
    <div className="e-list-pg">
      {/* Page Header */}
      <header className="e-list-header">
        <h1>Shelter Events</h1>
        <p>Browse All Events at Our Shelter</p>
        
        <div className="e-list-search">
          <div className="e-list-search-bar">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search events..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            className="e-list-filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>
      </header>

      {/* Filters Section */}
      {showFilters && (
        <div className="e-list-filters">
          <div className="e-list-filter-group">
            <label>Event Type</label>
            <div className="e-list-filter-options">
              {eventTypes.map(type => (
                <button
                  key={type}
                  className={`e-list-filter-btn ${filters.eventType === type.toLowerCase() ? 'active' : ''}`}
                  onClick={() => handleFilterChange('eventType', type.toLowerCase())}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          <div className="e-list-filter-group">
            <label>Date Range</label>
            <div className="e-list-filter-options">
              {dateRanges.map(range => (
                <button
                  key={range}
                  className={`e-list-filter-btn ${filters.dateRange === range.toLowerCase().replace(' ', '-') ? 'active' : ''}`}
                  onClick={() => handleFilterChange('dateRange', range.toLowerCase().replace(' ', '-'))}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          
          <div className="e-list-filter-group">
            <label>Location</label>
            <select 
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            >
              {locations.map(location => (
                <option key={location} value={location.toLowerCase().replace(' ', '-')}>
                  {location}
                </option>
              ))}
            </select>
          </div>
          
          <div className="e-list-filter-group">
            <label className="e-list-checkbox-label">
              <input 
                type="checkbox" 
                checked={filters.volunteerTasks}
                onChange={(e) => handleFilterChange('volunteerTasks', e.target.checked)}
              />
              <span>Volunteer tasks available</span>
            </label>
          </div>
        </div>
      )}

      {/* Sorting Controls */}
      <div className="e-list-sorting">
        <div className="e-list-sort-by">
          <ArrowUpDown size={16} />
          <span>Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest Events</option>
            <option value="urgent">Most Urgent</option>
          </select>
        </div>
        
        <div className="e-list-results">
          {filteredEvents.length} events found
        </div>
      </div>

      {/* Events Listing */}
      <div className="e-list-events">
        {filteredEvents.length === 0 ? (
          <div className="e-list-empty">
            <p>No events match your filters. Try adjusting your search criteria.</p>
          </div>
        ) : (
          filteredEvents.map(event => (
            <div 
              key={event.id} 
              className={`e-list-event-card ${event.featured ? 'featured' : ''} ${event.urgent ? 'urgent' : ''}`}
            >
              {event.featured && (
                <div className="e-list-featured-badge">
                  <Heart size={14} />
                  <span>Featured</span>
                </div>
              )}
              
              {event.urgent && (
                <div className="e-list-urgent-badge">Urgent</div>
              )}
              
              <div className="e-list-event-image">
                <img src={event.image} alt={event.title} />
                <div className={`e-list-event-type ${event.type.toLowerCase()}`}>
                  {event.type}
                </div>
              </div>
              
              <div className="e-list-event-content">
                <h3>{event.title}</h3>
                
                <div className="e-list-event-details">
                  <div className="e-list-event-detail">
                    <Calendar size={16} />
                    <span>{event.date} • {event.time}</span>
                  </div>
                  
                  <div className="e-list-event-detail">
                    <MapPin size={16} />
                    <span>{event.location}</span>
                  </div>
                  
                  <div className="e-list-event-detail">
                    <Users size={16} />
                    <span>{event.rsvpCount} attending • {event.volunteerSlots} volunteer slots left</span>
                  </div>
                </div>
                
                <p className="e-list-event-description">{event.description}</p>
                
                <div className="e-list-event-actions">
                  <button 
                    className="e-list-read-more-btn"
                    onClick={() => handleReadMore(event)}
                  >
                    Read More
                  </button>
                  <button className="e-list-share-btn">
                    <Share size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Event Detail Modal */}
      {showModal && selectedEvent && (
        <div className="e-list-modal-overlay" onClick={closeModal}>
          <div className="e-list-modal" onClick={(e) => e.stopPropagation()}>
            <button className="e-list-modal-close" onClick={closeModal}>
              <X size={24} />
            </button>
            
            <div className="e-list-modal-content">
              <div className="e-list-modal-image">
                <img src={selectedEvent.image} alt={selectedEvent.title} />
                <div className={`e-list-modal-type ${selectedEvent.type.toLowerCase()}`}>
                  {selectedEvent.type}
                </div>
              </div>
              
              <div className="e-list-modal-header">
                <h2>{selectedEvent.title}</h2>
                {selectedEvent.urgent && (
                  <div className="e-list-modal-urgent">Urgent Help Needed</div>
                )}
              </div>
              
              <div className="e-list-modal-details">
                <div className="e-list-modal-detail">
                  <Calendar size={18} />
                  <div>
                    <strong>Date & Time</strong>
                    <p>{selectedEvent.date} • {selectedEvent.time}</p>
                  </div>
                </div>
                
                <div className="e-list-modal-detail">
                  <MapPin size={18} />
                  <div>
                    <strong>Location</strong>
                    <p>{selectedEvent.location}</p>
                  </div>
                </div>
                
                <div className="e-list-modal-detail">
                  <Users size={18} />
                  <div>
                    <strong>Attendance</strong>
                    <p>{selectedEvent.rsvpCount} people attending • {selectedEvent.volunteerSlots} volunteer slots available</p>
                  </div>
                </div>
              </div>
              
              <div className="e-list-modal-description">
                <h3>About This Event</h3>
                <p>{selectedEvent.fullDescription}</p>
              </div>
              
              <div className="e-list-modal-contact">
                <h3>Contact Information</h3>
                <p><strong>Email:</strong> streettosweet@gmail.com</p>
                {selectedEvent.requirements && (
                  <p><strong>Volunteer Requirements:</strong> {selectedEvent.requirements}</p>
                )}
              </div>
              
              <div className="e-list-modal-actions">
                <button className="e-list-modal-share">
                  <Share size={18} />
                  Share Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EventListing;
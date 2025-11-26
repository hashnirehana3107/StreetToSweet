const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const { authenticateToken } = require('../middleware/auth');
require('../Model/EventModel');
require('../Model/Register');
const Event = mongoose.model('Event');
const Register = mongoose.model('Register');

// GET /events - list events (optionally filter by status="upcoming" etc.)
router.get('/', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };

    // Default: upcoming by date if status not specified
    let query = Event.find(filter).sort({ date: 1 });
    const events = await query.limit(limit * 1).skip((page - 1) * limit);
    const total = await Event.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        events,
        pagination: { current: parseInt(page), pages: Math.ceil(total / limit), total }
      }
    });
  } catch (error) {
    console.error('[EventRoutes] list error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to load events', error: error.message });
  }
});

// GET /events/upcoming - convenience endpoint for upcoming or future-dated events
router.get('/upcoming', async (req, res) => {
  try {
    const today = new Date();
    const events = await Event.find({
      $or: [
        { status: { $in: ['upcoming', 'ongoing'] } },
        { date: { $gte: today } }
      ]
    })
      .sort({ date: 1 })
      .limit(100);

    res.json({ status: 'success', data: { events } });
  } catch (error) {
    console.error('[EventRoutes] upcoming error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to load upcoming events', error: error.message });
  }
});

// GET /events/:eventId - event detail
// GET /events/mine - list events current user registered for
router.get('/mine', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const events = await Event.find({ 'registeredVolunteers.volunteerId': userId })
      .sort({ date: 1 });

    // map include only my registration subdoc
    const mapped = events.map(ev => {
      const mine = (ev.registeredVolunteers || []).find(v => String(v.volunteerId) === String(userId));
      return {
        _id: ev._id,
        title: ev.title,
        date: ev.date,
        startTime: ev.startTime,
        endTime: ev.endTime,
        location: ev.location,
        eventType: ev.eventType,
        status: ev.status,
        photos: ev.photos,
        myRegistration: mine ? { _id: mine._id, status: mine.status, registeredAt: mine.registeredAt } : null
      };
    });

    res.json({ status: 'success', data: { events: mapped } });
  } catch (error) {
    console.error('[EventRoutes] mine error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to load your events', error: error.message });
  }
});

// GET /events/:eventId - event detail
router.get('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(404).json({ status: 'error', message: 'Event not found' });
    }
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ status: 'error', message: 'Event not found' });
    res.json({ status: 'success', data: { event } });
  } catch (error) {
    console.error('[EventRoutes] detail error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to load event', error: error.message });
  }
});

// POST /events/:eventId/register - register current user to event
router.post('/:eventId/register', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ status: 'error', message: 'Event not found' });

    // Check already registered
    const already = event.registeredVolunteers.some(v => String(v.volunteerId) === String(userId));
    if (already) {
      return res.status(200).json({ status: 'success', message: 'Already registered', data: { event } });
    }

    // Optional capacity check
    if (event.maxVolunteers && event.registeredVolunteers.length >= event.maxVolunteers) {
      return res.status(400).json({ status: 'error', message: 'Event registration is full' });
    }

    event.registeredVolunteers.push({ volunteerId: userId, status: 'registered' });
    await event.save();

    // Find the just-added sub-registration id
    const reg = event.registeredVolunteers.find(v => String(v.volunteerId) === String(userId));

    res.status(201).json({ status: 'success', message: 'Registered for event', data: { event, registrationId: reg?._id, registration: reg } });
  } catch (error) {
    console.error('[EventRoutes] register error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to register for event', error: error.message });
  }
});

// GET /events/:eventId/confirmation-pdf - generate PDF confirmation for user's registration
router.get('/:eventId/confirmation-pdf', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(404).json({ status: 'error', message: 'Event not found' });
    }

    // Find the event and user
    const event = await Event.findById(eventId);
    const user = await Register.findById(userId);

    if (!event) {
      return res.status(404).json({ status: 'error', message: 'Event not found' });
    }

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Check if user is registered for this event
    const registration = event.registeredVolunteers.find(v => String(v.volunteerId) === String(userId));
    if (!registration) {
      return res.status(404).json({ status: 'error', message: 'Registration not found' });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="event-confirmation-${eventId}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // Add content to PDF
    
    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('Event Registration Confirmation', { align: 'center' });
    doc.moveDown(2);

    // Success message
    doc.fontSize(16).font('Helvetica').fillColor('#28a745').text('✓ You\'re registered successfully!', { align: 'center' });
    doc.fillColor('#000000').text('Thank you for supporting street dogs in our community.', { align: 'center' });
    doc.moveDown(2);

    // Event Details Section
    doc.fontSize(18).font('Helvetica-Bold').text('Event Details');
    doc.moveDown(0.5);
    
    // Event Type Badge
    const eventTypeFormatted = event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1).replace(/_/g, ' ');
    doc.fontSize(12).font('Helvetica').fillColor('#007bff').text(`${eventTypeFormatted} Event`, { continued: false });
    doc.fillColor('#000000');
    
    doc.moveDown(0.5);
    doc.fontSize(20).font('Helvetica-Bold').text(event.title);
    doc.moveDown(1);

    // Event information
    doc.fontSize(12).font('Helvetica-Bold').text('Date & Time:');
    doc.font('Helvetica').text(`${new Date(event.date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })}`);
    doc.text(`${event.startTime} - ${event.endTime}`);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').text('Location:');
    doc.font('Helvetica').text(event.location);
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').text('Event Type:');
    doc.font('Helvetica').text(eventTypeFormatted);
    doc.moveDown(1);

    // Registration Details Section
    doc.fontSize(18).font('Helvetica-Bold').text('Registration Details');
    doc.moveDown(0.5);

    doc.fontSize(12).font('Helvetica-Bold').text('Registered by:');
    doc.font('Helvetica').text(user.name);
    doc.moveDown(0.3);

    doc.font('Helvetica-Bold').text('Email:');
    doc.font('Helvetica').text(user.email);
    doc.moveDown(0.3);

    doc.font('Helvetica-Bold').text('Registration ID:');
    doc.font('Helvetica').text(registration._id.toString());
    doc.moveDown(0.3);

    doc.font('Helvetica-Bold').text('Registration Date:');
    doc.font('Helvetica').text(new Date(registration.registeredAt).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
    doc.moveDown(0.3);

    doc.font('Helvetica-Bold').text('Status:');
    doc.font('Helvetica').text(registration.status.charAt(0).toUpperCase() + registration.status.slice(1));
    doc.moveDown(2);

    // Important Information Section
    doc.fontSize(18).font('Helvetica-Bold').text('Important Information');
    doc.moveDown(0.5);

    const importantInfo = [
      '• Please arrive 15 minutes early for registration',
      '• Bring your ID for verification',
      '• Check your email for any updates or changes',
      '• Contact us at +94 11 234 5678 if you have questions'
    ];

    if (event.eventType === 'volunteer') {
      importantInfo.push('• Volunteer orientation will begin 30 minutes before the event');
    }

    doc.fontSize(12).font('Helvetica');
    importantInfo.forEach(info => {
      doc.text(info);
      doc.moveDown(0.3);
    });

    doc.moveDown(1);

    // Description if available
    if (event.description) {
      doc.fontSize(18).font('Helvetica-Bold').text('Event Description');
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').text(event.description);
      doc.moveDown(1);
    }

    // Requirements if available
    if (event.requirements) {
      doc.fontSize(18).font('Helvetica-Bold').text('Requirements');
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').text(event.requirements);
      doc.moveDown(1);
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica').fillColor('#666666').text(
      'This is an automatically generated confirmation. Please keep this document for your records.',
      { align: 'center' }
    );
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, { align: 'center' });

    // Finalize the PDF
    doc.end();

  } catch (error) {
    console.error('[EventRoutes] PDF generation error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to generate PDF', error: error.message });
  }
});

// GET /events/mine - list events current user registered for

module.exports = router;

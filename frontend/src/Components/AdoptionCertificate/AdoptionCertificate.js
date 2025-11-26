import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./AdoptionCertificate.css";
import axios from "axios";



const AdoptionCertificate = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const certificateRef = useRef(null);
  const [certificateData, setCertificateData] = useState(location.state?.certificateData || null);
  const [loading, setLoading] = useState(!certificateData); // Only loading if data not in state
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Fetch enhanced certificate data from backend
  useEffect(() => {
    if (!certificateData && requestId) {
      const fetchCertificateData = async () => {
        try {
          setLoading(true);
          // App uses 'authToken' convention; fall back to sessionStorage
          const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
          console.log('Token exists:', !!token);

          // If no token, redirect to login to acquire one (ProtectedRoute should also guard)
          if (!token) {
            setError('Please login to view your adoption certificate.');
            // Optional: try to navigate to login preserving return path
            // navigate('/login', { state: { from: location } });
            setLoading(false);
            return;
          }

          // Use a clean axios instance to avoid stale global Authorization headers
          const api = axios.create({ baseURL: 'http://localhost:3000' });
          const headers = { Authorization: `Bearer ${token}` };

          const res = await api.get(
            `http://localhost:3000/adoption-requests/${requestId}/certificate`,
            { headers }
          );
          setCertificateData(res.data);
        } catch (err) {
          console.error('Certificate fetch error:', err);
          console.error('Error response:', err.response?.data);
          // If unauthorized due to missing/invalid token, hint login
          const msg = err.response?.data?.message || 'Failed to fetch adoption certificate data.';
          setError(msg);
          if (err.response?.status === 401 || err.response?.status === 403) {
            // navigate to login, preserving return path
            // navigate('/login', { state: { from: location } });
          }
        } finally {
          setLoading(false);
        }
      };
      fetchCertificateData();
    }
  }, [certificateData, requestId]);

  // PDF download
  const generatePDF = async () => {
    if (!certificateRef.current || !certificateData) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(certificateRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgRatio = imgProps.width / imgProps.height;
      let pdfWidth = pageWidth - 20;
      let pdfHeight = pdfWidth / imgRatio;
      if (pdfHeight > pageHeight - 20) {
        pdfHeight = pageHeight - 20;
        pdfWidth = pdfHeight * imgRatio;
      }
      const x = (pageWidth - pdfWidth) / 2;
      const y = (pageHeight - pdfHeight) / 2;
      pdf.addImage(imgData, "PNG", x, y, pdfWidth, pdfHeight, undefined, "FAST");
      pdf.save(`Adoption_Certificate_${certificateData.dog.name}_${certificateData.certificateId}.pdf`);
    } catch (err) {
      console.error(err);
      setError("Failed to generate PDF");
    } finally {
      setGenerating(false);
    }
  };

  // Word download
  const generateWord = () => {
    if (!certificateData) return;
    const htmlContent = certificateRef.current.innerHTML;
    const blob = new Blob(["\ufeff", htmlContent], { type: "application/msword" });
    saveAs(blob, `Adoption_Certificate_${certificateData.dog.name}_${certificateData.certificateId}.doc`);
  };

  // Excel download
  const generateExcel = () => {
    if (!certificateData) return;
    const data = [
      {
        CertificateID: certificateData.certificateId,
        AdopterName: certificateData.adopter.fullName,
        Email: certificateData.adopter.email,
        Phone: certificateData.adopter.phone,
        Address: certificateData.adopter.address,
        DogName: certificateData.dog.name,
        Breed: certificateData.dog.breed,
        Age: certificateData.dog.age,
        Status: certificateData.requestStatus,
        ApprovalDate: new Date(certificateData.approvedDate).toLocaleDateString(),
        AuthorizedOfficer: certificateData.authorizedOfficer?.name || 'N/A',
        Veterinarian: certificateData.veterinarian?.name || 'N/A',
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Certificate");
    XLSX.writeFile(workbook, `Adoption_Certificate_${certificateData.dog.name}_${certificateData.certificateId}.xlsx`);
  };

  if (loading) return <div className="cert-loading">Loading certificate data...</div>;
  if (error) return <div className="cert-error">{error}</div>;
  if (!certificateData) return <div className="cert-error">No certificate data found.</div>;

  const approvalDate = new Date(certificateData.approvedDate);
  const certificateDate = new Date(certificateData.certificateDate);

  return (
    <div className="certificate-page">
      <div className="certificate-actions">
        <button onClick={generatePDF} disabled={generating}>
          {generating ? "Generating PDF..." : "Download PDF"}
        </button>
        {/* <button onClick={generateWord}>Download Word</button>
        <button onClick={generateExcel}>Download Excel</button> */}
        <button onClick={() => navigate(-1)}>Back</button>
      </div>

      <div className="certificate-preview-wrapper">
        <div className="certificate" ref={certificateRef}>
          <div className="cert-border">
            <div className="cert-header">
              <img className="logo" src="/animalShelter.png" alt="Shelter Logo" />
              <div className="cert-title">
                <h1>Adoption Certificate</h1>
                <p>This certifies the loving adoption of a rescued dog</p>
              </div>
            </div>

            <div className="cert-body">
              <div className="cert-left">
                <img src={`http://localhost:3000/uploads/dogs/${certificateData.dog.photo || "/dog-placeholder.jpg"}`} alt={certificateData.dog.name} />
              </div>
              <div className="cert-right">
                <p>Certificate No: <strong>{certificateData.certificateId}</strong></p>
                <h3>{certificateData.adopter.fullName}</h3>
                <p>
                  has adopted <strong>{certificateData.dog.name}</strong> ({certificateData.dog.breed}) on{" "}
                  <strong>{approvalDate.toLocaleDateString()}</strong>.
                </p>
                <div className="details-grid">
                  <div><strong>Dog Age:</strong> {certificateData.dog.age}</div>
                  <div><strong>Status:</strong> {certificateData.requestStatus}</div>
                  <div><strong>Email:</strong> {certificateData.adopter.email}</div>
                  <div><strong>Phone:</strong> {certificateData.adopter.phone}</div>
                  <div><strong>Address:</strong> {certificateData.adopter.address}</div>
                  <div><strong>Home Type:</strong> {certificateData.adopter.homeType}</div>
                  <div><strong>Adopter Status:</strong> {certificateData.adopter.status}</div>
                  <div><strong>Has Other Pets:</strong> {certificateData.adopter.hasPets ? 'Yes' : 'No'}</div>
                </div>

                {certificateData.dog.vaccinated !== undefined && (
                  <div className="health-info">
                    <p><strong>Vaccination Status:</strong> {certificateData.dog.vaccinated ? 'Vaccinated' : 'Not Vaccinated'}</p>
                    {certificateData.dog.health && <p><strong>Health Notes:</strong> {certificateData.dog.health}</p>}
                  </div>
                )}

                <div className="signatures">
                  <div>
                    <div className="sign-line" />
                    <p>{certificateData.veterinarian?.name || 'Veterinarian'}</p>
                    {certificateData.veterinarian?.specialization && (
                      <p style={{fontSize: '0.8em', color: '#666'}}>{certificateData.veterinarian.specialization}</p>
                    )}
                  </div>
                  <div>
                    <div className="sign-line" />
                    <p>{certificateData.authorizedOfficer?.name || 'Authorized Officer'}</p>
                    {certificateData.authorizedOfficer?.role && (
                      <p style={{fontSize: '0.8em', color: '#666'}}>{certificateData.authorizedOfficer.role.charAt(0).toUpperCase() + certificateData.authorizedOfficer.role.slice(1)}</p>
                    )}
                  </div>
                </div>

                <div className="cert-dates">
                  <p><strong>Certificate Issued:</strong> {certificateDate.toLocaleDateString()}</p>
                  {certificateData.veterinarian?.reviewDate && (
                    <p><strong>Veterinary Review:</strong> {new Date(certificateData.veterinarian.reviewDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="cert-footer">
              <p>StreetToSweet - Caring for street dogs • www.streettosweet.example</p>
              <p style={{fontSize: '0.8em', color: '#888'}}>This certificate is valid and verifiable with ID: {certificateData.certificateId}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdoptionCertificate;

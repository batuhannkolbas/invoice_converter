import React, { useState, useCallback } from 'react';
import './App.css';
import logo1 from './logo1.png';
import { FaFileUpload, FaLightbulb, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';

function App() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
    setPreviewData(null);
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
      setPreviewData(null);
    }
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Lütfen en az bir dosya seç.");
      return;
    }

    setIsLoading(true);

    try {
      const previewFormData = new FormData();
      previewFormData.append('file', files[0]);

      const previewResponse = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: previewFormData,
      });

      if (previewResponse.ok) {
        const preview = await previewResponse.json();
        setPreviewData(preview);
      }

      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('http://localhost:8000/uploadfiles/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("İşlem başarısız");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_results_${new Date().getTime()}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      console.error("Hata:", error);
      alert(`Hata oluştu: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      {/* Sol Bilgilendirme Konteynırı */}
      <div className="info-container left-container">
        <h2><FaInfoCircle /> OCR Technology</h2>
        <div className="info-card">
          <h3>Optical Character Recognition</h3>
          <p>We scan written texts and transfer them to digital media. Thanks to this technology:</p>
          <ul>
            <li><FaCheckCircle /> All texts on invoices are being recognized.</li>
            <li><FaCheckCircle /> Even complex texts can be read</li>
            <li><FaCheckCircle /> English and Turkish languages are being supported</li>
          </ul>
        </div>
        <div className="info-card">
          <h3>Supported file types</h3>
          <div className="file-types">
            <div className="file-type">
              <div className="file-icon pdf">PDF</div>
              <span>PDF Docs</span>
            </div>
            <div className="file-type">
              <div className="file-icon img">IMG</div>
              <span>PNG and JPEG files</span>
            </div>
          </div>
        </div>
      </div>

      {/* Merkez İçerik */}
      <div className="container">
        <img src={logo1} alt="Fatura Logo" className="logo" />
        <h1>Invoice Processing Platform</h1>

        <div 
          className={`upload-box ${isDragging ? 'dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="upload-icon">
            <FaFileUpload size={48} />
          </div>
          <label htmlFor="file-upload" className="custom-upload-btn">
            {files.length > 0 
              ? `${files.length} file selected` 
              : isDragging 
                ? "Drop your file here" 
                : " Select your file"}
          </label>
          <input 
            id="file-upload"
            type="file" 
            multiple 
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg"
          />
          <div className="drag-drop-text">
            {isDragging ? "Drop!" : "You can drag and drop PDF, PNG or JPEG files"}
          </div>
        </div>

        <button 
          onClick={handleUpload} 
          disabled={isLoading || files.length === 0}
          className="process-btn"
        >
          {isLoading ? 'Processing' : 'Analyze and Download'}
        </button>

        {previewData && (
          <div className="preview-section">
            <h3>Önemli Bilgiler:</h3>
            <div className="entities-grid">
              {previewData.entities.slice(0, 5).map((item, index) => (
                <div key={index} className="entity-card">
                  <span className="entity-text">{item.Text}</span>
                  <span className={`entity-label ${item.Label.toLowerCase()}`}>
                    {item.Label}
                  </span>
                </div>
              ))}
            </div>
            {previewData.entities.length > 5 && (
              <p>+ {previewData.entities.length - 5} daha...</p>
            )}
          </div>
        )}
      </div>

      {/* Sağ Bilgilendirme Konteynırı */}
      <div className="info-container right-container">
        <h2><FaLightbulb /> NER Model</h2>
        <div className="info-card">
          <h3>Named Entity Recognition</h3>
          <p>Automatically recognizes and classifies important information in text:</p>
          <div className="entity-examples">
            <div className="entity-example">
              <span className="entity-badge person">Person</span>
              <span>Person Names</span>
            </div>
            <div className="entity-example">
              <span className="entity-badge organization">Org</span>
              <span>Organization Namess</span>
            </div>
            <div className="entity-example">
              <span className="entity-badge date">Date</span>
              <span>Invoice Dates</span>
            </div>
            <div className="entity-example">
              <span className="entity-badge money">Price</span>
              <span>Payment amounts</span>
            </div>
          </div>
        </div>
        <div className="info-card">
          <h3>How it works?</h3>
          <ol className="how-it-works">
            <li>Upload your file</li>
            <li>Extract text with OCR</li>
            <li>Important information is recognized with NER</li>
            <li>Results are downloaded</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import './App.css';
import logo1 from './logo1.png';

function App() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
    setPreviewData(null); // Yeni dosya seçildiğinde önceki önizlemeyi temizle
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Lütfen en az bir dosya seç.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Önce önizleme verisini çek
      const previewFormData = new FormData();
      previewFormData.append('file', files[0]); // Sadece ilk dosya için önizleme

      const previewResponse = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: previewFormData,
      });

      if (previewResponse.ok) {
        const preview = await previewResponse.json();
        setPreviewData(preview);
      }

      // 2. Tüm dosyaları işle ve ZIP indir
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
      link.download = `invoice_results_${new Date().getTime()}.zip`; // Benzersiz isim
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
      <div className="container">
        <img src={logo1} alt="Fatura Logo" className="logo" />
        <h1>Invoice Processing Platform</h1>

        <div className="upload-box">
          <label htmlFor="file-upload" className="custom-upload-btn">
            {files.length > 0 
              ? `${files.length} dosya seçildi` 
              : "Dosya Seç (PDF/Resim)"}
          </label>
          <input 
            id="file-upload"
            type="file" 
            multiple 
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg"
          />
        </div>

        <button 
          onClick={handleUpload} 
          disabled={isLoading || files.length === 0}
          className="process-btn"
        >
          {isLoading ? 'İşleniyor...' : 'Analiz Et & İndir'}
        </button>

        {/* Önizleme Alanı */}
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
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import './App.css';
import logo1 from './logo1.png'; // Logonu doğru klasöre koyduğundan emin ol

function App() {
  const [files, setFiles] = useState([]);

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files)); // Çoklu dosya desteği
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Lütfen en az bir dosya seç.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/uploadfiles/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Yükleme başarısız.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'output_files.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Hata:", error);
      alert("Bir şeyler ters gitti.");
    }
  };

  return (
    <div className="App">
      <div className="container">
        <img src={logo1} alt="Fatura Logo" className="logo1" />
        <h1>Invoice Processing Platform</h1>

        <input type="file" multiple onChange={handleFileChange} />
        <button onClick={handleUpload}>Download</button>
      </div>
    </div>
  );
}

export default App;

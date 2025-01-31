import React, { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "./App.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min",
  import.meta.url
).toString();

Modal.setAppElement("#root");

const App = () => {
  const [documents, setDocuments] = useState(() => {
    const savedDocs = localStorage.getItem("documents");
    return savedDocs ? JSON.parse(savedDocs) : Array(9).fill(null);
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDocIndex, setSelectedDocIndex] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [extractions, setExtractions] = useState([]);
  const pdfViewerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("documents", JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    if (selectedDoc) {
      setExtractions(
        Array.from({ length: 4 }, (_, i) => ({
          extraction: `Extraction ${i + 1}`,
          page: Math.floor(Math.random() * (numPages || 10)) + 1,
        }))
      );
    }
  }, [selectedDoc, numPages]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const newDocs = [...documents];
      newDocs[selectedDocIndex] = {
        name: file.name,
        uploadDate: new Date().toLocaleDateString(),
        fileData: reader.result,
      };
      setDocuments(newDocs);
      setPdfFile(reader.result);
      setModalIsOpen(false);
    };
  };

  const openUploadModal = (index) => {
    setSelectedDocIndex(index);
    setModalIsOpen(true);
  };

  const openDocumentModal = (index) => {
    setSelectedDoc(documents[index]);
    setPdfFile(documents[index].fileData);
  };

  const goToPage = (page) => {
    if (pdfViewerRef.current) {
      pdfViewerRef.current.scrollTo({
        top: (page - 1) * 600,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="container">
      <img src="/images/logo.svg" alt="Logo" className="logo" />
      <div className="grid">
        {documents.map((doc, index) => (
          <div
            key={index}
            className="document-box"
            onClick={() =>
              doc ? openDocumentModal(index) : openUploadModal(index)
            }
          >
            <p>Legal Document {index + 1}</p>
            {doc && (
              <div>
                <p>Uploaded On: {doc.uploadDate}</p>
                <p>File Name: {doc.name}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}>
        <h2>Upload Document</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
        />
        <button onClick={() => setModalIsOpen(false)}>Cancel</button>
      </Modal>

      {selectedDoc && (
        <Modal isOpen={true} onRequestClose={() => setSelectedDoc(null)}>
          <div className="modal-header">
            <h2>{selectedDoc.name}</h2>
            <button
              className="close-button"
              onClick={() => setSelectedDoc(null)}
            >
              X
            </button>
          </div>
          <div className="document-details">
            <div className="pdf-viewer scrollable" ref={pdfViewerRef}>
              <Document
                file={pdfFile}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                ))}
              </Document>
            </div>
            <div className="extractions">
              <h3>Mock Extractions</h3>
              {extractions.map((ext, i) => (
                <p key={i}>
                  {ext.extraction} - Page {ext.page}
                  <button
                    style={{ marginLeft: "10px" }}
                    onClick={() => goToPage(ext.page)}
                  >
                    Go To Page
                  </button>
                </p>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default App;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { beUrl } from "../constants";

export default function CloudStorage() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({ message: "", isError: false });
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileType, setFileType] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${beUrl}/files`);
      setFiles(response.data);
      setUploadStatus({ message: "", isError: false });
    } catch (error) {
      console.error("Error fetching files:", error);
      setUploadStatus({ message: "Failed to load files", isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadStatus({ message: "Uploading...", isError: false });
      await axios.post(`${beUrl}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadStatus({ message: "File uploaded successfully!", isError: false });
      await fetchFiles();
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus({ message: "Upload failed!", isError: true });
    }
  };

  const handleDownload = (filename) => {
    const link = document.createElement("a");
    link.href = `${beUrl}/download/${filename}`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`Are you sure you want to delete ${filename}?`)) return;

    try {
      await axios.delete(`${beUrl}/delete/${filename}`);
      if (selectedFile === filename) {
        setSelectedFile(null);
        setPreviewUrl("");
      }
      await fetchFiles();
    } catch (error) {
      console.error("Delete error:", error);
      setUploadStatus({ message: "Delete failed!", isError: true });
    }
  };

  const handlePreview = (file) => {
    setSelectedFile(file.name);
    setPreviewUrl(`${beUrl}/download/${file.name}`);
    setFileType(file.type);
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const FileIcon = ({ type }) => {
    if (type.startsWith('image/')) {
      return (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    if (type.startsWith('video/')) {
      return (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    }
    if (type.startsWith('audio/')) {
      return (
        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">Cloud Storage</h1>
          <p className="mt-2 opacity-90">Store and manage all your files</p>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Upload Section */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Upload Files</h2>
                <p className="text-sm text-gray-600">Supports all file types</p>
              </div>
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Select File
                <input type="file" onChange={handleUpload} className="hidden" />
              </label>
            </div>
            {uploadStatus.message && (
              <div className={`mt-3 px-3 py-2 rounded text-sm ${uploadStatus.isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {uploadStatus.message}
              </div>
            )}
          </div>

          {/* File List */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Files</h2>
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : files.length === 0 ? (
              <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <p className="mt-2">No files uploaded yet</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {files.map((file) => (
                    <li 
                      key={file.name} 
                      className={`p-4 hover:bg-gray-100 transition-colors ${selectedFile === file.name ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex items-center flex-1 cursor-pointer min-w-0"
                          onClick={() => handlePreview(file)}
                        >
                          <div className="flex-shrink-0 mr-3">
                            <FileIcon type={file.type} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(file.name);
                            }}
                            className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors"
                          >
                            Download
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(file.name);
                            }}
                            className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Preview Section */}
          
          {previewUrl && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Preview</h2>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium mb-2 text-gray-900">{selectedFile}</h3>
                <div className="mt-4">
                  {fileType.startsWith("image/") && (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-w-full h-auto max-h-[500px] mx-auto border rounded-lg shadow-sm" 
                    />
                  )}
                  {fileType.startsWith("video/") && (
                    <video 
                      controls 
                      className="w-full max-h-[500px] mx-auto border rounded-lg shadow-sm"
                    >
                      <source src={previewUrl} type={fileType} />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  {fileType.startsWith("audio/") && (
                    <div className="w-full p-4 bg-gray-50 rounded-lg">
                      <audio controls className="w-full">
                        <source src={previewUrl} type={fileType} />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                  {!fileType.startsWith("image/") && 
                   !fileType.startsWith("video/") && 
                   !fileType.startsWith("audio/") && (
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <FileIcon type={fileType} className="mx-auto w-16 h-16 mb-4" />
                      <p className="text-gray-700">No preview available for this file type</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
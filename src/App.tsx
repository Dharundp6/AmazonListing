import React, { useState, useRef } from 'react';
import { Upload, Download, Plus, X, FileImage, Package, Settings, Eye, Trash2, Check, AlertCircle } from 'lucide-react';

const AmazonImageProcessor = () => {
  const [asinCodes, setAsinCodes] = useState(['']);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processingStatus, setProcessingStatus] = useState('idle'); // idle, processing, completed, error
  const [processedImages, setProcessedImages] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [processingLog, setProcessingLog] = useState([]);
  const fileInputRef = useRef(null);

  const variantOrder = [
    "MAIN", "FRNT", "SIDE", "BACK", "PT01", 
    "PT02", "PT03", "PT04", "PT05", "PT06"
  ];

  const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.tif', '.tiff'];

  const addAsinCode = () => {
    setAsinCodes([...asinCodes, '']);
  };

  const removeAsinCode = (index) => {
    if (asinCodes.length > 1) {
      setAsinCodes(asinCodes.filter((_, i) => i !== index));
    }
  };

  const updateAsinCode = (index, value) => {
    const newCodes = [...asinCodes];
    newCodes[index] = value.toUpperCase();
    setAsinCodes(newCodes);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => 
      supportedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    );
    
    const filesWithPreview = validFiles.map((file, index) => ({
      file,
      name: file.name,
      preview: URL.createObjectURL(file),
      id: Date.now() + index,
      variant: variantOrder[index] || `PT${String(index - 5).padStart(2, '0')}`
    }));

    setUploadedFiles(filesWithPreview);
    setCurrentStep(2);
  };

  const removeFile = (id) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(file => file.id !== id);
      // Reassign variants based on new order
      return updated.map((file, index) => ({
        ...file,
        variant: variantOrder[index] || `PT${String(index - 5).padStart(2, '0')}`
      }));
    });
  };

  const processImages = () => {
    if (asinCodes.filter(code => code.trim()).length === 0 || uploadedFiles.length === 0) {
      return;
    }

    setProcessingStatus('processing');
    setProcessingLog([]);
    const processed = [];
    const logs = [];

    const validAsins = asinCodes.filter(code => code.trim());
    const maxVariants = Math.min(uploadedFiles.length, variantOrder.length);

    logs.push(`🚀 Starting processing for ${validAsins.length} ASINs with ${maxVariants} variants`);

    validAsins.forEach((asin, asinIndex) => {
      logs.push(`📦 Processing ASIN ${asinIndex + 1}/${validAsins.length}: ${asin}`);
      
      uploadedFiles.slice(0, maxVariants).forEach((fileObj, variantIndex) => {
        const variant = variantOrder[variantIndex];
        const newName = `${asin}.${variant}${getFileExtension(fileObj.name)}`;
        
        processed.push({
          id: `${asin}-${variant}`,
          asin,
          variant,
          originalName: fileObj.name,
          newName,
          preview: fileObj.preview,
          file: fileObj.file
        });

        logs.push(`   ✅ ${fileObj.name} → ${newName}`);
      });
    });

    setProcessedImages(processed);
    setProcessingLog(logs);
    setProcessingStatus('completed');
    setCurrentStep(3);
  };

  const getFileExtension = (filename) => {
    return filename.substring(filename.lastIndexOf('.'));
  };

  const downloadZip = async () => {
    // In a real implementation, you would create a zip file here
    // For this demo, we'll simulate the download
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-');
    const zipName = `Amazon_Images_${timestamp}.zip`;
    
    // Create a blob with some sample content (in reality, you'd zip the actual files)
    const blob = new Blob(['Sample ZIP content'], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = zipName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetProcess = () => {
    setAsinCodes(['']);
    setUploadedFiles([]);
    setProcessedImages([]);
    setProcessingStatus('idle');
    setCurrentStep(1);
    setProcessingLog([]);
    setShowPreview(false);
  };

  const getStepStatus = (step) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Amazon Image Processor
          </h1>
          <p className="text-gray-600">
            Professional tool for renaming and organizing Amazon product images
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  getStepStatus(step) === 'completed' ? 'bg-green-500 text-white' :
                  getStepStatus(step) === 'current' ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {getStepStatus(step) === 'completed' ? <Check size={20} /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 transition-all duration-300 ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-center space-x-16 text-sm text-gray-600">
            <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : ''}>
              ASIN Setup
            </span>
            <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : ''}>
              Upload Images
            </span>
            <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : ''}>
              Process & Download
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          {/* Step 1: ASIN Codes */}
          <div className={`transition-all duration-300 ${currentStep === 1 ? 'block' : 'hidden'}`}>
            <div className="flex items-center mb-6">
              <Package className="text-blue-500 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-gray-800">Step 1: Configure ASIN Codes</h2>
            </div>
            
            <div className="space-y-4">
              {asinCodes.map((asin, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={asin}
                      onChange={(e) => updateAsinCode(index, e.target.value)}
                      placeholder="Enter ASIN code (e.g., B0FFNGWMV9)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono"
                      maxLength={10}
                    />
                  </div>
                  <button
                    onClick={() => removeAsinCode(index)}
                    disabled={asinCodes.length === 1}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              
              <button
                onClick={addAsinCode}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Plus size={20} />
                <span>Add Another ASIN</span>
              </button>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={asinCodes.filter(code => code.trim()).length === 0}
                className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Continue to Upload Images
              </button>
            </div>
          </div>

          {/* Step 2: Upload Images */}
          <div className={`transition-all duration-300 ${currentStep === 2 ? 'block' : 'hidden'}`}>
            <div className="flex items-center mb-6">
              <FileImage className="text-blue-500 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-gray-800">Step 2: Upload Product Images</h2>
            </div>

            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={supportedExtensions.join(',')}
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 cursor-pointer transition-colors duration-200"
              >
                <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-xl font-semibold text-gray-600 mb-2">
                  Click to upload product images
                </p>
                <p className="text-gray-500">
                  Supported formats: JPG, JPEG, PNG, GIF, TIF, TIFF
                </p>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Uploaded Images ({uploadedFiles.length})
                  </h3>
                  <div className="text-sm text-gray-500">
                    Variants: {uploadedFiles.slice(0, variantOrder.length).map(f => f.variant).join(', ')}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {uploadedFiles.map((fileObj, index) => (
                    <div key={fileObj.id} className="bg-gray-50 rounded-lg p-4 relative">
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => removeFile(fileObj.id)}
                          className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      <img
                        src={fileObj.preview}
                        alt={fileObj.name}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                      
                      <div className="text-sm">
                        <p className="font-medium text-gray-700 truncate">{fileObj.name}</p>
                        <p className="text-blue-600 font-semibold">→ {fileObj.variant}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Back to ASINs
                  </button>
                  <button
                    onClick={processImages}
                    disabled={uploadedFiles.length === 0}
                    className="px-8 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Process Images
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Processing & Download */}
          <div className={`transition-all duration-300 ${currentStep === 3 ? 'block' : 'hidden'}`}>
            <div className="flex items-center mb-6">
              <Settings className="text-blue-500 mr-3" size={28} />
              <h2 className="text-2xl font-bold text-gray-800">Step 3: Processing Complete</h2>
            </div>

            {processingStatus === 'processing' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Processing images...</p>
              </div>
            )}

            {processingStatus === 'completed' && (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <Check className="text-green-500 mr-3" size={24} />
                    <div>
                      <p className="text-green-800 font-semibold">Processing Complete!</p>
                      <p className="text-green-600 text-sm">
                        {processedImages.length} images processed for {asinCodes.filter(c => c.trim()).length} ASINs
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Processing Log */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Processing Log</h3>
                    <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto">
                      {processingLog.map((log, index) => (
                        <div key={index} className="text-sm text-gray-600 mb-1 font-mono">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Generated Files Preview</h3>
                    <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto">
                      {processedImages.slice(0, 10).map((img, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <img src={img.preview} alt="" className="w-8 h-8 object-cover rounded" />
                            <span className="text-sm font-mono text-gray-700">{img.newName}</span>
                          </div>
                          <span className="text-xs text-gray-500">{img.variant}</span>
                        </div>
                      ))}
                      {processedImages.length > 10 && (
                        <div className="text-center text-sm text-gray-500 mt-2">
                          ... and {processedImages.length - 10} more files
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center space-x-4 mt-8">
                  <button
                    onClick={resetProcess}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Start New Process
                  </button>
                  <button
                    onClick={downloadZip}
                    className="px-8 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Download size={20} />
                    <span>Download ZIP</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {asinCodes.filter(code => code.trim()).length}
              </div>
              <div className="text-sm text-gray-600">ASIN Codes</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {uploadedFiles.length}
              </div>
              <div className="text-sm text-gray-600">Images Uploaded</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {Math.min(uploadedFiles.length, variantOrder.length)}
              </div>
              <div className="text-sm text-gray-600">Variants Used</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">
                {processedImages.length}
              </div>
              <div className="text-sm text-gray-600">Files Generated</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmazonImageProcessor;
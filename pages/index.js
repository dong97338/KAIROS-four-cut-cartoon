import { useState, useRef } from 'react';

export default function Home() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState([]);
  const dropAreaRef = useRef(null);

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    updateFilesAndPreviews(droppedFiles);
  };

  const updateFilesAndPreviews = (newFiles) => {
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    updatedFiles.forEach(file => previewFile(file));
  };

  const previewFile = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreviews(prevPreviews => [...prevPreviews, reader.result]);
    };
  };

// ...

const onUpload = () => {
	const formData = new FormData();
	files.forEach(file => formData.append('files', file));
	formData.append('prompt', prompt);
	formData.append('negativePrompt', negativePrompt);
	
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 120000); // 120초 후 타임아웃
  
	// 서버 엔드포인트에 POST 요청 보내기
	fetch('/api/generateImages', {
	  method: 'POST',
	  body: formData,
	  signal: controller.signal
	})
	.then(response => response.json())
	.then(data => {
		const imageUrls = data.imagePaths.map(imagePath => `/api/image/${imagePath.split('/').pop()}`);
		console.log(imageUrls);
		setGeneratedImages(imageUrls);
	})

	.catch(error => {
	  console.error('Error:', error);
	})
	.finally(() => clearTimeout(timeoutId));
  };

  return (
    <div>
      <h1>이미지 업로드</h1>
      <div
        ref={dropAreaRef}
        onDragOver={onDragOver}
        onDrop={onDrop}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '20px',
          width: '300px',
          minHeight: '200px',
          padding: '10px',
          textAlign: 'center',
          margin: '10px',
          position: 'relative',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {previews.map((preview, index) => (
          <img
            key={index}
            src={preview}
            alt="Preview"
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'cover',
              margin: '5px',
              flex: '0 0 auto',
            }}
          />
        ))}
        {!previews.length && "여기에 파일을 드래그하세요"}
      </div>
      <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="프롬프트 입력" />
      <input type="text" value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} placeholder="네거티브 프롬프트 입력" />
      <button onClick={onUpload}>업로드</button>

      {/* 생성된 이미지 표시 */}
	  {console.log(generatedImages)}
      {generatedImages.length > 0 && (
        <div>
          <h2>생성된 이미지</h2>
          <div>
            {generatedImages.map((imageUrl, index) => (
              <img
                key={index}
                src={imageUrl}
                alt={`Generated Image ${index + 1}`}
                style={{
                  width: '200px',
                  height: '200px',
                  objectFit: 'cover',
                  margin: '10px',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { Stepper, Step, Button, Typography } from "@material-tailwind/react";

const CameraCapture = () => {
	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const [video, setVideo] = useState(null);

	useEffect(() => {
		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices.getUserMedia({ video: true })
				.then(stream => {
					let videoEl = videoRef.current;
					videoEl.srcObject = stream;
					videoEl.play();
					setVideo(videoEl);
				})
				.catch(error => {
					console.error('Camera access denied or error in stream:', error);
				});
		}
	}, []);

	const captureImage = () => {
		if (!video) {
			console.error('Video not available');
			return;
		}

		const canvasEl = canvasRef.current;
		console.log('Video dimensions:', video.videoWidth, video.videoHeight);

		canvasEl.width = video.videoWidth;
		canvasEl.height = video.videoHeight;
		canvasEl.getContext('2d').drawImage(video, 0, 0);

		const imageData = canvasEl.toDataURL('image/png');
		localStorage.setItem('capturedImage', imageData);

		window.location.href = 'camera2.html';
	};

	return (
		<div>
			<div className='h-full w-full rounded-lg border-dashed border-4 border-gray-400'>
				<video className="px-4 py-4" ref={videoRef} style={{ width: '100%' }}></video>
			</div>
			<div class="flex justify-end">
				<Button className='mt-4' onClick={captureImage}>Capture</Button>
			</div>

			<canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
		</div>
	);
};

export default CameraCapture;

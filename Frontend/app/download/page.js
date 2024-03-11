'use client';

import React, {useEffect, useState} from 'react';
import { useRouter } from 'next/navigation' 
import { saveAs } from 'file-saver'
import Image from 'next/image';
import { Carousel } from '@material-tailwind/react';
import { QRCodeSVG } from 'qrcode.react'

import { Card, CardHeader, CardBody, CardFooter, Typography, Button } from "@material-tailwind/react";

const handleImageClick = () => {
  alert('클릭 성공');
};
const dummy = 'complete_dummy.jpg';
const Page = () => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [isMobile, setIsMobile] = useState(true);
  const {taskId}=useRouter().query ?? {}; //your-page-path?taskId=${taskId}에서 taskId를 가져옴
  const [imgUrl, setImgUrl] = useState(''); //이미지 다운로드 url

  const url = endpoint => `${process.env.NODE_ENV == 'development' ? 'http://216.153.57.204:8080' : ''}/api/${endpoint}`;

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);
  useEffect(() => { setIsMobile(window.innerHeight > window.innerWidth) }, []);
  useEffect(() => {
    console.log(isMobile ? "모바일 환경입니다." : "데스크탑 환경입니다.");
  }, [isMobile]);
//처음 로드될 때 서버에서 이미지 다운로드
  useEffect(() => {
    setImgUrl(url(`download/${taskId}`)),[] //서버 fetch할 때는 /taskid바로
  })






  return (
    <div className='w-full h-screen p-12'>
      <div className="w-full justify-normal bg-white rounded-2xl divide-x flex flex-row mx-auto">
        <Card className="w-96 border-e-4">
          <CardHeader shadow={false} floated={false} className="h-96">
            {([imgUrl] || [dummy]).map((imageUrl, index) =>
              <img key={index} src={imageUrl} alt="card-image" className="h-full w-full object-cover" />
            )}
          </CardHeader>
          <CardBody>
            <div className="mb-2 flex items-center justify-between">
              <Typography color="blue-gray" className="font-medium">
                드래곤 타는 이야기
              </Typography>
              <Typography color="blue-gray" className="font-medium">
                KAIROS
              </Typography>
            </div>

          </CardBody>
          <CardFooter className="pt-0">
            <a href={imgUrl} download='4cut.png'>
              <Button
                ripple={false}
                fullWidth={true}
                className="bg-blue-gray-900/10 text-blue-gray-900 shadow-none hover:scale-105 hover:shadow-none focus:scale-105 focus:shadow-none active:scale-100"
              >
                Download
              </Button>
            </a>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Page;

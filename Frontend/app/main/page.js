'use client'
import React, {useEffect, useRef, useState} from 'react'
import {Typography, Button} from '@material-tailwind/react'
import {useRouter} from 'next/navigation'


const images = ['example1.png', 'example2.png', 'example3.png', 'example4.png', 'example1.png', 'example2.png', 'example3.png', 'example4.png']

const Slider = () => {
  const [offset, setOffset] = useState(0)
  const sliderRef = useRef(null)
  const imageWidth = 300 // 각 이미지의 너비, 실제 이미지 너비에 맞게 조정해야 할 수 있습니다.
  const slideSpeed = 1 // 슬라이드 속도, 필요에 따라 조정
  const router=useRouter();
  useEffect(() => {
    // 이미지 배열을 두 번 연결하고, 해당 배열의 총 너비를 계산합니다.
    const totalWidth = images.length * imageWidth * 2

    const slide = () => {
      setOffset(prevOffset => {
        const newOffset = prevOffset + slideSpeed
        // 총 너비를 초과하는 경우, 오프셋을 이미지 배열의 처음 너비만큼 빼서 순간 이동시킵니다.
        if (newOffset >= totalWidth / 2) {
          return newOffset - totalWidth / 2
        }
        return newOffset
      })
    }

    const intervalId = setInterval(slide, 10) // 40ms마다 슬라이드

    return () => clearInterval(intervalId) // 컴포넌트가 언마운트될 때 인터벌을 정리합니다.
  }, [])

  return (
    <div className="w-full">
      <Typography variant="h2" className="p-10 text-center">
        동화네컷
      </Typography>
      <div className="overflow-hidden whitespace-nowrap" ref={sliderRef}>
        <div style={{transform: `translateX(-${offset}px)`}}>
          {images.concat(images).map((image, index) => (
            <img key={index} src={image} alt={`Slide ${index}`} className="inline-block h-auto" style={{width: `${imageWidth}px`}} />
          ))}
        </div>
      </div>
      <div className="fixed bottom-24 left-0 right-0 flex justify-center">
        <Button size="lg" color="orange" className="rounded-full" onClick={()=>router.push('/make')}>
          시작하기
        </Button>
      </div>
    </div>
  )
}

export default () => {
  return (
    <div className="App">
      <Slider />
    </div>
  )
}

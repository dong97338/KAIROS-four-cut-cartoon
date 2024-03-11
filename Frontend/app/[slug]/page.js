'use client'

import React, {useEffect, useState} from 'react'
import {saveAs} from 'file-saver'
import Image from 'next/image'
import {Carousel} from '@material-tailwind/react'
import {QRCodeSVG} from 'qrcode.react'
import {useRouter} from 'next/navigation'

import {Card, CardHeader, CardBody, CardFooter, Typography, Button} from '@material-tailwind/react'

const dummy = 'complete_dummy.jpg'
const Page = ({params}) => {
  const [currentUrl, setCurrentUrl] = useState('')
  const [isMobile, setIsMobile] = useState(true)
  // let { image } = params.slug //ssg 단계에서는 query가 없을 수 있음: https://chat.openai.com/share/688c3d25-4a28-4ad9-a021-ff71ecd9d336
  const image = decodeURIComponent(params.slug)

  const router = useRouter()


  useEffect(() => 
    setCurrentUrl(window.location.href)
  , [])
  useEffect(() => {
    setIsMobile(window.innerHeight > window.innerWidth)
  }, [])

  return (
    <div className="h-screen w-full p-12">
      <div className="mx-auto flex w-full flex-row justify-normal divide-x rounded-2xl bg-white">
        <Card className="w-96 border-e-4">
          <CardHeader shadow={false} floated={false} className="h-auto">
            <img src={image || dummy} alt="card-image" className="h-full w-full object-cover" />
          </CardHeader>
          <CardBody>
            <div className="mb-2 flex items-center justify-between">
              <Typography color="blue-gray" className="font-medium">
                {/* 드래곤 타는 이야기 */}
              </Typography>
              <Typography color="blue-gray" className="font-medium">
                KAIROS
              </Typography>
            </div>
          </CardBody>
          <CardFooter className="pt-0">
            <a href={image || dummy} download="4cut.png">
              <Button
                ripple={false}
                fullWidth={true}
                className="bg-blue-gray-900/10 text-blue-gray-900 shadow-none hover:scale-105 hover:shadow-none focus:scale-105 focus:shadow-none active:scale-100">
                Download
              </Button>
            </a>
          </CardFooter>
        </Card>
        {!isMobile && (
          <div className="flex w-96 flex-col place-items-center justify-center">
            <QRCodeSVG value={`${currentUrl}`} />
            <p className="mb-10 text-base text-black">QR</p>
            <div>
              <img
                src="https://t4.ftcdn.net/jpg/06/86/38/05/240_F_686380547_Uo1eGf1lznayp1hguQMumt66Rb5oZLhk.jpg"
                alt="card-image"
                onClick={()=>router.push('..')}
                className="mt-1 h-32 w-32"
                style={{cursor: 'pointer'}}
              />
            </div>
            <p className="text-base text-black">메인 화면</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Page

'use client'

import {useCallback, useRef, useState} from 'react'
import {useRouter} from 'next/navigation'
import Image from 'next/image'
import {CardHeader, CardBody, CardFooter, Stepper, Step, Button, Typography, Card} from '@material-tailwind/react'
import {CameraIcon, UserIcon, PaintBrushIcon, VideoCameraIcon, ArrowDownIcon} from '@heroicons/react/24/outline'
// import {useSpring, animated, useChain} from 'react-spring' //npm install react-spring@8.0.27: https://stackoverflow.com/a/66802388
import {useSpring, animated, useTransition} from '@react-spring/web'
import {motion} from 'framer-motion'
import { CardImage } from '@/public/images'
import Webcam from 'react-webcam'

const db = {story: ['원령공주 이야기', '팀플스토리', '긱사네컷'], gender: ['남자', '여자']}
const cardImages = {story: ['/지브리.png', '/팀플스토리.png', '/긱사네컷.png'], gender: ['/팀플스토리.png', '/지브리.png']}
const details = {
  '원령공주 이야기': '지브리의 원령공주 속으로 들어가, 신비로운 늑대를 만나, 함께 마음껏 달려보세요',
  팀플스토리: '토이스토리 스타일 주인공이 되어, 주변 캐릭터와 팀플하는 이야기',
  긱사네컷: '내가 해리포터 영화 속 주인공이라면? 나랑 어울리는 호그와트 기숙사는 어디일지 알아보세요.'
}
const dummy = 'The place is close to Barceloneta Beach and bus stop just 2 min by walk and near to &quot;Naviglio&quot; where you can enjoy the main night life in Barcelona.'
const steps = [
  [CameraIcon, '사진'],
  [PaintBrushIcon, '스토리'],
  [UserIcon, '성별']
]
const backgroundImages = ['/transparent.png', '/autumn.jpg', '/dawn.jpg', '/snow.jpg', '/space.jpg']

const InteractiveCard = ({children, className}) => {
  const [{xyso}, api] = useSpring(() => ({}))
  const style = {
    transform: xyso?.interpolate((x, y, s) => `perspective(350px) rotateX(${6 * y - 3}deg) rotateY(${-(6 * x - 3)}deg) scale(${s})`),
    background: xyso?.interpolate((x, y, s, o) => `radial-gradient(500px at ${100 * x}% ${100 * y}%, rgb(255 255 255/${0.5 * o}), transparent, rgb(0 0 0/${0.2 * o}))`)
  }
  const handleMouseMove = e => {
    const {left, top, width, height} = e.currentTarget.getBoundingClientRect()
    api({xyso: [(e.clientX - left) / width, (e.clientY - top) / height, 1.05, 0.8], config: {mass: 1, friction: 10}})
  }
  const handleMouseOut = () => api({xyso: [0.5, 0.5, 1, 0], config: {mass: 10, tension: 350, friction: 30, precision: 0.001}})
  handleMouseOut()
  return (
    <animated.div className={`${className} rounded-3xl`} onMouseMove={handleMouseMove} onMouseOut={handleMouseOut} style={style}>
      {children}
    </animated.div>
  )
}

// const Cir = () => {
//   const r = 50
//   const o1Ref = useSpring
//   const [{o1}, api1] = useSpring(() => ({}))
//   const [{o2}, api2] = useSpring(() => ({}))
//   const enter = () => api1({o1: 0, onChange: v => v.o1 > 1.5 && api2({o2: 0})})
//   const out = () => api2({o2: 2, onChange: v => v.o2 < 0.5 && api1({o1: 2})})
//   // out()
//   return (
//     <div className="relative -rotate-90 fill-none stroke-black [&_*]:size-[100px]" onMouseEnter={enter} onMouseOut={out}>
//       <svg className="absolute ">
//         <animated.circle cx={r} cy={r} r={r} className=" " strokeDasharray={2 * Math.PI * r} strokeDashoffset={o1?.interpolate(o1 => `${Math.PI * r * o1}`)} />
//       </svg>
//       <svg className="absolute">
//         <animated.circle cx={r} cy={r} r={r} strokeWidth="2" strokeDasharray={2 * Math.PI * r} strokeDashoffset={o2?.interpolate(o2 => `${Math.PI * r * o2}`)} />
//       </svg>
//     </div>
//   )
// }

export default function StepperWithContent() {
  const [activeStep, setActiveStep] = useState(0)
  const [prevStep, setPrevStep] = useState(0) // 방향 상태를 관리하려면 setActiveStep(cur=>(setDirection(cur<i?1:-1),i)) 이렇게 복잡해짐
  const [isLastStep, setIsLastStep] = useState(false)
  const [isFirstStep, setIsFirstStep] = useState(false)
  const [step, setStep] = useState(new Array(db.count).fill(-1)) // [스토리/장르, 성별]
  const [webcamLoaded, setWebcamLoaded] = useState(false)
  const [imgSrc, setImgSrc] = useState(null)
  const [queuestataus, setQueueStatus] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [index, setIndex] = useState(0) // 현재 이미지 인덱스 상태
  const [backgroundOpacity, setBackgroundOpacity] = useState(0)
  const webcamRef = useRef(null)
  const router = useRouter()
  const capture = useCallback(() => setImgSrc(webcamRef.current.getScreenshot({width: 640, height: 480})), [webcamRef])

  const url = endpoint => `/api/${endpoint}`
  const handleNext = () => !isLastStep && (setPrevStep(activeStep), setActiveStep(cur => cur + 1))
  const handlePrev = () => !isFirstStep && (setPrevStep(activeStep), setActiveStep(cur => cur - 1))
  const generateImages = async () => {
    router.push('/loading')
    const formData = new FormData()
    formData.append('files', new File([await fetch(imgSrc).then(res => res.blob())], 'image.png', {type: 'image/jpeg'}))
    formData.append('db', JSON.stringify(db))
    Object.keys(db).forEach((key, i) => formData.append(key, step[i]))
    console.log('fetching...')
    const taskId = +(await fetch(url('generateImages/1'), {method: 'POST', body: formData}).then(ret => ret.json())).taskId
    global.taskId = taskId
    console.log(`taskId: ${taskId}`)
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(url(`checkStatus/${taskId}`))
        const data = await response.json()
        console.log(`status: ${data.status}`)
        if (+data.status == 0) {
          global.imageUrl = url(`image/${data.imagePath.replaceAll('/', '+')}`)
          clearInterval(intervalId)
          router.push(`/${encodeURIComponent(global.imageUrl)}`)
        }
        if (+data.status == 1) {
          console.log('if status:1')
          setIsLoading(true)
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Status check error:', error)
        clearInterval(intervalId) // 오류 발생 시 인터벌 정지
      }
    }, 1000)
  }

  const transitions = useTransition(activeStep, {
    keys: null,
    from: {opacity: 0, transform: `translate3d(${prevStep < activeStep ? 100 : -100}%,0,0)`},
    enter: {opacity: 1, transform: 'translate3d(0%,0,0)'},
    leave: {opacity: 0, transform: `translate3d(${prevStep < activeStep ? -100 : 100}%,0,0)`},
    config: {precision: 0.0001}
  })

  const [isUp, setIsUp] = useState(false)

  const draw = {
    hidden: i => ({
      pathLength: 1 - i,
      transition: {
        pathLength: {delay: (1 - i) * 0.5, type: 'spring', duration: 1.5, bounce: 0}
      }
    }),
    visible: i => ({
      pathLength: i,
      transition: {
        pathLength: {delay: i * 0.5, type: 'spring', duration: 1.5, bounce: 0}
      }
    })
  }
  const draw2 = {
    hidden: {pathLength: 0},
    visible: {pathLength: 1, transition: {duration: 2}}
  }
  const Cir = () => {
    const r = 50
    return (
      <motion.svg
        className="size-[104px] -rotate-90 fill-none stroke-black"
        onMouseOver={() => setIsUp(true)}
        onMouseLeave={() => setIsUp(false)}
        initial={isUp ? 'hidden' : 'visible'}
        animate={isUp ? 'visible' : 'hidden'}>
        <motion.circle cx="52" cy="52" r="50" variants={draw} custom={0} style={{scaleY: -1}} />
        <motion.circle cx="52" cy="52" r="50" strokeWidth={2} variants={draw} custom={1} />
        {/* <motion.ArrowDownIcon variants={draw2} custom={1} /> */}
      </motion.svg>
    )
  }

  return (
    <div className="h-screen w-full p-12" style={{backgroundImage: `url(${backgroundImages[index]})`, backgroundSize: 'cover', transition: '0.5s ease-out'}}>
      <div className="glass h-full shadow-2xl backdrop-blur-md">
        <div className=" flex h-full w-full  flex-col px-24 py-4">
          <Stepper activeStep={activeStep} isLastStep={setIsLastStep} isFirstStep={setIsFirstStep}>
            {steps.map(([Icon, str], i) => (
              <Step key={i} onClick={() => (setPrevStep(activeStep), setActiveStep(i))}>
                <Icon className="size-5" />
                <div className="absolute -bottom-[4.5rem] w-max text-center">
                  <Typography variant="h6" color={activeStep === i ? 'blue-gray' : 'gray'}>
                    Step {i + 1}
                  </Typography>
                  <Typography color={activeStep === i ? 'blue-gray' : 'gray'} className="font-normal">
                    {str}
                  </Typography>
                </div>
              </Step>
            ))}
          </Stepper>
          <div className="relative mt-24 grow">
            {transitions(
              (style, i) =>
                [
                  <animated.div style={style} className="absolute left-0 right-0 m-auto h-full w-max pb-16 [&_*]:rounded-lg">
                    <div className="aspect-[4/3] max-h-full overflow-hidden border-4 border-dashed border-gray-400">
                      {' '}
                      {/*overflow-hidden이 640, 축소비율 조건 만족*/}
                      {!imgSrc && !webcamLoaded && (
                        <div className="grid h-full animate-pulse bg-gray-300">
                          <VideoCameraIcon className="m-auto size-24 text-gray-500" strokeWidth={2} />
                        </div>
                      )}
                      {imgSrc ? <img src={imgSrc} /> : <Webcam ref={webcamRef} height={480} width={640} screenshotFormat="image/jpeg" onUserMedia={() => setWebcamLoaded(true)} />}
                    </div>
                    <div>
                      <Button className="float-right mt-4" onClick={imgSrc ? () => (setImgSrc(null), setWebcamLoaded(false)) : capture}>
                        {imgSrc ? '다시 찍기' : 'Capture'}
                      </Button>
                    </div>
                  </animated.div>,
                  ...Object.entries(db).map(([key, li], i1) => (
                    <animated.div style={style} className="absolute left-0 right-0 m-auto flex w-full justify-center p-4">
                      {li.map((str, i2) => (
                        <InteractiveCard className="mx-auto mt-6 grid w-96">
                          {/* grid를 하면 가장 높은 카드에 나머지 카드 높이들도 맞춰짐 */}
                          <Card className="glass shadow-2xl backdrop-blur-md">
                            <CardHeader color="blue-gray" className="relative h-56">
                              <Image src={CardImage[key][i2]} alt="card-image" layout="fill" objectFit="cover" priority />
                            </CardHeader>
                            <CardBody>
                              <Typography variant="h5" color="blue-gray" className="mb-2">
                                {str}
                              </Typography>
                              <Typography>{details[str] || dummy}</Typography>
                            </CardBody>
                            <CardFooter className="pt-0">
                              <Button
                                key={`${i1}${i2}`}
                                onClick={() => setStep({...step, [i1]: i2})}
                                onMouseEnter={() => setIndex(i2 + 1)}
                                color={step[i1] == i2 ? 'blue' : 'gray'}>
                                {str}
                              </Button>
                            </CardFooter>
                          </Card>
                        </InteractiveCard>
                      ))}
                    </animated.div>
                  ))
                ][i]
            )}
          </div>
          <div className="flex justify-between">
            <Button onClick={handlePrev} disabled={isFirstStep}>
              Prev
            </Button>
            <Button onClick={() => (isLastStep ? generateImages() : handleNext())} disabled={step?.[activeStep - 1] == -1 || !imgSrc}>
              {isLastStep ? '동화 만들기' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

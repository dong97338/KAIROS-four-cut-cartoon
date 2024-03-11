'use client'

import React from 'react'
import {useRouter} from 'next/navigation'
import {Progress, Spinner, Typography} from '@material-tailwind/react'

export default function ProgressLabel() {
  const [progress, setProgress] = React.useState(0)
  const [currentTextIndex, setCurrentTextIndex] = React.useState(0)
  const [queuestataus, setQueueStatus] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [taskId, setTaskId] = React.useState(0)

  const loadingTexts = ['시나리오를 작성 중이에요.', '멋있는 이미지를 만들고 있어요!', '아름다운 미모를 가지고 있어요!', '조금만 기다리면 완성됩니다!']

  const url = endpoint => `/api/${endpoint}`
  const router = useRouter()

  // const waitForTaskIdChange = () => {
  // 	// taskId가 0이 아닐 때까지 확인
  // 	const checkInterval = setInterval(() => {
  // 	  if (taskId !== 0) {
  // 		console.log(`TaskId updated: ${taskId}`);
  // 		clearInterval(checkInterval); // 인터벌 중단
  // 		checkImageStatus(); // 이미지 상태 확인 시작
  // 	  } else {
  // 		console.log('Waiting for taskId to change...');
  // 	  }
  // 	}, 1000); // 1초마다 확인
  //   };
  // React.useEffect(() => {
  // 	(async () => {
  // 	  setTaskId(await fetch(url('generateImages/1'), { method: 'POST', body: global.formData }).then(ret => ret.json()));
  // 	})();
  //   }, []); // 빈 의존성 배열을 추가하여 마운트 시에만 실행

  // // waitForTaskIdChange()
  // const checkImageStatus = async () => {
  // 	console.log(`checkImageStatus: ${taskId}`)

  // 	// 일정 간격으로 상태 확인
  // 	fetch(url(`checkStatus/${taskId}`)) //여기서 taskId
  // 		.then(response => response.json())
  // 		.then(data => {
  // 			console.log(+data.status);
  // 			setQueueStatus(+data.status);  //큐 개수
  // 			if (+data.status === 0) {
  // 				// 이미지 생성 완료 처리
  // 				const imageUrls = data.imagePaths.map(imagePath => url(`image/${imagePath.replaceAll('/', '+')}`));
  // 				console.log(imageUrls);
  // 				global.imageUrls = imageUrls;
  // 				// setTaskId(0)
  // 				router.push('./../complete');
  // 			}
  // 			if (+data.status === 1) {
  // 				setIsLoading(true);
  // 			} else {
  // 				setIsLoading(false);
  // 			}
  // 		})
  // 		.catch(error => {
  // 			console.error('Status check error:', error);
  // 		})
  // };
  // React.useEffect(() => {
  // 	checkImageStatus();
  // 	const intervalId = setInterval(checkImageStatus, 1000); // 1초마다 대기열 상태를 확인

  // 	return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 인터벌 정리
  // }, []);

  // const interval = setInterval(() => {
  // 	setCurrentTextIndex(currentTextIndex + 1);
  // }, 2000);
  // clearInterval(interval);이렇게 만들면 한 바퀴 돌때마다 텍스트가 깜박거린다.

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTextIndex(oldProgress => {
        return oldProgress + 1
      })
    }, 2000)
    return () => {
      clearInterval(timer)
    }
  }, [])

  const est = 45
  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress(oldProgress => {
        if (oldProgress === est) {
          return 0
        }
        const diff = 0.5
        return Math.min(oldProgress + diff, est)
      })
    }, 500)
    return () => {
      clearInterval(timer)
    }
  }, [])

  // return <Progress value={progress} color="lightBlue" />;
  return (
    <div className='flex h-screen w-full flex-col items-center justify-center '>
      <Spinner className=" h-52 w-52" />
      <Typography variant="h5" color="gray" className="mx-auto mt-48">
        {loadingTexts[currentTextIndex % loadingTexts.length]}
      </Typography>
      <Progress value={parseInt((progress / est) * 100)} label="Completed" className='mt-32'/>;
    </div>
  )
}

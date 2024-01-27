const express = require('express')
const multer = require('multer')
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const path = require('path');


const app = express()
const port = 8080

app.use(require('cors')());
app.use(express.json());

const now = new Date();
const year = now.getFullYear().toString();
const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 월은 0부터 시작하므로 +1
const day = now.getDate().toString().padStart(2, '0');
const hours = now.getHours().toString().padStart(2, '0');
const minutes = now.getMinutes().toString().padStart(2, '0');

const serverStartTime = `data/${year}-${month}-${day}_${hours}${minutes}`;

let prompt, negativePrompt, sampleSteps, styleStrength, guidanceScale;
let numberOfOutputImages=4;


// 폴더 생성
fs.mkdir(serverStartTime, { recursive: true }, (err) => {
  if (err) {
    console.error(`폴더 생성 실패: ${err}`);
  } else {
    console.log(`폴더 생성 성공: ${serverStartTime}`);
  }
});
// 연도-월-일_시간분초 형식의 폴더 이름 생성

let requestCounter = 0;
let imgCounter;

const queueStatus = new Set();
const taskStatus = new Set();

let imagePaths = [];

const storage = multer.diskStorage({
    destination: async(req, file, cb) => cb(null, `${serverStartTime}/${requestCounter}/in/img/`),
    filename: (req, file, cb) => cb(null, `${imgCounter++}.jpg`)
});

const upload = multer({ storage: storage });

// async function generateImages() {
// 	try {
// 	  const { stdout, stderr } = await exec(`python download_models.py ${serverStartTime} ${requestCounter}`);
  
// 	  // 여기에 파일이 생성되었는지 확인하는 로직 추가 가능
  
// 	  // 이미지 경로
// 	  let imagePaths = []
// 	  taskStatus.add(requestCounter)
// 	  for(let i=0;i<numberOfOutputImages;++i)
// 		imagePaths.push(`${serverStartTime}/${requestCounter}/out/${i}.png`)
// 	  return imagePaths;
// 	} catch (error) {
// 	  console.error(`Error: ${error.message}`);
// 	  throw new Error('Image generation failed.');
// 	}
//   }


app.post('/api/generateImages', async(req, res) => {
	const taskId = ++requestCounter;
	queueStatus.add(taskId)
	console.log(queueStatus)
	await fs.promises.mkdir(`${serverStartTime}/${taskId}/in/img`, { recursive: true }),
	console.log(`폴더 생성 성공: ${serverStartTime}/${taskId}/in/img`),
	await fs.promises.mkdir(`${serverStartTime}/${taskId}/out`),
	console.log(`폴더 생성 성공: ${serverStartTime}/${taskId}/out`),
	// await fs.promises.writeFileSync('time.json', JSON.stringify({ serverStartTime, taskId }))
	imgCounter = 0;
	upload.array('files')(req, res, async (err) => {
		res.json({ taskId });
		console.log(`taskId: ${taskId}`)
		if (err) {
		  console.error(`이미지 업로드 실패: ${err}`);
		//   res.status(500).json({ error: err.message });
		} else {
		  ({ prompt, negativePrompt, style, sampleSteps, styleStrength, numberOfOutputImages, guidanceScale } = req.body);
		  fs.writeFileSync(`${serverStartTime}/${taskId}/in/options.json`, JSON.stringify({ prompt, negativePrompt, style, sampleSteps, styleStrength, numberOfOutputImages, guidanceScale }));
		  try {
			// exec(`python download_models.py ${serverStartTime} ${taskId}`).then(taskStatus.add(taskId));
			const interval = setInterval(() => {
				// console.log(Math.min(...queueStatus),taskId)
				if (Math.min(...queueStatus) == taskId) { // 'condition'은 원하는 조건을 체크하는 변수입니다.
					clearInterval(interval);
					const spawn = require('child_process').spawn;
					const result = spawn('python', ['download_models.py',serverStartTime,`${taskId}`]);
		
					result.stdout.on('data', (data) => {
						console.log(`파이썬 표준 출력: ${data}`);
					});
		
					result.stderr.on('data', (data) => {
						console.error(`파이썬 표준 에러: ${data}`);
					});
		
					result.on('close', (code) => {
						console.log(`파이썬 프로세스 종료, 종료 코드: ${code}`);
						taskStatus.add(taskId);
						queueStatus.delete(taskId)
					});
				}
			}, 1000);


			// let imagePaths = []
			// taskStatus.add(requestCounter)
			// for(let i=0;i<numberOfOutputImages;++i)
			//   imagePaths.push(`${serverStartTime}/${requestCounter}/out/${i}.png`)
			// res.json({ imagePaths });
		  } catch (error) {
			console.error(`Error: ${error.message}`);
			throw new Error('Image generation failed.');
			// res.status(500).json({ error: error.message });
		  }
		}
	});


  // Python 스크립트 실행
});

app.get('/api/checkStatus/:taskId', (req, res) => {
	const taskId = +req.params.taskId;
	// console.log(taskId,taskStatus);

	
	// 여기에서 taskId를 사용하여 작업의 상태를 확인합니다.
	// 예를 들어, 데이터베이스 조회나, 메모리에 저장된 상태 정보를 확인하는 로직 등을 구현합니다.
  
	// 작업 상태에 따라 적절한 응답을 반환합니다.
	console.log(taskId,queueStatus);
	if (taskId == 0) {
		res.json({status: queueStatus.size})
	}else if (taskStatus.delete(taskId)) { //taskId를 숫자로 변환해야함에 주의
		let imagePaths = []
		// taskStatus.add(taskId)
		for(let i=0;i<numberOfOutputImages;++i)
			imagePaths.push(`${serverStartTime}/${taskId}/out/${i}.png`)
		res.json({ status: 0, imagePaths });
	//   imagePaths=0;
	} else {
		let cnt=0;
		for(const e of queueStatus)
			if(e<=taskId)
				++cnt;
			console.log(taskId,cnt);
	  res.json({ status: cnt, imagePaths });
	}
  });

app.get('/api/image/:filename', (req, res) => {
	let { filename } = req.params;
	console.log(filename)
	filename=filename.replace(/\+/g,'/')
	const filePath = path.join(__dirname,filename);
	res.sendFile(filePath);
  });


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
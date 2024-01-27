from huggingface_hub import hf_hub_download
base_model_path = 'frankjoshua/sdxlUnstableDiffusers_v11' #https://github.com/TencentARC/PhotoMaker/blob/main/photomaker_style_demo.ipynb /stablediffusionapi/disney-pixar-cartoon
photomaker_path = hf_hub_download(repo_id="TencentARC/PhotoMaker", filename="photomaker-v1.bin", repo_type="model")
lora_path = './xl_more_art-full_v1.safetensors' #https://huggingface.co/frankjoshua/xl_more_art-full_v1

import torch
import sys
import os
from diffusers.utils import load_image
from diffusers import EulerDiscreteScheduler
from photomaker import PhotoMakerStableDiffusionXLPipeline

import PhotoMaker.gradio_demo.style_template as style_template

import json

# def generate_images():
def download_models(serverStartTime, requestCounter):
	device = "cuda" if torch.cuda.is_available() else "cpu"

	### Load base model
	pipe = PhotoMakerStableDiffusionXLPipeline.from_pretrained(
		base_model_path,  # can change to any base model based on SDXL
		torch_dtype=torch.bfloat16, 
		use_safetensors=True, 
		variant="fp16"
	).to(device)

	### Load PhotoMaker checkpoint
	pipe.load_photomaker_adapter(
		os.path.dirname(photomaker_path),
		subfolder="",
		weight_name=os.path.basename(photomaker_path),
		trigger_word="img"  # define the trigger word
	)     

	pipe.scheduler = EulerDiscreteScheduler.from_config(pipe.scheduler.config)

	print("Loading lora...") # https://github.com/TencentARC/PhotoMaker/blob/main/photomaker_style_demo.ipynb in[3]
	pipe.load_lora_weights(os.path.dirname(lora_path), weight_name=os.path.basename(lora_path), adapter_name="xl_more_art-full")
	pipe.set_adapters(["photomaker", "xl_more_art-full"], adapter_weights=[1.0, 0.5])



	### Also can cooperate with other LoRA modules
	# pipe.load_lora_weights(os.path.dirname(lora_path), weight_name=lora_model_name, adapter_name="xl_more_art-full")
	# pipe.set_adapters(["photomaker", "xl_more_art-full"], adapter_weights=[1.0, 0.5])

	pipe.fuse_lora()

	### define the input ID images
	input_id_images = []
	# with open('time.json', 'r') as file:
	# time_data = json.load(file)
	input_folder_name = f'{serverStartTime}/{requestCounter}/in/img' #Strings nested within an f-string cannot use the same quote character as the f-string prior to Python 3.12Pylance
	image_basename_list = os.listdir(input_folder_name)
	image_path_list = sorted([os.path.join(input_folder_name, basename) for basename in image_basename_list])

	for image_path in image_path_list:
		input_id_images.append(load_image(image_path))

# JSON 파일 열기 및 읽기

# 읽어온 데이터 사용

# Note that the trigger word `img` must follow the class word for personalization
# prompt = "'Yay!' in a speech bubble pointing at a girl img riding dragon over a whimsical castle, comic book, graphic novel, half-body, screenshot from animation"
# negative_prompt = "3d, realistic, photo-realistic, bad quality, bad anatomy, worst quality, low quality, lowres, extra fingers, blur, blurry, ugly, wrong proportions, watermark, image artifacts, bad eyes, bad hands, bad arms"
	generator = torch.Generator(device=device).manual_seed(42)
	with open(f'{serverStartTime}/{requestCounter}/in/options.json', 'r') as file:
		option_data = json.load(file)
		p, n = style_template.styles.get(option_data['style']) #positive, negative
		for i, img in enumerate(pipe(
			prompt=p.replace("{prompt}", option_data['prompt']),
			input_id_images=input_id_images,
			negative_prompt=n + ' ' + option_data['negativePrompt'],
			num_images_per_prompt=int(option_data['numberOfOutputImages']), #최대 4
			num_inference_steps=int(option_data['sampleSteps']), #50
			start_merge_step=int(option_data['styleStrength']), #맞나??? 모르겠다
			guidance_scale=float(option_data['guidanceScale']),
			generator=generator,


		).images):
			img.save(f'{serverStartTime}/{requestCounter}/out/{i}.png')

	# return ['out/0.png', 'out/1.png', 'out/2.png', 'out/3.png']

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("사용법: python generate_image.py [task_id] [image_index]")
        sys.exit(1)

    download_models(sys.argv[1], sys.argv[2])
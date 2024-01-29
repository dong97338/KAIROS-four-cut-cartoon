from PIL import Image, ImageDraw, ImageFont
import matplotlib.pyplot as plt
import numpy as np
import textwrap
import cv2

# Load the image file
img_path = './iqweru (6).jpg'
image = Image.open(img_path)
# Load the speech bubble image
speech_bubble_path = './pngwing.com.png'
speech_bubble = Image.open(speech_bubble_path)

# cv2.FaceDetectorYN.create('face_detection_yunet_2021dec.onnx','',(512,512))

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
# Detect faces again since we are starting fresh
gray_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2GRAY)
faces = face_cascade.detectMultiScale(gray_image, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

text = "Hello! How are you today? "

# Calculate the position of the speech bubble (to the right of the first detected face)
if len(faces) > 0:
    x, y, w, h = faces[0]  # Get the coordinates of the first detected face
    bubble_x = x + w //2 + 40  # Position the bubble to the right of the face
    bubble_y = y - h + 50 # 얼굴크기비율로해야

    # Resize the speech bubble to be proportionate to the face width
    speech_bubble_ratio = speech_bubble.width / speech_bubble.height
    speech_bubble_width = int(1.5 * w)
    speech_bubble_height = int(1.5 * w / speech_bubble_ratio)
    speech_bubble = speech_bubble.resize((speech_bubble_width, speech_bubble_height))
    
    # Create a mask for the speech bubble where white parts are opaque
    mask = speech_bubble.convert("L").point(lambda x: 255 if x > 128 else 0)
    
    # Paste the speech bubble onto the original image
    image.paste(speech_bubble, (bubble_x, bubble_y), mask)

# Create a drawing context on the image
draw = ImageDraw.Draw(image)

# Set a starting font size (large to small to fit the text box)
font_size = 40
font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# 말풍선 내 텍스트 박스의 크기를 계산 (여백 포함)
text_box_width = speech_bubble_width * 0.7  # 좌우 여백
text_box_height = speech_bubble_height * 0.5 # 상하 여백

# 텍스트 래핑 조정: 너비를 말풍선에 맞게 조정
wrap_width = 50  # 이 값을 조정하여 적절한 래핑 너비를 찾음

# 폰트 크기 조정: 말풍선 크기에 맞게 폰트 크기 조정
font_size = 20  # 초기 폰트 크기 설정
font = ImageFont.truetype(font_path, font_size)

# 텍스트 높이가 말풍선 내부 높이를 초과하지 않을 때까지 폰트 크기 조정
while max([font.getbbox(x)[2] for x in textwrap.fill(text, width=wrap_width).split('\n')]) > text_box_width:
	wrap_width -= 1
	font = ImageFont.truetype(font_path, font_size)


	while font.getbbox(textwrap.fill(text, width=wrap_width))[3]*(textwrap.fill(text, width=wrap_width).count('\n')+1) > text_box_height:
		font_size -= 1
		font = ImageFont.truetype(font_path, font_size)
    
# print(font.getbbox(textwrap.fill(text, width=wrap_width))[3]*(textwrap.fill(text, width=wrap_width).count('\n')+1),text_box_height)

# 텍스트를 말풍선 내부에 맞게 래핑
wrapped_text = textwrap.fill(text, width=wrap_width)

# 텍스트의 위치 계산: 말풍선 내에서 텍스트를 중앙에 위치시킴
_, _, text_width, text_height = draw.multiline_textbbox([0,0],wrapped_text, font=font)
text_x = bubble_x + (speech_bubble_width - text_width) // 2
text_y = bubble_y + (speech_bubble_height - text_height) // 2 - 10

# 이미지에 텍스트 그리기
draw.multiline_text((text_x, text_y), wrapped_text, font=font, fill="black")

# 결과 보기
plt.imshow(image)
plt.axis('off')
plt.show()

# 수정된 이미지 저장 경로
modified_img_path = '/mnt/data/modified_image_with_text.jpg'
image.save(modified_img_path)
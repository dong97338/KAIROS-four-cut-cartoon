from PIL import Image, ImageDraw, ImageFont
import matplotlib.pyplot as plt
import numpy as np
import textwrap
import cv2

# Load the image file
img_path = './iqweru (1).jpg'
image = Image.open(img_path)
# Load the speech bubble image
speech_bubble_path = './pngwing.com.png'
speech_bubble = Image.open(speech_bubble_path)

# Reload the original image to start fresh
image = Image.open(img_path)

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
# Detect faces again since we are starting fresh
gray_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2GRAY)
faces = face_cascade.detectMultiScale(gray_image, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

text = "Hello! How are you today?"

# Calculate the position of the speech bubble (to the right of the first detected face)
if len(faces) > 0:
    x, y, w, h = faces[0]  # Get the coordinates of the first detected face
    bubble_x = x + w + 10  # Position the bubble to the right of the face
    bubble_y = y

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
font = ImageFont.truetype(font_path, font_size)

# Determine the size of the text box within the speech bubble
text_box_width = speech_bubble_width - 40  # 20 pixels padding on each side
text_box_height = speech_bubble_height - 40  # 20 pixels padding on each side

# Find the optimal font size that allows the text to fit within the text box
while font.getsize_multiline(textwrap.fill(text, width=20))[1] > text_box_height:
    font_size -= 1
    font = ImageFont.truetype(font_path, font_size)

# Format the text to fit within the text box
wrapped_text = textwrap.fill(text, width=20)

# Calculate the position of the text to center it in the text box
text_width, text_height = draw.multiline_textsize(wrapped_text, font=font)
text_x = bubble_x + (speech_bubble_width - text_width) // 2
text_y = bubble_y + (speech_bubble_height - text_height) // 2

# Draw the text onto the image
draw.multiline_text((text_x, text_y), wrapped_text, font=font, fill="black", align='center')

# Show the result
plt.imshow(image)
plt.axis('off')
plt.show()

# Save the result image with the text box layout
text_box_layout_img_path = '/mnt/data/result_image_with_text_box_layout.jpg'
image.save(text_box_layout_img_path)

text_box_layout_img_path
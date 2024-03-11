from PIL import Image

# 투명한 이미지 생성 (1x1)
transparent_image = Image.new('RGBA', (1, 1), (0, 0, 0, 0))

# 이미지 저장
transparent_image.save('transparent.png')

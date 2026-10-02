from rembg import remove
import onnxruntime as ort
from PIL import Image

photo_path = 'Afzal.jpg'
fileName = photo_path.split('.')

print(fileName[0]+"_no_bg."+fileName[1])

input_img = Image.open(photo_path)
output_img = remove(input_img)
output_img.save(fileName[0]+"_no_bg.png")
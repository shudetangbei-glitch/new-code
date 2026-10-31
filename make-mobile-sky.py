import bpy
from pathlib import Path
root = Path(__file__).resolve().parent
image = bpy.data.images.load(str(root / "art/city-sky.hdr"))
scene = bpy.context.scene
scene.view_settings.view_transform = "AgX"
scene.render.image_settings.file_format = "JPEG"
scene.render.image_settings.quality = 82
image.save_render(str(root / "art/city-sky-mobile.jpg"), scene=scene)

import bpy, math, os
from mathutils import Vector
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
materials={}
for name,color,metal,rough in [('Plaster',(0.73,0.67,0.55,1),0,.85),('Brick',(.42,.18,.11,1),0,.88),('Stone',(.52,.5,.44,1),0,.7),('Glass',(.08,.17,.21,1),.3,.14),('Roof',(.16,.19,.2,1),.2,.6),('Iron',(.06,.08,.075,1),.65,.3),('Wood',(.18,.11,.06,1),0,.7),('Awning',(.27,.34,.26,1),0,.8)]:
 m=bpy.data.materials.new(name);m.diffuse_color=color;m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=color;p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough;materials[name]=m
def cube(name,loc,scale,material,bevel=.025):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(materials[material])
 if bevel:
  m=o.modifiers.new('Edge highlights','BEVEL');m.width=bevel;m.segments=2;bpy.ops.object.modifier_apply(modifier=m.name)
 return o
def arch(name,x,y,z,w,h,mat):
 r=w/2;points=[(-r,0),(-r,h-r)]+[(math.cos(math.pi-i*math.pi/12)*r,h-r+math.sin(math.pi-i*math.pi/12)*r) for i in range(13)]+[(r,0)]
 n=len(points);verts=[(x+px,y+depth,z+pz) for depth in [0,.1] for px,pz in points];faces=[tuple(range(n-1,-1,-1)),tuple(range(n,n*2))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.materials.append(materials[mat]);o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);return o
for kind in range(6):
 prefix=f'k{kind}_';w=3.6;d=2.65;h=[5.2,6.5,4.1,8.4,5.8,7.2][kind]
 root=bpy.data.objects.new(f'kit_{kind}',None);bpy.context.collection.objects.link(root)
 cube(prefix+'facade',(0,0,h/2),(w,d,h),'Brick' if kind%2 else 'Plaster',.06)
 for z in [.15,1.95,h-.12,h+.08]:cube(prefix+'cornice',(0,0,z),(w+.2,d+.2,.14),'Stone')
 for x in [-w/2+.12,w/2-.12]:cube(prefix+'pilaster',(x,-d/2-.06,h/2),(.2,.15,h),'Stone')
 for floor in range(max(1,int((h-1.8)/1.35))):
  z=2.2+floor*1.35
  for x in [-.95,0,.95]:
   arch(prefix+'arch_frame',x,-d/2-.13,z,.72,1.02,'Stone');arch(prefix+'arch_glass',x,-d/2-.16,z+.06,.59,.87,'Glass')
   cube(prefix+'mullion',(x,-d/2-.19,z+.48),(.035,.035,.84),'Wood',.005)
   cube(prefix+'sill',(x,-d/2-.15,z-.025),(.84,.36,.09),'Stone')
   if floor==0 and kind in [1,4,5]:
    cube(prefix+'balcony',(x,-d/2-.4,z-.1),(.88,.7,.1),'Stone')
    cube(prefix+'rail',(x,-d/2-.74,z+.3),(.88,.045,.04),'Iron',.008)
    for j in range(7):cube(prefix+'baluster',(x-.39+j*.13,-d/2-.74,z+.1),(.025,.025,.42),'Iron',.005)
  for side in [-1,1]:
   for y in [-.65,.45]:
    cube(prefix+'side_window_frame',(side*(w/2+.015),y,z+.43),(.06,.65,.95),'Stone')
    cube(prefix+'side_glass',(side*(w/2+.05),y,z+.43),(.025,.53,.83),'Glass',.008)
    cube(prefix+'side_bar',(side*(w/2+.07),y,z+.43),(.025,.035,.85),'Wood',.004)
 arch(prefix+'door_frame',.9,-d/2-.15,.13,.9,1.67,'Stone');arch(prefix+'door',.9,-d/2-.18,.18,.73,1.52,'Wood')
 cube(prefix+'door_glass',(.9,-d/2-.2,1.12),(.54,.025,.63),'Glass',.01)
 cube(prefix+'handle',(1.13,-d/2-.24,.85),(.045,.055,.18),'Iron',.01)
 cube(prefix+'shop_frame',(-.62,-d/2-.08,.95),(1.7,.12,1.55),'Stone')
 cube(prefix+'shop_glass',(-.62,-d/2-.15,.95),(1.53,.04,1.38),'Glass',.015)
 for x in [-1.13,-.61,-.1]:cube(prefix+'shop_bars',(x,-d/2-.19,.96),(.04,.04,1.4),'Iron',.005)
 for z in [.12,.9]:cube(prefix+'step',(.9,-d/2-.29,z*.16),(.98,.5,.11),'Stone')
 # Curved cloth canopy, tessellated across its depth rather than a flat slab.
 verts=[];faces=[]
 for j in range(8):
  t=j/7
  for x in [-1.66,.35]:verts.append((x,-d/2-.12-t*.7,1.89-.25*t+.07*math.sin(t*math.pi)))
 for j in range(7):faces.append((j*2,j*2+1,j*2+3,j*2+2))
 me=bpy.data.meshes.new(prefix+'cloth');me.from_pydata(verts,[],faces);me.materials.append(materials['Awning']);ob=bpy.data.objects.new(prefix+'canopy',me);bpy.context.collection.objects.link(ob)
 if kind in [0,2,4]:
  for side in [-1,1]:
   roof=cube(prefix+'pitched_roof',(0,side*.72,h+.45),(w+.3,1.7,.14),'Roof');roof.rotation_euler.x=side*math.radians(28)
  for x in [-1.4,-.7,0,.7,1.4]:cube(prefix+'roof_seam',(x,0,h+.82),(.025,d+.2,.03),'Iron',.004)
 else:
  cube(prefix+'flat_roof',(0,0,h+.13),(w+.22,d+.22,.17),'Roof')
  for x in [-w/2,w/2]:cube(prefix+'parapet',(x,0,h+.3),(.13,d,.3),'Stone')
 for x in [-1,1]:cube(prefix+'chimney',(x,.7,h+.65),(.38,.45,.9),'Brick');cube(prefix+'chimney_cap',(x,.7,h+1.12),(.46,.53,.08),'Stone')
 for mat_name in materials:
  objects=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.name.startswith(prefix) and o.data.materials and o.data.materials[0].name==mat_name]
  if not objects:continue
  bpy.ops.object.select_all(action='DESELECT')
  for o in objects:o.select_set(True)
  bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();o=bpy.context.object;o.name=f'kit_{kind}_{mat_name}';o.parent=root
output=os.path.join(os.path.dirname(os.path.abspath(__file__)),'art','city-kit.glb')
bpy.ops.export_scene.gltf(filepath=output,export_format='GLB',export_apply=True,export_animations=False)
print('CITY_KIT_EXPORTED',output)


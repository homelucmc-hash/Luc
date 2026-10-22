"""Original ATELIER COFFEE espresso advertisement, rendered with Blender.

blender -b --python scripts/render-coffee.py -- --frames 0,80,159 --width 800 --samples 24
All geometry and shader fields are authored here. No third-party assets or reference pixels.
The deterministic frame function makes the 160-frame sequence exactly reversible.
"""
import argparse
import bpy
import math
import json
import random
import time
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
PRODUCTION = ROOT / 'production'
RENDERS = PRODUCTION / 'renders'
for folder in (PRODUCTION, RENDERS): folder.mkdir(parents=True, exist_ok=True)
parser = argparse.ArgumentParser()
parser.add_argument('--frames', default='0,80,159')
parser.add_argument('--width', type=int, default=1280)
parser.add_argument('--height', type=int)
parser.add_argument('--samples', type=int, default=40)
parser.add_argument('--threads', type=int, default=5)
parser.add_argument('--crema-exposure', type=float, default=0)
parser.add_argument('--engine', choices=['cycles','eevee'], default='cycles')
parser.add_argument('--output', type=Path, default=RENDERS)
parser.add_argument('--save-blend', action='store_true')
args = parser.parse_args(__import__('sys').argv[__import__('sys').argv.index('--')+1:] if '--' in __import__('sys').argv else [])
args.output.mkdir(parents=True, exist_ok=True)
if args.frames == 'all': frames = list(range(160))
elif ':' in args.frames:
    parts = [int(v) for v in args.frames.split(':')]
    frames = list(range(parts[0], parts[1], parts[2] if len(parts)>2 else 1))
else: frames = [int(v) for v in args.frames.split(',')]

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for block in bpy.data.materials: bpy.data.materials.remove(block)
scene = bpy.context.scene
scene.render.engine = 'CYCLES' if args.engine=='cycles' else 'BLENDER_EEVEE_NEXT'
scene.render.resolution_x = args.width
scene.render.resolution_y = args.height or round(args.width*9/16)
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGB'
scene.render.image_settings.color_depth = '8'
scene.render.film_transparent = False
scene.render.threads_mode = 'FIXED'
scene.render.threads = max(1, args.threads)
scene.render.use_persistent_data = True
scene.render.fps = 30
scene.frame_start, scene.frame_end = 0,159
if args.engine=='cycles':
    scene.cycles.device = 'CPU'
    scene.cycles.samples = args.samples
    scene.cycles.use_denoising = False  # Debian Blender build has no OpenImageDenoise device
    scene.cycles.adaptive_threshold = .035
    scene.cycles.max_bounces = 7
    scene.cycles.diffuse_bounces = 3
    scene.cycles.glossy_bounces = 4
    scene.cycles.transmission_bounces = 5
    scene.cycles.transparent_max_bounces = 8
    scene.cycles.sample_clamp_indirect = 3.5
else:
    scene.eevee.taa_render_samples = args.samples
    scene.eevee.use_raytracing = True
    # AO uses raytracing in Eevee Next
scene.view_settings.view_transform = 'AgX'
try: scene.view_settings.look = 'AgX - Medium High Contrast'
except: pass
scene.view_settings.exposure = -.25
world = bpy.data.worlds.new('Night studio')
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (.006,.004,.002,1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = .16
scene.world = world

# ---- Material library. Long, narrow area reflections supply the photographic chrome. ----
def material(name, color, metallic=0, roughness=.3, transmission=0, coat=0):
    m=bpy.data.materials.new(name); m.use_nodes=True
    b=m.node_tree.nodes.get('Principled BSDF')
    b.inputs['Base Color'].default_value=(*color,1)
    b.inputs['Metallic'].default_value=metallic
    b.inputs['Roughness'].default_value=roughness
    b.inputs['IOR'].default_value=1.46
    b.inputs['Transmission Weight'].default_value=transmission
    b.inputs['Coat Weight'].default_value=coat
    b.inputs['Coat Roughness'].default_value=.12
    return m

def microfinish(m, scale=160, distance=.002, strength=.16):
    n=m.node_tree.nodes; l=m.node_tree.links; b=n.get('Principled BSDF')
    noise=n.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value=scale; noise.inputs['Detail'].default_value=3
    bump=n.new('ShaderNodeBump'); bump.inputs['Strength'].default_value=strength; bump.inputs['Distance'].default_value=distance
    l.new(noise.outputs['Fac'],bump.inputs['Height']); l.new(bump.outputs['Normal'],b.inputs['Normal'])
    return noise

chrome=material('Hand-polished stainless steel',(.44,.405,.35),1,.13)
microfinish(chrome,450,.0008,.10)
steel=material('Brushed dark stainless',(.085,.075,.064),.94,.24)
microfinish(steel,200,.0013,.10)
black_metal=material('Black enamel machine',(.001,.0007,.0004),0,.95,coat=0)
black_metal.node_tree.nodes['Principled BSDF'].inputs['Specular IOR Level'].default_value=.08
phenolic=material('Black phenolic handle',(.012,.009,.006),.05,.27,coat=.25)
microfinish(phenolic,170,.002,.12)
ceramic=material('Ivory vitrified porcelain',(.46,.395,.30),0,.21,coat=.65)
microfinish(ceramic,340,.0017,.10)
ceramic_foot=material('Unglazed porcelain foot',(.39,.315,.225),0,.62)
coffee=material('Fresh espresso, amber transmission',(.19,.052,.008),0,.115,.23,.85)
bs=coffee.node_tree.nodes.get('Principled BSDF'); bs.inputs['IOR'].default_value=1.333
bs.inputs['Emission Color'].default_value=(.19,.047,.005,1); bs.inputs['Emission Strength'].default_value=.07
absorption=coffee.node_tree.nodes.new('ShaderNodeVolumeAbsorption'); absorption.inputs['Color'].default_value=(.27,.077,.012,1); absorption.inputs['Density'].default_value=.9
coffee.node_tree.links.new(absorption.outputs['Volume'],coffee.node_tree.nodes.get('Material Output').inputs['Volume'])
liquid_noise=microfinish(coffee,45,.0007,.09)
crema=material('Tiger crema, dissolved microfoam',(.4,.16,.035),0,.48,coat=.12)
n=crema.node_tree.nodes; l=crema.node_tree.links; bs=n.get('Principled BSDF')
texcoord=n.new('ShaderNodeTexCoord')
noise=n.new('ShaderNodeTexNoise'); noise.noise_dimensions='4D'; noise.inputs['Scale'].default_value=10.5; noise.inputs['Detail'].default_value=5; noise.inputs['Roughness'].default_value=.72; noise.inputs['Distortion'].default_value=1.15
l.new(texcoord.outputs['Generated'],noise.inputs['Vector'])
ramp=n.new('ShaderNodeValToRGB'); cr=ramp.color_ramp
cr.elements.remove(cr.elements[1]); cr.elements[0].position=.18; cr.elements[0].color=(.045,.009,.001,1)
for position,col in [(.35,(.14,.038,.004,1)),(.48,(.38,.13,.018,1)),(.61,(.65,.32,.072,1)),(.75,(.83,.55,.20,1)),(.88,(.35,.11,.012,1))]:
    e=cr.elements.new(position);e.color=col
l.new(noise.outputs['Fac'],ramp.inputs[0])
crema_mix=n.new('ShaderNodeMixRGB'); crema_mix.blend_type='MIX'; crema_mix.inputs[1].default_value=(.045,.012,.002,1); crema_mix.inputs[0].default_value=.8
l.new(ramp.outputs['Color'],crema_mix.inputs[2]); l.new(crema_mix.outputs[0],bs.inputs['Base Color'])
fine=n.new('ShaderNodeTexNoise');fine.inputs['Scale'].default_value=190;fine.inputs['Detail'].default_value=2.2
l.new(texcoord.outputs['Generated'],fine.inputs['Vector'])
bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.2;bump.inputs['Distance'].default_value=.002
l.new(fine.outputs['Fac'],bump.inputs['Height']);l.new(bump.outputs['Normal'],bs.inputs['Normal'])
rough=n.new('ShaderNodeMapRange');rough.inputs['From Min'].default_value=.15;rough.inputs['From Max'].default_value=.85;rough.inputs['To Min'].default_value=.40;rough.inputs['To Max'].default_value=.64
l.new(noise.outputs['Fac'],rough.inputs['Value']);l.new(rough.outputs['Result'],bs.inputs['Roughness'])
# Original generated photographic microtexture mapped in the liquid's own plane.
texture_path=PRODUCTION/'textures'/'crema-original.png'
if texture_path.exists():
    image=n.new('ShaderNodeTexImage');image.image=bpy.data.images.load(str(texture_path));image.interpolation='Linear';image.extension='EXTEND'
    l.new(texcoord.outputs['UV'],image.inputs['Vector'])
    tint=n.new('ShaderNodeMixRGB');tint.blend_type='MULTIPLY';tint.inputs[0].default_value=.18
    l.new(image.outputs['Color'],tint.inputs[1]);l.new(ramp.outputs['Color'],tint.inputs[2])
    l.new(tint.outputs[0],crema_mix.inputs[2])
    l.new(image.outputs['Color'],bump.inputs['Height']);bump.inputs['Strength'].default_value=.055;bump.inputs['Distance'].default_value=.0006
    albedo_exposure=n.new('ShaderNodeMixRGB');albedo_exposure.name='Crema photographic exposure';albedo_exposure.blend_type='MULTIPLY';albedo_exposure.inputs[0].default_value=1
    exposure_factor=2**args.crema_exposure
    albedo_exposure.inputs[2].default_value=(exposure_factor,exposure_factor,exposure_factor,1)
    l.new(image.outputs['Color'],albedo_exposure.inputs[1]);l.new(albedo_exposure.outputs[0],bs.inputs['Base Color'])
    for connection in list(bs.inputs['Roughness'].links):l.remove(connection)
    bs.inputs['Roughness'].default_value=.52
    bs.inputs['Coat Weight'].default_value=.08

bubble_mat=material('Thin espresso bubble film',(.25,.09,.012),0,.085,.6,.7);bubble_mat.node_tree.nodes['Principled BSDF'].inputs['IOR'].default_value=1.333
logo_mat=material('Subtle fired porcelain signature',(.23,.18,.12),0,.4)

# ---- Geometry is original lathed/cast product modeling, no external stock assets. ----
def mesh_obj(name, verts, faces, mat, smooth_shading=True):
    me=bpy.data.meshes.new(name+' mesh');me.from_pydata(verts,[],faces);me.update()
    ob=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(ob)
    if mat:ob.data.materials.append(mat)
    if smooth_shading:
        for poly in me.polygons:poly.use_smooth=True
    return ob

def lathe(name, profile, mat, segments=128):
    verts=[];faces=[]
    for r,z in profile:
        for j in range(segments):
            a=2*math.pi*j/segments;verts.append((r*math.cos(a),r*math.sin(a),z))
    for k in range(len(profile)-1):
        for j in range(segments):
            q=k*segments+j;qn=k*segments+(j+1)%segments
            faces.append((q,qn,qn+segments,q+segments))
    return mesh_obj(name,verts,faces,mat)

def torus(name,radius,tube,z,mat,x=0,y=0):
    bpy.ops.mesh.primitive_torus_add(major_segments=128,minor_segments=16,location=(x,y,z),major_radius=radius,minor_radius=tube)
    ob=bpy.context.object;ob.name=name;ob.data.materials.append(mat)
    for p in ob.data.polygons:p.use_smooth=True
    return ob

def box(name,loc,scale,mat,bevel=.04):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);ob=bpy.context.object;ob.name=name;ob.dimensions=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);ob.data.materials.append(mat)
    mod=ob.modifiers.new('Machined edge radii','BEVEL');mod.width=bevel;mod.segments=4
    ob.modifiers.new('Weighted product normals','WEIGHTED_NORMAL')
    return ob

def curve_tube(name,points,radius,mat):
    cu=bpy.data.curves.new(name,'CURVE');cu.dimensions='3D';cu.resolution_u=20;cu.bevel_depth=radius;cu.bevel_resolution=5
    sp=cu.splines.new('BEZIER');sp.bezier_points.add(len(points)-1)
    for point,xyz in zip(sp.bezier_points,points):point.co=xyz;point.handle_left_type='AUTO';point.handle_right_type='AUTO'
    ob=bpy.data.objects.new(name,cu);bpy.context.collection.objects.link(ob);ob.data.materials.append(mat);return ob

def sphere(name,loc,radius,mat,scale=(1,1,1),segments=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=12,radius=radius,location=loc);ob=bpy.context.object;ob.name=name;ob.scale=scale;ob.data.materials.append(mat)
    for p in ob.data.polygons:p.use_smooth=True
    return ob

cup_profile=[(0,.06),(.27,.06),(.37,.075),(.45,.12),(.50,.20),(.535,.34),(.568,.60),(.594,.82),(.599,.90),(.594,.927),(.582,.942),(.565,.936),(.555,.913),(.551,.82),(.530,.60),(.502,.35),(.465,.23),(.420,.178),(.34,.16),(0,.16)]
cup=lathe('Glazed porcelain cup, hollow casting',cup_profile,ceramic,160)
cup.location.z=.035;cup.scale.z=.76
handle=curve_tube('Porcelain oval handle',[(.55,.0,.79),(.89,.0,.85),(1.09,.0,.69),(1.10,.0,.40),(.95,.0,.22),(.53,.0,.29)],.064,ceramic);handle.location.z=.035;handle.scale.z=.76
foot=lathe('Porcelain unglazed foot',[(.24,.055),(.31,.055),(.33,.068),(.31,.083),(.25,.082),(.24,.055)],ceramic_foot,96);foot.location.z=.035
# A small own-brand ceramic maker's mark, never copied from reference branding.
bpy.ops.object.text_add(location=(0,-.559,.398),rotation=(math.pi/2,0,0));logo=bpy.context.object;logo.name='Atelier maker signature';logo.data.body='ATELIER';logo.data.align_x='CENTER';logo.data.size=.045;logo.data.extrude=.0003;logo.data.materials.append(logo_mat)

# Professional brew-group housing and the bottomless portafilter assembly.
box('Espresso machine body',(0,1.12,2.7),(3.8,1.35,2.3),black_metal,.13)
box('Brushed stainless front',(0,.365,3.20),(3.7,.16,1.22),steel,.065)
lathe('Brew group upper casting',[(.58,2.36),(.72,2.36),(.80,2.43),(.79,2.61),(.70,2.69),(.50,2.72),(.49,2.60),(.58,2.36)],chrome)
lathe('Bottomless portafilter precision rim',[(.568,2.185),(.646,2.185),(.704,2.205),(.738,2.253),(.738,2.328),(.69,2.37),(.612,2.369),(.568,2.32),(.568,2.185)],chrome)
torus('Polished basket lip',.588,.024,2.185,chrome)
torus('Machined shadow line',.727,.012,2.291,black_metal)
torus('Upper casting highlight',.778,.025,2.48,chrome)
# Bayonet lugs and handle socket catch broken highlights instead of a toy silhouette.
for x in (-.69,.69):box('Portafilter bayonet lug '+str(x),(x,.07,2.35),(.24,.30,.09),chrome,.025)
connector=lathe('Handle steel collar',[(0,0),(.12,0),(.13,.12),(.13,.23),(.10,.28),(0,.28)],chrome,64);connector.rotation_euler[1]=-math.pi/2;connector.location=(-.64,-.015,2.31)
grip=lathe('Tapered phenolic portafilter grip',[(0,0),(.10,0),(.14,.09),(.163,.64),(.155,1.15),(.132,1.30),(0,1.33)],phenolic,96);grip.rotation_euler[1]=-math.pi/2;grip.location=(-.87,-.015,2.31)
# Fine basket perforations along the visible outer ring.
for ring,radius,count in [(0,.554,110),(1,.525,104)]:
    for j in range(count):
        a=j/count*2*math.pi+ring*.027
        bead=sphere('Basket perforation',(radius*math.cos(a),radius*math.sin(a),2.182),.006,black_metal,scale=(1,1,.24),segments=8)

# A real slotted steel drip tray, visible as softly defocused warm highlights.
box('Drip tray base',(0,-.15,.015),(4.4,3.45,.10),black_metal,.07)
for i in range(16):
    y=-1.65+i*.19
    box('Polished drip tray bar '+str(i),(0,y,.075),(4.1,.075,.05),steel,.022)
box('Drip tray front bevel',(0,-1.85,.09),(4.4,.13,.14),chrome,.045)
# Out-of-focus warm architecture behind the machine.
backdrop=material('Diffuse almost-black studio backdrop',(.0025,.0016,.0010),0,.9)
box('Background panel',(0,2.30,1.55),(7,.10,4.2),backdrop,.05)
for i,(x,z,r) in enumerate([(1.8,1.2,.16),(-1.6,.4,.12),(2.2,2.7,.1),(1.2,.35,.08)]):
    m=material('Warm background glint '+str(i),(.5,.18,.025),0,.4);b=m.node_tree.nodes['Principled BSDF'];b.inputs['Emission Color'].default_value=(.8,.29,.035,1);b.inputs['Emission Strength'].default_value=1.4
    sphere('Defocused bronze glint '+str(i),(x,2.05,z),r,m,scale=(1,.3,1),segments=16)

# ---- Deformable espresso geometries. ----
NTHETA=96;NR=28;NSTREAM=72;NSIDE=20
funnel_verts=[(0,0,0)]*((NR+1)*NTHETA);funnel_faces=[]
for k in range(NR):
    for j in range(NTHETA):
        a=k*NTHETA+j;b=k*NTHETA+(j+1)%NTHETA
        funnel_faces.append((a,b,b+NTHETA,a+NTHETA))
funnel=mesh_obj('Amber bottomless extraction, radial confluence',funnel_verts,funnel_faces,coffee)
stream_verts=[(0,0,0)]*((NSTREAM+1)*NSIDE);stream_faces=[]
for k in range(NSTREAM):
    for j in range(NSIDE):
        a=k*NSIDE+j;b=k*NSIDE+(j+1)%NSIDE
        stream_faces.append((a,b,b+NSIDE,a+NSIDE))
stream=mesh_obj('Espresso stream, viscous irregular meniscus',stream_verts,stream_faces,coffee)
# Surface uses concentric polar quads, with an impact crater and damped rings.
SURFACE_RINGS=42;SURFACE_SIDES=128
surface_verts=[(0,0,0)]*((SURFACE_RINGS+1)*SURFACE_SIDES);surface_faces=[]
for k in range(SURFACE_RINGS):
    for j in range(SURFACE_SIDES):
        a=k*SURFACE_SIDES+j;b=k*SURFACE_SIDES+(j+1)%SURFACE_SIDES
        surface_faces.append((a,a+SURFACE_SIDES,b+SURFACE_SIDES,b))
surface=mesh_obj('Rising espresso crema with impact crater',surface_verts,surface_faces,crema)
surface.data.uv_layers.new(name='Crema planar mapping')
# Coffee volume is a closed tapered loft matching the inside of the ceramic.
volume=lathe('Espresso volume inside the casting',[(0,.18),(.42,.18),(.50,.25),(.5,.3),(.50,.5),(.50,.7),(0,.7)],coffee,96)
rng=random.Random(398)
bubbles=[]
for i in range(58):
    angle=rng.random()*2*math.pi
    radial=(.85+.13*rng.random()) if i<41 else (.22+.55*rng.random())
    size=.0045+rng.random()**2*.013
    ob=sphere('Crema bubble '+str(i),(0,0,0),size,bubble_mat,scale=(1,1,.5),segments=12)
    bubbles.append((ob,angle,radial,size))
drops=[sphere('First espresso drop '+str(i),(0,0,2),.045 if i==0 else .019,coffee,segments=32) for i in range(3)]

# Subtle real participating steam, sculpted with a 3D noise density field.
# This is a Blender volume, not a screen overlay or stock smoke video.
steam_mat=bpy.data.materials.new('Warm espresso steam');steam_mat.use_nodes=True
sn=steam_mat.node_tree.nodes;sl=steam_mat.node_tree.links;sn.clear()
sv=sn.new('ShaderNodeVolumePrincipled');sv.inputs['Color'].default_value=(.70,.72,.70,1);sv.inputs['Anisotropy'].default_value=.12
so=sn.new('ShaderNodeOutputMaterial');sl.new(sv.outputs['Volume'],so.inputs['Volume'])
st=sn.new('ShaderNodeTexCoord');sep=sn.new('ShaderNodeSeparateXYZ');sl.new(st.outputs['Generated'],sep.inputs[0])
snoise=sn.new('ShaderNodeTexNoise');snoise.noise_dimensions='4D';snoise.inputs['Scale'].default_value=5.6;snoise.inputs['Detail'].default_value=4;snoise.inputs['Roughness'].default_value=.7;snoise.inputs['Distortion'].default_value=1.9;sl.new(st.outputs['Generated'],snoise.inputs['Vector'])
sramp=sn.new('ShaderNodeValToRGB');sramp.color_ramp.elements[0].position=.47;sramp.color_ramp.elements[0].color=(0,0,0,1);sramp.color_ramp.elements[1].position=.74;sramp.color_ramp.elements[1].color=(1,1,1,1);sl.new(snoise.outputs['Fac'],sramp.inputs[0])
sub=sn.new('ShaderNodeVectorMath');sub.operation='SUBTRACT';sub.inputs[1].default_value=(.5,.5,0);sl.new(st.outputs['Generated'],sub.inputs[0])
scale=sn.new('ShaderNodeVectorMath');scale.operation='MULTIPLY';scale.inputs[1].default_value=(1,1.5,0);sl.new(sub.outputs[0],scale.inputs[0])
dist=sn.new('ShaderNodeVectorMath');dist.operation='LENGTH';sl.new(scale.outputs[0],dist.inputs[0])
edge=sn.new('ShaderNodeMapRange');edge.clamp=True;edge.inputs['From Min'].default_value=.08;edge.inputs['From Max'].default_value=.52;edge.inputs['To Min'].default_value=1;edge.inputs['To Max'].default_value=0;sl.new(dist.outputs['Value'],edge.inputs['Value'])
height_fade=sn.new('ShaderNodeValToRGB');height_fade.color_ramp.elements[0].position=.06;height_fade.color_ramp.elements[0].color=(1,1,1,1);height_fade.color_ramp.elements[1].position=1;height_fade.color_ramp.elements[1].color=(0,0,0,1);sl.new(sep.outputs['Z'],height_fade.inputs[0])
smul=sn.new('ShaderNodeMath');smul.operation='MULTIPLY';sl.new(sramp.outputs['Color'],smul.inputs[0]);sl.new(edge.outputs['Result'],smul.inputs[1])
smul2=sn.new('ShaderNodeMath');smul2.operation='MULTIPLY';sl.new(smul.outputs[0],smul2.inputs[0]);sl.new(height_fade.outputs['Color'],smul2.inputs[1])
steam_strength=sn.new('ShaderNodeMath');steam_strength.operation='MULTIPLY';steam_strength.inputs[1].default_value=0;sl.new(smul2.outputs[0],steam_strength.inputs[0]);sl.new(steam_strength.outputs[0],sv.inputs['Density'])
bpy.ops.mesh.primitive_cube_add(size=1,location=(0,0,1.26));steam=bpy.context.object;steam.name='True volumetric espresso steam';steam.dimensions=(.94,.72,1.10);steam.data.materials.append(steam_mat)

# ---- Studio lighting and macro camera. ----
def area(name,position,energy,color,size,target,shape='DISK',size_y=None):
    data=bpy.data.lights.new(name,'AREA');data.energy=energy;data.color=color;data.shape=shape;data.size=size
    if shape=='RECTANGLE':data.size_y=size_y or size
    ob=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(ob);ob.location=position
    ob.rotation_euler=(Vector(target)-ob.location).to_track_quat('-Z','Y').to_euler();return ob
area('Large warm window',(-2.7,-3.0,4.4),340,(1,.78,.53),2.2,(0,0,1.1),'RECTANGLE',3.2)
area('Amber edge strip',(2.8,.4,2.7),500,(1,.42,.11),1.0,(0,0,1.4),'RECTANGLE',3.0)
area('Cold silver reflection',(-1.4,-1.3,2.9),260,(.79,.87,1),.36,(0,0,2.2),'RECTANGLE',2.4)
area('Top gold softbox',(.6,.1,4.7),280,(1,.72,.39),1.4,(0,0,1.2),'RECTANGLE',2.8)
area('Cup front soft fill',(-.6,-4.4,1.5),75,(1,.84,.63),3.0,(0,0,.6))
area('Crema reflected strip',(.5,-.8,2.8),160,(1,.85,.61),.18,(0,0,.6),'RECTANGLE',1.8)
bpy.ops.object.camera_add();camera=bpy.context.object;camera.name='Macro campaign camera';scene.camera=camera;camera.data.sensor_width=36;camera.data.lens=80;camera.data.dof.use_dof=True
bpy.ops.object.empty_add(type='PLAIN_AXES');focus=bpy.context.object;focus.name='Macro focus pull';camera.data.dof.focus_object=focus
camera.data.dof.aperture_fstop=2.8;camera.data.dof.aperture_blades=8

# Slight bloom only on the brightest reflections, not a synthetic haze layer.
scene.use_nodes=True
nodes=scene.node_tree.nodes;nodes.clear();rl=nodes.new('CompositorNodeRLayers');glare=nodes.new('CompositorNodeGlare');glare.glare_type='FOG_GLOW';glare.quality='MEDIUM';glare.threshold=1.6;glare.size=7;glare.mix=-.94
out=nodes.new('CompositorNodeComposite');scene.node_tree.links.new(rl.outputs['Image'],glare.inputs['Image']);scene.node_tree.links.new(glare.outputs['Image'],out.inputs['Image'])

def clamp(x):return max(0,min(1,x))
def smooth(x):x=clamp(x);return x*x*(3-2*x)
def seg(p,a,b):return smooth((p-a)/(b-a))
def mix(a,b,t):return a+(b-a)*t

def frame_values(index):
    p=index/159
    fill=seg(p,.30,.83)
    flow=seg(p,.12,.23)*(1-seg(p,.81,.895))
    level=.035+mix(.170,.650,fill)
    radius=mix(.453,.553,fill)
    stream_radius=mix(.027,.017,seg(p,.63,.84))*flow
    reveal=seg(p,.15,.48)
    return dict(frame=index,progress=p,fill=fill,steam=seg(p,.84,.98),liquidLevel=level,stream=flow,streamRadius=stream_radius,cupRim=.751,sourceZ=2.055,reveal=reveal)


def update(index):
    v=frame_values(index);p=v['progress'];fill=v['fill'];flow=v['stream'];level=v['liquidLevel'];R=v['radius'] if 'radius' in v else mix(.453,.553,fill)
    phase=p*15.2
    # A broad, feathered amber sheet converges into a thin vertical stream.
    for k in range(NR+1):
        t=k/NR
        r=.026+(.398-.026)*t
        z=2.182-.127*(1-t)**.62
        for j in range(NTHETA):
            a=j/NTHETA*2*math.pi
            feather=math.sin(a*13+phase+t*19)*.007*t*(1-t)+math.cos(a*7-phase*.7)*.003*t
            funnel.data.vertices[k*NTHETA+j].co=((r+feather)*math.cos(a),(r+feather)*math.sin(a),z+math.sin(a*11+t*19-phase)*.007*t*(1-t))
    funnel.data.update()
    # During the final reveal the basket retains its glossy extraction meniscus.
    rstream=v['streamRadius']
    stream.hide_render=flow<.003
    for k in range(NSTREAM+1):
        t=k/NSTREAM;z=mix(level+.007,2.055,t)
        sway=math.sin(t*11+phase*1.4)*.004*math.sin(t*math.pi)
        radius=rstream*(1+.055*math.sin(t*35-phase*2.2)+.025*math.cos(t*63+phase))
        for j in range(NSIDE):
            a=j/NSIDE*2*math.pi
            stream.data.vertices[k*NSIDE+j].co=(sway+radius*math.cos(a),radius*math.sin(a),z)
    stream.data.update()
    # Before continuous extraction, three genuine geometric droplets fall.
    for i,drop in enumerate(drops):
        drop.hide_render=p>.245
        if i==0:
            length=.075+.05*math.sin(p*36)**2
            drop.location=(0,0,2.055-length*.42);drop.scale=(.8,.8,length/.045)
        else:
            t=(p*7.4+i*.33)%1
            drop.location=(.005*math.sin(i+p*30),0,1.90-t*1.30);drop.scale=(.82,.82,1.3+i*.1)
    # A closed tapered espresso body remains inside the porcelain at every level.
    volume.hide_render=fill<.001
    # Rebuild the seven-ring radial volume to match its current level precisely.
    body_top=level-.030
    profiles=[(0,.155),(.40,.155),(.435,.17),(mix(.44,R,.2),mix(.17,body_top,.2)),(mix(.44,R,.65),mix(.17,body_top,.65)),(R,body_top),(0,body_top)]
    for k,(r,z) in enumerate(profiles):
        for j in range(96):
            a=j/96*2*math.pi;volume.data.vertices[k*96+j].co=(r*math.cos(a),r*math.sin(a),z)
    volume.data.update()
    surface.hide_render=fill<.001
    for k in range(SURFACE_RINGS+1):
        r=R*k/SURFACE_RINGS
        for j in range(SURFACE_SIDES):
            a=j/SURFACE_SIDES*2*math.pi
            crater=-.019*flow*math.exp(-(r/.057)**2)
            impact=.008*flow*math.exp(-((r-.084)/.036)**2)
            ripple=.0035*flow*math.sin(r*72-phase*3)*math.exp(-r*5)*(1-r/R)
            gentle=.0012*math.sin(a*5+phase+r*15)*math.sin(math.pi*r/R)
            surface.data.vertices[k*SURFACE_SIDES+j].co=(r*math.cos(a),r*math.sin(a),level+crater+impact+ripple+gentle)
    surface.data.update()
    uv=surface.data.uv_layers.active.data
    for loop in surface.data.loops:
        point=surface.data.vertices[loop.vertex_index].co
        uv[loop.index].uv=(.5+point.x/(R*2),.5+point.y/(R*2))
    noise.inputs['W'].default_value=phase*.07
    crema_mix.inputs[0].default_value=mix(.22,.95,seg(p,.30,.68))
    for i,(ob,a,radial,size) in enumerate(bubbles):
        ob.hide_render=fill<.012
        angle=a+.025*math.sin(phase+i)
        ob.location=(R*radial*math.cos(angle),R*radial*math.sin(angle),level+.001)
        ob.scale=(1,1,mix(.25,.54,fill))
    reveal=v['reveal'];end=seg(p,.77,1)
    cam_location=Vector((mix(.65,1.12,reveal),mix(-3.9,-8.05,reveal),mix(1.63,4.5,reveal)-.7*seg(p,.73,1)))
    target=Vector((mix(-.32,-.83,reveal),0,mix(2.02,1.17,reveal)))
    # The final subtle arc preserves all screen-space continuity.
    cam_location.x+=math.sin(end*math.pi/2)*.10
    camera.location=cam_location;camera.rotation_euler=(target-cam_location).to_track_quat('-Z','Y').to_euler()
    camera.data.lens=mix(83,66,reveal)
    focus.location=(0,0,mix(2.02,level,seg(p,.28,.73)))
    camera.data.dof.aperture_fstop=mix(3.0,4.1,reveal)
    steam.hide_render=p<.84
    steam_strength.inputs[1].default_value=.19*seg(p,.84,.98)
    snoise.inputs['W'].default_value=p*2.4
    scene.frame_set(index)
    bpy.context.view_layer.update()
    return v

metadata={'title':'ATELIER COFFEE — original espresso macro sequence','frames':160,'width':scene.render.resolution_x,'height':scene.render.resolution_y,'engine':args.engine,'samples':args.samples,'license':'Original Blender geometry, lighting, shaders and animation authored for this project. Original AI-assisted photographic crema microtexture created for this production; see production/textures/crema-original-provenance.txt. No third-party model/video assets or reference pixels. Reference images used only as art direction.','framesMetadata':[frame_values(i) for i in range(160)]}
metadata.update({'cremaExposure':args.crema_exposure,'cpuThreads':scene.render.threads})
(PRODUCTION/'frame-metadata.json').write_text(json.dumps(metadata,indent=2))
(PRODUCTION/'ASSET-CREDITS.txt').write_text('ATELIER COFFEE — Original Blender production\n\nAll cup, handle, brew-group, portafilter, filter perforations, drip tray, liquid, droplets and crema geometry are original procedural models authored in scripts/render-coffee.py. All shader materials, surface motion, studio lighting, camera framing and animations are authored for this project. No reference image pixels, stock video or third-party models are rendered. The original AI-assisted generated crema-original.png microtexture is used as a Blender surface material; see production/textures for provenance. The five supplied reference stills are kept separate and used only for direction and validation.\n\nRendered with Blender 4.3.2, Cycles CPU or Eevee as recorded in frame-metadata.json. Optimized web assets may be derived by FFmpeg/ImageMagick.\n')
if args.save_blend:
    update(frames[0]);bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(PRODUCTION/'atelier-espresso.blend'))
for index in frames:
    t=time.monotonic();values=update(index)
    scene.render.filepath=str(args.output/f'frame-{index:03}.png')
    bpy.ops.render.render(write_still=True)
    print('FRAME_DONE',index,'SECONDS',round(time.monotonic()-t,2),'FILL',round(values['fill'],4),flush=True)

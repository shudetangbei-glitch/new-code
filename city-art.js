import {GLTFLoader,cloneSkeleton,RoomEnvironment} from './art-loader.js';
export async function loadCityArt(T,renderer){
 const loader=new T.TextureLoader();const maps={};
 await Promise.all(['brick_wall_001','brick_pavement','asphalt_02','concrete_floor_02'].map(async id=>{const arr=await Promise.all(['Diffuse','nor_gl','rough'].map(type=>loader.loadAsync(`./art/${id}-${type}.jpg`)));arr.forEach((t,i)=>{t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(id==='asphalt_02'?2:3,id==='asphalt_02'?5:3);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());if(i===0)t.colorSpace=T.SRGBColorSpace;});maps[id]=arr;}));
 function surface(id,color=0xffffff){const [map,normalMap,roughnessMap]=maps[id];return new T.MeshStandardMaterial({map,normalMap,roughnessMap,color,roughness:.9,normalScale:new T.Vector2(.5,.5)});}
 const models=await Promise.all(['hoodie_character','animated_woman'].map(async n=>{const response=await fetch(`./art/${n}-city.glb.gz`);if(!response.ok)throw Error('人物模型加载失败');const bytes=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();return new GLTFLoader().parseAsync(bytes,'');}));
 const pmrem=new T.PMREMGenerator(renderer);const envScene=new RoomEnvironment();const environment=pmrem.fromScene(envScene,.04).texture;envScene.dispose();pmrem.dispose();
 function avatar(color,variant=0){const asset=models[variant%2],model=cloneSkeleton(asset.scene);model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.material=o.material.clone();o.material.roughness=.8;if(/Purple|Orange|LightBlue/i.test(o.material.name))o.material.color.set(color);}});const mixer=new T.AnimationMixer(model),idle=mixer.clipAction(asset.animations.find(c=>/\|Idle$/.test(c.name))),walk=mixer.clipAction(asset.animations.find(c=>/\|Walk$/.test(c.name)));idle.play();walk.play();walk.setEffectiveWeight(0);mixer.update(0);model.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(model),scale=1.27/(bounds.max.y-bounds.min.y);const root=new T.Group();root.add(model);root.scale.setScalar(scale);root.position.y=-bounds.min.y*scale;return {root,mixer,idle,walk,weight:0};}
 return {surface,avatar,environment};
}


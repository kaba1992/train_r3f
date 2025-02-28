
import { useFrame, useThree } from "@react-three/fiber"
import { useRef, useState, useEffect, useMemo, useCallback, use } from "react"
import * as THREE from "three"
import vertexImages from "../shaders/vertexImages.glsl"
import fragmentImages from "../shaders/fragmentImages.glsl"
import gsap from 'gsap'
import { Html } from '@react-three/drei'
import { damp, damp2, damp3 } from 'maath/easing'

export default function Box(props) {
  const numberOfCubes = 10
  const positions = useRef([...Array(numberOfCubes)].map((_, i) => ({
    x: (i * 0.4),
    y: (i * 0.3),
    z: (i * -0.6)
  })))
  const [textures, setTextures] = useState([])
  const [morphIndex, setMorphIndex] = useState(0)
  const { mouse } = useThree();
  const [toggleButton, setToggleButton] = useState()

  const getElementByIdAsync = id => new Promise(resolve => {
    const getElement = () => {
      const element = document.getElementById(id);
      if (element) {
        resolve(element);
      } else {
        requestAnimationFrame(getElement);
      }
    };
    getElement();
  });

  useEffect(async () => {
    setToggleButton(await getElementByIdAsync('toggleButton'));
    const handleMorphIndex = (e) => {
      setMorphIndex((prev) => (prev + 1) % 4);
    };

    if (toggleButton) {
      toggleButton.addEventListener('click', handleMorphIndex);
    }

    return () => {
      toggleButton.removeEventListener('click', handleMorphIndex)
    }
  }, [toggleButton])

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const loadedTextures = new Array(numberOfCubes);
    for (let i = 0; i < numberOfCubes; i++) {
      loader.load(
        `/assets/images/${i}.jpg`,
        (texture) => {
          loadedTextures[i] = texture;
          setTextures((prev) => [...prev, texture]);
        }
      )
    }
  }, [numberOfCubes]);

  if (textures.length < numberOfCubes) return null;

  return (
    <>
      {positions.current.map((position, index) => (
        <AnimatedCube key={index} position={[position.x, position.y, position.z]} index={index} texturesElements={textures} morphingIndex={morphIndex} mouse={mouse} toggleButton={toggleButton} />
      ))}

    </>
  )
}



function AnimatedCube({ position, index, texturesElements, morphingIndex, mouse, toggleButton }) {
  const meshRef = useRef()
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  const [canPlayStartAnim, setCanPlayStartAnim] = useState(true)
  const { camera } = useThree()
  const radius = 5;
  const angleStep = (Math.PI * 2) / 10;
  const angle = angleStep * index;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  const totalElements = texturesElements.length; // nombre total d'éléments
  const spiralFactor = 1
  const rotationSpeed = 2; // contrôle la vitesse de rotation
  const t = (index * 2 * Math.PI) / totalElements;

  const r = spiralFactor * t;
  const newX = r * Math.cos(rotationSpeed * t);
  const newZ = r * Math.sin(rotationSpeed * t);
  const distanceFromCenter = Math.sqrt(newX * newX + newZ * newZ);
  const maxDistance = Math.sqrt(Math.pow(spiralFactor * 2 * Math.PI, 2) * 2);
  const scale = 0.5 + (distanceFromCenter / maxDistance) * 1.5;
  const clock = new THREE.Clock()
  const delta = clock.getDelta()


  const uniforms = useMemo(() => ({
    uTexture: { value: texturesElements[index] || new THREE.Texture() },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uTime: { value: 0 },
  }), [index, texturesElements])

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position)
    }
    uniforms.uTime.value += delta
    uniforms.uMouse.value = new THREE.Vector2(mouse.x, mouse.y)
  })

  useEffect(() => {

    if (meshRef.current && canPlayStartAnim) {
      setCanPlayStartAnim(false)
      gsap.set(meshRef.current.position, { x: 0, y: 0, z: 0 })
      gsap.set(meshRef.current.scale, { x: 0, y: 0, z: 0 })
      gsap.to(meshRef.current.position, {
        x: position[0],
        y: position[1],
        z: position[2],
        duration: 1.5,
        delay: index * 0.05,
        ease: 'elastic.out(1, 0.6)'
      })
      setTimeout(() => {
        gsap.to(meshRef.current.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 1.5,
          delay: index * 0.05,
          ease: 'elastic.out(1,0.6)'
        })
      }, 300);
    }
  }, [canPlayStartAnim, position, index])


  const handleMorph = (x, y, z, duration, delay, ease, scales) => {
    gsap.set(meshRef.current.scale, { x: 0, y: 0, z: 0 })
    gsap.to(meshRef.current.position, {
      x: x,
      y: y,
      z: z,
      duration: duration,
      delay: delay,
      ease: ease
    });
    gsap.to(meshRef.current.scale, {
      x: scales.x,
      y: scales.y,
      z: scales.z,
      duration: duration,
      delay: delay,
      ease: ease
    });
  }

  const handleCirclePosition = useCallback((e) => handleMorph(x, 0, z, 0.5, index * 0.1, "power2.out", { x: 1, y: 1, z: 1 }), [x, z, index]);
  const handleCircleYPosition = useCallback((e) => handleMorph(x, z, 0, 0.5, index * 0.1, "power2.out", { x: 1, y: 1, z: 1 }), [x, z, index]);
  const handleCardsPosition = useCallback((e) => handleMorph(position[0], position[1], position[2], 0.5, index * 0.1, "power2.out", { x: 1, y: 1, z: 1 }), [position, index]);
  const handleSpiralPosition = useCallback((e) => handleMorph(newX, newZ, 0, 0.5, index * 0.1, "power2.out", { x: scale, y: scale, z: scale }), [newX, newZ, index]);

  const morphFunctions = useMemo(() => [
    handleSpiralPosition,
    handleCirclePosition,
    handleCircleYPosition,
    handleCardsPosition
  ], [handleSpiralPosition, handleCirclePosition, handleCircleYPosition, handleCardsPosition])

  // Exécuter la fonction de morphing quand morphingIndex change
  useEffect(() => {
    console.log(morphingIndex);
    if (!toggleButton) return
    toggleButton.addEventListener('click', morphFunctions[morphingIndex]);

    return () => {
      toggleButton.removeEventListener('click', morphFunctions[morphingIndex]);
    }

  }, [morphingIndex, morphFunctions, toggleButton])


  const handlePointerEnter = useCallback((e) => {
    console.log(e);
    e.stopPropagation()
    setHover(true)
    //up the mesh on hover on y axis
    gsap.to(meshRef.current.position, { y: meshRef.current.position.y + 0.5, duration: 0.5, ease: 'elastic.out(1, 0.6)' })
  }, [position]);

  const handlePointerLeave = useCallback((e) => {
    e.stopPropagation()
    setHover(false)
    //down the mesh on hover on y axis
    gsap.to(meshRef.current.position, { y: position[1], duration: 0.5, ease: 'elastic.out(1, 0.6)' })
  }, [position]);


  if (fragmentImages === '' || vertexImages === '' || texturesElements.length < 10) return null;

  console.log("all loaded");

  return (
    <>

      <mesh
        ref={meshRef}
        position={position}
        // scale={scale}
        onClick={() => setActive(!active)}
        onPointerEnter={(e) => handlePointerEnter(e)}
        onPointerLeave={(e) => handlePointerLeave(e)}
      >
        <planeBufferGeometry args={[2, 2]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={vertexImages}
          fragmentShader={fragmentImages}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>

  )
}
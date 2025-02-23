import { useSpring, animated } from "@react-spring/three"
import { useFrame, useThree } from "@react-three/fiber"
import { useRef, useState, useEffect } from "react"
import * as THREE from "three"
import vertexImages from "../shaders/vertexImages.glsl"
import fragmentImages from "../shaders/fragmentImages.glsl"
import { useMemo } from "react"
import gsap from 'gsap'
import { useGSAP } from "@gsap/react"
import { Billboard } from '@react-three/drei'
export default function Box(props) {
  const numberOfCubes = 10
  const positions = useRef([...Array(numberOfCubes)].map((_, i) => ({
    x: (i * 0.4),
    y: (i * 0.3),
    z: (i * -0.6)
  })))
  const [textures, setTextures] = useState([])
  const [morphIndex, setMorphIndex] = useState(-1)


  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const loadedTextures = new Array(numberOfCubes);
    let loadedCount = 0;

    for (let i = 0; i < numberOfCubes; i++) {
      loader.load(
        `/assets/images/${i}.jpg`,
        (texture) => {

          loadedTextures[i] = texture;
          loadedCount++;
          setTextures((prev) => [...prev, texture]);
        }
      )
    }
    const handleMorphIndex = (e) => {
      setMorphIndex((prev) => (prev + 1) % 3);
    };
    window.addEventListener('click', handleMorphIndex)


    return () => {
      window.removeEventListener('click', handleMorphIndex)
    }
  }, [numberOfCubes]);



  if (textures.length < numberOfCubes) return null;


  return (
    <>
      {positions.current.map((position, index) => (
        <AnimatedCube key={index} position={[position.x, position.y, position.z]} index={index} texturesElements={textures} morphingIndex={morphIndex}  />
      ))}

    </>
  )
}



function AnimatedCube({ position, index, texturesElements, morphingIndex }) {
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

  const uniforms = useMemo(() => ({
    uTexture: { value: texturesElements[index] || new THREE.Texture() },
  }), [index, texturesElements])

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position)
    }
  })

  useGSAP((context, contextSafe) => {
    if (meshRef.current && canPlayStartAnim) {
      setCanPlayStartAnim(false)
      gsap.set(meshRef.current.position, { x: 0, y: 0, z: 0 })
      gsap.to(meshRef.current.position, { x: position[0], y: position[1], z: position[2], duration: 1.5, delay: index * 0.1, ease: 'elastic.out(1, 0.6)' })
    }

    const handleCirclePosition = contextSafe((e) => {
      // Animer vers la nouvelle position
      gsap.to(meshRef.current.position, {
        x: x,
        y: 0,
        z: z,
        duration: 1,
        delay: index * 0.1,
        ease: "power2.out"
      });
    })
    const handleCircleYPosition = contextSafe((e) => {
      gsap.to(meshRef.current.position, {
        x: x,
        y: z,
        z: 0,
        duration: 1,
        delay: index * 0.1,
        ease: "power2.out"
      });
    });

    const handleCardsPosition = contextSafe((e) => {
      gsap.to(meshRef.current.position, {
        x: position[0],
        y: position[1],
        z: position[2],
        duration: 1,
        delay: index * 0.1,
        ease: "power2.out"
      });
    });

    console.log(morphingIndex);
    const morphFunctions = [handleCirclePosition, handleCircleYPosition, handleCardsPosition]
   
    window.addEventListener('click', morphFunctions[morphingIndex])

    return () => {
   
      window.removeEventListener('click', morphFunctions[morphingIndex])
    }

  }, { scope: meshRef, dependencies: [position, index, texturesElements, morphingIndex] })

  function handlePointerEnter(e) {
    console.log(e);
    e.stopPropagation()
    setHover(true)
    //up the mesh on hover on y axis
    gsap.to(meshRef.current.position, { y: meshRef.current.position.y + 0.5, duration: 0.5, ease: 'elastic.out(1, 0.6)' })
  }

  function handlePointerLeave(e) {
    e.stopPropagation()
    setHover(false)
    //down the mesh on hover on y axis
    gsap.to(meshRef.current.position, { y: position[1], duration: 0.5, ease: 'elastic.out(1, 0.6)' })
  }

  const { scale } = useSpring({
    scale: [1.5, 1.5, 1.5]
  })
  if (fragmentImages === '' || vertexImages === '' || texturesElements.length < 10) return null;

  console.log("all loaded");

  return (

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
  )
}
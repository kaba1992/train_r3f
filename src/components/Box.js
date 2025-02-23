import { useSpring, animated } from "@react-spring/three"
import { useFrame } from "@react-three/fiber"
import { useRef, useState, useEffect, use } from "react"
import * as THREE from "three"
import vertexImages from "../shaders/vertexImages.glsl"
import fragmentImages from "../shaders/fragmentImages.glsl"
import { useMemo } from "react"
import gsap from 'gsap'
import { useGSAP } from "@gsap/react"
export default function Box(props) {
  const numberOfCubes = 10
  const positions = useRef([...Array(numberOfCubes)].map((_, i) => ({
    x: (i * 0.4),
    y: (i * 0.3),
    z: (i * -0.6)
  })))
  const [textures, setTextures] = useState([])
  const planesRef = useRef([]);
  const [planes, setPlanes] = useState([]); 

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const loadedTextures = new Array(numberOfCubes);
    let loadedCount = 0;

    for (let i = 0; i < numberOfCubes; i++) {
      loader.load(
        `/assets/images/${i}.jpg`,
        (texture) => {
          loadedTextures.push(texture);
          loadedCount++;
          setTextures((prev) => [...prev, texture]);
        }
      )
    }
  }, [numberOfCubes]);

  useFrame(() => {
    positions.current.forEach((pos, i) => {

    })
  })
  useGSAP(() => {
    console.log(planesRef.current);
  
    window.addEventListener('click', () => {
      gsap.to(positions.current, { x:Math.cos(Math.PI *2 ) * 2, y:0, z:Math.sin( Math.PI *2 ) * 2, duration: 1.5, ease: 'elastic.out(1, 0.6)' })


    })

    return () => {
      window.removeEventListener('click', () => {})
    }

  }, { dependencies: [planes] })
  if (textures.length < numberOfCubes) return null;


  return (
    <>
      {positions.current.map((position, index) => (
        <AnimatedCube key={index} position={[position.x, position.y, position.z]} index={index} texturesElements={textures} planesRef ={(el) => {
          if (el && !planesRef.current.includes(el)) {
            planesRef.current[index] = el;
            setPlanes([...planesRef.current]); // Force le re-render en mettant à jour l'état
          }
        }}/>
      ))}

    </>
  )
}



function AnimatedCube({ position, index, texturesElements }) {
  const meshRef = useRef()
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)

  const uniforms = useMemo(() => ({
    uTexture: { value: texturesElements[index] || new THREE.Texture() },
  }), [index, texturesElements])

  useEffect(() => {
  


  }, [meshRef.current])

  useGSAP(() => {
    if (meshRef.current) {
      gsap.set(meshRef.current.position, { x: 0, y: 0, z: 0 })
      gsap.to(meshRef.current.position, { x: position[0], y: position[1], z: position[2], duration: 1.5 })
    }


    return () => {
      window.removeEventListener('click', () => {
      })
    }

  }, { scope: meshRef, dependencies: [position, index, texturesElements] })

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
import { useSpring, animated } from "@react-spring/three"
import { useFrame } from "@react-three/fiber"
import { useRef, useState,useEffect } from "react"
import * as THREE from "three"
import vertex from "../assets/shaders/vertex.glsl"
import fragment from "../assets/shaders/fragment.glsl"
import { useMemo } from "react"
import { useTexture } from "@react-three/drei"


export default function Box(props) {
  const numberOfCubes = 10
  const positions = useRef([...Array(numberOfCubes)].map((_, i) => ({
    x: (i * 0.2),
    y: (i * 0.2),
    z: (i * -0.6)
  })))
const [textures, setTextures] = useState([])

useEffect(() => {
  console.log(vertex);
  
  const loadedTextures = []
  for (let i = 0; i < numberOfCubes; i++) {
    const texture = new THREE.TextureLoader().load(`../assets/images/${i}.jpg`)
    loadedTextures.push(texture)
  }
  setTextures((prev) => [...prev, ...loadedTextures])
}, [numberOfCubes])


  useFrame(() => {
    positions.current.forEach((pos, i) => {

    })
  })

  return (
    <>
      {positions.current.map((pos, i) => (
        <AnimatedCube key={i} position={[pos.x, pos.y, pos.z]} index={i} texturesElements={textures} />
      ))}
    </>
  )
}



function AnimatedCube({ position, index, texturesElements }) {
  const meshRef = useRef()
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)

  const uniforms = useMemo(() => ({
    uTexture: { value: texturesElements[index] },
  }), [index, texturesElements])


  function handlePointerEnter(e) {
    e.stopPropagation()
    setHover(true)
  }

  function handlePointerLeave(e) {
    e.stopPropagation()
    setHover(false)
  }

  const { scale, color } = useSpring({
    scale: [1.5, 1.5, 1.5],
    color: hovered ? "hotpink" : "orange",
  })

  return (
    <animated.mesh
      ref={meshRef}
      position={position}
      scale={scale}
      onClick={() => setActive(!active)}
      onPointerEnter={(e) => handlePointerEnter(e)}
      onPointerLeave={(e) => handlePointerLeave(e)}
    >
      <planeGeometry args={[1, 1, 1]} />
      <shaderMaterial
        side={THREE.DoubleSide}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
         />


    </animated.mesh>
  )
}
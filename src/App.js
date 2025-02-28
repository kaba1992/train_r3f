import './App.css';
import Box from './components/Box';
import { OrbitControls, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

function App() {


  return (
    <>
 
      <Canvas
        camera={{ position: [0, 0, 10] }}
      >
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls
          minPolarAngle={Math.PI / 2} // 90 degrés
          maxPolarAngle={Math.PI / 2} // 90 degrés
        />
        <Box position={[0, 0, 0]} />
        <Stats />
      </Canvas>
      <button
      id='toggleButton'
        style={
          {
            position: "absolute",
            top: "50%",
            left: "10%",
            transform: "translate(-50 %, -50 %)"
          }
        }
      >Click Here</button>
    </>
  );
}

export default App;

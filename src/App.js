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
        <OrbitControls />
        <Box position={[0, 0, 0]} />
        <Stats />
      </Canvas>
    </>
  );
}

export default App;

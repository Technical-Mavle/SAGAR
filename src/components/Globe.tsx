import React, { useRef, useMemo, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { DataPoint } from '../App';
import { checkWebGLSupport, disposeWebGLContext } from '../utils/webglUtils';

// This is the original Globe component - kept as backup

interface GlobeProps {
  dataPoints: DataPoint[];
  onDataPointClick: (dataPoint: DataPoint) => void;
}

const Globe: React.FC<GlobeProps> = ({ dataPoints, onDataPointClick }) => {
  const globeRef = useRef<THREE.Mesh>(null);
  const dataPointRefs = useRef<THREE.Mesh[]>([]);
  const { gl } = useThree();
  const contextLostRef = useRef(false);

  // Check WebGL support on mount
  useEffect(() => {
    console.log('Globe component mounted - using fallback rendering');
  }, []);

  // Handle WebGL context loss with improved recovery
  const handleContextLost = useCallback((event: Event) => {
    event.preventDefault();
    contextLostRef.current = true;
    console.warn('WebGL context lost, attempting to restore...');
    
    // Clear any pending operations
    if (gl) {
      gl.dispose();
    }
  }, [gl]);

  const handleContextRestored = useCallback(() => {
    console.log('WebGL context restored');
    contextLostRef.current = false;
    
    // Force a complete re-render
    if (gl) {
      gl.resetState();
      gl.setClearColor('#0a1929', 1.0);
    }
  }, [gl]);

  useEffect(() => {
    const canvas = gl.domElement;
    
    // Don't try to check or clear contexts - this causes the errors
    // Just add event listeners and let the Canvas component handle context creation
    console.log('Setting up WebGL event listeners on canvas');
    
    // Add event listeners
    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost, false);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored, false);
    };
  }, [gl, handleContextLost, handleContextRestored]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Dispose of WebGL context properly
      if (gl && !contextLostRef.current) {
        try {
          disposeWebGLContext(gl.getContext());
        } catch (error) {
          console.warn('Error disposing WebGL context on unmount:', error);
        }
      }
    };
  }, [gl]);

  // Rotate the globe slowly (only if context is not lost)
  useFrame((state) => {
    if (globeRef.current && !contextLostRef.current) {
      globeRef.current.rotation.y += 0.005;
    }
  });

  // Convert lat/lng to 3D coordinates on sphere
  const latLngToVector3 = (lat: number, lng: number, radius: number = 2) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    return new THREE.Vector3(
      -(radius * Math.sin(phi) * Math.cos(theta)),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  // Get color based on water body
  const getWaterBodyColor = (waterBody: string) => {
    switch (waterBody) {
      case 'Arabian Sea':
        return '#00ff88'; // marine-green
      case 'Bay of Bengal':
        return '#ffd700'; // marine-yellow
      case 'Andaman Sea':
        return '#00d4ff'; // marine-cyan
      default:
        return '#ff6b35'; // marine-orange
    }
  };

  // Create data point meshes
  const dataPointMeshes = useMemo(() => {
    return dataPoints.map((point, index) => {
      const position = latLngToVector3(point.decimalLatitude, point.decimalLongitude, 2.1);
      const color = getWaterBodyColor(point.waterBody);
      
      return (
        <mesh
          key={index}
          position={position}
          ref={(el) => {
            if (el) dataPointRefs.current[index] = el;
          }}
          onClick={() => onDataPointClick(point)}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      );
    });
  }, [dataPoints, onDataPointClick]);

  // Animate data points (only if context is not lost)
  useFrame((state) => {
    if (!contextLostRef.current) {
      dataPointRefs.current.forEach((ref, index) => {
        if (ref) {
          const time = state.clock.getElapsedTime();
          const scale = 1 + Math.sin(time * 2 + index) * 0.3;
          ref.scale.setScalar(scale);
        }
      });
    }
  });

  return (
    <group>
      {/* Main Globe */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          color="#1a1a2e"
          shininess={100}
          transparent={true}
          opacity={0.8}
        />
      </mesh>

      {/* Globe Wireframe */}
      <mesh>
        <sphereGeometry args={[2.01, 32, 32]} />
        <meshBasicMaterial
          color="#00d4ff"
          wireframe={true}
          transparent={true}
          opacity={0.1}
        />
      </mesh>

      {/* Data Points */}
      {dataPointMeshes}

      {/* Globe Title */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.3}
        color="#00d4ff"
        anchorX="center"
        anchorY="middle"
      >
        Marine Biodiversity Explorer
      </Text>
    </group>
  );
};

export default Globe;

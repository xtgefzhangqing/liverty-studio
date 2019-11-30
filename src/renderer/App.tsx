import React, { useEffect, useRef } from 'react'
import { Stage, Layer } from 'react-konva'
import { Canvas } from 'react-three-fiber'
import Konva from 'konva'
import styled from 'styled-components'
import MenuBase from './components/MenuBase'
import MenuControls from './components/MenuControls'
import MenuSources from './components/MenuSouces'
import SourceImage from './components/SourceImage'
import VrmModel from './components/VrmModel'
import { useBroadcast } from './hooks/useBroadcast'
import { useSource } from './hooks/useSource'

interface CanvasElement extends HTMLCanvasElement {
  captureStream: (frameRate: number) => MediaStream
}

const App: React.FC = () => {
  const { setStream } = useBroadcast()
  const { images, sources, updateSource } = useSource()
  const stageRef = useRef<Konva.Stage>(null)
  const vrmRef = useRef<HTMLDivElement>(null)

  const stageHeight = innerHeight * 0.6
  const stageWidth = (stageHeight / 9) * 16

  const renderVrm = () => {
    const stageCanvas = stageRef.current?.content.querySelector('canvas')
    const vrmCanvas = vrmRef.current?.querySelector('canvas')

    if (!stageCanvas || !vrmCanvas) return
    const context = stageCanvas.getContext('2d')

    if (!context) return
    const { width, height } = vrmCanvas
    context.clearRect(stageWidth - width, stageHeight - height, width, height)
    context.drawImage(vrmCanvas, stageWidth - width, stageHeight - height, width, height)
  }

  useEffect(() => {
    const stageCanvas = (stageRef.current?.content.querySelector('canvas') as unknown) as
      | CanvasElement
      | null
      | undefined

    if (!stageCanvas) {
      console.error('Cannot find stage canvas')
      return
    }

    const mediaStream = stageCanvas.captureStream(30)
    setStream(mediaStream)
  }, [setStream])

  return (
    <Wrapper>
      <TitleBar />
      <Main>
        <div style={{ margin: '0 auto', backgroundColor: '#000' }}>
          <Stage
            ref={(stageRef as unknown) as React.RefObject<Stage>}
            width={stageWidth}
            height={stageHeight}>
            <Layer>
              {images.map(image => (
                <SourceImage
                  key={image.id}
                  source={image}
                  updateSource={updateSource}
                  isSelected={true}
                  draggable
                />
              ))}
            </Layer>
          </Stage>
        </div>
      </Main>
      <Menus>
        <MenuSources sources={sources} />
        <MenuBase title="Mixers"></MenuBase>
        <MenuControls />
      </Menus>
      <VrmCanvas ref={vrmRef}>
        <Canvas>
          <ambientLight intensity={0.5} />
          <spotLight intensity={0.6} position={[30, 30, 50]} angle={0.2} penumbra={1} castShadow />
          <VrmModel
            url="https://cdn.glitch.com/e9accf7e-65be-4792-8903-f44e1fc88d68%2Fthree-vrm-girl.vrm?v=1568881824654"
            renderTo2dCanvas={renderVrm}
          />
        </Canvas>
      </VrmCanvas>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
`

const TitleBar = styled.div`
  background-color: ${({ theme }) => theme.grayLight};
  width: 100%;
  height: 24px;
  -webkit-app-region: drag;
`

const VrmCanvas = styled.div`
  width: 200px;
  height: ${innerHeight * 0.6 * 0.6}px;
  visibility: hidden;
  position: absolute;
  z-index: -1;
`

const Main = styled.div`
  background-color: ${({ theme }) => theme.grayDark};
  display: flex;
  width: 100%;
  height: 60vh;
`

const Menus = styled.div`
  display: flex;
  width: 100%;
  height: 40vh;
  margin-top: auto;
`

export default App
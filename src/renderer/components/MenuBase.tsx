import React from 'react'
import styled from 'styled-components'

type Props = {
  title: string
}

const MenuBase: React.FC<Props> = ({ children, title }) => {
  return (
    <Wrapper>
      <MenuTitle>{title}</MenuTitle>
      <MenuBox>{children}</MenuBox>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  border: 1px solid #333;
  width: 100%;
  height: 100%;
`

const MenuTitle = styled.div`
  background-color: #333;
  line-height: 20px;
  text-align: center;
  width: 100%;
  height: 20px;
`

const MenuBox = styled.div`
  background-color: #212121;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100% - 20px);
`

export default MenuBase
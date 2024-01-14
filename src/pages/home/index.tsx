import Image from 'next/image'
import { NextSeo } from 'next-seo'
import { Heading, Text } from '@ignite-ui/react'

import previewImage from '../../assets/app-preview.png'
import { ClaimUsernameForm } from './components/ClaimUsernameForm'

import { Container, Hero, Preview } from './styles'

export default function Home() {
  return (
    <>
      <NextSeo
        title="Ignite Call | Descomplique sua agenda"
        description="Conecte seu calendário e permita que as pessoas marquem agendamentos no seu tempo livre."
      />
      <Container>
        <Hero>
          <Heading as="h1" size="4xl">
            Agendamento descomplicado
          </Heading>
          <Text size="xl">
            Conecte seu calendário e permita que as pessoas marquem agendamentos
            no seu tempo livre.
          </Text>
          <ClaimUsernameForm />
        </Hero>

        <Preview>
          <Image
            src={previewImage}
            height={400}
            quality={100}
            priority
            alt="Calendário simulando a aplicação em funcionamento"
          />
        </Preview>
      </Container>
    </>
  )
}

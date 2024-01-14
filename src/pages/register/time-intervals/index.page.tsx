import { useRouter } from 'next/router'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { NextSeo } from 'next-seo'
import {
  Button,
  Checkbox,
  Heading,
  MultiStep,
  Text,
  TextInput,
} from '@ignite-ui/react'
import { ArrowRight } from 'phosphor-react'

import { api } from '@/lib/axios'
import { getWeekDays } from '@/utils/get-week-days'
import { convertTimeStringToMinutes } from '@/utils/convert-time-string-to-minutes'

import { Container, Header } from '../styles'
import {
  FormError,
  IntervalBox,
  IntervalContainer,
  IntervalDay,
  IntervalInputs,
  IntervalItem,
} from './styles'

const timeIntervalsSchema = z.object({
  intervals: z
    .array(
      z.object({
        weekDay: z.number().min(0).max(6),
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .length(7)
    .transform((intervals) => intervals.filter((interval) => interval.enabled))
    .refine((intervals) => intervals.length > 0, {
      message: 'Selecione pelo menos um dia da semana.',
    })
    .transform((intervals) => {
      return intervals.map((interval) => {
        return {
          weekDay: interval.weekDay,
          startTimeInMinutes: convertTimeStringToMinutes(interval.startTime),
          endTimeInMinutes: convertTimeStringToMinutes(interval.endTime),
        }
      })
    })
    .refine(
      (intervals) => {
        return intervals.every(
          (interval) =>
            interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes,
        )
      },
      {
        message: 'O intervalo de tempo deve ser igual ou maior a 1 hora.',
      },
    ),
})

type TimeIntervalsFormInput = z.input<typeof timeIntervalsSchema>
type TimeIntervalsFormOutput = z.output<typeof timeIntervalsSchema>

export default function TimeIntervals() {
  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
    watch,
  } = useForm<TimeIntervalsFormInput, any, TimeIntervalsFormOutput>({
    resolver: zodResolver(timeIntervalsSchema),
    defaultValues: {
      intervals: [
        { weekDay: 0, enabled: false, startTime: '08:00', endTime: '18:00' },
        { weekDay: 1, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 2, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 3, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 4, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 5, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 6, enabled: false, startTime: '08:00', endTime: '18:00' },
      ],
    },
  })

  const router = useRouter()
  const weekDays = getWeekDays()

  const { fields } = useFieldArray({
    control,
    name: 'intervals',
  })

  const intervals = watch('intervals')

  async function handleSetTimeIntervals(data: TimeIntervalsFormOutput) {
    const { intervals } = data
    await api.post('/users/time-intervals', { intervals })

    await router.push(`/register/update-profile`)
  }

  return (
    <>
      <NextSeo title="Selecione sua disponibilidade | Ignite Call" noindex />
      <Container>
        <Header>
          <Heading as="strong">Quase lá</Heading>
          <Text>
            Defina o intervalo de horário que você está disponível em cada dia
            da semana.
          </Text>

          <MultiStep size={4} currentStep={3} />
        </Header>
        <IntervalBox as="form" onSubmit={handleSubmit(handleSetTimeIntervals)}>
          <IntervalContainer>
            {fields.map((field, index) => {
              return (
                <IntervalItem key={field.id}>
                  <IntervalDay>
                    <Controller
                      name={`intervals.${index}.enabled`}
                      control={control}
                      render={({ field }) => {
                        return (
                          <Checkbox
                            onCheckedChange={(checked) => {
                              field.onChange(checked === true)
                            }}
                            checked={field.value}
                          />
                        )
                      }}
                    />
                    <Text>{weekDays[field.weekDay]}</Text>
                  </IntervalDay>
                  <IntervalInputs>
                    <TextInput
                      size="sm"
                      type="time"
                      step={60}
                      disabled={intervals[index].enabled === false}
                      {...register(`intervals.${index}.startTime`)}
                      crossOrigin=""
                    />
                    <TextInput
                      size="sm"
                      type="time"
                      step={60}
                      disabled={intervals[index].enabled === false}
                      {...register(`intervals.${index}.endTime`)}
                      crossOrigin=""
                    />
                  </IntervalInputs>
                </IntervalItem>
              )
            })}
          </IntervalContainer>

          {errors.intervals && (
            <FormError size="sm">{errors.intervals.root?.message}</FormError>
          )}

          <Button type="submit" disabled={isSubmitting}>
            Próximo passo
            <ArrowRight />
          </Button>
        </IntervalBox>
      </Container>
    </>
  )
}
